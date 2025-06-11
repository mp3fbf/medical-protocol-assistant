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
 */
async function integrateProtocol(
  allSections: ProtocolFullContent,
  medicalCondition: string,
): Promise<ProtocolFullContent> {
  // Pass the complete protocol as JSON for review
  const protocolJSON = JSON.stringify(allSections, null, 2);

  const response = await createChatCompletion(
    O3,
    [
      { role: "system", content: PROTOCOL_INTEGRATION_PROMPT },
      {
        role: "user",
        content: `Medical Condition: ${medicalCondition}\n\nComplete Protocol in JSON format:\n${protocolJSON}\n\nReview this protocol and return it with any necessary adjustments for consistency. Return ONLY valid JSON.`,
      },
    ],
    {
      response_format: JSON_RESPONSE_FORMAT,
      temperature: getModelTemperature(O3, 0.1), // Very low for consistency check (or 1 for O3)
      // max_tokens: 15000, // Removed to let O3 use its default maximum
    },
  );

  if (!response.content) {
    throw new OpenAIError("O3 returned empty content for protocol integration");
  }

  try {
    // Clean markdown code blocks if present
    const cleanedContent = response.content
      .replace(/^```json\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    const parsedContent = JSON.parse(cleanedContent);

    // Transform O3 response to ensure sectionNumber is a number in all sections
    const transformedProtocol: ProtocolFullContent = {} as ProtocolFullContent;

    for (const [key, section] of Object.entries(parsedContent)) {
      if (section && typeof section === "object") {
        const sectionData = section as any;
        transformedProtocol[key as keyof ProtocolFullContent] = {
          ...sectionData,
          // Convert sectionNumber to number if it's a string
          sectionNumber:
            typeof sectionData.sectionNumber === "string"
              ? parseInt(sectionData.sectionNumber, 10)
              : sectionData.sectionNumber,
        } as any;
      }
    }

    return transformedProtocol;
  } catch (error) {
    console.error(
      "[IntegrateProtocol] Failed to parse JSON response:",
      response.content.substring(0, 200),
    );
    throw new OpenAIError(
      `O3 returned invalid JSON for protocol integration: ${error instanceof Error ? error.message : String(error)}`,
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
  const { medicalCondition, researchData } = input;

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
