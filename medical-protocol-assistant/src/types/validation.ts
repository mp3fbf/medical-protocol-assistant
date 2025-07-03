/**
 * Common TypeScript types for the protocol validation engine.
 */
import type { ProtocolFullContent, FlowchartData } from "./protocol"; // Assuming these types exist

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  ruleId: string; // Identifier for the specific rule that failed
  sectionNumber?: number; // Section number where the issue occurred
  field?: string; // Specific field within a section or node
  message: string; // User-friendly error/warning message in PT-BR
  severity: ValidationSeverity;
  category?:
    | "STRUCTURE"
    | "COMPLETENESS"
    | "OBJECTIVITY"
    | "MEDICATION"
    | "FLOWCHART_CONSISTENCY"
    | "CONTENT_SPECIFIC";
  details?: Record<string, any>; // Additional details about the issue
  // E.g., for a medication issue: { medicationName: "Dipirona", expected: "500mg", found: "5g" }
  suggestion?: string; // Optional suggestion for fixing the issue
}

export interface ValidationReport {
  protocolId: string;
  versionId?: string; // Optional, if validating a specific version
  isValid: boolean; // Overall validity (true if no 'error' severity issues)
  issues: ValidationIssue[];
  checkedAt: string; // ISO timestamp
  summary?: {
    totalIssues: number;
    errors: number;
    warnings: number;
  };
}

/**
 * A generic function signature for individual validation checks.
 * Each validator will implement this. Can be sync or async.
 * @param protocolContent The full content of the protocol (all 13 sections).
 * @param protocolFlowchart Optional flowchart data for cross-validation.
 * @returns An array of ValidationIssue found by this specific validator, or a Promise resolving to it.
 */
export type ValidatorFunction = (
  protocolContent: ProtocolFullContent,
  protocolFlowchart?: FlowchartData, // Flowchart data is optional for now
) => ValidationIssue[] | Promise<ValidationIssue[]>;

/**
 * Defines the structure for a single validation rule.
 */
export interface ValidationRuleDefinition {
  id: string; // Unique ID for the rule (e.g., "STRUCTURE_001", "MEDICATION_002")
  description: string; // Description of what the rule checks (in English for devs)
  severity: ValidationSeverity;
  category:
    | "STRUCTURE"
    | "COMPLETENESS"
    | "OBJECTIVITY"
    | "MEDICATION"
    | "FLOWCHART_CONSISTENCY"
    | "CONTENT_SPECIFIC";
  check: ValidatorFunction;
}
