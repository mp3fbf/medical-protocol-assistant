/**
 * Pane for displaying and potentially interacting with the protocol's flowchart.
 */
"use client";
import React from "react";
import { ProtocolFlowchartCanvas } from "@/components/protocol/flowchart/protocol-flowchart-canvas";
import type { FlowchartDefinition } from "@/types/flowchart";

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
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-gray-500">Carregando fluxograma...</p>
      </div>
    );
  }

  // TODO: Enhance to handle updates to flowchartData if it becomes editable here.
  // For now, it's primarily for display.

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
          Fluxograma: {protocolTitle || "Protocolo"}
        </h3>
      </div>
      <div className="flex-1 p-1">
        {flowchartData && flowchartData.nodes.length > 0 ? (
          <ProtocolFlowchartCanvas /> // This component will use its own initialNodes/edges or be prop-driven later
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">
              Nenhum fluxograma disponível ou fluxograma vazio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
