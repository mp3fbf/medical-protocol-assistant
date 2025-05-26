/**
 * TypeScript Types for AI Protocol Generation
 */
import type {
  AIResearchData,
  AISectionGenerationOutput as BaseAISectionOutput,
} from "@/lib/ai/types";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";

/**
 * Input for generating a single protocol section using AI.
 */
export interface AIProtocolSectionInput {
  protocolId: string; // ID of the protocol being edited/created
  protocolVersionId?: string; // Optional: ID of the specific version being worked on
  medicalCondition: string;
  sectionNumber: number; // 1-13
  sectionTitle?: string; // Optional: user can pre-fill title
  researchFindings?: AIResearchData["findings"]; // Relevant research findings
  previousSectionsContent?: Partial<ProtocolFullContent>; // Content of sections already generated/filled
  specificInstructions?: string; // User-provided specific instructions for this section
}

/**
 * Output from generating a single protocol section using AI.
 * Extends the base output to ensure sectionNumber and title are present.
 */
export interface AIProtocolSectionOutput extends BaseAISectionOutput {
  sectionNumber: number;
  title: string;
  content: ProtocolSectionData["content"]; // String or structured JSON
}

/**
 * Input for generating a full medical protocol using AI.
 */
export interface AIFullProtocolGenerationInput {
  protocolId?: string; // Optional: if generating for an existing draft protocol
  medicalCondition: string;
  researchData: AIResearchData; // Comprehensive research data
  specificInstructions?: string; // Overall instructions for the protocol
}

/**
 * Output from generating a full medical protocol using AI.
 * This should conform to the ProtocolFullContent structure.
 */
export interface AIFullProtocolGenerationOutput {
  protocolContent: ProtocolFullContent;
  warnings?: string[]; // Warnings about potential inaccuracies or missing info
  confidenceScore?: number; // Overall confidence for the full protocol
}

/**
 * Represents the structure of a medication item as expected by AI prompts
 * and for validation.
 */
export interface MedicationPromptInput {
  name: string;
  dose: string; // e.g., "500mg", "10mg/kg"
  route: string; // e.g., "Oral", "IV", "IM"
  frequency: string; // e.g., "BID", "q6h", "Once daily"
  duration?: string; // e.g., "7 days", "Until symptom resolution"
  notes?: string; // Additional notes or conditions
}

/**
 * Represents a standard section definition for prompting the AI.
 */
export interface StandardSectionDefinition {
  sectionNumber: number;
  titlePT: string; // Title in Portuguese
  description: string; // Brief description of what this section should contain
  // Specific structural requirements or fields for this section, as a JSON schema-like object or descriptive text
  contentSchemaDescription: string;
  example?: Record<string, any>; // Example JSON output for this section's content
}
