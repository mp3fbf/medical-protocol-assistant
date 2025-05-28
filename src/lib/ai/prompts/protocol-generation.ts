/**
 * Prompts for AI-powered medical protocol generation.
 */
import type { AIResearchData } from "@/types/research"; // Corrected import
import type { StandardSectionDefinition as _StandardSectionDefinition } from "@/types/ai-generation"; // Keep for createFullProtocolUserPrompt type
import type {
  ProtocolFullContent,
  ProtocolSectionData as _ProtocolSectionData, // Marked as unused if only its sub-property 'content' is used
} from "@/types/protocol";
import { SECTION_DEFINITIONS as _SECTION_DEFINITIONS } from "./section-specific"; // Prefixed as it's passed to functions

export const PROTOCOL_GENERATION_SYSTEM_PROMPT = `
  You are an expert AI assistant for generating standardized medical protocols.
  Your primary goal is to create documents with **perfect formatting and structure** according to the provided specifications (13 sections, ABNT-like format where applicable for structure).
  Clinical accuracy of the initial draft is secondary to format and completeness; clinical details will be reviewed and refined by human medical experts.
  
  Key Directives:
  1.  **Complete All 13 Sections**: Every protocol MUST have all 13 sections. If information for a section is scarce or not applicable based on research, generate a placeholder statement like "Não aplicável para esta condição" or "Informação não disponível na pesquisa inicial." but ensure the section exists with its title.
  2.  **Structured Output**: Generate content in JSON format as specified. Each section should have a 'sectionNumber', 'title', and 'content'. The 'content' field can be a string or a structured JSON object if the section demands it (e.g., tables, lists of criteria).
  3.  **Objective Criteria**: All decision points, criteria, and thresholds must be objective and clearly defined (e.g., "Glasgow Coma Scale < 13", "Temperature > 38.5°C", " presença de criterium X"). Avoid vague terms like "severe" or "significant" without quantification.
  4.  **Medication Details**: When mentioning medications, always include: Dose, Route, Frequency, and Duration if specified in the research or standard practice (e.g., "Amoxicilina 500mg, via oral, a cada 8 horas, por 7 dias").
  5.  **Portuguese Language**: All generated protocol text (titles, content) must be in Brazilian Portuguese (PT-BR).
  6.  **Consistency**: Ensure consistency across sections (e.g., terminology, abbreviations defined once).
  7.  **No Patient Data**: Do not include any placeholder or example patient data.
  8.  **Conciseness and Clarity**: Be clear and to the point.
  9.  **References**: If specific references are used for a section, indicate them appropriately, especially for Section 13 (Referências Bibliográficas).
  
  You will be provided with research findings and a medical condition. Your task is to synthesize this information into a complete 13-section protocol draft or a specific section as requested.
  `;

export function createFullProtocolUserPrompt(
  medicalCondition: string,
  researchData: AIResearchData,
  allSectionDefinitions: _StandardSectionDefinition[],
  specificInstructions?: string,
): string {
  const researchSummary = researchData.findings
    .map(
      (f) =>
        `- Source: ${f.source} (${f.findingType}): ${f.extractedText.substring(0, 150)}...`,
    )
    .join("\n");

  const sectionInstructions = allSectionDefinitions
    .map(
      (sd) =>
        `Seção ${sd.sectionNumber} - ${sd.titlePT}:\n  Descrição: ${sd.description}\n  Estrutura Esperada do Conteúdo: ${sd.contentSchemaDescription}\n  Exemplo (se aplicável): ${JSON.stringify(sd.example)}\n`,
    )
    .join("\n---\n");

  return `
  Medical Condition: ${medicalCondition}
  ${specificInstructions ? `\nGlobal Instructions for Protocol: ${specificInstructions}` : ""}
  
  Research Findings Summary:
  ${researchSummary || "Nenhuma pesquisa detalhada fornecida."}
  
  Please generate a complete 13-section medical protocol for the condition specified above.
  Follow the system prompt directives strictly.
  The output must be a single JSON object where keys are section numbers (as strings, e.g., "1", "2", ..., "13") and values are objects containing 'sectionNumber' (number), 'title' (string, PT-BR), and 'content' (string or structured JSON).
  
  Section Definitions and Expected Structures:
  ---
  ${sectionInstructions}
  ---
  
  Example of the top-level JSON output structure:
  \`\`\`json
  {
    "1": { "sectionNumber": 1, "title": "Título da Seção 1", "content": "Conteúdo da seção 1..." },
    "2": { "sectionNumber": 2, "title": "Título da Seção 2", "content": { "field1": "value1", "field2": ["itemA", "itemB"] } },
    // ... and so on for all 13 sections
    "13": { "sectionNumber": 13, "title": "Referências Bibliográficas", "content": "Lista de referências..." }
  }
  \`\`\`
  Ensure every section from 1 to 13 is present in the output.
  `;
}

export function createSingleSectionUserPrompt(
  medicalCondition: string,
  sectionDefinition: _StandardSectionDefinition,
  researchFindings?: AIResearchData["findings"],
  previousSectionsContent?: Partial<ProtocolFullContent>,
  specificInstructions?: string,
): string {
  const researchSummary = researchFindings
    ?.map(
      (f) =>
        `- Source: ${f.source} (${f.findingType}): ${f.extractedText.substring(0, 150)}...`,
    )
    .join("\n");

  const contextSummary = previousSectionsContent
    ? Object.entries(previousSectionsContent)
        .map(
          ([num, secData]) =>
            `Seção ${num} - ${secData?.title}: ${typeof secData?.content === "string" ? secData.content.substring(0, 100) + "..." : JSON.stringify(secData?.content).substring(0, 100) + "..."}`,
        )
        .join("\n  ")
    : "Nenhuma seção anterior fornecida.";

  return `
  Medical Condition: ${medicalCondition}
  
  Research Findings Summary (if relevant for this section):
  ${researchSummary || "Nenhuma pesquisa detalhada fornecida ou aplicável."}
  
  Content of Previous Sections (for context):
  ${contextSummary}
  
  Current Section to Generate:
  Seção ${sectionDefinition.sectionNumber} - ${sectionDefinition.titlePT}
    Descrição: ${sectionDefinition.description}
    Estrutura Esperada do Conteúdo: ${sectionDefinition.contentSchemaDescription}
    Exemplo de Conteúdo (se aplicável): ${JSON.stringify(sectionDefinition.example)}
  ${specificInstructions ? `\nSpecific Instructions for this Section: ${specificInstructions}` : ""}
  
  Please generate ONLY the content for **Seção ${sectionDefinition.sectionNumber} - ${sectionDefinition.titlePT}**.
  Follow the system prompt directives strictly for objectivity and formatting.
  The output must be a single JSON object representing this section:
  \`\`\`json
  {
    "sectionNumber": ${sectionDefinition.sectionNumber},
    "title": "${sectionDefinition.titlePT}",
    "content": "Conteúdo gerado para esta seção..." // or a structured JSON object as per schema
  }
  \`\`\`
  `;
}
