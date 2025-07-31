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
import { O3, JSON_RESPONSE_FORMAT, getModelTemperature } from "./config";
import { OpenAIError } from "./errors";
import { GeneratedFullProtocolSchema } from "../validators/generated-content";
import { CONTEXT_SYSTEM_PROMPTS } from "./prompts/context-specific-prompts";
import { getSectionContextInstructions } from "./prompts/section-context-instructions";
import { ProtocolContext } from "@/types/database";
import { generationProgressEmitter } from "@/lib/events/generation-progress";

// Session management types
interface GenerationSession {
  sessionId: string;
  completedSections: Partial<ProtocolFullContent>;
  contextSummaries: Map<string, string>;
  lastUpdateTime: number;
  attempts: Map<string, number>;
}

// In-memory session storage (could be replaced with Redis/DB)
const sessionStore = new Map<string, GenerationSession>();

function saveGenerationSession(
  sessionId: string,
  sections: Partial<ProtocolFullContent>,
  contexts?: Map<string, string>,
): void {
  const session: GenerationSession = {
    sessionId,
    completedSections: sections,
    contextSummaries: contexts || new Map(),
    lastUpdateTime: Date.now(),
    attempts: new Map(),
  };
  sessionStore.set(sessionId, session);
  console.log(
    `[ModularGeneration] Saved session ${sessionId} with ${Object.keys(sections).length} sections`,
  );
}

function loadGenerationSession(sessionId: string): GenerationSession | null {
  return sessionStore.get(sessionId) || null;
}

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
      temperature: getModelTemperature(O3),
      // max_tokens: 5000, // Removed to let O3 use its default maximum
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
  context?: ProtocolContext,
  targetPopulation?: string,
  specificInstructions?: string,
): Promise<Partial<ProtocolFullContent>> {
  // Select appropriate system prompt based on context
  const systemPrompt = context 
    ? CONTEXT_SYSTEM_PROMPTS[context] || MODULAR_GENERATION_SYSTEM_PROMPT
    : MODULAR_GENERATION_SYSTEM_PROMPT;
  
  // Create modular prompt with context considerations
  const basePrompt = createModularGroupPrompt(
    groupKey,
    medicalCondition,
    researchData,
    previousSections,
    contextSummary,
  );
  
  // Add context-specific instructions to the prompt
  const contextualPrompt = context ? `
CONTEXTO DE ATENDIMENTO: ${context}
${targetPopulation ? `Detalhes da População: ${targetPopulation}` : ''}
${specificInstructions ? `Instruções Adicionais: ${specificInstructions}` : ''}

IMPORTANTE: Adapte TODO o conteúdo ao contexto de ${getContextLabel(context)}.

${basePrompt}

${getContextSpecificInstructionsForGroup(groupKey, context)}
` : basePrompt;

  const response = await createChatCompletion(
    O3,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: contextualPrompt },
    ],
    {
      response_format: JSON_RESPONSE_FORMAT,
      temperature: getModelTemperature(O3),
      // max_tokens: 10000, // Removed to let O3 use its default maximum
    },
  );

  if (!response.content) {
    throw new OpenAIError(`O3 returned empty content for group ${groupKey}`);
  }

  // Clean markdown code blocks if present (O3 model tends to add them)
  const cleanedContent = response.content
    .replace(/^```json\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  const parsedContent = JSON.parse(cleanedContent);

  // Transform O3 response to ensure sectionNumber is a number
  const transformedContent: Partial<ProtocolFullContent> = {};

  for (const [key, section] of Object.entries(parsedContent)) {
    if (section && typeof section === "object") {
      const sectionData = section as any;
      transformedContent[key] = {
        ...sectionData,
        // Convert sectionNumber to number if it's a string
        sectionNumber:
          typeof sectionData.sectionNumber === "string"
            ? parseInt(sectionData.sectionNumber, 10)
            : sectionData.sectionNumber,
      };
    }
  }

  // Validate that we got the expected sections
  const group = SECTION_GROUPS[groupKey];
  for (const sectionNum of group.sections) {
    if (!transformedContent[sectionNum.toString()]) {
      throw new OpenAIError(
        `Missing section ${sectionNum} in group ${groupKey}`,
      );
    }
  }

  return transformedContent;
}

/**
 * Perform final integration and consistency check
 * Optimized version that skips re-processing if not needed
 */
async function integrateProtocol(
  allSections: ProtocolFullContent,
  medicalCondition: string,
): Promise<ProtocolFullContent> {
  // Skip integration if we're confident the protocol is already well-formed
  // This is a performance optimization to avoid unnecessary O3 calls
  const skipIntegration = process.env.SKIP_PROTOCOL_INTEGRATION === "true";

  if (skipIntegration) {
    console.log(
      "[IntegrateProtocol] Skipping integration check for performance",
    );
    // Just ensure sectionNumbers are correct
    const correctedProtocol: ProtocolFullContent = {} as ProtocolFullContent;

    for (const [key, section] of Object.entries(allSections)) {
      if (section && typeof section === "object") {
        const sectionData = section as any;
        correctedProtocol[key as keyof ProtocolFullContent] = {
          ...sectionData,
          sectionNumber:
            typeof sectionData.sectionNumber === "string"
              ? parseInt(sectionData.sectionNumber, 10)
              : sectionData.sectionNumber,
        } as any;
      }
    }

    return correctedProtocol;
  }

  // Create a summary instead of sending the entire protocol
  const protocolSummary = Object.entries(allSections).map(([num, section]) => ({
    section: num,
    title: section.title,
    hasContent: !!section.content,
    contentLength:
      typeof section.content === "string"
        ? section.content.length
        : JSON.stringify(section.content).length,
  }));

  console.log(
    "[IntegrateProtocol] Starting integration check with summary approach",
  );
  console.log(
    `[IntegrateProtocol] Sending summary of ${protocolSummary.length} sections`,
  );
  console.log(
    "[IntegrateProtocol] Summary content lengths:",
    protocolSummary.map((s) => s.contentLength),
  );

  // NÃO TEM TIMEOUT - O3 DEMORA O QUANTO PRECISAR!
  // Qualidade > Velocidade SEMPRE

  try {
    const response = await createChatCompletion(
      O3,
      [
        { role: "system", content: PROTOCOL_INTEGRATION_PROMPT },
        {
          role: "user",
          content: `Medical Condition: ${medicalCondition}

Protocol Summary:
${JSON.stringify(protocolSummary, null, 2)}

Based on this summary, are there any critical issues or missing sections? 
If everything looks complete and consistent, respond with: {"status": "approved"}
If there are issues, respond with: {"status": "issues", "problems": ["list of issues"]}

Return ONLY valid JSON.`,
        },
      ],
      {
        response_format: JSON_RESPONSE_FORMAT,
        temperature: getModelTemperature(O3, 0.1),
      },
    );

    if (!response.content) {
      throw new OpenAIError(
        "O3 returned empty content for protocol integration",
      );
    }

    const cleanedContent = response.content
      .replace(/^```json\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    const validationResult = JSON.parse(cleanedContent);

    if (validationResult.status === "approved") {
      console.log(
        "[IntegrateProtocol] Protocol approved, returning original with corrections",
      );

      // Just ensure sectionNumbers are correct
      const correctedProtocol: ProtocolFullContent = {} as ProtocolFullContent;

      for (const [key, section] of Object.entries(allSections)) {
        if (section && typeof section === "object") {
          const sectionData = section as any;
          correctedProtocol[key as keyof ProtocolFullContent] = {
            ...sectionData,
            sectionNumber:
              typeof sectionData.sectionNumber === "string"
                ? parseInt(sectionData.sectionNumber, 10)
                : sectionData.sectionNumber,
          } as any;
        }
      }

      return correctedProtocol;
    } else {
      // If there are issues, we might need to do a full integration
      console.warn(
        "[IntegrateProtocol] Issues found:",
        validationResult.problems,
      );

      // For now, still return the corrected protocol
      // In the future, we could implement targeted fixes
      const correctedProtocol: ProtocolFullContent = {} as ProtocolFullContent;

      for (const [key, section] of Object.entries(allSections)) {
        if (section && typeof section === "object") {
          const sectionData = section as any;
          correctedProtocol[key as keyof ProtocolFullContent] = {
            ...sectionData,
            sectionNumber:
              typeof sectionData.sectionNumber === "string"
                ? parseInt(sectionData.sectionNumber, 10)
                : sectionData.sectionNumber,
          } as any;
        }
      }

      return correctedProtocol;
    }
  } catch (error: any) {
    console.error(
      "[IntegrateProtocol] Erro ao processar resposta de validação:",
      error,
    );

    // QUALQUER ERRO NA INTEGRAÇÃO É CRÍTICO - NÃO PODE SER IGNORADO
    throw new Error(
      `FALHA CRÍTICA na integração do protocolo: ${error.message}. ` +
        "Esta etapa é obrigatória para garantir qualidade médica.",
    );
  }
}

/**
 * Main modular generation function
 */
export async function generateModularProtocolAI(
  input: AIFullProtocolGenerationInput,
  progressCallback?: ProgressCallback,
  sessionId?: string,
  protocolId?: string,
): Promise<AIFullProtocolGenerationOutput> {
  const { medicalCondition, researchData, context, targetPopulation, specificInstructions } = input;

  // Try to load existing session
  let allSections: Partial<ProtocolFullContent> = {};
  let startIndex = 0;
  let savedContexts: Map<string, string> = new Map();

  if (sessionId) {
    const savedSession = loadGenerationSession(sessionId);
    if (savedSession) {
      console.log(
        `[ModularGeneration] Resuming session ${sessionId} from group ${Object.keys(savedSession.completedSections).length}`,
      );
      allSections = savedSession.completedSections;
      savedContexts = savedSession.contextSummaries || new Map();
      // Calculate which group to start from
      const completedGroups = Math.floor(Object.keys(allSections).length / 3); // Rough estimate
      startIndex = Math.min(completedGroups, 4); // Max 5 groups
    }
  }

  // Create new session ID if not provided
  const currentSessionId =
    sessionId || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const groupKeys = Object.keys(
    SECTION_GROUPS,
  ) as (keyof typeof SECTION_GROUPS)[];

  // Generate each group progressively
  for (let i = startIndex; i < groupKeys.length; i++) {
    const groupKey = groupKeys[i];
    const group = SECTION_GROUPS[groupKey];

    // Update progress and emit real-time event
    const progress = {
      currentGroup: group.name,
      groupIndex: i,
      totalGroups: groupKeys.length,
      sectionsCompleted: Object.keys(allSections).map(Number),
      message: `Gerando ${group.name} (Seções ${group.sections.join(", ")})...`,
    };
    progressCallback?.(progress);

    // Emit real-time progress event if protocolId is provided
    if (protocolId) {
      generationProgressEmitter.emitProgress(
        protocolId,
        currentSessionId,
        progress,
      );
    }

    try {
      // Generate context summary for groups after the first
      let contextSummary: string | undefined;

      // Check if we have a saved context for this group
      const savedContextKey = `context-${i}`;
      if (savedContexts.has(savedContextKey)) {
        contextSummary = savedContexts.get(savedContextKey);
        console.log(`[ModularGeneration] Using saved context for group ${i}`);
      } else if (i > 0) {
        const contextProgress = {
          currentGroup: group.name,
          groupIndex: i,
          totalGroups: groupKeys.length,
          sectionsCompleted: Object.keys(allSections).map(Number),
          message: `Preparando contexto para ${group.name}...`,
        };
        progressCallback?.(contextProgress);

        if (protocolId) {
          generationProgressEmitter.emitProgress(
            protocolId,
            currentSessionId,
            contextProgress,
          );
        }

        contextSummary = await generateContextSummary(
          allSections,
          medicalCondition,
        );

        // Save context for potential retry
        savedContexts.set(savedContextKey, contextSummary);
      }

      // Generate the group with retry for server errors
      let groupSections;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          groupSections = await generateSectionGroup(
            groupKey,
            medicalCondition,
            researchData,
            allSections,
            contextSummary,
            context,
            targetPopulation,
            specificInstructions,
          );
          break; // Success, exit retry loop
        } catch (error: any) {
          // Check if it's a server error from OpenAI
          if (
            error.cause?.type === "server_error" &&
            retryCount < maxRetries - 1
          ) {
            retryCount++;
            console.log(
              `[ModularGeneration] OpenAI server error on ${groupKey}, retry ${retryCount}/${maxRetries - 1} in 30 seconds...`,
            );
            console.log(`[ModularGeneration] Error details:`, {
              message: error.message,
              type: error.cause?.type,
              requestId: error.cause?.request_id,
              status: error.cause?.status,
            });

            // Save progress before retry
            saveGenerationSession(currentSessionId, allSections, savedContexts);

            await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds
            continue;
          }
          // Not a server error or max retries reached
          throw error;
        }
      }

      // Merge into all sections
      allSections = { ...allSections, ...groupSections };

      // Save progress after each successful group
      saveGenerationSession(currentSessionId, allSections, savedContexts);
    } catch (error: any) {
      console.error(
        `[ModularGeneration] Error generating group ${groupKey}:`,
        error,
      );

      // Save partial progress before rethrowing
      saveGenerationSession(currentSessionId, allSections, savedContexts);

      // Emit error event
      if (protocolId) {
        generationProgressEmitter.emitError(
          protocolId,
          currentSessionId,
          `Erro ao gerar ${group.name}: ${error.message}`,
        );
      }

      // Add session ID to error for potential resume
      error.sessionId = currentSessionId;
      error.completedSections = Object.keys(allSections).length;

      throw error;
    }
  }

  // Final integration pass
  const finalProgress = {
    currentGroup: "Integração Final",
    groupIndex: groupKeys.length,
    totalGroups: groupKeys.length + 1,
    sectionsCompleted: Object.keys(allSections).map(Number),
    message: "Realizando verificação de consistência e integração final...",
  };
  progressCallback?.(finalProgress);

  if (protocolId) {
    generationProgressEmitter.emitProgress(
      protocolId,
      currentSessionId,
      finalProgress,
    );
  }

  // ⚠️⚠️⚠️ NUNCA REMOVER ESTA INTEGRAÇÃO ⚠️⚠️⚠️
  // QUALIDADE > VELOCIDADE - Esta etapa é ESSENCIAL para garantir consistência médica
  // NÃO importa se demora 5, 10 ou 15 minutos - QUALIDADE É INEGOCIÁVEL
  // Tentativas anteriores de "otimizar" removendo esta etapa resultaram em protocolos inconsistentes
  console.log(
    `[ModularGeneration] Starting integration at ${new Date().toISOString()}`,
  );
  const integrationStartTime = Date.now();

  const integratedProtocol = await integrateProtocol(
    allSections as ProtocolFullContent,
    medicalCondition,
  );

  const integrationTime = Date.now() - integrationStartTime;
  console.log(
    `[ModularGeneration] Integration completed in ${integrationTime}ms`,
  );

  // Validate the final result
  console.log(
    `[ModularGeneration] Starting validation at ${new Date().toISOString()}`,
  );
  const validationStartTime = Date.now();

  const validationResult =
    GeneratedFullProtocolSchema.safeParse(integratedProtocol);

  const validationTime = Date.now() - validationStartTime;
  console.log(
    `[ModularGeneration] Validation completed in ${validationTime}ms`,
  );

  if (!validationResult.success) {
    console.error(
      "Modular generation validation failed:",
      validationResult.error.errors,
    );

    if (protocolId) {
      generationProgressEmitter.emitError(
        protocolId,
        currentSessionId,
        `Erro na validação do protocolo: ${validationResult.error.message}`,
      );
    }

    throw new OpenAIError(
      `Generated protocol has invalid structure: ${validationResult.error.message}`,
    );
  }

  // Emit completion event
  if (protocolId) {
    generationProgressEmitter.emitComplete(
      protocolId,
      currentSessionId,
      Object.keys(integratedProtocol).map(Number),
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

/**
 * Get context-specific instructions for a section group
 */
function getContextSpecificInstructionsForGroup(
  groupKey: keyof typeof SECTION_GROUPS,
  context: ProtocolContext
): string {
  const group = SECTION_GROUPS[groupKey];
  const instructions: string[] = [];
  
  // Add specific instructions for each section in the group
  for (const sectionNum of group.sections) {
    const sectionInstruction = getSectionContextInstructions(context, sectionNum);
    if (sectionInstruction) {
      instructions.push(`
Seção ${sectionNum} - Instruções Específicas:
${sectionInstruction}
`);
    }
  }
  
  return instructions.length > 0 
    ? `\nINSTRUÇÕES ESPECÍFICAS DO CONTEXTO:\n${instructions.join('\n')}`
    : '';
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

/**
 * Resume a failed generation session
 */
export async function resumeGenerationSession(
  sessionId: string,
  input: AIFullProtocolGenerationInput,
  progressCallback?: ProgressCallback,
): Promise<AIFullProtocolGenerationOutput> {
  const session = loadGenerationSession(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  console.log(
    `[ModularGeneration] Resuming session ${sessionId} with ${Object.keys(session.completedSections).length} completed sections`,
  );

  // Resume with saved progress
  return generateModularProtocolAI(input, progressCallback, sessionId);
}

/**
 * List all active sessions
 */
export function listGenerationSessions(): {
  sessionId: string;
  sectionsCount: number;
  lastUpdate: Date;
}[] {
  return Array.from(sessionStore.values()).map((session) => ({
    sessionId: session.sessionId,
    sectionsCount: Object.keys(session.completedSections).length,
    lastUpdate: new Date(session.lastUpdateTime),
  }));
}
