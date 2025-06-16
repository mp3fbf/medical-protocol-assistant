/**
 * Converter between standard flowchart format and clinical flowchart format
 */

import type {
  FlowchartDefinition,
  CustomFlowNode,
  CustomFlowEdge,
} from "@/types/flowchart";
import type {
  ClinicalFlowchart,
  ClinicalNode,
  ClinicalEdge,
} from "@/types/flowchart-clinical";

/**
 * Convert clinical flowchart format to standard flowchart format
 * This allows clinical flowcharts to be displayed in the standard viewer
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
        // Custom nodes with questions map to decision nodes
        standardType = "decision";
        standardData = {
          type: "decision",
          title: clinicalNode.data.label,
          criteria: clinicalNode.data.descricao || "Questionário",
        };
        break;

      case "summary":
        // Summary nodes map to triage nodes
        standardType = "triage";
        standardData = {
          type: "triage",
          title: clinicalNode.data.label,
          description: clinicalNode.data.descricao,
        };
        break;

      case "conduct":
        // Conduct nodes map to action nodes
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
 */
export function standardToClinical(
  standard: FlowchartDefinition,
): ClinicalFlowchart {
  // Convert nodes
  const nodes: ClinicalNode[] = standard.nodes.map((standardNode) => {
    // Map standard node types to clinical node types
    let clinicalType: ClinicalNode["type"];
    let clinicalData: ClinicalNode["data"];

    switch (standardNode.type) {
      case "decision":
        // Decision nodes map to custom nodes with a single question
        clinicalType = "custom";
        clinicalData = {
          label: standardNode.data.title,
          condicao: "SEMPRE",
          descricao: (standardNode.data as any).criteria || "",
          condicional: "visivel",
          questions: [
            {
              id: `Q${standardNode.id}`,
              uid: "",
              titulo: standardNode.data.title,
              descricao: (standardNode.data as any).criteria || "",
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
        clinicalType = "summary";
        clinicalData = {
          label: standardNode.data.title,
          condicao: "",
          descricao: (standardNode.data as any).description || "",
          condicional: "visivel",
        };
        break;

      case "action":
      case "medication":
        // Action and medication nodes map to conduct nodes
        clinicalType = "conduct";
        const actions = (standardNode.data as any).actions || [];
        const medications = (standardNode.data as any).medications || [];

        clinicalData = {
          label: standardNode.data.title,
          condicao: "",
          descricao: "",
          condicional: "visivel",
          conduta: "conclusao",
          condutaDataNode: {
            orientacao:
              actions.length > 0
                ? [
                    {
                      id: `O${standardNode.id}`,
                      nome: "Orientações",
                      descricao: "",
                      condicional: "visivel",
                      condicao: "SEMPRE",
                      conteudo: `<ul>${actions.map((a: string) => `<li>${a}</li>`).join("")}</ul>`,
                    },
                  ]
                : [],
            exame: [],
            medicamento: medications.map((med: any, idx: number) => ({
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
            })),
            encaminhamento: [],
            mensagem: [],
          },
        };
        break;

      case "start":
      case "end":
        // Start/end nodes map to custom nodes with no questions
        clinicalType = "custom";
        clinicalData = {
          label: standardNode.data.title,
          condicao: "SEMPRE",
          descricao: "",
          condicional: "visivel",
          questions: [],
        };
        break;

      default:
        // Fallback to custom node
        clinicalType = "custom";
        clinicalData = {
          label: standardNode.data.title || "Nó",
          condicao: "SEMPRE",
          descricao: "",
          condicional: "visivel",
          questions: [],
        };
    }

    return {
      id: standardNode.id,
      type: clinicalType,
      position: standardNode.position,
      data: clinicalData,
    };
  });

  // Convert edges
  const edges: ClinicalEdge[] = standard.edges.map((standardEdge) => ({
    id: standardEdge.id,
    source: standardEdge.source,
    target: standardEdge.target,
    data: {
      rule: String(standardEdge.label || "Regra nova"),
    },
  }));

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
    if (!["custom", "summary", "conduct"].includes(node.type)) return false;
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
