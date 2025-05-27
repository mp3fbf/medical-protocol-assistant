/**
 * Zod Schemas and Validation Rules for Flowcharts.
 */
import { z } from "zod";
import type {
  CustomFlowNode,
  CustomFlowEdge,
  FlowchartDefinition,
  FlowchartMedication,
} from "@/types/flowchart";
import type {
  ValidationIssue,
  ValidationRuleDefinition,
  ValidatorFunction as GenericValidatorFunction,
} from "@/types/validation";

// ValidatorFunction specific to flowchart validation context
type FlowchartValidatorFunction = (
  flowchart: FlowchartDefinition,
) => ValidationIssue[];

// Schema for medication item within a flowchart node
export const FlowchartMedicationSchema = z.object({
  name: z.string().min(1),
  dose: z.string().min(1),
  route: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

// Schema for the 'data' part of a flowchart node, based on node type
export const GeneratedFlowNodeDataSchema = z.object({
  title: z.string().min(1, "Título do nó é obrigatório."),
  type: z.enum(["decision", "action", "medication", "triage", "start", "end"]),
  priority: z.enum(["high", "medium", "low"]).optional(),
  // Type-specific fields
  criteria: z.string().optional(), // For decision nodes
  actions: z.array(z.string()).optional(), // For action nodes
  medications: z.array(FlowchartMedicationSchema).optional(), // For medication nodes
  description: z.string().optional(), // For triage or other general purpose nodes
});

// Schema for a single AI-generated flowchart node
export const GeneratedFlowNodeSchema = z.object({
  id: z.string().min(1, "ID do nó é obrigatório."),
  type: z.enum(["decision", "action", "medication", "triage", "start", "end"]),
  data: GeneratedFlowNodeDataSchema,
  // position is not expected from AI, will be added by layout engine
});

// Schema for a single AI-generated flowchart edge
export const GeneratedFlowEdgeSchema = z.object({
  id: z.string().min(1, "ID da aresta é obrigatório."),
  source: z.string().min(1, "Nó de origem (source) é obrigatório."),
  target: z.string().min(1, "Nó de destino (target) é obrigatório."),
  label: z.string().optional(),
  type: z.enum(["default", "conditional"]).optional(),
});

// Schema for the complete AI-generated flowchart structure
export const GeneratedFlowchartSchema = z.object({
  nodes: z.array(GeneratedFlowNodeSchema),
  edges: z.array(GeneratedFlowEdgeSchema),
});

/**
 * Rule: Checks for orphan nodes (nodes with no incoming or outgoing edges,
 * excluding designated start/end nodes).
 */
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
    // Allow 'start' nodes to have no incoming, and 'end' nodes to have no outgoing.
    const isStartNode = node.type === "start";
    const isEndNode = node.type === "end";

    const hasIncoming = edges.some((edge) => edge.target === node.id);
    const hasOutgoing = edges.some((edge) => edge.source === node.id);

    if (isStartNode && !hasOutgoing && nodes.length > 1) {
      // Start node with no outgoing edges (and it's not the only node)
      // This check might be too strict if a start node can immediately be an end node.
      // For now, assume start nodes should lead somewhere if there are other nodes.
    } else if (isEndNode && !hasIncoming && nodes.length > 1) {
      // End node with no incoming edges (and it's not the only node)
    } else if (!isStartNode && !isEndNode && (!hasIncoming || !hasOutgoing)) {
      // Non-start/end node that is an orphan or a dead-end/start
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

/**
 * Rule: Checks for basic infinite loops (e.g., a node pointing directly to itself).
 * More complex loop detection is harder and might require graph traversal algorithms.
 */
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
  // TODO: Implement more sophisticated cycle detection if needed
  return issues;
};

export const FLOWCHART_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "FLOWCHART_ORPHAN_NODES",
    description:
      "Checks for nodes that are not connected to the main flow (excluding start/end nodes under certain conditions).",
    severity: "warning",
    category: "FLOWCHART_CONSISTENCY",
    check: checkOrphanNodes as unknown as GenericValidatorFunction, // Cast to generic for the array
  },
  {
    id: "FLOWCHART_INFINITE_LOOPS",
    description:
      "Checks for basic infinite loops (e.g., self-referential nodes).",
    severity: "error",
    category: "FLOWCHART_CONSISTENCY",
    check: checkInfiniteLoops as unknown as GenericValidatorFunction, // Cast to generic for the array
  },
  // Add more flowchart-specific validation rules here
];

/**
 * Validates the flowchart structure and consistency.
 * @param flowchart - The flowchart data (nodes and edges).
 * @returns An array of validation issues.
 */
export const validateFlowchart = async (
  flowchart: FlowchartDefinition,
): Promise<ValidationIssue[]> => {
  let allIssues: ValidationIssue[] = [];
  for (const rule of FLOWCHART_VALIDATION_RULES) {
    // The rule.check is cast to GenericValidatorFunction which might take ProtocolFullContent (optional second arg)
    // Here, we are only passing flowchart, so the validator function itself must handle undefined second arg.
    // In this specific case, FlowchartValidatorFunction only takes flowchart, so it's fine.
    const ruleIssuesResult = await (
      rule.check as unknown as FlowchartValidatorFunction
    )(flowchart);
    allIssues = allIssues.concat(ruleIssuesResult);
  }
  return allIssues;
};
