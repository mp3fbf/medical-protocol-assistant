/**
 * Main ReactFlow Canvas component for visualizing and editing medical protocol flowcharts.
 */
"use client";

import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  // type Node, // Marked as unused
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { customNodeTypes } from "./node-types";
import { FlowMinimap } from "./ui/minimap";
import { FlowControls } from "./ui/controls";
import type {
  CustomFlowNode,
  CustomFlowEdge,
  CustomFlowNodeData,
} from "@/types/flowchart";

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

const initialEdges: CustomFlowEdge[] = [
  { id: "e1-2", source: "1", target: "2", type: "default", animated: true },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    sourceHandle: "no",
    label: "Não",
    type: "default",
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    sourceHandle: "yes",
    label: "Sim",
    type: "default",
  },
];

const ProtocolFlowchartCanvasContent: React.FC = () => {
  const [_nodes, _setNodes, onNodesChange] = // _setNodes marked as unused
    useNodesState<CustomFlowNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-[600px] w-full rounded-md border border-gray-300 bg-gray-50">
      <ReactFlow
        nodes={_nodes} // use _nodes
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={customNodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="protocol-flowchart-theme"
      >
        <Background gap={16} color="#e0e0e0" variant={BackgroundVariant.Dots} />
        <FlowControls />
        <FlowMinimap />
      </ReactFlow>
    </div>
  );
};

export const ProtocolFlowchartCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <ProtocolFlowchartCanvasContent />
    </ReactFlowProvider>
  );
};
