/**
 * TypeScript Types for AI Requests and Responses
 *
 * THIS FILE IS BEING DEPRECATED. Types are being moved to:
 * - src/types/ai-generation.ts
 * - src/types/research.ts
 *
 * Please update imports to use the new locations.
 * This file will be removed in a future cleanup step (Step 6 of Optimization Plan).
 */

/*
// Generic structure for AI-generated content that needs to be parsed
export interface StructuredOutput<T> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number; // Optional confidence score from the AI
  warnings?: string[]; // Any warnings or caveats from the AI
}

// Represents a chunk of information extracted during AI research
// MOVED to src/types/research.ts as AIResearchFinding
// export interface AIResearchFinding { ... }

// Represents the result of an AI research phase
// MOVED to src/types/research.ts as AIResearchData
// export interface AIResearchData { ... }

// Context provided to the AI for generating a protocol or a section
// MOVED to src/types/ai-generation.ts as AIGenerationContext (implicitly, via specific input types)
// export interface AIGenerationContext { ... }

// Represents the output from an AI protocol generation task
// MOVED to src/types/ai-generation.ts as AIFullProtocolGenerationOutput
// export interface AIProtocolGenerationOutput { ... }

// Represents the output from an AI section generation task
// MOVED to src/types/ai-generation.ts as AIProtocolSectionOutput
// export interface AISectionGenerationOutput { ... }

// Type for sources to be queried by DeepResearch
// MOVED to src/types/research.ts as DeepResearchSource
// export type DeepResearchSource = ...;

// MOVED to src/types/research.ts as DeepResearchQuery
// export interface DeepResearchQuery { ... }
*/
export {}; // Add an empty export to keep it a module until deleted
