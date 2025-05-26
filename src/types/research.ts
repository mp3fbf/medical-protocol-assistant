/**
 * TypeScript Types for Medical Research Functionality
 */
import type {
  DeepResearchSource as OriginalDeepResearchSource,
  DeepResearchQuery as OriginalDeepResearchQuery,
  AIResearchFinding as OriginalAIResearchFinding,
  AIResearchData as OriginalAIResearchData,
} from "@/lib/ai/types"; // Assuming these are the intended canonical types

// Re-export for local module usage if preferred, or use directly from ai/types
export type DeepResearchSource = OriginalDeepResearchSource;
export type DeepResearchQuery = OriginalDeepResearchQuery;

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
 * Represents a single structured finding extracted and processed by an AI model
 * from a RawDeepResearchArticle.
 * This aligns with AIResearchFinding from src/lib/ai/types.ts
 */
export type ProcessedAIMedicalFinding = OriginalAIResearchFinding;

/**
 * Represents the aggregated and structured output of the research process
 * for a given query.
 * This aligns with AIResearchData from src/lib/ai/types.ts
 */
export type AggregatedResearchOutput = OriginalAIResearchData;

// Example of a more specific finding type, if needed for processing
export interface DiagnosticCriterionFinding extends ProcessedAIMedicalFinding {
  findingType: "diagnostic_criteria";
  criteriaDetails: {
    name: string;
    threshold?: string | number;
    description: string;
  }[];
}

export interface TreatmentProtocolFinding extends ProcessedAIMedicalFinding {
  findingType: "treatment_protocol";
  treatmentDetails: {
    medicationName?: string;
    dosage?: string;
    route?: string;
    frequency?: string;
    duration?: string;
    description: string;
  }[];
}

export interface GeriatricConsiderationFinding
  extends ProcessedAIMedicalFinding {
  findingType: "geriatric_consideration";
  considerationDetails: {
    aspect: string;
    description: string;
  }[];
}
