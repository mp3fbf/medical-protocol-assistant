/**
 * tRPC Router for Medical Research operations
 */
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { performMedicalResearch } from "@/lib/ai/research";
import type {
  DeepResearchQuery,
  AggregatedResearchOutput,
} from "@/types/research";
import { DeepResearchSource } from "@/lib/ai/types"; // Using the canonical type

// Zod schema for DeepResearchQuery, aligning with the TypeScript type
const DeepResearchQueryInputSchema = z.object({
  condition: z
    .string()
    .min(3, "A condição médica deve ter pelo menos 3 caracteres."),
  sources: z
    .array(z.enum(["pubmed", "scielo", "cfm", "mec", "other_guidelines"]))
    .optional(),
  yearRange: z.number().int().min(1).max(20).optional().default(5), // Default 5 years, max 20
  keywords: z.array(z.string()).optional(),
});

export const researchRouter = router({
  /**
   * Performs medical literature research via DeepResearch (mocked) and AI processing.
   */
  performResearch: protectedProcedure
    .input(DeepResearchQueryInputSchema)
    .mutation(async ({ ctx, input }): Promise<AggregatedResearchOutput> => {
      // `ctx.session.user` is available and validated by `protectedProcedure`
      console.log(
        `User ${ctx.session.user.id} initiated research for: ${input.condition}`,
      );

      try {
        const researchOutput = await performMedicalResearch(
          input as DeepResearchQuery,
        );
        return researchOutput;
      } catch (error: any) {
        console.error("Error in performResearch tRPC procedure:", error);
        // Re-throw or transform into a TRPCError
        // For now, re-throwing to see the original error cause during development
        // In production, might want to throw a generic TRPCError
        throw error;
      }
    }),
});
