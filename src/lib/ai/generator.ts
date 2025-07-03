/**
 * Main AI Protocol Generation Logic
 *
 * This module orchestrates the generation of full medical protocols or individual sections
 * using AI, based on research data and predefined prompts.
 */
// import { v4 as _uuidv4 } from "uuid"; // Marked as unused
import { createChatCompletion } from "./client";
import {
  PROTOCOL_GENERATION_SYSTEM_PROMPT,
  createFullProtocolUserPrompt,
  createSingleSectionUserPrompt,
} from "./prompts/protocol-generation";
import { SECTION_DEFINITIONS } from "./prompts/section-specific";
import type {
  AIFullProtocolGenerationInput,
  AIFullProtocolGenerationOutput,
  AIProtocolSectionInput,
  AIProtocolSectionOutput,
  StandardSectionDefinition as _StandardSectionDefinition, // Marked as unused
} from "@/types/ai-generation";
import type {} from // ProtocolFullContent as _ProtocolFullContent, // Marked as unused
// ProtocolSectionData as _ProtocolSectionData, // Marked as unused
"@/types/protocol";
import {
  DEFAULT_CHAT_MODEL,
  DEFAULT_LARGE_CONTEXT_MODEL,
  JSON_RESPONSE_FORMAT,
  // DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION,
  // DEFAULT_MAX_TOKENS_SECTION_GENERATION,
  LARGE_DOCUMENT_THRESHOLD,
  getModelTemperature,
} from "./config";
import { OpenAIError } from "./errors";
import {
  GeneratedFullProtocolSchema,
  GeneratedSingleSectionSchema,
} from "../validators/generated-content";
import {
  generateModularProtocolAI,
  shouldUseModularGeneration,
  type ProgressCallback,
} from "./generator-modular";

// Re-export types for external use
export type {
  ProgressCallback,
  ModularGenerationProgress,
} from "./generator-modular";

export async function generateFullProtocolAI(
  input: AIFullProtocolGenerationInput,
  options?: {
    useModular?: boolean;
    progressCallback?: ProgressCallback;
    protocolId?: string;
    sessionId?: string;
  },
): Promise<AIFullProtocolGenerationOutput> {
  const { medicalCondition, researchData, specificInstructions } = input;

  // Determine if we should use modular generation
  const useModular =
    options?.useModular ??
    shouldUseModularGeneration(researchData, specificInstructions);

  // Use modular generation if appropriate
  if (useModular) {
    console.log(
      "[generateFullProtocolAI] Using modular generation with O3 model",
    );
    return generateModularProtocolAI(
      input,
      options?.progressCallback,
      options?.sessionId,
      options?.protocolId,
    );
  }

  // Otherwise, use traditional single-pass generation
  console.log(
    "[generateFullProtocolAI] Using traditional single-pass generation",
  );
  // const openaiClient = _getOpenAIClient(); // Marked as unused

  const userPrompt = createFullProtocolUserPrompt(
    medicalCondition,
    researchData,
    SECTION_DEFINITIONS,
    specificInstructions,
  );

  // Estimate token count (rough approximation: 1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(
    (PROTOCOL_GENERATION_SYSTEM_PROMPT.length + userPrompt.length) / 4,
  );
  const modelToUse =
    estimatedTokens > LARGE_DOCUMENT_THRESHOLD
      ? DEFAULT_LARGE_CONTEXT_MODEL
      : DEFAULT_CHAT_MODEL;

  console.log(
    `[generateFullProtocolAI] Estimated tokens: ${estimatedTokens}, using model: ${modelToUse}`,
  );

  try {
    const response = await createChatCompletion(
      modelToUse,
      [
        { role: "system", content: PROTOCOL_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      {
        response_format: JSON_RESPONSE_FORMAT,
        temperature: getModelTemperature(modelToUse),
        // max_tokens: DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION, // Removed to let models use their default maximum
      },
    );

    const content = response.content;
    if (!content) {
      throw new OpenAIError(
        "AI returned empty content for full protocol generation.",
      );
    }

    // Clean markdown code blocks if present (some models add them)
    const cleanedContent = content
      .replace(/^```json\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    const parsedContent = JSON.parse(cleanedContent);

    // Transform response to ensure sectionNumber is a number (O3 model compatibility)
    const transformedContent: any = {};
    for (const [key, section] of Object.entries(parsedContent)) {
      if (section && typeof section === "object") {
        transformedContent[key] = {
          ...section,
          sectionNumber:
            typeof (section as any).sectionNumber === "string"
              ? parseInt((section as any).sectionNumber, 10)
              : (section as any).sectionNumber,
        };
      }
    }

    const validationResult =
      GeneratedFullProtocolSchema.safeParse(transformedContent);

    if (!validationResult.success) {
      console.error(
        "AI-generated full protocol failed Zod validation:",
        validationResult.error.errors,
      );
      throw new OpenAIError(
        `AI-generated full protocol has invalid structure: ${validationResult.error.message}`,
      );
    }

    return {
      protocolContent: validationResult.data,
    };
  } catch (error) {
    console.error("Full protocol generation AI call failed:", error);
    if (error instanceof OpenAIError || error instanceof SyntaxError) {
      throw error;
    }
    throw new OpenAIError(
      "An unexpected error occurred during full protocol generation.",
      {
        cause: error as Error,
      },
    );
  }
}

export async function generateProtocolSectionAI(
  input: AIProtocolSectionInput,
): Promise<AIProtocolSectionOutput> {
  const {
    medicalCondition,
    sectionNumber,
    researchFindings,
    previousSectionsContent,
    specificInstructions,
  } = input;

  const sectionDefinition = SECTION_DEFINITIONS.find(
    (sd) => sd.sectionNumber === sectionNumber,
  );

  if (!sectionDefinition) {
    throw new Error(
      `Invalid section number: ${sectionNumber}. No definition found.`,
    );
  }

  // const openaiClient = _getOpenAIClient(); // Marked as unused
  const userPrompt = createSingleSectionUserPrompt(
    medicalCondition,
    sectionDefinition,
    researchFindings,
    previousSectionsContent,
    specificInstructions,
  );

  try {
    const response = await createChatCompletion(
      DEFAULT_CHAT_MODEL,
      [
        { role: "system", content: PROTOCOL_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      {
        response_format: JSON_RESPONSE_FORMAT,
        temperature: getModelTemperature(DEFAULT_CHAT_MODEL),
        // max_tokens: DEFAULT_MAX_TOKENS_SECTION_GENERATION, // Removed to let models use their default maximum
      },
    );

    const content = response.content;
    if (!content) {
      throw new OpenAIError(
        `AI returned empty content for section ${sectionNumber}.`,
      );
    }

    // Clean markdown code blocks if present
    const cleanedContent = content
      .replace(/^```json\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    const parsedSection = JSON.parse(cleanedContent);

    // Transform response to ensure sectionNumber is a number (O3 model compatibility)
    const transformedSection = {
      ...parsedSection,
      sectionNumber:
        typeof parsedSection.sectionNumber === "string"
          ? parseInt(parsedSection.sectionNumber, 10)
          : parsedSection.sectionNumber,
    };

    const validationResult =
      GeneratedSingleSectionSchema.safeParse(transformedSection);

    if (!validationResult.success) {
      console.error(
        `AI-generated section ${sectionNumber} failed Zod validation:`,
        validationResult.error.errors,
      );
      throw new OpenAIError(
        `AI-generated section ${sectionNumber} has invalid structure: ${validationResult.error.message}`,
      );
    }

    if (validationResult.data.sectionNumber !== sectionNumber) {
      throw new OpenAIError(
        `AI returned content for section ${validationResult.data.sectionNumber} but section ${sectionNumber} was requested.`,
      );
    }

    return validationResult.data as AIProtocolSectionOutput;
  } catch (error) {
    console.error(`AI generation for section ${sectionNumber} failed:`, error);
    if (error instanceof OpenAIError || error instanceof SyntaxError) {
      throw error;
    }
    throw new OpenAIError(
      `An unexpected error occurred during generation of section ${sectionNumber}.`,
      { cause: error as Error },
    );
  }
}
