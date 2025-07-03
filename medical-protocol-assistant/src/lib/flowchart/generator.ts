/**
 * Logic for automatically generating flowchart data (nodes and edges)
 * from protocol text content using AI.
 */
import { v4 as uuidv4 } from "uuid";
import { createChatCompletion } from "@/lib/ai/client";
import {
  FLOWCHART_GENERATION_SYSTEM_PROMPT,
  createFlowchartGenerationUserPrompt,
} from "@/lib/ai/prompts/flowchart";
import {
  O4_MINI,
  JSON_RESPONSE_FORMAT,
  // DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION,
  DEFAULT_TEMPERATURE,
} from "@/lib/ai/config";
import { OpenAIError } from "@/lib/ai/errors";
import type { ProtocolFullContent } from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart";
import { GeneratedFlowchartSchema } from "@/lib/validators/flowchart";
import {
  generateFlowchartModular,
  shouldUseModularFlowchartGeneration,
  getFlowchartGenerationModel,
} from "./flowchart-generator-modular";

// Sections typically most relevant for flowchart generation
const RELEVANT_SECTIONS_FOR_FLOWCHART = [
  "4", // Critérios de Inclusão e Exclusão (can influence start)
  "5", // Avaliação Inicial e Classificação de Risco/Gravidade
  "6", // Diagnóstico
  "7", // Tratamento
  "8", // Manejo de Complicações
  "9", // Critérios de Internação, Alta ou Encaminhamento (can influence end nodes)
];

/**
 * Ensures all nodes and edges in the raw parsed flowchart data have IDs.
 * Assigns UUIDs if IDs are missing.
 * @param rawData - The raw parsed object from AI, expected to have nodes and edges arrays.
 * @returns The data with IDs ensured for nodes and edges.
 */
function ensureIdsInFlowchartData(rawData: any): {
  nodes: any[];
  edges: any[];
} {
  const nodes = Array.isArray(rawData?.nodes) ? rawData.nodes : [];
  const edges = Array.isArray(rawData?.edges) ? rawData.edges : [];

  const processedNodes = nodes.map((node: any) => ({
    ...node,
    id:
      node && typeof node.id === "string" && node.id.trim() !== ""
        ? node.id
        : `node-${uuidv4()}`,
  }));

  const processedEdges = edges.map((edge: any) => ({
    ...edge,
    id:
      edge && typeof edge.id === "string" && edge.id.trim() !== ""
        ? edge.id
        : `edge-${uuidv4()}`,
  }));

  return { nodes: processedNodes, edges: processedEdges };
}

/**
 * Generates flowchart data (nodes and edges) from protocol content using AI.
 * Layout is not applied here; it's a separate step.
 * @param protocolId - The ID of the protocol.
 * @param protocolContent - The full content of the protocol.
 * @param protocolCondition - The medical condition the protocol is for.
 * @param options - Optional generation options including progress callback
 * @returns A promise resolving to the FlowchartDefinition (nodes and edges).
 */
export async function generateFlowchartFromProtocolContent(
  protocolId: string,
  protocolContent: ProtocolFullContent,
  protocolCondition: string,
  options?: {
    progressCallback?: (progress: {
      step: number;
      totalSteps: number;
      message: string;
      data?: any;
    }) => void;
  },
): Promise<FlowchartDefinition> {
  console.log(
    `[generateFlowchartFromProtocolContent] Generating flowchart for protocol ${protocolId}`,
  );

  // Check if we should use modular generation
  if (shouldUseModularFlowchartGeneration(protocolContent)) {
    console.log(
      `[generateFlowchartFromProtocolContent] Using modular generation for large protocol`,
    );
    return generateFlowchartModular(protocolContent, {
      protocolId,
      progressCallback: options?.progressCallback,
    });
  }

  // For smaller protocols, use the original single-call approach
  const relevantTextSections: Pick<ProtocolFullContent, string> = {};
  RELEVANT_SECTIONS_FOR_FLOWCHART.forEach((sectionKey) => {
    if (protocolContent[sectionKey]) {
      relevantTextSections[sectionKey] = protocolContent[sectionKey];
    }
  });

  if (Object.keys(relevantTextSections).length === 0) {
    console.warn(
      `No relevant sections found in protocol ${protocolId} for flowchart generation. Returning empty flowchart.`,
    );
    return { nodes: [], edges: [] };
  }

  const userPrompt = createFlowchartGenerationUserPrompt(
    protocolCondition,
    relevantTextSections,
  );

  // Get appropriate model based on content size
  const model = getFlowchartGenerationModel(protocolContent);
  console.log(`[generateFlowchartFromProtocolContent] Using model: ${model}`);

  try {
    const response = await createChatCompletion(
      model, // Use dynamic model selection
      [
        { role: "system", content: FLOWCHART_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      {
        response_format: JSON_RESPONSE_FORMAT,
        temperature: DEFAULT_TEMPERATURE,
        // max_tokens: DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION, // Removed to let models use their default maximum
      },
    );

    const content = response.content;
    if (!content) {
      throw new OpenAIError(
        "AI returned empty content for flowchart generation.",
      );
    }

    let parsedContentFromAI: any;
    try {
      parsedContentFromAI = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI JSON response for flowchart:", e);
      throw new SyntaxError(
        `AI returned malformed JSON for flowchart: ${(e as Error).message}`,
      );
    }

    // Ensure IDs exist before validation
    const contentWithEnsuredIds = ensureIdsInFlowchartData(parsedContentFromAI);

    const validationResult = GeneratedFlowchartSchema.safeParse(
      contentWithEnsuredIds,
    );

    if (!validationResult.success) {
      console.error(
        "AI-generated flowchart failed Zod validation after ID pre-processing:",
        validationResult.error.errors,
      );
      throw new OpenAIError(
        `AI-generated flowchart has invalid structure: ${validationResult.error.message}`,
        { cause: validationResult.error },
      );
    }

    const finalNodes = validationResult.data.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: { x: 0, y: 0 }, // Layout will set this
      data: {
        ...node.data,
        type: node.type, // Ensure data.type matches the node's top-level type
      },
    })) as FlowchartDefinition["nodes"]; // Type assertion

    // Edges are already validated and have IDs.
    let finalEdges = validationResult.data.edges;

    // Ensure decision edges have sourceHandle
    const decisionNodeIds = new Set(
      validationResult.data.nodes
        .filter((node: any) => node.type === "decision")
        .map((node: any) => node.id),
    );

    finalEdges = finalEdges.map((edge: any) => {
      if (decisionNodeIds.has(edge.source) && !edge.sourceHandle) {
        console.warn(
          `[Flowchart] WARNING: Edge ${edge.id} from decision node ${edge.source} is missing sourceHandle. Adding default 'yes'.`,
        );
        return { ...edge, sourceHandle: "yes" };
      }
      return edge;
    });

    return { nodes: finalNodes, edges: finalEdges };
  } catch (error) {
    console.error(
      `Flowchart generation AI call failed for protocol ${protocolId}:`,
      error,
    );
    if (error instanceof OpenAIError || error instanceof SyntaxError) {
      throw error; // Re-throw known errors
    }
    throw new OpenAIError(
      "An unexpected error occurred during flowchart generation.",
      { cause: error as Error },
    );
  }
}
