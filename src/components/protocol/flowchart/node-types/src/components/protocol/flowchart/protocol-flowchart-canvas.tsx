/**
 * Main ReactFlow Canvas component for visualizing and editing medical protocol flowcharts.
 */
"use client";

import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider, // Required for useReactFlow hook if used outside of ReactFlow component tree
  BackgroundVariant, // Import BackgroundVariant
} from "reactflow";
import "reactflow/dist/style.css"; // Default ReactFlow styles

import { customNodeTypes } from "@/components/protocol/flowchart/node-types";
import { FlowMinimap } from "@/components/protocol/flowchart/ui/minimap";
import { FlowControls } from "@/components/protocol/flowchart/ui/controls";
import type {
  CustomFlowNode,
  CustomFlowEdge,
  CustomFlowNodeData,
} from "@/types/flowchart";

// Sample initial data
const initialNodes: CustomFlowNode[] = [
  {
    id: "1",
    type: "triage",
    position: { x: 50, y: 50 },
    data: { type: "triage", title: "Início do Protocolo", priority: "high" },
  },
  {
    id: "2",
    type: "decision",
    position: { x: 50, y: 200 },
    data: {
      type: "decision",
      title: "Paciente Estável?",
      criteria: "PAS > 90mmHg, SatO2 > 94%",
      priority: "medium",
    },
  },
  {
    id: "3",
    type: "action",
    position: { x: -150, y: 350 },
    data: {
      type: "action",
      title: "Monitorar Sinais Vitais",
      actions: ["Verificar PA a cada 15 min", "ECG contínuo"],
      priority: "low",
    },
  },
  {
    id: "4",
    type: "medication",
    position: { x: 250, y: 350 },
    data: {
      type: "medication",
      title: "Administrar Medicação X",
      medications: [
        { name: "Droga Alpha", dose: "10mg", route: "IV", frequency: "BID" },
      ],
      priority: "medium",
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "default", animated: true },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    sourceHandle: "no", // Assuming 'no' path from decision node
    label: "Não",
    type: "default",
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    sourceHandle: "yes", // Assuming 'yes' path from decision node
    label: "Sim",
    type: "default",
  },
];

const ProtocolFlowchartCanvasContent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<CustomFlowNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-[600px] w-full rounded-md border border-gray-300 bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={customNodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="protocol-flowchart-theme" // For custom global styles if needed
      >
        <Background gap={16} color="#e0e0e0" variant={BackgroundVariant.Dots} />
        <FlowControls />
        <FlowMinimap />
      </ReactFlow>
    </div>
  );
};

// Wrap with ReactFlowProvider if useReactFlow is needed in child components not directly under <ReactFlow>
// For this setup, FlowControls and FlowMinimap are direct children, so Provider is not strictly needed here
// but good practice if the structure evolves.
export const ProtocolFlowchartCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <ProtocolFlowchartCanvasContent />
    </ReactFlowProvider>
  );
};
