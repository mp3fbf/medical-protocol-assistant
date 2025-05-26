/**
 * Main AI Protocol Generation Logic
 *
 * This module orchestrates the generation of full medical protocols or individual sections
 * using AI, based on research data and predefined prompts.
 */
import { v4 as uuidv4 } from "uuid";
import { getOpenAIClient, createChatCompletion } from "./client";
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
  StandardSectionDefinition,
} from "@/types/ai-generation";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import {
  DEFAULT_CHAT_MODEL,
  JSON_RESPONSE_FORMAT,
  DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION,
  DEFAULT_MAX_TOKENS_SECTION_GENERATION,
  DEFAULT_TEMPERATURE,
} from "./config";
import { OpenAIError } from "./errors";
import {
  GeneratedFullProtocolSchema,
  GeneratedSingleSectionSchema,
} from "../validators/generated-content";

/**
 * Generates a complete 13-section medical protocol using AI.
 * @param input - The input data including medical condition and research findings.
 * @returns A promise resolving to the fully generated protocol content.
 */
export async function generateFullProtocolAI(
  input: AIFullProtocolGenerationInput,
): Promise<AIFullProtocolGenerationOutput> {
  const { medicalCondition, researchData, specificInstructions } = input;
  const openaiClient = getOpenAIClient();

  const userPrompt = createFullProtocolUserPrompt(
    medicalCondition,
    researchData,
    SECTION_DEFINITIONS,
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
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION,
      },
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new OpenAIError(
        "AI returned empty content for full protocol generation.",
      );
    }

    const parsedContent = JSON.parse(content);
    const validationResult =
      GeneratedFullProtocolSchema.safeParse(parsedContent);

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
      // TODO: Extract warnings or confidence scores if AI provides them
    };
  } catch (error) {
    console.error("Full protocol generation AI call failed:", error);
    if (error instanceof OpenAIError || error instanceof SyntaxError) {
      throw error; // Re-throw known errors
    }
    throw new OpenAIError(
      "An unexpected error occurred during full protocol generation.",
      {
        cause: error as Error,
      },
    );
  }
}

/**
 * Generates a single protocol section using AI.
 * @param input - The input data for generating the section.
 * @returns A promise resolving to the generated section data.
 */
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

  const openaiClient = getOpenAIClient();
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
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS_SECTION_GENERATION,
      },
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new OpenAIError(
        `AI returned empty content for section ${sectionNumber}.`,
      );
    }

    const parsedSection = JSON.parse(content);
    const validationResult =
      GeneratedSingleSectionSchema.safeParse(parsedSection);

    if (!validationResult.success) {
      console.error(
        `AI-generated section ${sectionNumber} failed Zod validation:`,
        validationResult.error.errors,
      );
      throw new OpenAIError(
        `AI-generated section ${sectionNumber} has invalid structure: ${validationResult.error.message}`,
      );
    }

    // Ensure the returned section number matches the requested one
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
