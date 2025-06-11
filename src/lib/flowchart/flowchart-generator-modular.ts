/**
 * Modular flowchart generation system
 * Breaks down flowchart generation into smaller, focused steps for better quality
 */

import { z } from "zod";
import type {
  FlowchartDefinition,
  CustomFlowNode as FlowNode,
  CustomFlowEdge as FlowEdge,
} from "@/types/flowchart";
import type { ProtocolFullContent } from "@/types/protocol";
import { getAIProvider } from "@/lib/ai/providers";
import { flowchartProgressEmitter } from "@/lib/events/flowchart-progress";

// Types for each generation step
interface FlowchartAnalysis {
  protocolType: "emergency" | "diagnostic" | "therapeutic" | "monitoring";
  complexity: "simple" | "moderate" | "complex";
  mainFlow: string[];
  criticalDecisions: string[];
  keyMedications: string[];
  estimatedNodes: number;
}

interface DecisionPoint {
  id: string;
  question: string;
  context: string;
  possibleOutcomes: Array<{
    label: string;
    condition: string;
    nextStep: string;
  }>;
  section: number;
}

interface FlowMapping {
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    details?: string;
    section: number;
    priority?: "high" | "medium" | "low";
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
    condition?: string;
  }>;
}

// Validation schemas
const FlowchartAnalysisSchema = z.object({
  protocolType: z.enum([
    "emergency",
    "diagnostic",
    "therapeutic",
    "monitoring",
  ]),
  complexity: z.enum(["simple", "moderate", "complex"]),
  mainFlow: z.array(z.string()),
  criticalDecisions: z.array(z.string()),
  keyMedications: z.array(z.string()),
  estimatedNodes: z.number().min(3).max(50),
});

const DecisionPointSchema = z.object({
  id: z.string(),
  question: z.string(),
  context: z.string(),
  possibleOutcomes: z.array(
    z.object({
      label: z.string(),
      condition: z.string(),
      nextStep: z.string(),
    }),
  ),
  section: z.number(),
});

const FlowMappingSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      details: z.string().optional(),
      section: z.number(),
      priority: z.enum(["high", "medium", "low"]).optional(),
    }),
  ),
  connections: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().optional(),
      condition: z.string().optional(),
    }),
  ),
});

// Progress tracking
interface ModularFlowchartSession {
  sessionId: string;
  protocolId: string;
  analysis?: FlowchartAnalysis;
  decisions?: DecisionPoint[];
  mapping?: FlowMapping;
  currentStep: number;
  totalSteps: number;
  startTime: number;
}

const sessions = new Map<string, ModularFlowchartSession>();

/**
 * Step 1: Analyze the protocol to understand its structure and type
 */
async function analyzeProtocol(
  protocolContent: ProtocolFullContent,
  progressCallback?: (message: string) => void,
): Promise<FlowchartAnalysis> {
  progressCallback?.("🔍 Analisando estrutura do protocolo...");

  const prompt = `Analise este protocolo médico e forneça uma análise estruturada para geração de fluxograma.

Protocolo:
${JSON.stringify(protocolContent, null, 2)}

Responda APENAS com um JSON no seguinte formato:
{
  "protocolType": "emergency" | "diagnostic" | "therapeutic" | "monitoring",
  "complexity": "simple" | "moderate" | "complex",
  "mainFlow": ["passo 1", "passo 2", ...],
  "criticalDecisions": ["decisão crítica 1", "decisão crítica 2", ...],
  "keyMedications": ["medicamento 1", "medicamento 2", ...],
  "estimatedNodes": número entre 3 e 50
}

Critérios:
- protocolType: Classifique baseado no objetivo principal do protocolo
- complexity: simple (< 10 nós), moderate (10-25 nós), complex (> 25 nós)
- mainFlow: Principais etapas do fluxo em ordem
- criticalDecisions: Decisões que afetam significativamente o tratamento
- keyMedications: Medicamentos principais mencionados
- estimatedNodes: Estimativa do número total de nós necessários`;

  const provider = getAIProvider();
  const completion = await provider.createCompletion(
    [{ role: "user", content: prompt }],
    {
      temperature: 0.3,
      max_tokens: 1000,
    },
  );

  const cleanedResponse = completion.content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const analysis = FlowchartAnalysisSchema.parse(JSON.parse(cleanedResponse));
  progressCallback?.(
    `✅ Análise concluída: Protocolo ${analysis.protocolType} com ${analysis.estimatedNodes} nós estimados`,
  );

  return analysis;
}

/**
 * Step 2: Extract and structure decision points
 */
async function extractDecisionPoints(
  protocolContent: ProtocolFullContent,
  analysis: FlowchartAnalysis,
  progressCallback?: (message: string) => void,
): Promise<DecisionPoint[]> {
  progressCallback?.("🔍 Extraindo pontos de decisão...");

  const decisions: DecisionPoint[] = [];
  const sectionsWithDecisions = [3, 5, 6, 7]; // Sections likely to have decisions

  for (const sectionNum of sectionsWithDecisions) {
    const section = protocolContent[sectionNum.toString()];
    if (!section?.content) continue;

    const prompt = `Extraia os pontos de decisão da seção ${sectionNum} deste protocolo médico.

Seção ${sectionNum} - ${section.title}:
${section.content}

Decisões críticas identificadas na análise:
${analysis.criticalDecisions.join("\n")}

Para cada decisão encontrada, responda APENAS com um array JSON:
[
  {
    "id": "decision_1",
    "question": "Pergunta clara para decisão",
    "context": "Contexto médico da decisão",
    "possibleOutcomes": [
      {
        "label": "Sim/Opção 1",
        "condition": "Condição para esta escolha",
        "nextStep": "Próximo passo se escolher esta opção"
      }
    ],
    "section": ${sectionNum}
  }
]

Regras:
- Foque em decisões que afetam o fluxo do tratamento
- Use linguagem médica clara e precisa
- Cada decisão deve ter 2-4 possíveis resultados
- IDs únicos no formato decision_N`;

    const provider = getAIProvider();
    const completion = await provider.createCompletion(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.3,
        max_tokens: 2000,
      },
    );

    try {
      const cleanedResponse = completion.content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const sectionDecisions = z
        .array(DecisionPointSchema)
        .parse(JSON.parse(cleanedResponse));
      decisions.push(...sectionDecisions);
    } catch (error) {
      console.warn(
        `Failed to extract decisions from section ${sectionNum}:`,
        error,
      );
    }
  }

  progressCallback?.(`✅ Extraídos ${decisions.length} pontos de decisão`);
  return decisions;
}

/**
 * Step 3: Create the flow mapping
 */
async function createFlowMapping(
  protocolContent: ProtocolFullContent,
  analysis: FlowchartAnalysis,
  decisions: DecisionPoint[],
  progressCallback?: (message: string) => void,
): Promise<FlowMapping> {
  progressCallback?.("🗺️ Mapeando fluxo do protocolo...");

  const prompt = `Crie um mapeamento completo de fluxograma para este protocolo médico.

Análise do protocolo:
${JSON.stringify(analysis, null, 2)}

Pontos de decisão identificados:
${JSON.stringify(decisions, null, 2)}

Conteúdo resumido das seções principais:
${Object.entries(protocolContent)
  .filter(([key]) => ["3", "5", "6", "7"].includes(key))
  .map(
    ([key, section]) =>
      `Seção ${key}: ${section.title}\n${typeof section.content === "string" ? section.content.substring(0, 200) : JSON.stringify(section.content).substring(0, 200)}...`,
  )
  .join("\n\n")}

Responda APENAS com um JSON no seguinte formato:
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Início",
      "section": 1
    },
    {
      "id": "node_1",
      "type": "action|decision|medication|triage",
      "label": "Texto do nó",
      "details": "Detalhes adicionais (opcional)",
      "section": número da seção,
      "priority": "high|medium|low" (opcional)
    }
  ],
  "connections": [
    {
      "from": "start",
      "to": "node_1",
      "label": "rótulo opcional",
      "condition": "condição opcional"
    }
  ]
}

Regras importantes:
- SEMPRE inclua nós start e end
- Use os IDs das decisões extraídas quando criar nós de decisão
- Tipos de nó: start, end, action, decision, medication, triage
- Conecte todos os nós formando um fluxo lógico
- Para nós de decisão, crie conexões para cada possível resultado
- Mantenha labels concisos mas claros`;

  const provider = getAIProvider();
  const completion = await provider.createCompletion(
    [{ role: "user", content: prompt }],
    {
      temperature: 0.3,
      max_tokens: 4000,
    },
  );

  const cleanedResponse = completion.content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const mapping = FlowMappingSchema.parse(JSON.parse(cleanedResponse));
  progressCallback?.(
    `✅ Mapeamento criado com ${mapping.nodes.length} nós e ${mapping.connections.length} conexões`,
  );

  return mapping;
}

/**
 * Step 4: Convert mapping to final flowchart format
 */
async function convertToFlowchart(
  mapping: FlowMapping,
  decisions: DecisionPoint[],
  progressCallback?: (message: string) => void,
): Promise<FlowchartDefinition> {
  progressCallback?.("🔄 Convertendo para formato final...");

  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  // Create decision map for easy lookup
  const decisionMap = new Map(decisions.map((d) => [d.id, d]));

  // Convert nodes
  for (const node of mapping.nodes) {
    // Create node with appropriate data based on type
    if (node.type === "decision" && decisionMap.has(node.id)) {
      const decision = decisionMap.get(node.id)!;
      const decisionNode: FlowNode = {
        id: node.id,
        type: "decision",
        position: { x: 0, y: 0 },
        data: {
          type: "decision",
          title: node.label,
          criteria: decision.question,
          outputs: decision.possibleOutcomes.map((o) => ({
            id: `${node.id}_${o.label.toLowerCase().replace(/\s+/g, "_")}`,
            label: o.label,
            position: "bottom-center" as const,
          })),
        },
      };
      nodes.push(decisionNode);
    } else {
      // Other node types
      const nodeData: any = {
        type: node.type,
        title: node.label,
      };

      const flowNode: FlowNode = {
        id: node.id,
        type: node.type as any,
        position: { x: 0, y: 0 },
        data: nodeData,
      };
      nodes.push(flowNode);
    }
  }

  // Convert connections to edges
  for (const conn of mapping.connections) {
    const sourceNode = nodes.find((n) => n.id === conn.from);
    const isDecisionNode = sourceNode?.type === "decision";

    edges.push({
      id: `${conn.from}-${conn.to}`,
      source: conn.from,
      target: conn.to,
      label: conn.label,
      sourceHandle:
        isDecisionNode && conn.condition
          ? `${conn.from}_${conn.condition.toLowerCase().replace(/\s+/g, "_")}`
          : undefined,
      targetHandle: undefined,
      type: "orthogonal",
    });
  }

  progressCallback?.("✅ Conversão concluída");

  return { nodes, edges };
}

/**
 * Main function to generate flowchart using modular approach
 */
export async function generateFlowchartModular(
  protocolContent: ProtocolFullContent,
  options?: {
    protocolId?: string;
    progressCallback?: (progress: {
      step: number;
      totalSteps: number;
      message: string;
      data?: any;
    }) => void;
  },
): Promise<FlowchartDefinition> {
  const sessionId = `flowchart-${Date.now()}`;
  const session: ModularFlowchartSession = {
    sessionId,
    protocolId: options?.protocolId || "unknown",
    currentStep: 0,
    totalSteps: 4,
    startTime: Date.now(),
  };

  sessions.set(sessionId, session);

  const updateProgress = (step: number, message: string, data?: any) => {
    session.currentStep = step;
    options?.progressCallback?.({
      step,
      totalSteps: session.totalSteps,
      message,
      data,
    });

    if (options?.protocolId) {
      flowchartProgressEmitter.emitProgress(
        options.protocolId,
        sessionId,
        step,
        session.totalSteps,
        message,
      );
    }
  };

  try {
    // Step 1: Analyze protocol
    updateProgress(1, "Analisando estrutura do protocolo...");
    const analysis = await analyzeProtocol(protocolContent, (msg) =>
      updateProgress(1, msg),
    );
    session.analysis = analysis;

    // Step 2: Extract decision points
    updateProgress(2, "Extraindo pontos de decisão...");
    const decisions = await extractDecisionPoints(
      protocolContent,
      analysis,
      (msg) => updateProgress(2, msg),
    );
    session.decisions = decisions;

    // Step 3: Create flow mapping
    updateProgress(3, "Mapeando fluxo do protocolo...");
    const mapping = await createFlowMapping(
      protocolContent,
      analysis,
      decisions,
      (msg) => updateProgress(3, msg),
    );
    session.mapping = mapping;

    // Step 4: Convert to final format
    updateProgress(4, "Finalizando fluxograma...");
    const flowchart = await convertToFlowchart(mapping, decisions, (msg) =>
      updateProgress(4, msg),
    );

    // Calculate layout
    const { applyDagreLayout } = await import("./layout");
    const layoutedFlowchart = {
      ...flowchart,
      nodes: applyDagreLayout([...flowchart.nodes], flowchart.edges, {
        rankdir: "TB",
        nodesep: 80,
        ranksep: 120,
      }),
    };

    updateProgress(4, "✅ Fluxograma gerado com sucesso!");

    if (options?.protocolId) {
      flowchartProgressEmitter.emitComplete(
        options.protocolId,
        sessionId,
        layoutedFlowchart,
      );
    }

    return layoutedFlowchart;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    if (options?.protocolId) {
      flowchartProgressEmitter.emitError(
        options.protocolId,
        sessionId,
        errorMessage,
      );
    }

    throw error;
  } finally {
    // Clean up session after a delay
    setTimeout(() => sessions.delete(sessionId), 60000);
  }
}

/**
 * Check if we should use modular generation based on protocol size
 */
export function shouldUseModularFlowchartGeneration(
  protocolContent: ProtocolFullContent,
): boolean {
  // Calculate approximate size
  const contentLength = Object.values(protocolContent)
    .map((section) => section.content?.length || 0)
    .reduce((sum, len) => sum + len, 0);

  // Use modular for protocols > 10KB or with many sections
  const hasManySections = Object.keys(protocolContent).length > 10;
  const isLarge = contentLength > 10000;

  return hasManySections || isLarge;
}

/**
 * Get appropriate model for flowchart generation
 */
export function getFlowchartGenerationModel(
  protocolContent: ProtocolFullContent,
): string {
  const contentLength = Object.values(protocolContent)
    .map((section) => section.content?.length || 0)
    .reduce((sum, len) => sum + len, 0);

  // For very large protocols or when O3 is available, use O3
  if (contentLength > 20000 || process.env.OPENAI_MODEL?.includes("o3")) {
    return "o3-mini"; // or "o3" for even better quality
  }

  // For medium protocols, use GPT-4
  if (contentLength > 10000) {
    return "gpt-4-turbo-preview";
  }

  // For smaller protocols, GPT-3.5 is sufficient
  return "gpt-3.5-turbo-16k";
}
