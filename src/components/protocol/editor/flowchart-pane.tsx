/**
 * Pane for displaying and potentially interacting with the protocol's flowchart.
 */
"use client";
import React, { useState } from "react";
import { ProtocolFlowchartCanvas } from "@/components/protocol/flowchart/protocol-flowchart-canvas";
import type { FlowchartDefinition } from "@/types/flowchart";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface FlowchartPaneProps {
  flowchartData: FlowchartDefinition | null;
  isLoading?: boolean;
  protocolTitle?: string;
}

export const FlowchartPane: React.FC<FlowchartPaneProps> = ({
  flowchartData,
  isLoading,
  protocolTitle,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-gray-500">Carregando fluxograma...</p>
      </div>
    );
  }

  const FlowchartContent = () => (
    <>
      {flowchartData && flowchartData.nodes.length > 0 ? (
        <ProtocolFlowchartCanvas
          nodes={flowchartData.nodes}
          edges={flowchartData.edges}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">
            Nenhum fluxograma disponível ou fluxograma vazio.
          </p>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            Fluxograma: {protocolTitle || "Protocolo"}
          </h3>
          {flowchartData && flowchartData.nodes.length > 0 && (
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
        <div className="flex-1 p-1">
          <FlowchartContent />
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="m-0 h-screen w-screen max-w-[100vw] p-0">
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100">
                Fluxograma: {protocolTitle || "Protocolo"}
              </h3>
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
