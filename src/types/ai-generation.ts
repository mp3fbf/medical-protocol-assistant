/**
 * TypeScript Types for AI Protocol Generation
 */
import type { AIResearchData, AIResearchFinding } from "@/types/research"; // Import from the new canonical source
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";

/**
 * Input for generating a single protocol section using AI.
 */
export interface AIProtocolSectionInput {
  protocolId: string;
  protocolVersionId?: string;
  medicalCondition: string;
  sectionNumber: number; // 1-13
  sectionTitle?: string;
  researchFindings?: AIResearchFinding[];
  previousSectionsContent?: Partial<ProtocolFullContent>;
  specificInstructions?: string;
}

/**
 * Output from generating a single protocol section using AI.
 * This should align with the structure of ProtocolSectionData.
 */
export interface AIProtocolSectionOutput {
  sectionNumber: number;
  title: string;
  content: ProtocolSectionData["content"];
  explanation?: string;
  confidenceScore?: number;
}

/**
 * Input for generating a full medical protocol using AI.
 */
export interface AIFullProtocolGenerationInput {
  protocolId?: string;
  medicalCondition: string;
  researchData: AIResearchData;
  specificInstructions?: string;
}

/**
 * Output from generating a full medical protocol using AI.
 * This should conform to the ProtocolFullContent structure.
 */
export interface AIFullProtocolGenerationOutput {
  protocolContent: ProtocolFullContent;
  warnings?: string[];
  confidenceScore?: number;
}

/**
 * Represents the structure of a medication item as expected by AI prompts
 * and for validation.
 */
export interface MedicationPromptInput {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  duration?: string;
  notes?: string;
}

/**
 * Represents a standard section definition for prompting the AI.
 */
export interface StandardSectionDefinition {
  sectionNumber: number;
  titlePT: string;
  description: string;
  contentSchemaDescription: string;
  // Example content can be a string, a record, or an array of records.
  example?: Record<string, any> | Array<Record<string, any>> | string;
}
