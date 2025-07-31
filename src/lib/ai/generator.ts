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
import { CONTEXT_SYSTEM_PROMPTS } from "./prompts/context-specific-prompts";
import { getSectionContextInstructions } from "./prompts/section-context-instructions";
import type {
  AIFullProtocolGenerationInput,
  AIFullProtocolGenerationOutput,
  AIProtocolSectionInput,
  AIProtocolSectionOutput,
  StandardSectionDefinition,
} from "@/types/ai-generation";
import type { AIResearchData } from "@/types/research";
import { ProtocolContext } from "@/types/database";
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
  const { medicalCondition, researchData, context, targetPopulation, specificInstructions } = input;

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

  // Select appropriate system prompt based on context
  const systemPrompt = context 
    ? CONTEXT_SYSTEM_PROMPTS[context] || PROTOCOL_GENERATION_SYSTEM_PROMPT
    : PROTOCOL_GENERATION_SYSTEM_PROMPT;

  // Create user prompt with context-aware instructions
  const userPrompt = createContextAwareUserPrompt(
    medicalCondition,
    researchData,
    SECTION_DEFINITIONS,
    context,
    targetPopulation,
    specificInstructions,
  );

  // Estimate token count (rough approximation: 1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(
    (systemPrompt.length + userPrompt.length) / 4,
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
        { role: "system", content: systemPrompt },
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

/**
 * Creates a context-aware user prompt for protocol generation
 */
function createContextAwareUserPrompt(
  medicalCondition: string,
  researchData: AIResearchData,
  sectionDefinitions: StandardSectionDefinition[],
  context?: ProtocolContext,
  targetPopulation?: string,
  additionalInstructions?: string
): string {
  // If no context, use default prompt creation
  if (!context) {
    return createFullProtocolUserPrompt(
      medicalCondition,
      researchData,
      sectionDefinitions,
      additionalInstructions
    );
  }

  // Create section instructions with context-specific modifications
  const sectionInstructions = sectionDefinitions.map(sd => {
    const baseInstruction = `
Seção ${sd.sectionNumber} - ${sd.titlePT}:
Descrição: ${sd.description}
Estrutura Esperada: ${sd.contentSchemaDescription}
`;
    
    // Add context-specific instructions if available
    const contextInstruction = getSectionContextInstructions(context, sd.sectionNumber);
    
    return contextInstruction 
      ? `${baseInstruction}\nPARA O CONTEXTO ${context}:\n${contextInstruction}`
      : baseInstruction;
  }).join('\n---\n');

  // Format research data
  const researchSummary = `
Evidências Científicas Encontradas:
${researchData.findings.map(f => `- ${f.title}: ${f.summary}`).join('\n')}

Estatísticas de Pesquisa:
- Total de artigos: ${researchData.statistics.totalArticles}
- Período coberto: ${researchData.statistics.yearRange}
- Bases consultadas: ${researchData.sourcesCovered.join(', ')}
`;

  return `
Condição Médica: ${medicalCondition}
Contexto de Atendimento: ${context}
${targetPopulation ? `\nDetalhes da População: ${targetPopulation}` : ''}
${additionalInstructions ? `\nInstruções Adicionais: ${additionalInstructions}` : ''}

IMPORTANTE: Este protocolo é específico para ${getContextLabel(context)}.
Siga RIGOROSAMENTE as instruções do contexto fornecidas no system prompt.

${researchSummary}

Instruções por Seção:
---
${sectionInstructions}
---

Gere o protocolo completo com as 13 seções, adaptando TODO o conteúdo ao contexto especificado.
Cada seção deve refletir as necessidades e limitações do ${getContextLabel(context)}.
`;
}

/**
 * Get context label for display
 */
function getContextLabel(context: ProtocolContext): string {
  const labels: Record<ProtocolContext, string> = {
    EMERGENCY_ROOM: "Pronto Atendimento",
    AMBULATORY: "Ambulatório",
    ICU: "Unidade de Terapia Intensiva",
    WARD: "Enfermaria",
    TELEMEDICINE: "Telemedicina",
    TRANSPORT: "Transporte/Remoção",
    HOME_CARE: "Atenção Domiciliar",
    SURGICAL_CENTER: "Centro Cirúrgico"
  };
  return labels[context] || context;
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
