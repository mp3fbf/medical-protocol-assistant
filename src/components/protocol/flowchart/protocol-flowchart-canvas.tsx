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
import { customEdgeTypes } from "./edge-types";
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
    data: { type: "triage", title: "Início do Protocolo" },
  },
  {
    id: "2",
    type: "decision",
    position: { x: 50, y: 200 },
    data: {
      type: "decision",
      title: "Paciente Estável?",
      criteria: "PAS > 90mmHg, SatO2 > 94%",
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
  // Function to remove duplicate connections (same source-handle to same target)
  const removeDuplicateEdges = (edges: CustomFlowEdge[]): CustomFlowEdge[] => {
    const seenConnections = new Set<string>();
    const validEdges: CustomFlowEdge[] = [];

    edges.forEach((edge) => {
      const handle = edge.sourceHandle || "default";
      // Include both source and target in the key to allow multiple edges from same handle to different targets
      const key = `${edge.source}-${handle}-${edge.target}`;

      if (!seenConnections.has(key)) {
        seenConnections.add(key);
        validEdges.push(edge);
      } else {
        console.warn(
          `Removing duplicate edge from ${edge.source} (${handle}) to ${edge.target}`,
        );
      }
    });

    return validEdges;
  };

  // Apply auto-layout to initial nodes
  const initialLayouted = React.useMemo(() => {
    const nodesToLayout = propNodes || defaultNodes;
    let edgesToLayout = propEdges || defaultEdges;

    console.log("=== FLOWCHART DEBUG START ===");
    console.log("Input nodes:", nodesToLayout.length);
    console.log("Input edges before cleanup:", edgesToLayout.length);

    // Log all nodes with their types and titles
    nodesToLayout.forEach((node) => {
      console.log(
        `Node ${node.id}: type=${node.type}, title="${node.data.title}"`,
      );
    });

    // Log all edges before cleanup
    console.log("Edges before cleanup:");
    edgesToLayout.forEach((edge) => {
      console.log(
        `Edge ${edge.id}: ${edge.source} (${edge.sourceHandle || "default"}) -> ${edge.target} (${edge.targetHandle || "default"}) label="${edge.label || ""}"`,
      );
    });

    // Clean up duplicate edges first
    edgesToLayout = removeDuplicateEdges(edgesToLayout);
    console.log("Edges after duplicate removal:", edgesToLayout.length);

    console.log("Final edges to layout:");
    edgesToLayout.forEach((edge) => {
      console.log(
        `Edge ${edge.id}: ${edge.source} (${edge.sourceHandle || "default"}) -> ${edge.target}`,
      );
    });

    // Check if it's clinical format by looking at node types
    const hasClinicalNodes = nodesToLayout.some(
      (node) =>
        (node.type as any) === "custom" ||
        (node.type as any) === "summary" ||
        (node.type as any) === "conduct",
    );

    const result = getLayoutedElements(nodesToLayout, edgesToLayout, {
      rankdir: "TB",
      nodesep: hasClinicalNodes ? 350 : 200, // Much larger spacing for clinical nodes
      ranksep: hasClinicalNodes ? 400 : 250, // Much larger spacing for clinical nodes
      edgesep: 150,
      ranker: "network-simplex",
    });

    console.log(
      "Layout result: ",
      result.nodes.length,
      "nodes,",
      result.edges.length,
      "edges",
    );
    console.log("=== FLOWCHART DEBUG END ===");

    return result;
  }, [propNodes, propEdges]);

  const [nodes, _setNodes, onNodesChange] = useNodesState<CustomFlowNodeData>(
    initialLayouted.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialLayouted.edges);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Memoize node and edge types to prevent React Flow warnings
  const memoizedNodeTypes = React.useMemo(() => customNodeTypes, []);
  const memoizedEdgeTypes = React.useMemo(() => customEdgeTypes, []);

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
    (params: Connection | Edge) => {
      // Check if source handle already has a connection (output handles limited to 1)
      // const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      // Rule: Output can only connect to input (no output-to-output connections)
      if (params.targetHandle && targetNode) {
        // If target has a handle ID, it's likely an output handle (not allowed)
        console.log("Cannot connect output to output handle");
        return;
      }

      // Check if this source already has a connection from the same handle
      // For nodes without specific handles, we treat them as having a single default output
      const sourceHandle = params.sourceHandle || "default";
      const existingConnection = edges.find(
        (e) =>
          e.source === params.source &&
          (e.sourceHandle || "default") === sourceHandle,
      );

      if (existingConnection) {
        console.log(
          `Output handle '${sourceHandle}' already has a connection from node ${params.source}`,
        );
        return; // Prevent multiple connections from same output handle
      }

      const newEdge = {
        ...params,
        type: "orthogonal",
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, edges, nodes],
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
        edgeTypes={memoizedEdgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.15,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1,
        }}
        defaultEdgeOptions={{
          type: "bezier",
          animated: false,
          style: {
            strokeWidth: 2,
            stroke: "#64748b",
          },
        }}
        connectionLineType={"bezier" as any}
        connectionMode={"loose" as any}
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
