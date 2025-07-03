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
import { customEdgeTypes } from "./edge-types";
import { FlowMinimap } from "./ui/minimap";
import { CustomControls } from "./ui/custom-controls";
import { FlowchartToolbar } from "./ui/flowchart-toolbar";
import { NodeEditDialog } from "./ui/node-edit-dialog";
import { EdgeEditDialog } from "./ui/edge-edit-dialog";
import { FlowchartHelpDialog } from "./ui/flowchart-help-dialog";
import { useFlowchartKeyboardNavigation } from "@/hooks/use-flowchart-keyboard-navigation";
import { getLayoutedElements } from "@/lib/flowchart/dagre-layout";
import type {
  CustomFlowNode,
  CustomFlowNodeData,
  CustomFlowEdge,
  FlowchartDefinition,
} from "@/types/flowchart";
import {
  clinicalToStandard,
  standardToClinical,
  isValidClinicalFlowchart,
  createFlowchartExport,
} from "@/lib/utils/flowchart-converter";
import { toast } from "sonner";

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

  // Function to remove duplicate connections (same source-handle to same target)
  const removeDuplicateEdges = (edges: any[]): any[] => {
    const seenConnections = new Set<string>();
    const validEdges: any[] = [];

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

  // Apply layout to initial nodes
  const initialLayouted = React.useMemo(() => {
    if (!flowchartData?.nodes || flowchartData.nodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    const cleanEdges = removeDuplicateEdges(
      (flowchartData?.edges || []).map((edge) => ({
        ...edge,
        type: "orthogonal",
      })),
    );

    // Check if it's clinical format by looking at node types
    const hasClinicalNodes = flowchartData.nodes.some(
      (node) =>
        (node.type as any) === "custom" ||
        (node.type as any) === "summary" ||
        (node.type as any) === "conduct",
    );

    return getLayoutedElements(flowchartData.nodes, cleanEdges, {
      rankdir: "TB",
      nodesep: hasClinicalNodes ? 350 : 200, // Larger spacing for clinical nodes
      ranksep: hasClinicalNodes ? 400 : 250, // Larger spacing for clinical nodes
      edgesep: 150,
      ranker: "network-simplex",
    });
  }, [flowchartData]);

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomFlowNodeData>(
    initialLayouted.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialLayouted.edges);
  const [selectedNode, setSelectedNode] = useState<CustomFlowNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEdgeEditDialogOpen, setIsEdgeEditDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState(false);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize localStorage check after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("flowchart-help-seen") === "true";
      console.log(
        "Flowchart help localStorage value:",
        localStorage.getItem("flowchart-help-seen"),
        "hasSeenHelp will be:",
        seen,
      );
      setHasSeenHelp(seen);
      setIsInitialized(true);
    }
  }, []);

  // Show help dialog on first visit
  useEffect(() => {
    if (isInitialized && !isReadOnly && !hasSeenHelp && !hasShownOnboarding) {
      // Small delay to ensure proper mounting
      const timer = setTimeout(() => {
        console.log(
          "Showing onboarding help dialog - hasSeenHelp:",
          hasSeenHelp,
        );
        setIsHelpOpen(true);
        setHasShownOnboarding(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, isReadOnly, hasSeenHelp, hasShownOnboarding]);

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
      // Check if source handle already has a connection (output handles limited to 1)
      const sourceNode = nodes.find((n) => n.id === params.source);
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

      // Get the label for decision edges
      let edgeLabel = undefined;
      if (sourceNode && sourceNode.type === "decision" && params.sourceHandle) {
        const decisionData = sourceNode.data as any;

        // Check new outputs format first
        if (decisionData.outputs) {
          const output = decisionData.outputs.find(
            (o: any) => o.id === params.sourceHandle,
          );
          if (output) {
            edgeLabel = output.label;
          }
        } else {
          // Legacy support
          if (params.sourceHandle === "yes") {
            edgeLabel = decisionData.yesLabel || "Sim";
          } else if (params.sourceHandle === "no") {
            edgeLabel = decisionData.noLabel || "Não";
          }
        }
      }

      const newEdge = {
        ...params,
        type: "orthogonal",
        label: edgeLabel,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setHasChanges(true);
    },
    [setEdges, edges, nodes],
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

  // Handle edge click for editing
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (!isReadOnly) {
        setSelectedEdge(edge);
        setIsEdgeEditDialogOpen(true);
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

  // Update edge label from edit dialog
  const handleEdgeUpdate = useCallback(
    (edgeId: string, label: string) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId ? { ...edge, label: label || undefined } : edge,
        ),
      );
      setHasChanges(true);
      setIsEdgeEditDialogOpen(false);
    },
    [setEdges],
  );

  // Delete edge from edit dialog
  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
      setHasChanges(true);
      setIsEdgeEditDialogOpen(false);
    },
    [setEdges],
  );

  // Export flowchart as JSON
  const handleExportJSON = useCallback(() => {
    const currentFlowchart: FlowchartDefinition = {
      nodes: nodes as CustomFlowNode[],
      edges: edges.map(
        (edge) =>
          ({
            ...edge,
            type: edge.type === "conditional" ? "conditional" : "default",
          }) as CustomFlowEdge,
      ),
      viewport: reactFlowInstance.getViewport(),
    };

    // Convert to clinical format for export
    const clinicalFlowchart = standardToClinical(currentFlowchart);
    const exportData = createFlowchartExport(clinicalFlowchart, "clinical", {
      id: "flowchart-" + Date.now(),
      title: "Fluxograma Médico",
    });

    // Create and download JSON file
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fluxograma-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Fluxograma exportado com sucesso!");
  }, [nodes, edges, reactFlowInstance]);

  // Import flowchart from JSON
  const handleImportJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        let text = await file.text();

        // Remove trailing semicolon if present (common in exported files)
        text = text.trim();
        if (text.endsWith(";")) {
          text = text.slice(0, -1);
        }

        // Parse the JSON file - it should work with escaped quotes
        const data = JSON.parse(text);

        let flowchartToImport: FlowchartDefinition;
        let isClinicalFormat = false;

        // Check if it's a clinical flowchart
        if (isValidClinicalFlowchart(data)) {
          // Direct clinical format - DO NOT convert, use as-is
          flowchartToImport = data as any;
          isClinicalFormat = true;
        } else if (data.flowchart && isValidClinicalFlowchart(data.flowchart)) {
          // Clinical format with metadata wrapper - DO NOT convert
          flowchartToImport = data.flowchart as any;
          isClinicalFormat = true;
        } else if (data.nodes && data.edges) {
          // Standard format (direct or with wrapper)
          flowchartToImport = data.flowchart || data;
        } else {
          throw new Error("Formato de arquivo inválido");
        }

        // Apply layout to imported nodes
        // Use larger spacing for clinical nodes
        const layouted = getLayoutedElements(
          flowchartToImport.nodes,
          flowchartToImport.edges,
          {
            rankdir: "TB",
            nodesep: isClinicalFormat ? 350 : 200, // Much larger horizontal spacing for clinical
            ranksep: isClinicalFormat ? 400 : 250, // Much larger vertical spacing for clinical
            edgesep: 150,
            ranker: "network-simplex",
          },
        );

        // Update the flow
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
        setHasChanges(true);

        // Fit view to show imported content
        setTimeout(() => {
          reactFlowInstance.fitView({
            padding: 0.15,
            includeHiddenNodes: false,
            duration: 800,
          });
        }, 100);

        toast.success("Fluxograma importado com sucesso!");
      } catch (error) {
        console.error("Erro ao importar fluxograma:", error);

        if (error instanceof SyntaxError) {
          toast.error(
            "Erro ao processar JSON. O arquivo pode conter caracteres especiais não escapados.",
          );
        } else if (
          error instanceof Error &&
          error.message === "Formato de arquivo inválido"
        ) {
          toast.error(error.message);
        } else {
          toast.error("Erro ao importar arquivo. Verifique o formato.");
        }
      }
    };

    input.click();
  }, [reactFlowInstance, setNodes, setEdges]);

  // Keyboard navigation
  useFlowchartKeyboardNavigation({
    enabled: !isReadOnly,
    onNodeSelect: (_node) => {
      // Node is already selected by the hook
    },
    onNodeEdit: (node) => {
      setSelectedNode(node as CustomFlowNode);
      setIsEditDialogOpen(true);
    },
    onNodeDelete: (nodeIds) => {
      setNodes((nds) => nds.filter((node) => !nodeIds.includes(node.id)));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target),
        ),
      );
      setHasChanges(true);
    },
  });

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
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
        />
      )}

      <div
        className="h-full min-h-[600px] w-full rounded-md border border-gray-300 bg-gray-50"
        role="application"
        aria-label="Editor de fluxograma. Use as teclas de seta para navegar entre os nós, Enter para editar, Delete para excluir."
        tabIndex={0}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={customNodeTypes}
          edgeTypes={customEdgeTypes}
          defaultEdgeOptions={{
            type: "bezier",
            animated: false,
            style: {
              strokeWidth: 2,
              stroke: "#64748b",
            },
          }}
          connectionLineType={"bezier" as any}
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
          edges={edges}
          nodes={nodes as CustomFlowNode[]}
        />
      )}

      {selectedEdge && (
        <EdgeEditDialog
          edge={selectedEdge}
          isOpen={isEdgeEditDialogOpen}
          onClose={() => setIsEdgeEditDialogOpen(false)}
          onSave={handleEdgeUpdate}
          onDelete={handleEdgeDelete}
          nodes={nodes as CustomFlowNode[]}
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
      return { type: "triage", title: "Nova Triagem" };
    case "decision":
      return {
        type: "decision",
        title: "Nova Decisão",
        criteria: "Defina os critérios",
        outputs: [
          { id: "yes", label: "Sim", position: "bottom-left" },
          { id: "no", label: "Não", position: "bottom-right" },
        ],
      };
    case "action":
      return {
        type: "action",
        title: "Nova Ação",
        actions: ["Ação 1"],
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
      };
    default:
      return {
        type: "action",
        title: "Novo Nó",
        actions: ["Ação 1"],
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
