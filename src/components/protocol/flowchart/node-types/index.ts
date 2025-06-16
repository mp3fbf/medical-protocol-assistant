/**
 * Custom Node Types for ReactFlow.
 * Maps node type strings to their respective components.
 */
import type { NodeTypes } from "reactflow";
import { DecisionNode } from "./decision-node";
import { ActionNode } from "./action-node";
import { MedicationNode } from "./medication-node";
import { TriageNode } from "./triage-node";
import { StartNode } from "./start-node";
import { EndNode } from "./end-node";

// Clinical node types
import { QuestionNode, SummaryNode, ConductNode } from "./clinical";

export const customNodeTypes: NodeTypes = {
  // Standard nodes
  decision: DecisionNode,
  action: ActionNode,
  medication: MedicationNode,
  triage: TriageNode,
  start: StartNode,
  end: EndNode,

  // Clinical nodes
  custom: QuestionNode, // "custom" type in JSON maps to QuestionNode
  summary: SummaryNode,
  conduct: ConductNode,
};
