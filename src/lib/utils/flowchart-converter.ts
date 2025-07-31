/**
 * Converter between standard flowchart format and clinical flowchart format
 *
 * IMPORTANT: Clinical format is the DEFAULT and preferred format.
 * Standard format is secondary and may be deprecated in the future.
 *
 * These converters are implemented but not yet exposed in the UI.
 * Future UI updates may add import/export functionality using these converters.
 */

import type {
  FlowchartDefinition,
  CustomFlowNode,
  CustomFlowEdge,
  DecisionNodeData,
  ActionNodeData,
  MedicationNodeData,
  TriageNodeData,
  StartNodeData,
  EndNodeData,
} from "@/types/flowchart";
import type {
  ClinicalFlowchart,
  ClinicalNode,
  ClinicalEdge,
} from "@/types/flowchart-clinical";
import { getLayoutedElements } from "@/lib/flowchart/dagre-layout";

/**
 * Convert clinical flowchart format to standard flowchart format
 * This allows clinical flowcharts to be displayed in the standard viewer
 *
 * Node type mapping:
 * - "custom" (coleta) → "decision"
 * - "summary" (resumo) → "triage"
 * - "conduct" (conduta) → "action"
 */
export function clinicalToStandard(
  clinical: ClinicalFlowchart,
): FlowchartDefinition {
  // Convert nodes
  const nodes: CustomFlowNode[] = clinical.nodes.map((clinicalNode) => {
    // Map clinical node types to standard node types
    let standardType: CustomFlowNode["type"];
    let standardData: CustomFlowNode["data"];

    switch (clinicalNode.type) {
      case "custom":
        // Custom (coleta) nodes with questions map to decision nodes
        standardType = "decision";
        standardData = {
          type: "decision",
          title: clinicalNode.data.label,
          criteria: clinicalNode.data.descricao || "Questionário de Coleta",
        };
        break;

      case "summary":
        // Summary (resumo) nodes map to triage nodes
        standardType = "triage";
        standardData = {
          type: "triage",
          title: clinicalNode.data.label,
          description: clinicalNode.data.descricao,
        };
        break;

      case "conduct":
        // Conduct (conduta) nodes map to action nodes
        standardType = "action";
        const conductData = clinicalNode.data as any;
        const actions: string[] = [];

        // Extract key actions from conduct data
        if (conductData.condutaDataNode) {
          if (conductData.condutaDataNode.medicamento?.length > 0) {
            actions.push(
              `${conductData.condutaDataNode.medicamento.length} medicamento(s)`,
            );
          }
          if (conductData.condutaDataNode.exame?.length > 0) {
            actions.push(
              `${conductData.condutaDataNode.exame.length} exame(s)`,
            );
          }
          if (conductData.condutaDataNode.orientacao?.length > 0) {
            actions.push(
              `${conductData.condutaDataNode.orientacao.length} orientação(ões)`,
            );
          }
          if (conductData.condutaDataNode.mensagem?.length > 0) {
            actions.push(
              `${conductData.condutaDataNode.mensagem.length} mensagem(ns)`,
            );
          }
        } else if (conductData.descricao) {
          // If no condutaDataNode, use description
          actions.push("Protocolo encerrado");
        }

        standardData = {
          type: "action",
          title: clinicalNode.data.label,
          actions: actions.length > 0 ? actions : ["Conduta médica"],
        };
        break;

      default:
        // Fallback to action node
        standardType = "action";
        standardData = {
          type: "action",
          title: clinicalNode.data.label || "Nó desconhecido",
          actions: ["Ação"],
        };
    }

    return {
      id: clinicalNode.id,
      type: standardType,
      position: clinicalNode.position,
      data: standardData,
    };
  });

  // Convert edges
  const edges: CustomFlowEdge[] = clinical.edges.map((clinicalEdge) => ({
    id: clinicalEdge.id,
    source: clinicalEdge.source,
    target: clinicalEdge.target,
    type: "default",
    label: clinicalEdge.data?.rule,
  }));

  return {
    nodes,
    edges,
  };
}

/**
 * Convert standard flowchart format to clinical flowchart format
 * This is a lossy conversion as standard format has less information
 *
 * Reverse mapping:
 * - "decision" → "custom" (coleta)
 * - "triage" → "summary" (resumo)
 * - "action" → "conduct" (conduta)
 */
export function standardToClinical(
  standard: FlowchartDefinition,
): ClinicalFlowchart {
  // Convert nodes
  const nodes: ClinicalNode[] = standard.nodes.map((standardNode, index) => {
    // Debug logging
    console.log(`Converting node ${index}:`, {
      id: standardNode.id,
      type: standardNode.type,
      data: standardNode.data,
      dataKeys: standardNode.data ? Object.keys(standardNode.data) : [],
    });

    // Map standard node types to clinical node types
    let clinicalType: ClinicalNode["type"] | "start" | "end";
    let clinicalData: any;

    // Ensure we have data
    if (!standardNode.data) {
      console.warn(`Node ${standardNode.id} has no data`, standardNode);
      clinicalType = "custom";
      clinicalData = {
        label: "Nó sem dados",
        condicao: "SEMPRE",
        descricao: "",
        condicional: "visivel",
        questions: [],
      };
      return {
        id: standardNode.id,
        type: clinicalType as any,
        position: standardNode.position,
        data: clinicalData,
      } as ClinicalNode;
    }

    switch (standardNode.type) {
      case "decision":
        // Decision nodes map to custom nodes with a single question
        const decisionData = standardNode.data as DecisionNodeData;
        clinicalType = "custom";
        clinicalData = {
          label: decisionData.title || "Decisão",
          condicao: "SEMPRE",
          descricao: decisionData.criteria || "",
          condicional: "visivel",
          questions: [
            {
              id: `Q${standardNode.id}`,
              uid: "",
              titulo: decisionData.title || "Decisão",
              descricao: decisionData.criteria || "",
              condicional: "visivel",
              expressao: "",
              select: "F", // Single choice by default
              options: [
                {
                  id: "",
                  label: "Sim",
                  preselected: false,
                  exclusive: false,
                },
                {
                  id: "",
                  label: "Não",
                  preselected: false,
                  exclusive: false,
                },
              ],
            },
          ],
        };
        break;

      case "triage":
        // Triage nodes map to summary nodes
        const triageData = standardNode.data as TriageNodeData;
        clinicalType = "summary";
        clinicalData = {
          label: triageData.title || "Triagem",
          condicao: "",
          descricao: triageData.description || "",
          condicional: "visivel",
        };
        break;

      case "action":
        // Action nodes map to conduct nodes
        const actionData = standardNode.data as ActionNodeData;
        clinicalType = "conduct";

        clinicalData = {
          label: actionData.title || "Ação",
          condicao: "",
          descricao: "",
          condicional: "visivel",
          conduta: "conclusao",
          condutaDataNode: {
            orientacao:
              actionData.actions && actionData.actions.length > 0
                ? [
                    {
                      id: `O${standardNode.id}`,
                      nome: "Orientações",
                      descricao: "",
                      condicional: "visivel",
                      condicao: "SEMPRE",
                      conteudo: `<ul>${actionData.actions.map((a: string) => `<li>${a}</li>`).join("")}</ul>`,
                    },
                  ]
                : [],
            exame: [],
            medicamento: [],
            encaminhamento: [],
            mensagem: [],
          },
        };
        break;

      case "medication":
        // Medication nodes map to conduct nodes
        const medicationData = standardNode.data as MedicationNodeData;
        clinicalType = "conduct";

        clinicalData = {
          label: medicationData.title || "Medicamento",
          condicao: "",
          descricao: "",
          condicional: "visivel",
          conduta: "conclusao",
          condutaDataNode: {
            orientacao: [],
            exame: [],
            medicamento: medicationData.medications
              ? medicationData.medications.map((med, idx) => ({
                  id: `M${standardNode.id}-${idx}`,
                  nome: med.name,
                  descricao: "",
                  condicional: "visivel",
                  condicao: "",
                  condicionalMedicamento: "intra-hospitalar",
                  quantidade: 1,
                  codigo: "",
                  nomeMed: med.name,
                  posologia: `<p>${med.dose} ${med.route} ${med.frequency}</p>`,
                  mensagemMedico: "",
                  via: med.route,
                }))
              : [],
            encaminhamento: [],
            mensagem: [],
          },
        };
        break;

      case "start":
        // Start nodes keep their type in clinical format
        const startData = standardNode.data as StartNodeData;
        clinicalType = "start";
        clinicalData = {
          type: "start",
          title: startData.title || "Início",
          label: startData.title || "Início",
        };
        break;

      case "end":
        // End nodes keep their type in clinical format
        const endData = standardNode.data as EndNodeData;
        clinicalType = "end";
        clinicalData = {
          type: "end",
          title: endData.title || "Fim",
          label: endData.title || "Fim",
        };
        break;

      default:
        // Fallback to custom node
        console.warn(`Unknown node type: ${standardNode.type}`, standardNode);
        clinicalType = "custom";
        clinicalData = {
          label: standardNode.data?.title || "Nó",
          condicao: "SEMPRE",
          descricao: "",
          condicional: "visivel",
          questions: [],
        };
    }

    return {
      id: standardNode.id,
      type: clinicalType as any,
      position: standardNode.position,
      data: clinicalData,
    } as ClinicalNode;
  });

  // Convert edges
  const edges: ClinicalEdge[] = standard.edges.map((standardEdge, index) => {
    console.log(`Converting edge ${index}:`, {
      id: standardEdge.id,
      source: standardEdge.source,
      target: standardEdge.target,
      label: standardEdge.label,
    });

    return {
      id: standardEdge.id,
      source: standardEdge.source,
      target: standardEdge.target,
      data: {
        rule: String(standardEdge.label || "Regra nova"),
      },
    };
  });

  return {
    nodes,
    edges,
  };
}

/**
 * Validate if a JSON object is a valid clinical flowchart
 */
export function isValidClinicalFlowchart(data: any): data is ClinicalFlowchart {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return false;

  // Basic validation of nodes
  for (const node of data.nodes) {
    if (!node.id || !node.type || !node.position || !node.data) return false;
    if (!["custom", "summary", "conduct", "start", "end"].includes(node.type))
      return false;
    if (
      typeof node.position.x !== "number" ||
      typeof node.position.y !== "number"
    )
      return false;
  }

  // Basic validation of edges
  for (const edge of data.edges) {
    if (!edge.id || !edge.source || !edge.target) return false;
  }

  return true;
}

/**
 * Create a metadata wrapper for exported flowcharts
 */
export interface FlowchartExportMetadata {
  version: "1.0";
  format: "clinical" | "standard";
  exportDate: string;
  protocolId?: string;
  protocolTitle?: string;
}

export interface FlowchartExport {
  metadata: FlowchartExportMetadata;
  flowchart: ClinicalFlowchart | FlowchartDefinition;
}

export function createFlowchartExport(
  flowchart: ClinicalFlowchart | FlowchartDefinition,
  format: "clinical" | "standard",
  protocolInfo?: { id: string; title: string },
): FlowchartExport {
  return {
    metadata: {
      version: "1.0",
      format,
      exportDate: new Date().toISOString(),
      protocolId: protocolInfo?.id,
      protocolTitle: protocolInfo?.title,
    },
    flowchart,
  };
}

/**
 * Compact flowchart for export to partner systems
 * Uses Dagre algorithm for professional layout without overlaps
 */
export function compactFlowchartForExport(
  flowchart: ClinicalFlowchart,
  protocolInfo?: { id: string; title: string; company?: string },
): any {
  // Convert nodes to ReactFlow format for Dagre layout
  const reactFlowNodes = flowchart.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
    // Use more realistic dimensions for Daktus site
    width: 240,
    height: node.type === "custom" && node.data.questions?.length > 2 ? 150 : 100,
  }));

  // Convert edges to ReactFlow format
  const reactFlowEdges = flowchart.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    data: edge.data,
  }));

  // Apply Dagre layout with partner-compatible parameters
  const { nodes: layoutedNodes } = getLayoutedElements(
    reactFlowNodes,
    reactFlowEdges,
    {
      rankdir: "LR", // Left to right layout (horizontal)
      nodesep: 250, // Reduced from 600 for more compact layout
      ranksep: 400, // Reduced from 1000 for better spacing
      marginx: 100, // Reduced margins
      marginy: 100, // Reduced margins
      edgesep: 150, // Reduced edge separation
      ranker: "network-simplex", // Best algorithm for reducing crossings
    }
  );

  // Apply scale factor to make layout more compact
  const SCALE_FACTOR = 0.6; // Compact by 40%
  const scaledNodes = layoutedNodes.map(node => ({
    ...node,
    position: {
      x: node.position.x * SCALE_FACTOR,
      y: node.position.y * SCALE_FACTOR
    }
  }));

  // Find minimum coordinates to normalize positions
  let minX = Infinity;
  let minY = Infinity;
  scaledNodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
  });

  // Normalize positions to start from positive values and update node data
  const compactedNodes = scaledNodes.map((layoutedNode) => {
    const originalNode = flowchart.nodes.find(n => n.id === layoutedNode.id);
    if (!originalNode) return layoutedNode;

    // Normalize position
    const position = {
      x: layoutedNode.position.x - minX + 400, // Start from x=400
      y: layoutedNode.position.y - minY + 200, // Start from y=200
    };

    // Update data format for compatibility
    let updatedData = { ...originalNode.data };
    
    // Add questions array for ALL node types except start/end
    if (originalNode.type !== "start" && originalNode.type !== "end") {
      if (!updatedData.questions) {
        updatedData.questions = [];
      }
      
      // Process existing questions for custom nodes
      if (originalNode.type === "custom" && updatedData.questions.length > 0) {
        updatedData.questions = updatedData.questions.map((q: any) => ({
          ...q,
          uid: q.uid || q.id?.replace(/^[PQ]/, "") || "",
          nodeId: originalNode.id,
          // Add iid to options if missing
          options: q.options?.map((opt: any) => ({
            ...opt,
            iid: opt.iid || crypto.randomUUID(),
          })) || [],
        }));
      }
    }
    
    // Add clinicalExpressions for summary nodes
    if (originalNode.type === "summary" && !updatedData.clinicalExpressions) {
      updatedData.clinicalExpressions = [];
    }

    return {
      id: originalNode.id,
      type: originalNode.type,
      position,
      data: updatedData,
    };
  });

  // Validate no overlaps (optional debug check)
  const overlaps = checkForOverlaps(compactedNodes);
  if (overlaps.length > 0) {
    console.warn("Node overlaps detected:", overlaps);
  }

  // Build the partner-compatible format
  const partnerFormat = {
    metadata: {
      company: protocolInfo?.company || "medical-protocol-assistant",
      name: protocolInfo?.title?.toLowerCase().replace(/\s+/g, "_") || "protocol",
      version: "1.0",
    },
    nodes: compactedNodes,
    edges: flowchart.edges.map(edge => ({
      ...edge,
      data: {
        ...edge.data,
        rule: edge.data?.rule || determineEdgeRule(edge, flowchart.nodes)
      }
    })),
  };

  return partnerFormat;
}

/**
 * Determine edge rule based on source node type and edge properties
 */
function determineEdgeRule(edge: ClinicalEdge, nodes: ClinicalNode[]): string {
  // If rule already exists, use it
  if (edge.data?.rule) return edge.data.rule;
  
  // Find source node to determine type
  const sourceNode = nodes.find(n => n.id === edge.source);
  if (!sourceNode) return "Regra nova";
  
  // For decision nodes, try to determine Yes/No based on target
  if (sourceNode.type === "custom" && sourceNode.data.questions?.length > 0) {
    // Common patterns for Yes/No edges
    if (edge.id.includes("yes") || edge.id.includes("sim")) return "Sim";
    if (edge.id.includes("no") || edge.id.includes("não")) return "Não";
    // TODO: For now, return generic rule. In a real implementation,
    // we would need to analyze edge connections more carefully
    return "Regra nova";
  }
  
  return "Regra nova";
}

/**
 * Check for node overlaps (helper function for validation)
 */
function checkForOverlaps(nodes: any[]): Array<{node1: string, node2: string}> {
  const overlaps: Array<{node1: string, node2: string}> = [];
  const nodeWidth = 240;  // Updated to match new dimensions
  const nodeHeight = 100; // Updated to match new dimensions
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      // Check if rectangles overlap
      if (!(node1.position.x + nodeWidth < node2.position.x ||
            node2.position.x + nodeWidth < node1.position.x ||
            node1.position.y + nodeHeight < node2.position.y ||
            node2.position.y + nodeHeight < node1.position.y)) {
        overlaps.push({ node1: node1.id, node2: node2.id });
      }
    }
  }
  
  return overlaps;
}
