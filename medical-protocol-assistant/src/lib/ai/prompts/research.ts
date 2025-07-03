/**
 * Prompt templates for AI-powered medical research extraction.
 * These prompts guide the LLM to extract structured information
 * from text provided by the DeepResearch API.
 */

import type {
  ProcessedAIMedicalFinding,
  DiagnosticCriterionFinding,
  TreatmentProtocolFinding,
  GeriatricConsiderationFinding,
} from "@/types/research";

// System prompt to set the context for the AI
export const EXTRACT_MEDICAL_INFO_SYSTEM_PROMPT = `
  You are an expert AI assistant specializing in extracting structured medical information from clinical guidelines, research papers, and medical texts.
  Your goal is to identify and structure key pieces of information accurately and objectively, focusing on quantifiable data, specific dosages, and clear criteria.
  Output should be in JSON format as specified in the user prompt.
  Avoid making assumptions or providing interpretations beyond what is explicitly stated in the text.
  Cite the source document for all extracted information.
  `;

// User prompt for extracting various types of information
export const createExtractionUserPrompt = (
  articleText: string,
  articleSourceId: string,
  articleSourceUrl?: string,
): string => `
  Please analyze the following medical text excerpt. Extract the specified information and structure it in JSON format.
  
  **Source Document ID:** ${articleSourceId}
  ${articleSourceUrl ? `**Source URL:** ${articleSourceUrl}` : ""}
  
  **Text to Analyze:**
  """
  ${articleText}
  """
  
  **Information to Extract and Desired JSON Structure:**
  
  Looking for the following types of information:
  1.  **Objective Diagnostic Criteria**: Extract specific criteria used for diagnosis, including any numerical thresholds, scales, or binary (yes/no) factors.
  2.  **Treatment Protocols**: Identify treatment recommendations, including specific medications, dosages (with units, route, frequency, duration if available), and other therapeutic interventions.
  3.  **Geriatric Considerations**: Note any special considerations, adjusted dosages, or warnings specifically relevant to elderly patients.
  
  **Output Format (JSON Array of Findings):**
  Provide an array of "ProcessedAIMedicalFinding" objects. Each object should conform to one of the following schemas based on the 'findingType':
  
  \`\`\`json
  [
    {
      "id": "unique_finding_id_1", // Generate a unique ID for each finding
      "source": "${articleSourceId}", // ID of the source document
      "findingType": "diagnostic_criteria", // or "treatment_protocol", "geriatric_consideration"
      "extractedText": "The specific sentence or paragraph from which this information was extracted.",
      "summary": "A concise summary of the finding.", // Optional
      "objectiveCriteria": { // For diagnostic_criteria
        "criterionName": "e.g., elevated C-Reactive Protein",
        "threshold": "> 10 mg/L", // or "Positive", "Present", etc.
        "description": "Brief description of the criterion."
      },
      "metadata": { "sourceUrl": "${articleSourceUrl ?? "N/A"}" }
    },
    {
      "id": "unique_finding_id_2",
      "source": "${articleSourceId}",
      "findingType": "treatment_protocol",
      "extractedText": "...",
      "objectiveCriteria": { // For treatment_protocol
        "medicationName": "e.g., Amoxicillin",
        "dosage": "500mg",
        "route": "oral",
        "frequency": "TID",
        "duration": "7 days",
        "description": "Description of the treatment step or guideline."
      },
      "metadata": { "sourceUrl": "${articleSourceUrl ?? "N/A"}" }
    },
    {
      "id": "unique_finding_id_3",
      "source": "${articleSourceId}",
      "findingType": "geriatric_consideration",
      "extractedText": "...",
      "objectiveCriteria": { // For geriatric_consideration
        "aspect": "e.g., Renal function adjustment",
        "description": "Specific advice or warning for elderly patients."
      },
      "metadata": { "sourceUrl": "${articleSourceUrl ?? "N/A"}" }
    }
    // ... more findings
  ]
  \`\`\`
  
  Ensure all extracted information is directly supported by the provided text. If a piece of information is not present, do not include it or invent it.
  If the text does not contain any of the requested information types, return an empty array: [].
  `;

// Type guard for narrowed finding types (optional, can be useful)
export function isDiagnosticCriterionFinding(
  finding: ProcessedAIMedicalFinding,
): finding is DiagnosticCriterionFinding {
  return finding.findingType === "diagnostic_criteria";
}

export function isTreatmentProtocolFinding(
  finding: ProcessedAIMedicalFinding,
): finding is TreatmentProtocolFinding {
  return finding.findingType === "treatment_protocol";
}

export function isGeriatricConsiderationFinding(
  finding: ProcessedAIMedicalFinding,
): finding is GeriatricConsiderationFinding {
  return finding.findingType === "geriatric_consideration";
}
