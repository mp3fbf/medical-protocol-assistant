/**
 * TypeScript Types for Medical Research Functionality
 */

// Type for sources to be queried by DeepResearch
export type DeepResearchSource =
  | "pubmed"
  | "scielo"
  | "cfm"
  | "mec"
  | "other_guidelines";

export interface DeepResearchQuery {
  condition: string;
  sources?: DeepResearchSource[];
  yearRange?: number; // e.g., last 5 years
  keywords?: string[];
}

/**
 * Represents the raw structure of a single article or guideline
 * as (mock) returned by the DeepResearch API.
 */
export interface RawDeepResearchArticle {
  id: string;
  title: string;
  authors?: string[];
  publicationDate?: string; // ISO date string
  sourceName: string; // e.g., "PubMed", "SciELO", "CFM Guideline"
  sourceUrl?: string; // URL to the original article/guideline
  abstract?: string;
  fullTextSnippet?: string; // A relevant snippet or the full text if available
  keywords?: string[];
  doi?: string;
}

/**
 * Represents a chunk of information extracted during AI research.
 * This is the canonical definition for AIResearchFinding.
 */
export interface AIResearchFinding {
  id: string;
  source: string; // e.g., PubMed ID, Guideline URL
  findingType:
    | "diagnostic_criteria"
    | "treatment_protocol"
    | "geriatric_consideration"
    | "dosage_information"
    | "numeric_threshold"
    | "other";
  extractedText: string; // The raw text extracted
  summary?: string; // Optional AI-generated summary
  // Using a flexible record for objectiveCriteria as its structure varies by findingType
  objectiveCriteria?: Record<
    string,
    string | number | boolean | Record<string, any> | Array<any>
  >;
  metadata?: Record<string, any>; // Other relevant metadata from the source
}

/**
 * Represents the result of an AI research phase.
 * This is the canonical definition for AIResearchData.
 */
export interface AIResearchData {
  query: string;
  findings: AIResearchFinding[];
  summary?: string; // Overall summary of the research
  timestamp: string; // ISO timestamp of when the research was performed/data aggregated
}

// Specific finding types for narrowing (examples)
export interface DiagnosticCriterionFinding extends AIResearchFinding {
  findingType: "diagnostic_criteria";
  objectiveCriteria: {
    // More specific structure for this type
    criterionName: string;
    threshold?: string | number; // e.g., "> 10 mg/L" or 10
    unit?: string; // e.g., "mg/L"
    description?: string; // Brief description of the criterion.
    scaleUsed?: string; // e.g., "Glasgow Coma Scale"
  };
}

export interface TreatmentProtocolFinding extends AIResearchFinding {
  findingType: "treatment_protocol";
  objectiveCriteria: {
    // More specific structure for this type
    medicationName?: string;
    dosage?: string;
    route?: string;
    frequency?: string;
    duration?: string;
    interventionName?: string; // For non-pharmacological treatments
    description: string; // Description of the treatment step or guideline.
  };
}

export interface GeriatricConsiderationFinding extends AIResearchFinding {
  findingType: "geriatric_consideration";
  objectiveCriteria: {
    // More specific structure for this type
    aspect: string; // e.g., "Renal function adjustment", "Polypharmacy"
    recommendation?: string;
    warning?: string;
    description: string; // Specific advice or warning for elderly patients.
  };
}

// Alias for consistency if `ProcessedAIMedicalFinding` was used elsewhere
export type ProcessedAIMedicalFinding = AIResearchFinding;
// Alias for consistency if `AggregatedResearchOutput` was used elsewhere
export type AggregatedResearchOutput = AIResearchData;
