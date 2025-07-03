/**
 * tRPC Router for Protocol Validation
 */
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { validateFullProtocol } from "@/lib/validators";
import {
  ProtocolFullContentSchema,
  FlowchartDataSchema,
} from "@/lib/validators/protocol-schema";

export const validationRouter = router({
  validateProtocol: protectedProcedure
    .input(
      z.object({
        protocolId: z.string().cuid(),
        versionId: z.string().cuid(),
        content: ProtocolFullContentSchema,
        flowchart: FlowchartDataSchema.optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { protocolId, versionId, content, flowchart } = input;

      try {
        const validationReport = await validateFullProtocol(
          protocolId,
          versionId,
          content as any,
          flowchart as any,
        );

        return {
          success: true,
          report: validationReport,
        };
      } catch (error) {
        console.error(
          "[TRPC /validation.validateProtocol] Validation error:",
          error,
        );
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Erro desconhecido na validação",
          report: null,
        };
      }
    }),

  validateContent: protectedProcedure
    .input(
      z.object({
        content: ProtocolFullContentSchema,
        flowchart: FlowchartDataSchema.optional(),
        validationTypes: z
          .array(
            z.enum([
              "structure",
              "completeness",
              "medical",
              "medication",
              "flowchart",
              "crossValidation",
            ]),
          )
          .optional()
          .default(["structure", "completeness", "medical", "medication"]),
      }),
    )
    .mutation(async ({ input }) => {
      const { content, flowchart, validationTypes: _validationTypes } = input;

      try {
        // Use a temporary ID for quick validation
        const tempProtocolId = "temp-validation";
        const tempVersionId = "temp-version-validation";

        // For quick validation, we can still use the full validation
        // but could optimize later to run only selected validation types
        const validationReport = await validateFullProtocol(
          tempProtocolId,
          tempVersionId,
          content as any,
          flowchart as any,
        );

        console.log(
          "[TRPC /validation.validateContent] Validation report generated:",
          {
            issuesCount: validationReport.issues.length,
            summary: validationReport.summary,
            isValid: validationReport.isValid,
          },
        );

        return {
          success: true,
          issues: validationReport.issues,
          summary: validationReport.summary,
          isValid: validationReport.isValid,
        };
      } catch (error) {
        console.error(
          "[TRPC /validation.validateContent] Content validation error:",
          error,
        );
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Erro desconhecido na validação de conteúdo",
          issues: [],
          summary: {
            totalIssues: 0,
            errors: 0,
            warnings: 0,
          },
          isValid: false,
        };
      }
    }),
});
