/**
 * Smart Flowchart Generator with Medical Protocol Intelligence
 *
 * This enhanced generator analyzes protocol content to create more intelligent
 * flowcharts with appropriate layouts and medical-specific optimizations.
 */
import { v4 as uuidv4 } from "uuid";
import { createChatCompletion } from "@/lib/ai/client";
import {
  FLOWCHART_GENERATION_SYSTEM_PROMPT,
  createFlowchartGenerationUserPrompt,
} from "@/lib/ai/prompts/flowchart";
import {
  DEFAULT_CHAT_MODEL,
  JSON_RESPONSE_FORMAT,
  DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION,
  DEFAULT_TEMPERATURE,
} from "@/lib/ai/config";
import { OpenAIError } from "@/lib/ai/errors";
import type { ProtocolFullContent } from "@/types/protocol";
import type { FlowchartDefinition, CustomFlowNode } from "@/types/flowchart";
import { GeneratedFlowchartSchema } from "@/lib/validators/flowchart";
import { applyDagreLayout } from "./layout";

// Enhanced section mapping for different protocol types
const PROTOCOL_TYPE_MAPPINGS = {
  EMERGENCY: {
    name: "Protocolo de Emergência",
    relevantSections: ["4", "5", "6", "7", "8", "9"],
    layout: "vertical",
    priorityNodes: ["triage", "decision", "action"],
  },
  DIAGNOSTIC: {
    name: "Protocolo Diagnóstico",
    relevantSections: ["4", "5", "6", "10", "11"],
    layout: "hierarchical",
    priorityNodes: ["decision", "action"],
  },
  THERAPEUTIC: {
    name: "Protocolo Terapêutico",
    relevantSections: ["5", "6", "7", "8", "9"],
    layout: "vertical",
    priorityNodes: ["medication", "action", "decision"],
  },
  MONITORING: {
    name: "Protocolo de Monitorização",
    relevantSections: ["8", "9", "10", "11"],
    layout: "circular",
    priorityNodes: ["action", "decision"],
  },
};

// Medical keywords to identify protocol types
const PROTOCOL_KEYWORDS = {
  EMERGENCY: [
    "emergência",
    "urgência",
    "parada",
    "choque",
    "trauma",
    "ressuscitação",
    "anafilaxia",
    "infarto",
    "avc",
    "convulsão",
    "coma",
  ],
  DIAGNOSTIC: [
    "diagnóstico",
    "investigação",
    "exames",
    "avaliação",
    "triagem",
    "rastreamento",
    "screening",
    "teste",
  ],
  THERAPEUTIC: [
    "tratamento",
    "terapia",
    "medicamento",
    "cirurgia",
    "procedimento",
    "intervenção",
    "manejo",
    "dose",
  ],
  MONITORING: [
    "monitorização",
    "seguimento",
    "controle",
    "vigilância",
    "observação",
    "acompanhamento",
    "reavaliação",
  ],
};

/**
 * Analyzes protocol content to determine the most appropriate protocol type
 */
function analyzeProtocolType(
  condition: string,
  content: ProtocolFullContent,
): keyof typeof PROTOCOL_TYPE_MAPPINGS {
  const combinedText = [
    condition,
    ...Object.values(content).map((section) =>
      typeof section?.content === "string"
        ? section.content
        : JSON.stringify(section?.content || ""),
    ),
  ]
    .join(" ")
    .toLowerCase();

  const scores = Object.entries(PROTOCOL_KEYWORDS).map(([type, keywords]) => ({
    type: type as keyof typeof PROTOCOL_TYPE_MAPPINGS,
    score: keywords.reduce(
      (score, keyword) => score + (combinedText.includes(keyword) ? 1 : 0),
      0,
    ),
  }));

  const bestMatch = scores.reduce((best, current) =>
    current.score > best.score ? current : best,
  );

  return bestMatch.score > 0 ? bestMatch.type : "EMERGENCY";
}

/**
 * Enhanced flowchart generation with medical protocol intelligence
 */
export async function generateSmartFlowchart(
  protocolId: string,
  protocolContent: ProtocolFullContent,
  protocolCondition: string,
  options: {
    includeLayout?: boolean;
    protocolType?: keyof typeof PROTOCOL_TYPE_MAPPINGS;
    maxNodes?: number;
    includeMedications?: boolean;
  } = {},
): Promise<FlowchartDefinition & { metadata?: any }> {
  const {
    includeLayout = true,
    maxNodes = 50,
    includeMedications = true,
  } = options;

  // Analyze protocol type if not provided
  const protocolType =
    options.protocolType ||
    analyzeProtocolType(protocolCondition, protocolContent);

  const typeMapping = PROTOCOL_TYPE_MAPPINGS[protocolType];
  console.log(
    `[SmartFlowchart] Detected protocol type: ${protocolType} (${typeMapping.name})`,
  );

  // Extract relevant sections based on protocol type
  const relevantSections: Pick<ProtocolFullContent, string> = {};
  typeMapping.relevantSections.forEach((sectionKey) => {
    if (protocolContent[sectionKey]) {
      relevantSections[sectionKey] = protocolContent[sectionKey];
    }
  });

  if (Object.keys(relevantSections).length === 0) {
    console.warn(
      `No relevant sections found for ${protocolType} protocol ${protocolId}`,
    );
    return { nodes: [], edges: [] };
  }

  // Enhanced prompt with protocol type context
  const enhancedPrompt = createEnhancedFlowchartPrompt(
    protocolCondition,
    relevantSections,
    protocolType,
    typeMapping,
    { maxNodes, includeMedications },
  );

  try {
    const response = await createChatCompletion(
      DEFAULT_CHAT_MODEL,
      [
        { role: "system", content: FLOWCHART_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: enhancedPrompt },
      ],
      {
        response_format: JSON_RESPONSE_FORMAT,
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION,
      },
    );

    const content = response.content;
    if (!content) {
      throw new OpenAIError(
        "AI returned empty content for smart flowchart generation.",
      );
    }

    let parsedContent: any;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      throw new SyntaxError(
        `AI returned malformed JSON: ${(e as Error).message}`,
      );
    }

    // Ensure IDs and validate
    const contentWithIds = ensureSmartIds(parsedContent, protocolType);
    const validationResult = GeneratedFlowchartSchema.safeParse(contentWithIds);

    if (!validationResult.success) {
      console.error(
        "Smart flowchart validation failed:",
        validationResult.error.errors,
      );
      throw new OpenAIError(
        `Generated flowchart has invalid structure: ${validationResult.error.message}`,
      );
    }

    let finalNodes = validationResult.data.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        ...node.data,
        type: node.type,
        priority:
          node.data.priority || getPriorityForNodeType(node.type, protocolType),
      },
    })) as CustomFlowNode[];

    let finalEdges = validationResult.data.edges;

    // Apply intelligent layout if requested
    if (includeLayout) {
      const layoutType = typeMapping.layout;
      const layoutResult = await applyMedicalLayout(
        { nodes: finalNodes, edges: finalEdges },
        layoutType,
        protocolType,
      );
      finalNodes = layoutResult.nodes;
      // Keep original edges to avoid type conflicts
      // finalEdges = layoutResult.edges;
    }

    // Add metadata about the generation
    const metadata = {
      protocolType,
      typeName: typeMapping.name,
      nodeCount: finalNodes.length,
      edgeCount: finalEdges.length,
      layoutType: typeMapping.layout,
      generatedAt: new Date().toISOString(),
      priorityNodeTypes: typeMapping.priorityNodes,
    };

    console.log(
      `[SmartFlowchart] Generated ${finalNodes.length} nodes, ${finalEdges.length} edges`,
    );

    return {
      nodes: finalNodes,
      edges: finalEdges,
      metadata,
    };
  } catch (error) {
    console.error(
      `Smart flowchart generation failed for protocol ${protocolId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Enhanced prompt creation with protocol type intelligence
 */
function createEnhancedFlowchartPrompt(
  condition: string,
  sections: Pick<ProtocolFullContent, string>,
  protocolType: keyof typeof PROTOCOL_TYPE_MAPPINGS,
  typeMapping: (typeof PROTOCOL_TYPE_MAPPINGS)[keyof typeof PROTOCOL_TYPE_MAPPINGS],
  options: { maxNodes: number; includeMedications: boolean },
): string {
  const basePrompt = createFlowchartGenerationUserPrompt(condition, sections);

  const typeSpecificInstructions = getTypeSpecificInstructions(
    protocolType,
    typeMapping,
  );

  return `${basePrompt}

PROTOCOLO TIPO: ${typeMapping.name}
MÁXIMO DE NODES: ${options.maxNodes}
INCLUIR MEDICAÇÕES: ${options.includeMedications ? "Sim" : "Não"}

INSTRUÇÕES ESPECÍFICAS PARA ${protocolType}:
${typeSpecificInstructions}

PRIORIDADES DE NODE (em ordem de importância):
${typeMapping.priorityNodes.map((type, i) => `${i + 1}. ${type}`).join("\n")}

Gere um fluxograma otimizado para este tipo de protocolo, focando nos elementos mais críticos.`;
}

/**
 * Get type-specific instructions for different protocol types
 */
function getTypeSpecificInstructions(
  protocolType: keyof typeof PROTOCOL_TYPE_MAPPINGS,
  _typeMapping: (typeof PROTOCOL_TYPE_MAPPINGS)[keyof typeof PROTOCOL_TYPE_MAPPINGS],
): string {
  switch (protocolType) {
    case "EMERGENCY":
      return `
- Priorize decisões críticas de tempo (triage, sinais vitais)
- Inclua nós de ação imediata para intervenções de emergência
- Use nós de medicação para drogas de emergência
- Termine com nós claros de disposição (alta, internação, transferência)`;

    case "DIAGNOSTIC":
      return `
- Foque em árvores de decisão para diagnóstico diferencial
- Inclua nós de ação para exames e testes
- Minimize medicações, foque em investigação
- Termine com nós de conclusão diagnóstica`;

    case "THERAPEUTIC":
      return `
- Inclua múltiplos nós de medicação com dosagens detalhadas
- Adicione nós de decisão para ajustes de dose
- Inclua monitoramento de resposta terapêutica
- Termine com critérios de sucesso/falha do tratamento`;

    case "MONITORING":
      return `
- Crie loops de monitoramento com reavaliações periódicas
- Inclua nós de decisão baseados em parâmetros vitais
- Adicione pontos de escalação de cuidados
- Termine com critérios de alta ou mudança de nível de cuidado`;

    default:
      return "- Siga as diretrizes gerais de geração de fluxograma";
  }
}

/**
 * Enhanced ID generation with semantic prefixes
 */
function ensureSmartIds(rawData: any, protocolType: string): any {
  const prefix = protocolType.toLowerCase().substring(0, 3);
  const nodes = Array.isArray(rawData?.nodes) ? rawData.nodes : [];
  const edges = Array.isArray(rawData?.edges) ? rawData.edges : [];

  const processedNodes = nodes.map((node: any, index: number) => ({
    ...node,
    id: node?.id || `${prefix}-node-${index + 1}-${uuidv4().substring(0, 8)}`,
  }));

  const processedEdges = edges.map((edge: any, index: number) => ({
    ...edge,
    id: edge?.id || `${prefix}-edge-${index + 1}-${uuidv4().substring(0, 8)}`,
  }));

  return { nodes: processedNodes, edges: processedEdges };
}

/**
 * Get default priority for node types based on protocol type
 */
function getPriorityForNodeType(
  nodeType: string,
  protocolType: keyof typeof PROTOCOL_TYPE_MAPPINGS,
): "high" | "medium" | "low" {
  const typeMapping = PROTOCOL_TYPE_MAPPINGS[protocolType];
  const priorityIndex = typeMapping.priorityNodes.indexOf(nodeType);

  if (priorityIndex === 0) return "high";
  if (priorityIndex === 1) return "medium";
  return "low";
}

/**
 * Apply medical-specific layouts
 */
async function applyMedicalLayout(
  flowchart: FlowchartDefinition,
  _layoutType: string,
  _protocolType: keyof typeof PROTOCOL_TYPE_MAPPINGS,
): Promise<FlowchartDefinition> {
  // For now, use the existing hierarchical layout
  // This can be enhanced with medical-specific layouts later
  const layoutedNodes = applyDagreLayout(flowchart.nodes, flowchart.edges);
  return { nodes: layoutedNodes, edges: flowchart.edges };
}
