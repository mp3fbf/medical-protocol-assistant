/**
 * tRPC Router for Protocol Management
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
    // Exclude ARCHIVED protocols from all counts
    const [totalProtocols, draftProtocols, reviewProtocols, approvedProtocols] =
      await Promise.all([
        ctx.db.protocol.count({
          where: { status: { not: ProtocolStatus.ARCHIVED } },
        }),
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
      where: { status: { not: ProtocolStatus.ARCHIVED } },
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

  getWeeklyActivity: publicProcedure.query(async ({ ctx }) => {
    // Get activity for the last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // 6 days ago + today = 7 days
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Query protocols updated in the last 7 days
    const weeklyProtocols = await ctx.db.protocol.findMany({
      where: {
        updatedAt: {
          gte: sevenDaysAgo,
        },
        status: { not: ProtocolStatus.ARCHIVED },
      },
      select: {
        updatedAt: true,
      },
    });

    // Initialize array with zeros for each day
    const activityByDay = Array(7).fill(0);
    const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Process the results to count by day of week
    for (const protocol of weeklyProtocols) {
      const dayOfWeek = protocol.updatedAt.getDay(); // 0 = Sunday, 6 = Saturday
      activityByDay[dayOfWeek]++;
    }

    // Calculate max value for percentage calculations
    const maxActivity = Math.max(...activityByDay, 1); // Avoid division by zero

    // Convert to percentages (0-100)
    const percentages = activityByDay.map((count) =>
      Math.round((count / maxActivity) * 100),
    );

    return {
      data: percentages,
      counts: activityByDay,
      labels: dayLabels,
      maxCount: maxActivity,
    };
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
        // Create protocol record with generation metadata
        const protocol = await ctx.db.protocol.create({
          data: {
            title,
            condition,
            code: protocolCode,
            createdById: userId,
            status: ProtocolStatus.DRAFT,
            updatedAt: new Date(),
          },
        });

        console.log(
          `[TRPC /protocol.create] Created protocol record: ${protocol.id} - ${protocol.title}`,
        );

        // Create empty initial version
        await ctx.db.protocolVersion.create({
          data: {
            protocolId: protocol.id,
            versionNumber: 1,
            createdById: userId,
            content: DEFAULT_EMPTY_CONTENT as any,
            flowchart: DEFAULT_EMPTY_FLOWCHART as any,
            changelogNotes:
              "Versão inicial criada - aguardando geração de conteúdo.",
          },
        });

        // Store generation parameters in audit log for later use
        await ctx.db.auditLog.create({
          data: {
            userId,
            action: "PROTOCOL_CREATED",
            resourceType: "PROTOCOL",
            resourceId: protocol.id,
            details: {
              generationMode,
              targetPopulation,
              researchSources,
              yearRange,
              materialFiles:
                materialFiles?.map((f) => ({
                  name: f.name,
                  size: f.size,
                  type: f.type,
                })) || [],
              supplementWithResearch,
            },
          },
        });

        console.log(
          `[TRPC /protocol.create] Successfully created protocol and stored generation params`,
        );

        // Return immediately - generation will be started separately
        return {
          id: protocol.id,
          code: protocol.code,
          title: protocol.title,
          condition: protocol.condition,
          status: protocol.status,
        };
      } catch (error) {
        console.error(
          `[TRPC /protocol.create] Error during protocol creation:`,
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

      // Always exclude ARCHIVED protocols unless specifically requested
      if (status && status !== ProtocolStatus.ARCHIVED) {
        whereClause.status = status;
      } else if (!status) {
        whereClause.status = { not: ProtocolStatus.ARCHIVED };
      } else if (status === ProtocolStatus.ARCHIVED) {
        // Only show archived if explicitly requested
        whereClause.status = ProtocolStatus.ARCHIVED;
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

  updateStatus: protectedProcedure
    .input(
      z.object({
        protocolId: z.string().cuid(),
        status: z.nativeEnum(ProtocolStatus),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { protocolId, status, reason } = input;
      const userId = ctx.session.user.id;

      // Verificar se o protocolo existe
      const protocol = await ctx.db.protocol.findUnique({
        where: { id: protocolId },
        select: {
          id: true,
          status: true,
          createdById: true,
        },
      });

      if (!protocol) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Protocolo com ID '${protocolId}' não encontrado.`,
        });
      }

      // Verificar permissões baseadas no novo status
      const userRole = ctx.session.user.role as UserRole;

      // Regras de permissão por status:
      // - DRAFT -> REVIEW: Criador pode enviar para revisão
      // - REVIEW -> APPROVED: Apenas REVIEWER ou ADMIN
      // - REVIEW -> DRAFT: REVIEWER ou ADMIN podem devolver para correções
      // - Qualquer -> ARCHIVED: ADMIN apenas

      if (status === ProtocolStatus.ARCHIVED && userRole !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem arquivar protocolos.",
        });
      }

      if (
        status === ProtocolStatus.APPROVED &&
        userRole !== UserRole.REVIEWER &&
        userRole !== UserRole.ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Apenas revisores ou administradores podem aprovar protocolos.",
        });
      }

      if (
        protocol.status === ProtocolStatus.DRAFT &&
        status === ProtocolStatus.REVIEW &&
        protocol.createdById !== userId &&
        userRole !== UserRole.ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Apenas o criador ou administradores podem enviar para revisão.",
        });
      }

      // Atualizar o status
      const updatedProtocol = await ctx.db.protocol.update({
        where: { id: protocolId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      // Criar log de auditoria
      await ctx.db.auditLog.create({
        data: {
          userId,
          action: `STATUS_CHANGE_${protocol.status}_TO_${status}`,
          resourceType: "PROTOCOL",
          resourceId: protocolId,
          details: {
            previousStatus: protocol.status,
            newStatus: status,
            reason: reason || null,
          },
        },
      });

      return updatedProtocol;
    }),
});

export const protocolCaller = createCallerFactory(protocolRouter);
