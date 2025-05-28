/**
 * Central export for all validation-related modules and functions.
 * Includes a comprehensive validation orchestrator.
 */
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
import type { ValidationReport, ValidationIssue } from "@/types/validation";

import { validateProtocolStructure } from "./protocol-structure";
import { validateMedications } from "./medication";
import { validateCompleteness } from "./completeness";
import { validateCrossConsistency } from "./cross-validation";
import { validateFlowchart } from "./flowchart"; // Assuming this exists for direct flowchart validation

export {
  validateProtocolStructure,
  validateMedications,
  validateCompleteness,
  validateCrossConsistency,
  validateFlowchart,
};

/**
 * Orchestrates all validation checks for a given protocol version's content and flowchart.
 *
 * @param protocolId - The ID of the protocol.
 * @param versionId - The ID of the protocol version being validated.
 * @param content - The full textual content of the protocol (13 sections).
 * @param flowchart - (Optional) The flowchart data associated with the protocol version.
 * @returns A Promise resolving to a ValidationReport.
 */
export async function validateFullProtocol(
  protocolId: string,
  versionId: string,
  content: ProtocolFullContent,
  flowchart?: FlowchartData,
): Promise<ValidationReport> {
  const allIssues: ValidationIssue[] = [];

  // Perform all validation checks
  allIssues.push(...(await validateProtocolStructure(content, flowchart)));
  allIssues.push(...(await validateCompleteness(content, flowchart)));
  allIssues.push(...(await validateMedications(content, flowchart)));

  if (flowchart) {
    allIssues.push(...(await validateFlowchart(flowchart))); // Validates flowchart-specific rules (e.g., orphans, loops)
    allIssues.push(...(await validateCrossConsistency(content, flowchart))); // Validates text vs. flowchart
  } else {
    // If no flowchart, add a warning or note that flowchart validation is skipped
    allIssues.push({
      ruleId: "SYSTEM_NO_FLOWCHART_FOR_VALIDATION",
      message:
        "Nenhum fluxograma fornecido; validações de fluxograma e de consistência texto-fluxograma foram ignoradas.",
      severity: "warning",
      category: "FLOWCHART_CONSISTENCY", // Or a general category
    });
  }

  const errors = allIssues.filter((issue) => issue.severity === "error").length;
  const warnings = allIssues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  return {
    protocolId,
    versionId,
    isValid: errors === 0, // Protocol is valid if there are no errors (warnings are acceptable)
    issues: allIssues,
    checkedAt: new Date().toISOString(),
    summary: {
      totalIssues: allIssues.length,
      errors,
      warnings,
    },
  };
}
