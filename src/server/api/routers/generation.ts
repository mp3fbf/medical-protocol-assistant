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
import { AIResearchDataSchema } from "@/lib/validators/protocol-schema"; // Assuming this exists or will be created
import { ProtocolFullContentSchema } from "@/lib/validators/protocol-schema"; // For previousSectionsContent

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
  sectionTitle: z.string().optional(),
  researchFindings: AIResearchDataSchema.shape.findings.optional(), // Array of AIResearchFinding
  previousSectionsContent: ProtocolFullContentSchema.optional(), // Allow partial for context
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
        // Type assertion, Zod validation ensures compatibility
        return generateFullProtocolAI(input as AIFullProtocolGenerationInput);
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
      // Type assertion, Zod validation ensures compatibility
      return generateProtocolSectionAI(input as AIProtocolSectionInput);
    }),
});

// Note: AIResearchDataSchema needs to be defined or imported correctly.
// If it's not already defined in protocol-schema.ts, it should be created based on AIResearchData type.
// For now, assuming it exists for the input validation.
