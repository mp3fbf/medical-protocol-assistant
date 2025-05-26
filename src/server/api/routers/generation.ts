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
  ProtocolFullContentSchema, // Used for previousSectionsContent
} from "@/lib/validators/protocol-schema";
import type { ProtocolFullContent } from "@/types/protocol";

// Zod schema for AIFullProtocolGenerationInput
const AIFullProtocolGenerationInputSchema = z.object({
  protocolId: z.string().uuid().optional(),
  medicalCondition: z.string().min(1, "Condição médica é obrigatória."),
  researchData: AIResearchDataSchema, // Use the Zod schema for AIResearchData
  specificInstructions: z.string().optional(),
});

// Zod schema for AIProtocolSectionInput
const AIProtocolSectionInputSchema = z.object({
  protocolId: z.string().uuid("ID de protocolo inválido."),
  protocolVersionId: z.string().uuid("ID de versão inválido.").optional(),
  medicalCondition: z.string().min(1, "Condição médica é obrigatória."),
  sectionNumber: z
    .number()
    .int()
    .min(1)
    .max(13, "Número da seção deve ser entre 1 e 13."),
  sectionTitle: z.string().optional(), // User might pre-fill this
  researchFindings: AIResearchDataSchema.shape.findings.optional(),
  // previousSectionsContent should match ProtocolFullContent structure but allow partial data
  previousSectionsContent: z.record(z.string(), z.any()).optional(), // Simplified for flexibility, actual structure from ProtocolFullContentSchema
  specificInstructions: z.string().optional(),
});

export const generationRouter = router({
  /**
   * Generates a full 13-section medical protocol using AI.
   */
  generateFullProtocol: protectedProcedure
    .input(AIFullProtocolGenerationInputSchema)
    .mutation(
      async ({ ctx, input }): Promise<AIFullProtocolGenerationOutput> => {
        console.log(
          `User ${ctx.session.user.id} initiated full protocol generation for: ${input.medicalCondition}`,
        );
        // Type assertion, Zod validation ensures compatibility at the boundary.
        // The generateFullProtocolAI function expects the more specific AIFullProtocolGenerationInput type.
        return generateFullProtocolAI(
          input as unknown as AIFullProtocolGenerationInput,
        );
      },
    ),

  /**
   * Generates a single protocol section using AI.
   */
  generateSingleSection: protectedProcedure
    .input(AIProtocolSectionInputSchema)
    .mutation(async ({ ctx, input }): Promise<AIProtocolSectionOutput> => {
      console.log(
        `User ${ctx.session.user.id} initiated section ${input.sectionNumber} generation for condition: ${input.medicalCondition}`,
      );
      // Similar to above, ensure type compatibility.
      // The previousSectionsContent might need careful mapping if its Zod schema is simplified here.
      // For now, direct assertion after Zod validation.
      const typedInput: AIProtocolSectionInput = {
        ...input,
        // Ensure previousSectionsContent is correctly typed if provided
        previousSectionsContent: input.previousSectionsContent
          ? (input.previousSectionsContent as Partial<ProtocolFullContent>)
          : undefined,
      };
      return generateProtocolSectionAI(typedInput);
    }),
});
