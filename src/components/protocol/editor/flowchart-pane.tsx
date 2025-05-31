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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update local flowchart when prop changes
  React.useEffect(() => {
    setLocalFlowchart(flowchartData);
  }, [flowchartData]);

  // Debug: Track container dimensions
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = { width: rect.width, height: rect.height };
        setDimensions(newDimensions);
        console.log("[FlowchartPane] Container dimensions:", {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          offsetHeight: containerRef.current.offsetHeight,
          offsetWidth: containerRef.current.offsetWidth,
          clientHeight: containerRef.current.clientHeight,
          clientWidth: containerRef.current.clientWidth,
          computed: window.getComputedStyle(containerRef.current).height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Check dimensions after a delay to catch any layout shifts
    const timeoutId = setTimeout(updateDimensions, 100);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timeoutId);
    };
  }, [isFullscreen]);

  // Debug: Log flowchart data
  React.useEffect(() => {
    console.log("[FlowchartPane] Flowchart data:", {
      hasData: !!flowchartData,
      nodeCount: flowchartData?.nodes?.length || 0,
      edgeCount: flowchartData?.edges?.length || 0,
      localHasData: !!localFlowchart,
      localNodeCount: localFlowchart?.nodes?.length || 0,
    });
  }, [flowchartData, localFlowchart]);

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

    console.log("[FlowchartContent] Rendering with:", {
      hasCurrentData: !!currentData,
      nodeCount: currentData?.nodes?.length || 0,
      isEditMode,
      isFullscreen,
    });

    if (!currentData || currentData.nodes.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">
            Nenhum fluxograma disponível ou fluxograma vazio.
          </p>
        </div>
      );
    }

    // Clean up edge types to avoid ReactFlow warnings
    const cleanedData = {
      ...currentData,
      edges: currentData.edges.map((edge) => ({
        ...edge,
        type: edge.type === "conditional" ? "default" : edge.type || "default",
      })),
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
          className="relative min-h-[600px] flex-1"
          style={{ height: "calc(100% - 80px)" }}
        >
          <div className="absolute inset-0 p-4">
            {/* Debug info */}
            {process.env.NODE_ENV === "development" && (
              <div className="absolute left-0 top-0 z-50 rounded bg-black/80 p-2 text-xs text-white">
                <div>
                  Container: {dimensions.width}x{dimensions.height}
                </div>
                <div>
                  Nodes: {(localFlowchart || flowchartData)?.nodes?.length || 0}
                </div>
                <div>Fullscreen: {isFullscreen ? "Yes" : "No"}</div>
              </div>
            )}
            <div className="h-full w-full">
              <FlowchartContent />
            </div>
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
