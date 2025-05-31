/**
 * Pane for displaying and potentially interacting with the protocol's flowchart.
 */
"use client";
import React, { useState } from "react";
import { ProtocolFlowchartCanvas } from "@/components/protocol/flowchart/protocol-flowchart-canvas";
import { EditableFlowchartCanvas } from "@/components/protocol/flowchart/editable-flowchart-canvas";
import type { FlowchartDefinition } from "@/types/flowchart";
import { Maximize2, Edit3, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { trpc } from "@/lib/api/client";
import { toast } from "sonner";

interface FlowchartPaneProps {
  flowchartData: FlowchartDefinition | null;
  isLoading?: boolean;
  protocolTitle?: string;
  protocolId?: string;
  versionId?: string;
  canEdit?: boolean;
}

export const FlowchartPane: React.FC<FlowchartPaneProps> = ({
  flowchartData,
  isLoading,
  protocolTitle,
  protocolId,
  versionId,
  canEdit = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localFlowchart, setLocalFlowchart] = useState(flowchartData);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [_dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update local flowchart when prop changes
  React.useEffect(() => {
    setLocalFlowchart(flowchartData);
  }, [flowchartData]);

  // Track container dimensions for debug overlay
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = { width: rect.width, height: rect.height };
        setDimensions(newDimensions);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Debug: Log only when flowchart data changes
  React.useEffect(() => {
    if (flowchartData) {
      console.log(
        "[FlowchartPane] Flowchart loaded with",
        flowchartData.nodes.length,
        "nodes",
      );
    }
  }, [flowchartData]);

  const updateFlowchartMutation = trpc.flowchart.updateManual.useMutation({
    onSuccess: () => {
      toast.success("Fluxograma salvo com sucesso!");
      setIsEditMode(false);
    },
    onError: (error) => {
      toast.error(`Erro ao salvar fluxograma: ${error.message}`);
    },
  });

  const handleSaveFlowchart = async (flowchart: FlowchartDefinition) => {
    if (!protocolId || !versionId) return;

    setLocalFlowchart(flowchart);
    updateFlowchartMutation.mutate({
      protocolId,
      versionId,
      flowchart: {
        nodes: flowchart.nodes,
        edges: flowchart.edges,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-gray-500">Carregando fluxograma...</p>
      </div>
    );
  }

  const FlowchartContent = () => {
    const currentData = localFlowchart || flowchartData;

    if (!currentData || currentData.nodes.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">
            Nenhum fluxograma disponível ou fluxograma vazio.
          </p>
        </div>
      );
    }

    // Clean up edge types and sourceHandles to avoid ReactFlow warnings
    const cleanedData = {
      ...currentData,
      edges: currentData.edges.map((edge) => {
        const cleanedEdge = {
          ...edge,
          type:
            edge.type === "conditional" ? "default" : edge.type || "default",
        };

        // Find the source node to check its type
        const sourceNode = currentData.nodes.find((n) => n.id === edge.source);

        // If source is a decision node, only allow 'yes' or 'no' handles
        if (sourceNode?.type === "decision") {
          if (
            cleanedEdge.sourceHandle &&
            !["yes", "no"].includes(cleanedEdge.sourceHandle)
          ) {
            // Map common variations to valid handles
            if (
              cleanedEdge.sourceHandle?.toLowerCase().includes("sim") ||
              cleanedEdge.sourceHandle?.toLowerCase().includes("true")
            ) {
              cleanedEdge.sourceHandle = "yes";
            } else if (
              cleanedEdge.sourceHandle?.toLowerCase().includes("não") ||
              cleanedEdge.sourceHandle?.toLowerCase().includes("nao") ||
              cleanedEdge.sourceHandle?.toLowerCase().includes("false")
            ) {
              cleanedEdge.sourceHandle = "no";
            } else {
              // Remove invalid sourceHandle
              console.warn(
                `[FlowchartPane] Removing invalid sourceHandle '${cleanedEdge.sourceHandle}' from edge ${edge.id}`,
              );
              delete cleanedEdge.sourceHandle;
            }
          }
        } else if (cleanedEdge.sourceHandle) {
          // For non-decision nodes, remove sourceHandle as they typically don't have multiple outputs
          delete cleanedEdge.sourceHandle;
        }

        return cleanedEdge;
      }),
    };

    if (isEditMode) {
      return (
        <EditableFlowchartCanvas
          flowchartData={cleanedData}
          onSave={handleSaveFlowchart}
          isReadOnly={false}
          protocolTitle={protocolTitle}
        />
      );
    }

    return (
      <ProtocolFlowchartCanvas
        nodes={cleanedData.nodes}
        edges={cleanedData.edges}
      />
    );
  };

  return (
    <>
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            Fluxograma: {protocolTitle || "Protocolo"}
          </h3>
          <div className="flex items-center gap-2">
            {canEdit &&
              ((localFlowchart || flowchartData)?.nodes?.length ?? 0) > 0 && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                    isEditMode
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  title={isEditMode ? "Visualizar" : "Editar"}
                >
                  {isEditMode ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </>
                  )}
                </button>
              )}
            {((localFlowchart || flowchartData)?.nodes?.length ?? 0) > 0 && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                title="Visualizar em tela cheia"
              >
                <Maximize2 className="h-4 w-4" />
                Tela Cheia
              </button>
            )}
          </div>
        </div>
        <div
          ref={containerRef}
          className="relative flex-1"
          style={{ height: "100%" }}
        >
          <div className="h-full w-full">
            <FlowchartContent />
          </div>
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="m-0 h-screen w-screen max-w-[100vw] p-0">
          <VisuallyHidden>
            <DialogTitle>Fluxograma em Tela Cheia</DialogTitle>
          </VisuallyHidden>
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100">
                Fluxograma: {protocolTitle || "Protocolo"}
              </h3>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`mr-4 flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isEditMode
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                    title={isEditMode ? "Visualizar" : "Editar fluxograma"}
                  >
                    {isEditMode ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full w-full">
                <FlowchartContent />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
