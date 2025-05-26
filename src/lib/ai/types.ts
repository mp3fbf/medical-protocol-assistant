/**
 * TypeScript Types for AI Requests and Responses
 *
 * This file defines common interfaces and types used when interacting
 * with AI services for research, generation, and other tasks.
 */

// Generic structure for AI-generated content that needs to be parsed
export interface StructuredOutput<T> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number; // Optional confidence score from the AI
  warnings?: string[]; // Any warnings or caveats from the AI
}

// Represents a chunk of information extracted during AI research
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
  objectiveCriteria?: Record<string, string | number | boolean>; // Extracted objective data
  metadata?: Record<string, any>; // Other relevant metadata from the source
}

// Represents the result of an AI research phase
export interface AIResearchData {
  query: string;
  findings: AIResearchFinding[];
  summary?: string; // Overall summary of the research
  timestamp: string;
}

// Context provided to the AI for generating a protocol or a section
export interface AIGenerationContext {
  medicalCondition: string;
  targetAudience: string; // e.g., "Emergency Room Physicians"
  existingSections?: Record<string, string>; // Content of already generated/edited sections
  researchData?: AIResearchData; // Relevant research findings
  specificInstructions?: string; // Any specific user instructions for this generation task
  outputFormatRequirements?: string; // e.g., "Ensure all 13 sections are present"
}

// Represents the output from an AI protocol generation task
export interface AIProtocolGenerationOutput {
  // This will map to the 13 sections of the protocol
  // For now, using a generic record; will be more specific later
  sections: Record<string, string | Record<string, any>>;
  flowchartLogic?: any; // AI's attempt to convert text to flowchart logic
  warnings?: string[]; // Warnings about potential inaccuracies or missing info
  confidenceScore?: number;
}

// Represents the output from an AI section generation task
export interface AISectionGenerationOutput {
  sectionNumber: number;
  title: string;
  content: string | Record<string, any>; // The generated content for the section
  explanation?: string; // AI's explanation of how it generated the content
  confidenceScore?: number;
}

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
