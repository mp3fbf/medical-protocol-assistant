/**
 * Editable ReactFlow Canvas component for editing medical protocol flowcharts.
 */
"use client";

import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import "./node-types/node-styles.css";

import { customNodeTypes } from "./node-types";
import { FlowMinimap } from "./ui/minimap";
import { CustomControls } from "./ui/custom-controls";
import { FlowchartToolbar } from "./ui/flowchart-toolbar";
import { NodeEditDialog } from "./ui/node-edit-dialog";
import { FlowchartHelpDialog } from "./ui/flowchart-help-dialog";
import type {
  CustomFlowNode,
  CustomFlowNodeData,
  CustomFlowEdge,
  FlowchartDefinition,
} from "@/types/flowchart";

interface EditableFlowchartCanvasProps {
  flowchartData: FlowchartDefinition | null;
  onSave?: (flowchart: FlowchartDefinition) => void;
  isReadOnly?: boolean;
  protocolTitle?: string;
}

const EditableFlowchartCanvasContent: React.FC<
  EditableFlowchartCanvasProps
> = ({ flowchartData, onSave, isReadOnly = false }) => {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomFlowNodeData>(
    flowchartData?.nodes || [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    flowchartData?.edges || [],
  );
  const [selectedNode, setSelectedNode] = useState<CustomFlowNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("flowchart-help-seen") === "true";
    }
    return false;
  });
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  // Show help dialog on first visit - only once per session
  useEffect(() => {
    if (!isReadOnly && !hasSeenHelp && !hasShownOnboarding && !isHelpOpen) {
      // Small delay to ensure proper mounting
      const timer = setTimeout(() => {
        setIsHelpOpen(true);
        setHasShownOnboarding(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isReadOnly, hasSeenHelp, hasShownOnboarding, isHelpOpen]);

  // Reset help dialog state when component unmounts
  useEffect(() => {
    return () => {
      setIsHelpOpen(false);
    };
  }, []);

  // Track changes
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      setHasChanges(true);
    },
    [onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      setHasChanges(true);
    },
    [onEdgesChange],
  );

  // Handle connections
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds));
      setHasChanges(true);
    },
    [setEdges],
  );

  // Handle node click for editing
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!isReadOnly) {
        setSelectedNode(node as CustomFlowNode);
        setIsEditDialogOpen(true);
      }
    },
    [isReadOnly],
  );

  // Add new node
  const addNode = useCallback(
    (
      type: "action" | "medication" | "decision" | "triage" | "start" | "end",
    ) => {
      const newNode: CustomFlowNode = {
        id: `node-${Date.now()}`,
        type,
        position: { x: 250, y: 250 },
        data: getDefaultNodeData(type),
      };

      setNodes((nds) => [...nds, newNode]);
      setHasChanges(true);
    },
    [setNodes],
  );

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    const selectedNodeIds = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);

    if (selectedNodeIds.length > 0) {
      setNodes((nds) =>
        nds.filter((node) => !selectedNodeIds.includes(node.id)),
      );
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !selectedNodeIds.includes(edge.source) &&
            !selectedNodeIds.includes(edge.target),
        ),
      );
      setHasChanges(true);
    }
  }, [nodes, setNodes, setEdges]);

  // Save flowchart
  const handleSave = useCallback(() => {
    if (onSave && hasChanges) {
      const viewport = reactFlowInstance.getViewport();
      const flowchart: FlowchartDefinition = {
        nodes: nodes as CustomFlowNode[],
        edges: edges.map(
          (edge) =>
            ({
              ...edge,
              type: edge.type === "conditional" ? "conditional" : "default",
            }) as CustomFlowEdge,
        ),
        viewport: {
          x: viewport.x,
          y: viewport.y,
          zoom: viewport.zoom,
        },
      };
      onSave(flowchart);
      setHasChanges(false);
    }
  }, [nodes, edges, onSave, hasChanges, reactFlowInstance]);

  // Update node data from edit dialog
  const handleNodeUpdate = useCallback(
    (nodeId: string, newData: CustomFlowNodeData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: newData } : node,
        ),
      );
      setHasChanges(true);
      setIsEditDialogOpen(false);
    },
    [setNodes],
  );

  return (
    <>
      {!isReadOnly && (
        <FlowchartToolbar
          onAddNode={addNode}
          onDeleteSelected={deleteSelectedNodes}
          onSave={handleSave}
          hasChanges={hasChanges}
          canDelete={nodes.some((node) => node.selected)}
          onHelp={() => setIsHelpOpen(true)}
        />
      )}

      <div className="h-full min-h-[600px] w-full rounded-md border border-gray-300 bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={customNodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="protocol-flowchart-theme"
          deleteKeyCode={isReadOnly ? null : "Delete"}
          multiSelectionKeyCode={isReadOnly ? null : "Control"}
          connectionRadius={50}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background
            gap={16}
            color="#e0e0e0"
            variant={BackgroundVariant.Dots}
          />
          <CustomControls />
          <FlowMinimap />
        </ReactFlow>
      </div>

      {selectedNode && (
        <NodeEditDialog
          node={selectedNode}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleNodeUpdate}
        />
      )}

      <FlowchartHelpDialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onDontShowAgain={(value) => {
          if (value) {
            localStorage.setItem("flowchart-help-seen", "true");
            setHasSeenHelp(true);
          }
        }}
      />
    </>
  );
};

// Helper function to get default node data based on type
function getDefaultNodeData(type: string): CustomFlowNodeData {
  switch (type) {
    case "start":
      return { type: "start", title: "Início" };
    case "end":
      return { type: "end", title: "Fim" };
    case "triage":
      return { type: "triage", title: "Nova Triagem", priority: "medium" };
    case "decision":
      return {
        type: "decision",
        title: "Nova Decisão",
        criteria: "Defina os critérios",
        priority: "medium",
      };
    case "action":
      return {
        type: "action",
        title: "Nova Ação",
        actions: ["Ação 1"],
        priority: "medium",
      };
    case "medication":
      return {
        type: "medication",
        title: "Nova Medicação",
        medications: [
          {
            name: "Medicamento",
            dose: "Dose",
            route: "Via",
            frequency: "Frequência",
          },
        ],
        priority: "medium",
      };
    default:
      return {
        type: "action",
        title: "Novo Nó",
        actions: ["Ação 1"],
        priority: "medium",
      };
  }
}

export const EditableFlowchartCanvas: React.FC<EditableFlowchartCanvasProps> = (
  props,
) => {
  return (
    <ReactFlowProvider>
      <EditableFlowchartCanvasContent {...props} />
    </ReactFlowProvider>
  );
};
