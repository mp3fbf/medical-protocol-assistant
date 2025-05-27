/**
 * TypeScript types for the Flowchart system.
 * Based on the Technical Specification section 4.3.
 */
import type { Node, Edge, XYPosition, Position } from "reactflow";

export interface FlowchartMedication {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  duration?: string;
  notes?: string;
}

export type FlowNodePriority = "high" | "medium" | "low";

export interface BaseNodeData {
  title: string;
  priority?: FlowNodePriority;
  // Additional common fields can be added here
}

export interface DecisionNodeData extends BaseNodeData {
  type: "decision";
  criteria: string; // For decisions
}

export interface ActionNodeData extends BaseNodeData {
  type: "action";
  actions: string[]; // For action nodes
}

export interface MedicationNodeData extends BaseNodeData {
  type: "medication";
  medications: FlowchartMedication[]; // For medication tables
}

export interface TriageNodeData extends BaseNodeData {
  type: "triage";
  description?: string; // Example: Triage criteria or initial assessment points
}

export interface StartNodeData extends BaseNodeData {
  type: "start";
  description?: string; // Optional: e.g., "Protocol initiated for condition X"
}

export interface EndNodeData extends BaseNodeData {
  type: "end";
  description?: string; // Optional: e.g., "Patient discharged" or "Refer to specialist"
}

// Union type for all possible node data structures
export type CustomFlowNodeData =
  | DecisionNodeData
  | ActionNodeData
  | MedicationNodeData
  | TriageNodeData
  | StartNodeData
  | EndNodeData;

// Custom Node type for ReactFlow, incorporating our specific data structure
export interface CustomFlowNode
  extends Node<CustomFlowNodeData, string | undefined> {
  type: "decision" | "action" | "medication" | "triage" | "start" | "end"; // Ensures 'type' string literal matches CustomFlowNodeData
}

// Custom Edge type (can be extended if custom edge data is needed)
export type CustomFlowEdge = Edge<any> & {
  type?: "default" | "conditional"; // Example: For conditional styling or logic
};

// Main data structure for storing a flowchart
export interface FlowchartDefinition {
  nodes: CustomFlowNode[];
  edges: CustomFlowEdge[];
  viewport?: { x: number; y: number; zoom: number }; // For saving/restoring view
}

// Re-export core ReactFlow types for convenience if needed elsewhere
export type { Node, Edge, XYPosition, Position };
