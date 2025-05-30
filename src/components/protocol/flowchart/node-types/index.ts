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

export const customNodeTypes: NodeTypes = {
  decision: DecisionNode,
  action: ActionNode,
  medication: MedicationNode,
  triage: TriageNode,
  start: StartNode,
  end: EndNode,
};
