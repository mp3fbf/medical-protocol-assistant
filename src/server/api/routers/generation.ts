/**
 * tRPC Router for AI Protocol Generation operations
 */
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  generateFullProtocolAI,
  generateProtocolSectionAI,
} from "@/lib/ai/generator";
import { resumeGenerationSession } from "@/lib/ai/generator-modular";
import type {
  AIFullProtocolGenerationInput,
  AIFullProtocolGenerationOutput,
  AIProtocolSectionInput,
  AIProtocolSectionOutput,
} from "@/types/ai-generation";
import {
  AIResearchDataSchema,
  // ProtocolFullContentSchema as _ProtocolFullContentSchema, // Marked as unused
} from "@/lib/validators/protocol-schema"; // AIResearchDataSchema is actually defined here
import type { ProtocolFullContent } from "@/types/protocol";
import { TRPCError } from "@trpc/server";

const AIFullProtocolGenerationInputSchema = z.object({
  protocolId: z
    .string()
    .cuid("ID de protocolo inválido (esperado CUID).")
    .optional(), // Changed from uuid()
  medicalCondition: z.string().min(1, "Condição médica é obrigatória."),
  researchData: AIResearchDataSchema,
  specificInstructions: z.string().optional(),
  useModularGeneration: z.boolean().optional(), // Enable modular generation
});

const AIProtocolSectionInputSchema = z.object({
  protocolId: z.string().cuid("ID de protocolo inválido (esperado CUID)."), // Changed from uuid()
  protocolVersionId: z
    .string()
    .cuid("ID de versão inválido (esperado CUID).")
    .optional(), // Changed from uuid()
  medicalCondition: z.string().min(1, "Condição médica é obrigatória."),
  sectionNumber: z
    .number()
    .int()
    .min(1)
    .max(13, "Número da seção deve ser entre 1 e 13."),
  sectionTitle: z.string().optional(),
  researchFindings: AIResearchDataSchema.shape.findings.optional(),
  previousSectionsContent: z.record(z.string(), z.any()).optional(),
  specificInstructions: z.string().optional(),
});

export const generationRouter = router({
  generateFullProtocol: protectedProcedure
    .input(AIFullProtocolGenerationInputSchema)
    .mutation(
      async ({ ctx, input }): Promise<AIFullProtocolGenerationOutput> => {
        console.log(
          `User ${ctx.session.user.id} initiated full protocol generation for: ${input.medicalCondition}`,
        );
        const { useModularGeneration, ...generationInput } = input;

        return generateFullProtocolAI(
          generationInput as unknown as AIFullProtocolGenerationInput,
          {
            useModular: useModularGeneration,
            // Note: Progress callback would need to be implemented via WebSocket or SSE for real-time updates
          },
        );
      },
    ),

  resumeGeneration: protectedProcedure
    .input(
      z.object({
        protocolId: z.string().cuid(),
        sessionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(
        `User ${ctx.session.user.id} resuming generation for protocol ${input.protocolId} with session ${input.sessionId}`,
      );

      // Get the protocol to retrieve the original generation params
      const protocol = await ctx.db.protocol.findUnique({
        where: { id: input.protocolId },
        include: {
          ProtocolVersion: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
        },
      });

      if (!protocol) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Protocol not found",
        });
      }

      // Check ownership
      if (protocol.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only resume your own protocol generation",
        });
      }

      try {
        // Resume the generation with the saved session
        const result = await resumeGenerationSession(
          input.sessionId,
          {
            medicalCondition: protocol.condition,
            researchData: {
              query: protocol.condition,
              findings: [], // This would need to be retrieved from somewhere
              timestamp: new Date().toISOString(),
            },
          },
          // Progress callback could be added here for SSE
        );

        // Update the protocol with the completed content
        if (result.protocolContent) {
          const latestVersion = protocol.ProtocolVersion[0];
          await ctx.db.protocolVersion.create({
            data: {
              protocolId: input.protocolId,
              versionNumber: (latestVersion?.versionNumber || 0) + 1,
              content: result.protocolContent as any,
              flowchart:
                latestVersion?.flowchart || ({ nodes: [], edges: [] } as any),
              changelogNotes: "Geração retomada e concluída com sucesso",
              createdById: ctx.session.user.id,
            },
          });
        }

        return result;
      } catch (error: any) {
        console.error("Failed to resume generation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to resume generation",
          cause: error,
        });
      }
    }),

  generateSingleSection: protectedProcedure
    .input(AIProtocolSectionInputSchema)
    .mutation(async ({ ctx, input }): Promise<AIProtocolSectionOutput> => {
      console.log(
        `User ${ctx.session.user.id} initiated section ${input.sectionNumber} generation for condition: ${input.medicalCondition}`,
      );
      const typedInput: AIProtocolSectionInput = {
        ...input,
        previousSectionsContent: input.previousSectionsContent
          ? (input.previousSectionsContent as Partial<ProtocolFullContent>)
          : undefined,
      };
      return generateProtocolSectionAI(typedInput);
    }),
});
