/**
 * tRPC Router for Medical Research operations
 */
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { performMedicalResearch } from "@/lib/ai/research";
import type {
  DeepResearchQuery,
  AggregatedResearchOutput,
  // DeepResearchSource as _DeepResearchSource, // Marked as unused
} from "@/types/research"; // Import from new canonical location
// import { DeepResearchSource as _DeepResearchSourceImport } from "@/lib/ai/types"; // No longer needed

const DeepResearchQueryInputSchema = z.object({
  condition: z
    .string()
    .min(3, "A condição médica deve ter pelo menos 3 caracteres."),
  sources: z
    .array(z.enum(["pubmed", "scielo", "cfm", "mec", "other_guidelines"]))
    .optional(),
  yearRange: z.number().int().min(1).max(20).optional().default(5),
  keywords: z.array(z.string()).optional(),
});

export const researchRouter = router({
  performResearch: protectedProcedure
    .input(DeepResearchQueryInputSchema)
    .mutation(async ({ ctx, input }): Promise<AggregatedResearchOutput> => {
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
        throw error;
      }
    }),
});
