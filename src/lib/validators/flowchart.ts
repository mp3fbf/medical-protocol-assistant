/**
 * Zod Schemas and Validation Rules for Flowcharts.
 */
import { z } from "zod";
import type {
  // CustomFlowNode as _CustomFlowNode, // Marked as unused
  // CustomFlowEdge as _CustomFlowEdge, // Marked as unused
  FlowchartDefinition,
  // FlowchartMedication as _FlowchartMedication, // Marked as unused
} from "@/types/flowchart";
import type {
  ValidationIssue,
  ValidationRuleDefinition,
  ValidatorFunction as GenericValidatorFunction,
} from "@/types/validation";

type FlowchartValidatorFunction = (
  flowchart: FlowchartDefinition,
) => ValidationIssue[];

export const FlowchartMedicationSchema = z.object({
  name: z.string().min(1),
  dose: z.string().min(1),
  route: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

const DecisionOutputSchema = z.object({
  id: z.string(),
  label: z.string(),
  position: z.enum([
    "bottom-left",
    "bottom-right",
    "bottom-center",
    "left",
    "right",
  ]),
});

export const GeneratedFlowNodeDataSchema = z.object({
  title: z.string().min(1, "Título do nó é obrigatório."),
  type: z.enum(["decision", "action", "medication", "triage", "start", "end"]),
  criteria: z.string().optional(),
  actions: z.array(z.string()).optional(),
  medications: z.array(FlowchartMedicationSchema).optional(),
  description: z.string().optional(),
  outputs: z.array(DecisionOutputSchema).optional(), // For decision nodes
});

export const GeneratedFlowNodeSchema = z.object({
  id: z.string().min(1, "ID do nó é obrigatório."),
  type: z.enum(["decision", "action", "medication", "triage", "start", "end"]),
  data: GeneratedFlowNodeDataSchema,
});

export const GeneratedFlowEdgeSchema = z.object({
  id: z.string().min(1, "ID da aresta é obrigatório."),
  source: z.string().min(1, "Nó de origem (source) é obrigatório."),
  target: z.string().min(1, "Nó de destino (target) é obrigatório."),
  label: z.string().optional(),
  type: z.enum(["default", "conditional"]).optional(),
  sourceHandle: z.string().optional(), // Required for decision nodes
  targetHandle: z.string().optional(), // Optional for specific target handles
});

export const GeneratedFlowchartSchema = z.object({
  nodes: z.array(GeneratedFlowNodeSchema),
  edges: z.array(GeneratedFlowEdgeSchema),
});

const checkOrphanNodes: FlowchartValidatorFunction = (
  flowchart,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const { nodes, edges } = flowchart;
  if (nodes.length === 0) return issues;

  const nodeIdsWithEdges = new Set<string>();
  edges.forEach((edge) => {
    nodeIdsWithEdges.add(edge.source);
    nodeIdsWithEdges.add(edge.target);
  });

  nodes.forEach((node) => {
    const isStartNode = node.type === "start";
    const isEndNode = node.type === "end";

    const hasIncoming = edges.some((edge) => edge.target === node.id);
    const hasOutgoing = edges.some((edge) => edge.source === node.id);

    if (isStartNode && !hasOutgoing && nodes.length > 1) {
    } else if (isEndNode && !hasIncoming && nodes.length > 1) {
    } else if (!isStartNode && !isEndNode && (!hasIncoming || !hasOutgoing)) {
      if (!nodeIdsWithEdges.has(node.id) && nodes.length > 1) {
        issues.push({
          ruleId: "FLOWCHART_ORPHAN_NODE",
          message: `O nó "${node.data.title}" (ID: ${node.id}, Tipo: ${node.type}) parece estar órfão (sem conexões de entrada ou saída).`,
          severity: "warning",
          category: "FLOWCHART_CONSISTENCY",
          details: { nodeId: node.id, nodeTitle: node.data.title },
        });
      }
    }
  });
  return issues;
};

const checkInfiniteLoops: FlowchartValidatorFunction = (
  flowchart,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  flowchart.edges.forEach((edge) => {
    if (edge.source === edge.target) {
      issues.push({
        ruleId: "FLOWCHART_SELF_LOOP",
        message: `O nó ID "${edge.source}" aponta diretamente para si mesmo, criando um loop infinito.`,
        severity: "error",
        category: "FLOWCHART_CONSISTENCY",
        details: { nodeId: edge.source },
      });
    }
  });
  return issues;
};

export const FLOWCHART_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "FLOWCHART_ORPHAN_NODES",
    description:
      "Checks for nodes that are not connected to the main flow (excluding start/end nodes under certain conditions).",
    severity: "warning",
    category: "FLOWCHART_CONSISTENCY",
    check: checkOrphanNodes as unknown as GenericValidatorFunction,
  },
  {
    id: "FLOWCHART_INFINITE_LOOPS",
    description:
      "Checks for basic infinite loops (e.g., self-referential nodes).",
    severity: "error",
    category: "FLOWCHART_CONSISTENCY",
    check: checkInfiniteLoops as unknown as GenericValidatorFunction,
  },
];

export const validateFlowchart = async (
  flowchart: FlowchartDefinition,
): Promise<ValidationIssue[]> => {
  let allIssues: ValidationIssue[] = [];
  for (const rule of FLOWCHART_VALIDATION_RULES) {
    const ruleIssuesResult = await (
      rule.check as unknown as FlowchartValidatorFunction
    )(flowchart);
    allIssues = allIssues.concat(ruleIssuesResult);
  }
  return allIssues;
};
