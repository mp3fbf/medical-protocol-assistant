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
  // TODO: Implement logic.
  return issues;
};

// Placeholder for a rule checking if all flowchart decision nodes are reflected in text
const checkFlowchartDecisionsInText: ValidatorFunction = (
  _protocolContent,
  _protocolFlowchart,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  // TODO: Implement logic.
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
];

/**
 * Validates consistency between protocol text and flowchart.
 * This function is async to accommodate potentially async rules.
 * @param protocolContent The full content of the protocol.
 * @param protocolFlowchart The flowchart data.
 * @returns An array of validation issues.
 */
export const validateCrossConsistency = async (
  protocolContent: ProtocolFullContent,
  protocolFlowchart?: FlowchartData,
): Promise<ValidationIssue[]> => {
  if (!protocolFlowchart) {
    return [];
  }

  let allIssues: ValidationIssue[] = [];
  for (const rule of CROSS_VALIDATION_RULES) {
    const ruleIssuesResult = await rule.check(
      protocolContent,
      protocolFlowchart,
    );
    allIssues = allIssues.concat(ruleIssuesResult);
  }
  return allIssues;
};
