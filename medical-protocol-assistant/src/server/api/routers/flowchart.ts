/**
 * tRPC Router for Flowchart Generation
 */
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generateSmartFlowchart } from "@/lib/flowchart/smart-generator";
import { generateFlowchartFromProtocolContent } from "@/lib/flowchart/generator";
import { ProtocolFullContentSchema } from "@/lib/validators/protocol-schema";

const FlowchartGenerationInputSchema = z.object({
  protocolId: z.string().cuid(),
  condition: z.string().min(1),
  content: ProtocolFullContentSchema,
  options: z
    .object({
      mode: z.enum(["smart", "basic", "clinical"]).default("smart"),
      includeLayout: z.boolean().default(true),
      protocolType: z
        .enum(["EMERGENCY", "DIAGNOSTIC", "THERAPEUTIC", "MONITORING"])
        .optional(),
      maxNodes: z.number().min(5).max(100).default(50),
      includeMedications: z.boolean().default(true),
      format: z.enum(["standard", "clinical"]).default("standard"),
    })
    .optional()
    .default({}),
});

export const flowchartRouter = router({
  generate: protectedProcedure
    .input(FlowchartGenerationInputSchema)
    .mutation(async ({ input }) => {
      const { protocolId, condition, content } = input;
      const options = input.options || {};

      try {
        console.log(
          `[TRPC /flowchart.generate] Generating flowchart for protocol ${protocolId}`,
        );
        console.log(
          `[TRPC /flowchart.generate] Mode: ${options.mode}, Type: ${options.protocolType || "auto-detect"}`,
        );

        let result;

        if (options.mode === "clinical" || options.format === "clinical") {
          // Generate clinical format flowchart
          const { generateClinicalFlowchartModular } = await import(
            "@/lib/flowchart/flowchart-generator-modular"
          );

          result = await generateClinicalFlowchartModular(content as any, {
            protocolId,
          });

          // Add metadata
          result = {
            ...result,
            metadata: {
              mode: "clinical",
              format: "clinical",
              generatedAt: new Date().toISOString(),
            },
          };
        } else if (options.mode === "smart") {
          result = await generateSmartFlowchart(
            protocolId,
            content as any, // Type conversion for now
            condition,
            {
              includeLayout: options.includeLayout,
              protocolType: options.protocolType,
              maxNodes: options.maxNodes,
              includeMedications: options.includeMedications,
            },
          );
        } else {
          // Basic generation (original method)
          const basicResult = await generateFlowchartFromProtocolContent(
            protocolId,
            content as any, // Type conversion for now
            condition,
          );
          result = {
            ...basicResult,
            metadata: {
              mode: "basic",
              generatedAt: new Date().toISOString(),
            },
          };
        }

        console.log(
          `[TRPC /flowchart.generate] Generated ${result.nodes.length} nodes, ${result.edges.length} edges`,
        );

        return {
          success: true,
          flowchart: {
            nodes: result.nodes,
            edges: result.edges,
          },
          metadata: result.metadata,
        };
      } catch (error) {
        console.error(
          `[TRPC /flowchart.generate] Error generating flowchart:`,
          error,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Falha na geração do fluxograma: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          cause: error,
        });
      }
    }),

  generateAndSave: protectedProcedure
    .input(FlowchartGenerationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { protocolId, condition, content } = input;
      const options = input.options || {};

      try {
        // Check if protocol exists and get latest version
        const protocol = await ctx.db.protocol.findUnique({
          where: { id: protocolId },
          include: {
            ProtocolVersion: {
              orderBy: { versionNumber: "desc" },
              take: 1,
            },
          },
        });

        if (!protocol || !protocol.ProtocolVersion[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Protocolo ou versão não encontrado",
          });
        }

        const latestVersion = protocol.ProtocolVersion[0];

        console.log(
          `[TRPC /flowchart.generateAndSave] Generating flowchart for protocol ${protocolId}`,
        );

        let result;

        if (options.mode === "clinical" || options.format === "clinical") {
          // Generate clinical format flowchart
          const { generateClinicalFlowchartModular } = await import(
            "@/lib/flowchart/flowchart-generator-modular"
          );

          result = await generateClinicalFlowchartModular(content as any, {
            protocolId,
          });

          // Add metadata
          result = {
            ...result,
            metadata: {
              mode: "clinical",
              format: "clinical",
              generatedAt: new Date().toISOString(),
            },
          };
        } else if (options.mode === "smart") {
          result = await generateSmartFlowchart(
            protocolId,
            content as any,
            condition,
            {
              includeLayout: options.includeLayout ?? true,
              protocolType: options.protocolType,
              maxNodes: options.maxNodes ?? 50,
              includeMedications: options.includeMedications ?? true,
            },
          );
        } else {
          const basicResult = await generateFlowchartFromProtocolContent(
            protocolId,
            content as any,
            condition,
          );
          result = {
            ...basicResult,
            metadata: {
              mode: "basic",
              generatedAt: new Date().toISOString(),
            },
          };
        }

        // Update the protocol version with new flowchart
        await ctx.db.protocolVersion.update({
          where: { id: latestVersion.id },
          data: {
            flowchart: {
              nodes: result.nodes,
              edges: result.edges,
            } as any,
          },
        });

        console.log(
          `[TRPC /flowchart.generateAndSave] Saved flowchart to version ${latestVersion.id}`,
        );

        return {
          success: true,
          flowchart: {
            nodes: result.nodes,
            edges: result.edges,
          },
          metadata: result.metadata,
        };
      } catch (error) {
        console.error(
          `[TRPC /flowchart.generateAndSave] Error generating flowchart:`,
          error,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Falha na geração do fluxograma: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          cause: error,
        });
      }
    }),

  regenerate: protectedProcedure
    .input(
      z.object({
        protocolId: z.string().cuid(),
        versionId: z.string().cuid(),
        condition: z.string().min(1),
        content: ProtocolFullContentSchema,
        options: z
          .object({
            mode: z.enum(["smart", "basic"]).default("smart"),
            protocolType: z
              .enum(["EMERGENCY", "DIAGNOSTIC", "THERAPEUTIC", "MONITORING"])
              .optional(),
            focusSections: z.array(z.string()).optional(),
            preserveLayout: z.boolean().default(false),
          })
          .optional()
          .default({}),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { protocolId, versionId, condition, content } = input;
      const options = input.options || {};

      try {
        // Check if protocol exists and user has permission
        const protocol = await ctx.db.protocol.findUnique({
          where: { id: protocolId },
          include: {
            ProtocolVersion: {
              where: { id: versionId },
              take: 1,
            },
          },
        });

        if (!protocol) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Protocolo com ID '${protocolId}' não encontrado.`,
          });
        }

        if (protocol.ProtocolVersion.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Versão do protocolo com ID '${versionId}' não encontrada.`,
          });
        }

        console.log(
          `[TRPC /flowchart.regenerate] Regenerating flowchart for protocol ${protocolId}, version ${versionId}`,
        );

        // Generate new flowchart
        let result;

        if (options.mode === "smart") {
          result = await generateSmartFlowchart(
            protocolId,
            content as any, // Type conversion for now
            condition,
            {
              includeLayout: !options.preserveLayout,
              protocolType: options.protocolType,
              maxNodes: 50,
              includeMedications: true,
            },
          );
        } else {
          const basicResult = await generateFlowchartFromProtocolContent(
            protocolId,
            content as any, // Type conversion for now
            condition,
          );
          result = {
            ...basicResult,
            metadata: {
              mode: "basic",
              regeneratedAt: new Date().toISOString(),
            },
          };
        }

        // Update the protocol version with new flowchart
        await ctx.db.protocolVersion.update({
          where: { id: versionId },
          data: {
            flowchart: {
              nodes: result.nodes,
              edges: result.edges,
            } as any,
          },
        });

        console.log(
          `[TRPC /flowchart.regenerate] Updated protocol version with new flowchart`,
        );

        return {
          success: true,
          flowchart: {
            nodes: result.nodes,
            edges: result.edges,
          },
          metadata: result.metadata,
        };
      } catch (error) {
        console.error(
          `[TRPC /flowchart.regenerate] Error regenerating flowchart:`,
          error,
        );

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Falha na regeneração do fluxograma: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          cause: error,
        });
      }
    }),

  analyze: protectedProcedure
    .input(
      z.object({
        condition: z.string().min(1),
        content: ProtocolFullContentSchema,
      }),
    )
    .query(async ({ input }) => {
      const { condition, content } = input;

      try {
        // Analyze the protocol to suggest the best approach for flowchart generation
        const analysis = analyzeProtocolForFlowchart(condition, content);

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error(
          `[TRPC /flowchart.analyze] Error analyzing protocol:`,
          error,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Falha na análise do protocolo: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          cause: error,
        });
      }
    }),

  generateClinical: protectedProcedure
    .input(
      z.object({
        protocolId: z.string().cuid(),
        condition: z.string().min(1),
        content: ProtocolFullContentSchema,
        includeLayout: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const { protocolId, condition, content, includeLayout } = input;

      try {
        console.log(
          `[TRPC /flowchart.generateClinical] Generating clinical flowchart for protocol ${protocolId}`,
        );

        // Generate clinical format flowchart directly
        const { generateClinicalFlowchartModular } = await import(
          "@/lib/flowchart/flowchart-generator-modular"
        );

        const clinicalResult = await generateClinicalFlowchartModular(
          content as any,
          {
            protocolId,
          },
        );

        console.log(
          `[TRPC /flowchart.generateClinical] Generated clinical flowchart with ${clinicalResult.nodes.length} nodes, ${clinicalResult.edges.length} edges`,
        );

        return {
          success: true,
          flowchart: clinicalResult,
          metadata: {
            mode: "clinical",
            format: "clinical",
            generatedAt: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error(
          `[TRPC /flowchart.generateClinical] Error generating clinical flowchart:`,
          error,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Falha na geração do fluxograma clínico: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          cause: error,
        });
      }
    }),

  updateManual: protectedProcedure
    .input(
      z.object({
        protocolId: z.string().cuid(),
        versionId: z.string().cuid(),
        flowchart: z.object({
          nodes: z.array(z.any()), // TODO: Add proper node validation
          edges: z.array(z.any()), // TODO: Add proper edge validation
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { protocolId, versionId, flowchart } = input;

      try {
        // Check if protocol exists and user has permission
        const protocol = await ctx.db.protocol.findUnique({
          where: { id: protocolId },
          include: {
            ProtocolVersion: {
              where: { id: versionId },
              take: 1,
            },
          },
        });

        if (!protocol) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Protocolo com ID '${protocolId}' não encontrado.`,
          });
        }

        if (protocol.ProtocolVersion.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Versão do protocolo com ID '${versionId}' não encontrada.`,
          });
        }

        // Check if user has permission to edit
        if (
          protocol.createdById !== ctx.session.user.id &&
          ctx.session.user.role !== "ADMIN"
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para editar este fluxograma.",
          });
        }

        console.log(
          `[TRPC /flowchart.updateManual] Saving manual flowchart edits for protocol ${protocolId}, version ${versionId}`,
        );

        // Update the protocol version with edited flowchart
        await ctx.db.protocolVersion.update({
          where: { id: versionId },
          data: {
            flowchart: flowchart as any,
          },
        });

        console.log(
          `[TRPC /flowchart.updateManual] Saved manual edits with ${flowchart.nodes.length} nodes, ${flowchart.edges.length} edges`,
        );

        return {
          success: true,
          flowchart,
        };
      } catch (error) {
        console.error(
          `[TRPC /flowchart.updateManual] Error saving flowchart:`,
          error,
        );

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Falha ao salvar alterações do fluxograma: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          cause: error,
        });
      }
    }),
});

/**
 * Analyze protocol content to suggest flowchart generation approach
 */
function analyzeProtocolForFlowchart(condition: string, content: any) {
  const combinedText = [
    condition,
    ...Object.values(content).map((section: any) =>
      typeof section?.content === "string"
        ? section.content
        : JSON.stringify(section?.content || ""),
    ),
  ]
    .join(" ")
    .toLowerCase();

  // Count different types of content
  const hasDecisions = /\b(se|caso|quando|critério|condição)\b/g.test(
    combinedText,
  );
  const hasMedications =
    /\b(mg|ml|administrar|dose|medicament|fármaco)\b/g.test(combinedText);
  const hasActions =
    /\b(realizar|executar|verificar|monitorar|avaliar)\b/g.test(combinedText);
  const hasEmergency = /\b(emergência|urgência|imediato|prioritário)\b/g.test(
    combinedText,
  );

  // Estimate complexity
  const wordCount = combinedText.split(/\s+/).length;
  const complexity =
    wordCount > 2000 ? "high" : wordCount > 1000 ? "medium" : "low";

  // Detect protocol type keywords
  const typeScores = {
    EMERGENCY: (
      combinedText.match(/\b(emergência|urgência|parada|choque|trauma)\b/g) ||
      []
    ).length,
    DIAGNOSTIC: (
      combinedText.match(/\b(diagnóstico|investigação|exames|avaliação)\b/g) ||
      []
    ).length,
    THERAPEUTIC: (
      combinedText.match(/\b(tratamento|terapia|medicamento|dose)\b/g) || []
    ).length,
    MONITORING: (
      combinedText.match(
        /\b(monitorização|seguimento|controle|vigilância)\b/g,
      ) || []
    ).length,
  };

  const suggestedType = Object.entries(typeScores).reduce((a, b) =>
    typeScores[a[0] as keyof typeof typeScores] >
    typeScores[b[0] as keyof typeof typeScores]
      ? a
      : b,
  )[0] as keyof typeof typeScores;

  return {
    complexity,
    estimatedNodes: Math.min(Math.ceil(wordCount / 100), 50),
    hasDecisions,
    hasMedications,
    hasActions,
    hasEmergency,
    suggestedType,
    typeScores,
    recommendations: {
      mode: complexity === "high" ? "smart" : "basic",
      includeLayout: true,
      protocolType: suggestedType,
      maxNodes: complexity === "high" ? 50 : 30,
      includeMedications: hasMedications,
    },
  };
}
