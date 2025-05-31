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
import "./node-types/node-styles.css";

import { customNodeTypes } from "./node-types";
import { FlowMinimap } from "./ui/minimap";
import { CustomControls } from "./ui/custom-controls";
import type {
  CustomFlowNode,
  CustomFlowEdge,
  CustomFlowNodeData,
} from "@/types/flowchart";

interface ProtocolFlowchartCanvasProps {
  nodes?: CustomFlowNode[];
  edges?: CustomFlowEdge[];
  onNodesChange?: (nodes: CustomFlowNode[]) => void;
  onEdgesChange?: (edges: CustomFlowEdge[]) => void;
}

const defaultNodes: CustomFlowNode[] = [
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

const defaultEdges: CustomFlowEdge[] = [
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

const ProtocolFlowchartCanvasContent: React.FC<
  ProtocolFlowchartCanvasProps
> = ({
  nodes: propNodes,
  edges: propEdges,
  onNodesChange: _onNodesChangeProp,
  onEdgesChange: _onEdgesChangeProp,
}) => {
  const [_nodes, _setNodes, onNodesChange] = // _setNodes marked as unused
    useNodesState<CustomFlowNodeData>(propNodes || defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    propEdges || defaultEdges,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debug: Log mount and props
  React.useEffect(() => {
    console.log("[ProtocolFlowchartCanvas] Mounted/Updated:", {
      propNodesCount: propNodes?.length || 0,
      propEdgesCount: propEdges?.length || 0,
      actualNodesCount: _nodes.length,
      actualEdgesCount: edges.length,
      usingDefaultNodes: !propNodes,
      firstNode: _nodes[0],
      containerExists: !!containerRef.current,
    });
  }, [propNodes, propEdges, _nodes, edges]);

  // Debug: Track container dimensions
  React.useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      console.log("[ProtocolFlowchartCanvas] Container size:", {
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
        parentElement:
          containerRef.current.parentElement?.getBoundingClientRect(),
      });
    }
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div ref={containerRef} className="h-full w-full">
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
        onInit={(instance) => {
          console.log("[ReactFlow] Initialized:", {
            nodes: instance.getNodes().length,
            edges: instance.getEdges().length,
            viewport: instance.getViewport(),
            bounds: instance.getIntersectingNodes({
              x: 0,
              y: 0,
              width: 1000,
              height: 1000,
            }).length,
          });
        }}
        onNodesInitialized={(nodes) => {
          console.log("[ReactFlow] Nodes initialized:", nodes.length);
        }}
        onError={(error) => {
          console.error("[ReactFlow] Error:", error);
        }}
      >
        <Background gap={16} color="#e0e0e0" variant={BackgroundVariant.Dots} />
        <CustomControls />
        <FlowMinimap />
      </ReactFlow>
    </div>
  );
};

export const ProtocolFlowchartCanvas: React.FC<ProtocolFlowchartCanvasProps> = (
  props,
) => {
  return (
    <ReactFlowProvider>
      <ProtocolFlowchartCanvasContent {...props} />
    </ReactFlowProvider>
  );
};
