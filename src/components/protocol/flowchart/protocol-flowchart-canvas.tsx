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
import "./node-types/medical-node-styles.css";
import "./flowchart-canvas.css";

import { customNodeTypes } from "./node-types";
import { FlowMinimap } from "./ui/minimap";
import { CustomControls } from "./ui/custom-controls";
import { useFlowchartKeyboardNavigation } from "@/hooks/use-flowchart-keyboard-navigation";
import { getLayoutedElements } from "@/lib/flowchart/dagre-layout";
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
  // Apply auto-layout to initial nodes
  const initialLayouted = React.useMemo(() => {
    const nodesToLayout = propNodes || defaultNodes;
    const edgesToLayout = propEdges || defaultEdges;
    return getLayoutedElements(nodesToLayout, edgesToLayout, {
      rankdir: "TB",
      nodesep: 80,
      ranksep: 120,
    });
  }, [propNodes, propEdges]);

  const [nodes, _setNodes, onNodesChange] = useNodesState<CustomFlowNodeData>(
    initialLayouted.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialLayouted.edges);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Memoize node types to prevent React Flow warnings
  const memoizedNodeTypes = React.useMemo(() => customNodeTypes, []);

  // Debug: Log only initial mount
  React.useEffect(() => {
    console.log(
      "[ProtocolFlowchartCanvas] Initialized with",
      nodes.length,
      "nodes and",
      edges.length,
      "edges",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps to run only once

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Keyboard navigation for accessibility
  useFlowchartKeyboardNavigation({
    enabled: true,
    onNodeSelect: (node) => {
      console.log("Node selected:", node.id);
    },
  });

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
      role="application"
      aria-label="Canvas do fluxograma. Use as teclas de seta para navegar entre os nós."
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={memoizedNodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.15,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1,
        }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
          style: {
            strokeWidth: 2,
          },
          labelBgStyle: {
            fill: "white",
            fillOpacity: 0.9,
          },
        }}
        attributionPosition="bottom-left"
        className="protocol-flowchart-theme"
        onInit={(instance) => {
          console.log(
            "[ReactFlow] Initialized with",
            instance.getNodes().length,
            "nodes",
          );
          // Auto-fit on initialization with better settings
          setTimeout(() => {
            instance.fitView({
              padding: 0.15,
              includeHiddenNodes: false,
              duration: 800,
              minZoom: 0.5,
              maxZoom: 1,
            });
          }, 100);
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
