/**
 * Clinical flowchart types for medical protocol questionnaires and conducts
 */

// Question option structure
export interface QuestionOption {
  id: string;
  label: string;
  preselected: boolean;
  exclusive: boolean;
}

// Question structure
export interface Question {
  id: string;
  uid: string;
  titulo: string;
  descricao: string;
  condicional: "visivel" | "oculto";
  expressao: string;
  select: "E" | "F" | "B"; // E = Multiple choice, F = Single choice, B = Text input
  options: QuestionOption[];
}

// Base node data for clinical nodes
export interface ClinicalBaseNodeData {
  label: string;
  condicao: string;
  descricao: string;
  condicional: "visivel" | "oculto";
}

// Custom node (questionnaire) data
export interface CustomNodeData extends ClinicalBaseNodeData {
  questions: Question[];
}

// Summary node data
export interface SummaryNodeData extends ClinicalBaseNodeData {
  // Summary nodes typically just have label, condicao, descricao
}

// Conduct sub-structures
export interface Orientacao {
  id: string;
  nome: string;
  descricao: string;
  condicional: "visivel" | "oculto";
  condicao: string;
  conteudo: string; // HTML content
}

export interface Exame {
  id: string;
  nome: string;
  descricao: string;
  condicional: "visivel" | "oculto";
  condicao: string;
  condicionalExame: "domiciliar" | "hospitalar";
  codigo: string;
  cid: string;
  indicacao: string;
  alerta: string;
  material: string;
}

export interface Medicamento {
  id: string;
  nome: string;
  descricao: string;
  condicional: "visivel" | "oculto";
  condicao: string;
  condicionalMedicamento: "intra-hospitalar" | "domiciliar";
  quantidade: number;
  codigo: string;
  nomeMed: string;
  posologia: string; // HTML content
  mensagemMedico: string;
  via: string;
}

export interface Encaminhamento {
  id: string;
  nome: string;
  descricao: string;
  condicional: "visivel" | "oculto";
  condicao: string;
  especialidade: string;
  motivo: string;
}

export interface Mensagem {
  id: string;
  nome: string;
  descricao: string;
  condicional: "visivel" | "oculto";
  condicao: string;
  conteudo: string; // HTML content
  observacao: string;
}

export interface ConductDataNode {
  orientacao: Orientacao[];
  exame: Exame[];
  medicamento: Medicamento[];
  encaminhamento: Encaminhamento[];
  mensagem: Mensagem[];
}

// Conduct node data
export interface ConductNodeData extends ClinicalBaseNodeData {
  conduta: "conclusao" | "encaminhamento" | "retorno";
  condutaDataNode?: ConductDataNode;
}

// Clinical node types
export type ClinicalNodeType = "custom" | "summary" | "conduct";

// Clinical node structure
export interface ClinicalNode {
  id: string;
  type: ClinicalNodeType;
  position: {
    x: number;
    y: number;
  };
  data: CustomNodeData | SummaryNodeData | ConductNodeData;
}

// Clinical edge structure
export interface ClinicalEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    rule: string;
  };
}

// Complete clinical flowchart structure
export interface ClinicalFlowchart {
  nodes: ClinicalNode[];
  edges: ClinicalEdge[];
}

// Type guards
export function isCustomNode(
  node: ClinicalNode,
): node is ClinicalNode & { data: CustomNodeData } {
  return node.type === "custom";
}

export function isSummaryNode(
  node: ClinicalNode,
): node is ClinicalNode & { data: SummaryNodeData } {
  return node.type === "summary";
}

export function isConductNode(
  node: ClinicalNode,
): node is ClinicalNode & { data: ConductNodeData } {
  return node.type === "conduct";
}

// Helper to check if conduct node has data
export function hasConductData(
  data: ConductNodeData,
): data is ConductNodeData & { condutaDataNode: ConductDataNode } {
  return !!data.condutaDataNode;
}
