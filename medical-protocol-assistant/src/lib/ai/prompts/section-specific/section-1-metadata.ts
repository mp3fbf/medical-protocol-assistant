/**
 * Prompts specific to Section 1: Identificação do Protocolo.
 * These can be more detailed helper prompts or data structures
 * to guide the AI for this particular section if needed beyond
 * the standard section definition.
 */

// Currently, the main prompt in protocol-generation.ts combined with SECTION_DEFINITIONS
// is expected to handle this section. This file is a placeholder for future,
// more granular prompt engineering for Section 1 if it becomes necessary.

export const SECTION_1_ADDITIONAL_INSTRUCTIONS = `
Ensure the 'codigoProtocolo' is concise and follows a pattern like 'COND-001' where COND is a short code for the condition.
The 'tituloCompleto' should accurately reflect the medical condition and scope.
All dates must be in YYYY-MM-DD format.
'ambitoAplicacao' should clearly state where this protocol applies (e.g., specific hospital units, all emergency rooms).
`;

// Example of how this could be used if section-specific logic was complex:
/*
import type { StandardSectionDefinition } from "@/types/ai-generation";

export function getSection1PromptDetails(
  baseDefinition: StandardSectionDefinition,
  medicalCondition: string
): string {
  // Potentially modify baseDefinition.contentSchemaDescription or add more examples based on medicalCondition
  return `
    For Section 1 (${baseDefinition.titlePT}) concerning "${medicalCondition}":
    ${SECTION_1_ADDITIONAL_INSTRUCTIONS}
    Remember to strictly adhere to the following JSON structure for the content:
    ${JSON.stringify(baseDefinition.example, null, 2)}
  `;
}
*/
