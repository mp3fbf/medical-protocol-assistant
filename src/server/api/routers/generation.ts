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
} from "@/lib/validators/protocol-schema";
import type { ProtocolFullContent } from "@/types/protocol";

const AIFullProtocolGenerationInputSchema = z.object({
  protocolId: z.string().uuid().optional(),
  medicalCondition: z.string().min(1, "Condição médica é obrigatória."),
  researchData: AIResearchDataSchema,
  specificInstructions: z.string().optional(),
});

const AIProtocolSectionInputSchema = z.object({
  protocolId: z.string().uuid("ID de protocolo inválido."),
  protocolVersionId: z.string().uuid("ID de versão inválido.").optional(),
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
        return generateFullProtocolAI(
          input as unknown as AIFullProtocolGenerationInput,
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
