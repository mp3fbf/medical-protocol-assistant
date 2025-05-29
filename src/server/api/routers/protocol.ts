/**
 * tRPC Router for Protocol Management
 */
import { TRPCError } from "@trpc/server";
// import { z as _z } from "zod"; // Marked as unused
import {
  router,
  publicProcedure,
  protectedProcedure,
  createCallerFactory,
} from "../trpc";
import {
  CreateProtocolInputSchema,
  ListProtocolsInputSchema,
  ProtocolIdInputSchema,
  UpdateProtocolVersionInputSchema,
} from "@/lib/validators/protocol-schema";
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
import { ProtocolStatus, UserRole } from "@prisma/client";
import { Permission } from "@/lib/auth/permissions";
import { checkPermission } from "@/lib/auth/rbac";
// import { randomUUID } from "crypto"; // No longer manually setting IDs

import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { performMedicalResearch } from "@/lib/ai/research";
import { generateFullProtocolAI } from "@/lib/ai/generator";
import type { DeepResearchQuery } from "@/types/research";
import { documentParser } from "@/lib/upload/document-parser";

const DEFAULT_EMPTY_CONTENT: ProtocolFullContent = Object.fromEntries(
  SECTION_DEFINITIONS.map((def) => [
    def.sectionNumber.toString(),
    {
      sectionNumber: def.sectionNumber,
      title: def.titlePT,
      content: "",
    },
  ]),
);

const DEFAULT_EMPTY_FLOWCHART: FlowchartData = {
  nodes: [],
  edges: [],
};

export const protocolRouter = router({
  getStats: publicProcedure.query(async ({ ctx }) => {
    const [totalProtocols, draftProtocols, reviewProtocols, approvedProtocols] =
      await Promise.all([
        ctx.db.protocol.count(),
        ctx.db.protocol.count({ where: { status: ProtocolStatus.DRAFT } }),
        ctx.db.protocol.count({ where: { status: ProtocolStatus.REVIEW } }),
        ctx.db.protocol.count({ where: { status: ProtocolStatus.APPROVED } }),
      ]);

    return {
      totalProtocols,
      draftProtocols,
      reviewProtocols,
      approvedProtocols,
    };
  }),

  getRecentActivity: publicProcedure.query(async ({ ctx }) => {
    const recentProtocols = await ctx.db.protocol.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
        ProtocolVersion: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: { versionNumber: true, createdAt: true },
        },
      },
    });

    return recentProtocols;
  }),
  create: protectedProcedure
    .input(CreateProtocolInputSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(
        "[TRPC /protocol.create] Received input on server:",
        JSON.stringify(input, null, 2),
      );

      const {
        title,
        condition,
        generationMode = "manual",
        targetPopulation,
        researchSources = ["pubmed", "scielo"],
        yearRange = 5,
        materialFiles,
        supplementWithResearch = false,
      } = input;

      // Log the generation configuration for future implementation
      console.log(`[TRPC /protocol.create] Generation mode: ${generationMode}`);
      console.log(
        `[TRPC /protocol.create] Target population: ${targetPopulation || "Not specified"}`,
      );
      console.log(
        `[TRPC /protocol.create] Research sources: ${researchSources.join(", ")}`,
      );
      console.log(`[TRPC /protocol.create] Year range: ${yearRange} years`);
      const userId = ctx.session.user.id;

      if (!title || !condition) {
        console.error(
          "[TRPC /protocol.create] Server received invalid input (missing title or condition):",
          input,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Título e condição médica são obrigatórios.",
        });
      }

      if (
        !checkPermission(
          ctx.session.user.role as UserRole,
          Permission.CREATE_PROTOCOL,
        )
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para criar protocolos.",
        });
      }

      const codePrefix = condition.substring(0, 5).toUpperCase();
      const count = await ctx.db.protocol.count({
        where: { code: { startsWith: codePrefix } },
      });
      const protocolCode = `${codePrefix}-${(count + 1)
        .toString()
        .padStart(3, "0")}`;

      try {
        // Initialize protocol content - will be empty for manual mode, generated for automatic mode
        let protocolContent: ProtocolFullContent = DEFAULT_EMPTY_CONTENT;
        let changelogNotes = "Versão inicial criada.";

        // If automatic mode, trigger AI research and generation
        if (generationMode === "automatic") {
          console.log(
            "[TRPC /protocol.create] Starting AI research and generation pipeline...",
          );

          try {
            // Step 1: Perform medical research
            const researchQuery: DeepResearchQuery = {
              condition,
              sources: researchSources as any,
              yearRange,
              keywords: targetPopulation ? [targetPopulation] : undefined,
            };

            console.log("[TRPC /protocol.create] Starting medical research...");
            const researchData = await performMedicalResearch(researchQuery);
            console.log(
              "[TRPC /protocol.create] Research completed, starting protocol generation...",
            );

            // Step 2: Generate protocol content using AI
            const generationResult = await generateFullProtocolAI({
              medicalCondition: condition,
              researchData,
              specificInstructions: targetPopulation
                ? `População alvo: ${targetPopulation}`
                : undefined,
            });

            if (generationResult.protocolContent) {
              protocolContent = generationResult.protocolContent;
              changelogNotes =
                "Versão inicial criada com IA baseada em pesquisa médica.";
              console.log(
                "[TRPC /protocol.create] AI generation completed successfully",
              );
              console.log(
                "[TRPC /protocol.create] Sample section from generated content:",
                {
                  section1: protocolContent["1"],
                  hasSection1: !!protocolContent["1"],
                  section1SectionNumber: protocolContent["1"]?.sectionNumber,
                  allSections: Object.keys(protocolContent),
                },
              );
            } else {
              console.warn(
                "[TRPC /protocol.create] AI generation failed, using empty content",
              );
              changelogNotes =
                "Versão inicial criada (geração IA falhou - conteúdo vazio).";
            }
          } catch (aiError) {
            console.error(
              "[TRPC /protocol.create] AI pipeline error:",
              aiError,
            );
            // Continue with empty content if AI fails
            changelogNotes =
              "Versão inicial criada (erro na geração IA - conteúdo vazio).";
          }
        } else if (generationMode === "material_based") {
          console.log(
            "[TRPC /protocol.create] Starting material-based generation pipeline...",
          );

          try {
            // Step 1: Parse uploaded documents
            if (!materialFiles || materialFiles.length === 0) {
              throw new Error(
                "No material files provided for material-based generation",
              );
            }

            console.log(
              `[TRPC /protocol.create] Processing ${materialFiles.length} uploaded documents...`,
            );

            let combinedMaterialContent = "";
            const documentSummaries: string[] = [];

            // Parse each uploaded file
            for (const file of materialFiles) {
              if (!file.buffer || !file.name) {
                console.warn(
                  "[TRPC /protocol.create] Skipping invalid file:",
                  file,
                );
                continue;
              }

              try {
                // Convert base64 to buffer if needed
                const buffer = Buffer.isBuffer(file.buffer)
                  ? file.buffer
                  : Buffer.from(file.buffer, "base64");

                const parsedDoc = await documentParser.parseFile(
                  buffer,
                  file.name,
                );

                combinedMaterialContent += `\n\n=== DOCUMENTO: ${parsedDoc.metadata.fileName} ===\n`;
                combinedMaterialContent += parsedDoc.content;

                documentSummaries.push(
                  `${parsedDoc.metadata.fileName} (${parsedDoc.metadata.fileType}, ${Math.round(parsedDoc.metadata.fileSize / 1024)}KB)`,
                );

                console.log(
                  `[TRPC /protocol.create] Successfully parsed: ${parsedDoc.metadata.fileName}`,
                );
              } catch (parseError) {
                console.error(
                  `[TRPC /protocol.create] Failed to parse file ${file.name}:`,
                  parseError,
                );
                // Continue with other files
              }
            }

            if (!combinedMaterialContent.trim()) {
              throw new Error(
                "No content could be extracted from uploaded files",
              );
            }

            // Step 2: Optional research supplementation
            let researchData = undefined;
            if (supplementWithResearch && researchSources.length > 0) {
              console.log(
                "[TRPC /protocol.create] Supplementing with medical research...",
              );

              const researchQuery: DeepResearchQuery = {
                condition,
                sources: researchSources as any,
                yearRange,
                keywords: targetPopulation ? [targetPopulation] : undefined,
              };

              researchData = await performMedicalResearch(researchQuery);
              console.log(
                "[TRPC /protocol.create] Research supplementation completed",
              );
            }

            // Step 3: Generate protocol from material + optional research
            console.log(
              "[TRPC /protocol.create] Generating protocol from material content...",
            );

            const materialInstructions = [
              `Baseie o protocolo principalmente no seguinte material médico fornecido:`,
              ``,
              combinedMaterialContent,
              ``,
              `=== INSTRUÇÕES ===`,
              `- Use o conteúdo acima como base principal para o protocolo`,
              `- Mantenha a estrutura e as recomendações do material original`,
              `- Documente as fontes dos documentos: ${documentSummaries.join(", ")}`,
            ];

            if (targetPopulation) {
              materialInstructions.push(
                `- População alvo: ${targetPopulation}`,
              );
            }

            if (supplementWithResearch && researchData) {
              materialInstructions.push(
                `- Complementar com evidências da pesquisa científica quando apropriado`,
              );
            }

            const generationResult = await generateFullProtocolAI({
              medicalCondition: condition,
              researchData: researchData || {
                query: condition,
                findings: [],
                timestamp: new Date().toISOString(),
              },
              specificInstructions: materialInstructions.join("\n"),
            });

            if (generationResult.protocolContent) {
              protocolContent = generationResult.protocolContent;
              changelogNotes = supplementWithResearch
                ? `Versão inicial criada a partir de material próprio e pesquisa complementar. Documentos: ${documentSummaries.join(", ")}.`
                : `Versão inicial criada a partir de material próprio. Documentos: ${documentSummaries.join(", ")}.`;

              console.log(
                "[TRPC /protocol.create] Material-based generation completed successfully",
              );
            } else {
              console.warn(
                "[TRPC /protocol.create] Material-based generation failed, using empty content",
              );
              changelogNotes =
                "Versão inicial criada (geração baseada em material falhou - conteúdo vazio).";
            }
          } catch (materialError) {
            console.error(
              "[TRPC /protocol.create] Material-based pipeline error:",
              materialError,
            );
            // Continue with empty content if material processing fails
            changelogNotes =
              "Versão inicial criada (erro no processamento de material - conteúdo vazio).";
          }
        }

        const protocol = await ctx.db.protocol.create({
          data: {
            // ID for Protocol is auto-generated by Prisma (@default(cuid()))
            title,
            condition,
            code: protocolCode,
            createdById: userId,
            status: ProtocolStatus.DRAFT,
            updatedAt: new Date(),
            ProtocolVersion: {
              create: [
                {
                  // ID for ProtocolVersion is also auto-generated by Prisma (@default(cuid()))
                  versionNumber: 1,
                  createdById: userId,
                  content: protocolContent as any,
                  flowchart: DEFAULT_EMPTY_FLOWCHART as any,
                  changelogNotes,
                },
              ],
            },
          },
        });
        console.log(
          `[TRPC /protocol.create] Successfully created protocol in DB: ${protocol.id} - ${protocol.title}`,
        );

        // Return a very simplified object for now to minimize serialization issues
        return {
          id: protocol.id,
          code: protocol.code,
          title: protocol.title,
          condition: protocol.condition,
          status: protocol.status,
        };
      } catch (error) {
        console.error(
          `[TRPC /protocol.create] Error during protocol creation in DB:`,
          error,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar protocolo no banco de dados.",
          cause: error,
        });
      }
    }),

  list: publicProcedure
    .input(ListProtocolsInputSchema)
    .query(async ({ ctx, input }) => {
      const {
        page = 1,
        limit = 20,
        status,
        search,
        sortBy = "updatedAt",
        sortOrder = "desc",
      } = input;

      const whereClause: any = {};
      if (status) {
        whereClause.status = status;
      }
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { condition: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ];
      }

      const protocols = await ctx.db.protocol.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          User: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { ProtocolVersion: true },
          },
          ProtocolVersion: {
            orderBy: { versionNumber: "desc" },
            take: 1,
            select: { versionNumber: true, createdAt: true },
          },
        },
      });

      const totalProtocols = await ctx.db.protocol.count({
        where: whereClause,
      });

      return {
        items: protocols,
        totalItems: totalProtocols,
        totalPages: Math.ceil(totalProtocols / limit),
        currentPage: page,
      };
    }),

  getById: protectedProcedure
    .input(ProtocolIdInputSchema)
    .query(async ({ ctx, input }) => {
      console.log(
        `[TRPC /protocol.getById] Received input on server: { protocolId: "${input.protocolId}" }`,
      );
      const protocol = await ctx.db.protocol.findUnique({
        where: { id: input.protocolId },
        include: {
          User: {
            select: { id: true, name: true, email: true },
          },
          ProtocolVersion: {
            orderBy: { versionNumber: "desc" },
            include: {
              User: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (!protocol) {
        console.warn(
          `[TRPC /protocol.getById] Protocol with ID '${input.protocolId}' not found.`,
        );
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Protocolo com ID '${input.protocolId}' não encontrado.`,
        });
      }
      console.log(
        `[TRPC /protocol.getById] Successfully fetched protocol: ${protocol.id}`,
      );

      // Debug protocol content structure
      const latestVersion = protocol.ProtocolVersion[0];
      if (latestVersion?.content) {
        console.log(
          "[TRPC /protocol.getById] Sample section from loaded content:",
          {
            section1: (latestVersion.content as any)["1"],
            hasSection1: !!(latestVersion.content as any)["1"],
            section1SectionNumber: (latestVersion.content as any)["1"]
              ?.sectionNumber,
            allSections: Object.keys(latestVersion.content as any),
          },
        );
      }

      return protocol;
    }),

  update: protectedProcedure
    .input(UpdateProtocolVersionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { protocolId, content, flowchart, changelogNotes } = input;
      const userId = ctx.session.user.id;

      const protocol = await ctx.db.protocol.findUnique({
        where: { id: protocolId },
        include: {
          ProtocolVersion: { orderBy: { versionNumber: "desc" }, take: 1 },
        },
      });

      if (!protocol) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Protocolo com ID '${protocolId}' não encontrado.`,
        });
      }

      const canEditOwn = checkPermission(
        ctx.session.user.role as UserRole,
        Permission.EDIT_OWN_PROTOCOL,
        protocol.createdById,
        userId,
      );
      const canEditAny = checkPermission(
        ctx.session.user.role as UserRole,
        Permission.EDIT_ANY_PROTOCOL,
      );

      if (!canEditOwn && !canEditAny) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para editar este protocolo.",
        });
      }

      const latestVersionNumber =
        protocol.ProtocolVersion[0]?.versionNumber ?? 0;

      const newProtocolVersion = await ctx.db.protocolVersion.create({
        data: {
          // ID for ProtocolVersion is auto-generated by Prisma
          protocolId: protocolId,
          versionNumber: latestVersionNumber + 1,
          content: (content ??
            protocol.ProtocolVersion[0]?.content ??
            DEFAULT_EMPTY_CONTENT) as any,
          flowchart: (flowchart ??
            protocol.ProtocolVersion[0]?.flowchart ??
            DEFAULT_EMPTY_FLOWCHART) as any,
          changelogNotes:
            changelogNotes ??
            `Atualização para versão ${latestVersionNumber + 1}.`,
          createdById: userId,
        },
      });

      await ctx.db.protocol.update({
        where: { id: protocolId },
        data: {
          updatedAt: new Date(),
        },
      });

      return newProtocolVersion;
    }),
});

export const protocolCaller = createCallerFactory(protocolRouter);
