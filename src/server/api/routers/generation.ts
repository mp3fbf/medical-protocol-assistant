/**
 * tRPC Router for AI Protocol Generation operations
 */
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  generateFullProtocolAI,
  generateProtocolSectionAI,
} from "@/lib/ai/generator";
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
