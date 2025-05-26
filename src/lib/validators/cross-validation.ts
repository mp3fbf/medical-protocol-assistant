/**
 * Cross-Validation Rules: Text vs. Flowchart.
 *
 * These validators ensure consistency between the textual content of the protocol
 * and its visual flowchart representation. For example:
 * - Every decision point in the text maps to a flowchart node.
 * - All medications mentioned in the text appear in flowchart medication tables.
 * - Conditional criteria in flowcharts match those in the text.
 */
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
import type {
  ValidationIssue,
  ValidatorFunction,
  ValidationRuleDefinition,
} from "@/types/validation";

// Placeholder for a rule checking if all text decision points are in the flowchart
const checkTextDecisionsInFlowchart: ValidatorFunction = (
  _protocolContent,
  _protocolFlowchart,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  // TODO: Implement logic. For example:
  // 1. Parse text to identify decision points (e.g., "Se PAS < 90 mmHg, então...").
  // 2. Check if each decision point has a corresponding 'decision' node in the flowchart
  //    with matching criteria.
  // if (someTextDecisionMissingInFlowchart) {
  //   issues.push({
  //     ruleId: "CROSS_VALIDATION_001",
  //     message: "Decisão textual 'XYZ' não encontrada no fluxograma.",
  //     severity: "error",
  //     category: "FLOWCHART_CONSISTENCY",
  //     // Potentially add sectionNumber or specific text snippet
  //   });
  // }
  return issues;
};

// Placeholder for a rule checking if all flowchart decision nodes are reflected in text
const checkFlowchartDecisionsInText: ValidatorFunction = (
  _protocolContent,
  _protocolFlowchart,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  // TODO: Implement logic.
  // if (someFlowchartDecisionNotInText) {
  //   issues.push({
  //     ruleId: "CROSS_VALIDATION_002",
  //     message: "Nó de decisão 'ABC' do fluxograma não tem correspondência clara no texto.",
  //     severity: "error",
  //     category: "FLOWCHART_CONSISTENCY",
  //     // Potentially add flowchart node ID
  //   });
  // }
  return issues;
};

export const CROSS_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "CROSS_TEXT_DECISIONS_IN_FLOWCHART",
    description:
      "Ensures all decision points from the protocol text are represented in the flowchart.",
    severity: "error",
    category: "FLOWCHART_CONSISTENCY",
    check: checkTextDecisionsInFlowchart,
  },
  {
    id: "CROSS_FLOWCHART_DECISIONS_IN_TEXT",
    description:
      "Ensures all decision nodes in the flowchart are reflected in the protocol text.",
    severity: "error",
    category: "FLOWCHART_CONSISTENCY",
    check: checkFlowchartDecisionsInText,
  },
  // Add more rules: medication consistency, conditional criteria matching, etc.
];

/**
 * Validates consistency between protocol text and flowchart.
 * @param protocolContent The full content of the protocol.
 * @param protocolFlowchart The flowchart data.
 * @returns An array of validation issues.
 */
export const validateCrossConsistency: ValidatorFunction = async (
  protocolContent,
  protocolFlowchart,
): Promise<ValidationIssue[]> => {
  // This function will be more meaningful once flowchart data structure is defined
  // and flowchart generation/editing is implemented.
  if (!protocolFlowchart) {
    // If no flowchart data is provided, we might return specific warnings or skip these checks.
    // For now, skipping if no flowchart data.
    return [];
  }

  let allIssues: ValidationIssue[] = [];
  for (const rule of CROSS_VALIDATION_RULES) {
    const ruleIssues = await rule.check(protocolContent, protocolFlowchart);
    allIssues = allIssues.concat(ruleIssues);
  }
  return allIssues;
};
