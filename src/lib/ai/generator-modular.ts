/**
 * Modular AI Protocol Generation
 *
 * This module implements a sophisticated multi-stage generation approach
 * using O3's advanced reasoning capabilities for deeper, more detailed protocols.
 */

import { createChatCompletion } from "./client";
import {
  MODULAR_GENERATION_SYSTEM_PROMPT,
  SECTION_GROUPS,
  CONTEXT_SUMMARY_PROMPT,
  PROTOCOL_INTEGRATION_PROMPT,
  createModularGroupPrompt,
} from "./prompts/modular-generation";
import type {
  AIFullProtocolGenerationInput,
  AIFullProtocolGenerationOutput,
} from "@/types/ai-generation";
import type { ProtocolFullContent } from "@/types/protocol";
import { O3, JSON_RESPONSE_FORMAT, DEFAULT_TEMPERATURE } from "./config";
import { OpenAIError } from "./errors";
import { GeneratedFullProtocolSchema } from "../validators/generated-content";

/**
 * Progress callback for UI updates
 */
export type ModularGenerationProgress = {
  currentGroup: string;
  groupIndex: number;
  totalGroups: number;
  sectionsCompleted: number[];
  message: string;
};

export type ProgressCallback = (progress: ModularGenerationProgress) => void;

/**
 * Generate a context summary from previous sections
 */
async function generateContextSummary(
  previousSections: Partial<ProtocolFullContent>,
  medicalCondition: string,
): Promise<string> {
  const sectionsText = Object.entries(previousSections)
    .map(
      ([num, data]) =>
        `Seção ${num} - ${data?.title}:\n${
          typeof data?.content === "string"
            ? data.content.substring(0, 500)
            : JSON.stringify(data?.content).substring(0, 500)
        }...`,
    )
    .join("\n\n");

  const response = await createChatCompletion(
    O3,
    [
      { role: "system", content: CONTEXT_SUMMARY_PROMPT },
      {
        role: "user",
        content: `Medical Condition: ${medicalCondition}\n\nPrevious Sections:\n${sectionsText}`,
      },
    ],
    {
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: 1000,
    },
  );

  return response.content || "";
}

/**
 * Generate a single group of sections
 */
async function generateSectionGroup(
  groupKey: keyof typeof SECTION_GROUPS,
  medicalCondition: string,
  researchData: AIFullProtocolGenerationInput["researchData"],
  previousSections: Partial<ProtocolFullContent>,
  contextSummary: string | undefined,
): Promise<Partial<ProtocolFullContent>> {
  const prompt = createModularGroupPrompt(
    groupKey,
    medicalCondition,
    researchData,
    previousSections,
    contextSummary,
  );

  const response = await createChatCompletion(
    O3,
    [
      { role: "system", content: MODULAR_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    {
      response_format: JSON_RESPONSE_FORMAT,
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: 6000, // Increased for detailed content
    },
  );

  if (!response.content) {
    throw new OpenAIError(`O3 returned empty content for group ${groupKey}`);
  }

  const parsedContent = JSON.parse(response.content);

  // Validate that we got the expected sections
  const group = SECTION_GROUPS[groupKey];
  for (const sectionNum of group.sections) {
    if (!parsedContent[sectionNum.toString()]) {
      throw new OpenAIError(
        `Missing section ${sectionNum} in group ${groupKey}`,
      );
    }
  }

  return parsedContent;
}

/**
 * Perform final integration and consistency check
 */
async function integrateProtocol(
  allSections: ProtocolFullContent,
  medicalCondition: string,
): Promise<ProtocolFullContent> {
  const sectionsText = Object.entries(allSections)
    .map(
      ([num, data]) =>
        `Seção ${num} - ${data.title}:\n${
          typeof data.content === "string"
            ? data.content.substring(0, 300)
            : JSON.stringify(data.content).substring(0, 300)
        }...`,
    )
    .join("\n\n");

  const response = await createChatCompletion(
    O3,
    [
      { role: "system", content: PROTOCOL_INTEGRATION_PROMPT },
      {
        role: "user",
        content: `Medical Condition: ${medicalCondition}\n\nComplete Protocol:\n${sectionsText}\n\nPlease review and ensure consistency. Return the complete integrated protocol.`,
      },
    ],
    {
      response_format: JSON_RESPONSE_FORMAT,
      temperature: 0.1, // Very low for consistency check
      max_tokens: 10000,
    },
  );

  if (!response.content) {
    throw new OpenAIError("O3 returned empty content for protocol integration");
  }

  return JSON.parse(response.content);
}

/**
 * Main modular generation function
 */
export async function generateModularProtocolAI(
  input: AIFullProtocolGenerationInput,
  progressCallback?: ProgressCallback,
): Promise<AIFullProtocolGenerationOutput> {
  const { medicalCondition, researchData } = input;

  let allSections: Partial<ProtocolFullContent> = {};
  const groupKeys = Object.keys(
    SECTION_GROUPS,
  ) as (keyof typeof SECTION_GROUPS)[];

  // Generate each group progressively
  for (let i = 0; i < groupKeys.length; i++) {
    const groupKey = groupKeys[i];
    const group = SECTION_GROUPS[groupKey];

    // Update progress
    progressCallback?.({
      currentGroup: group.name,
      groupIndex: i,
      totalGroups: groupKeys.length,
      sectionsCompleted: Object.keys(allSections).map(Number),
      message: `Gerando ${group.name} (Seções ${group.sections.join(", ")})...`,
    });

    // Generate context summary for groups after the first
    let contextSummary: string | undefined;
    if (i > 0) {
      progressCallback?.({
        currentGroup: group.name,
        groupIndex: i,
        totalGroups: groupKeys.length,
        sectionsCompleted: Object.keys(allSections).map(Number),
        message: `Preparando contexto para ${group.name}...`,
      });

      contextSummary = await generateContextSummary(
        allSections,
        medicalCondition,
      );
    }

    // Generate the group
    const groupSections = await generateSectionGroup(
      groupKey,
      medicalCondition,
      researchData,
      allSections,
      contextSummary,
    );

    // Merge into all sections
    allSections = { ...allSections, ...groupSections };
  }

  // Final integration pass
  progressCallback?.({
    currentGroup: "Integração Final",
    groupIndex: groupKeys.length,
    totalGroups: groupKeys.length + 1,
    sectionsCompleted: Object.keys(allSections).map(Number),
    message: "Realizando verificação de consistência e integração final...",
  });

  const integratedProtocol = await integrateProtocol(
    allSections as ProtocolFullContent,
    medicalCondition,
  );

  // Validate the final result
  const validationResult =
    GeneratedFullProtocolSchema.safeParse(integratedProtocol);
  if (!validationResult.success) {
    console.error(
      "Modular generation validation failed:",
      validationResult.error.errors,
    );
    throw new OpenAIError(
      `Generated protocol has invalid structure: ${validationResult.error.message}`,
    );
  }

  // Prepare final output in the expected format
  return {
    protocolContent: integratedProtocol,
    warnings: [],
    confidenceScore: 0.95, // High confidence for modular generation with O3
  };
}

/**
 * Helper function to check if modular generation should be used
 */
export function shouldUseModularGeneration(
  researchData: AIFullProtocolGenerationInput["researchData"],
  specificInstructions?: string,
): boolean {
  // Use modular generation for complex protocols or when specifically requested
  const hasExtensiveResearch = researchData.findings.length > 10;
  const requestsDetailed =
    specificInstructions?.toLowerCase().includes("detalhado") ||
    specificInstructions?.toLowerCase().includes("completo");

  return hasExtensiveResearch || requestsDetailed || true; // Always use for now
}
