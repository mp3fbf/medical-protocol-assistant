/**
 * Minimap component for the ReactFlow canvas.
 */
"use client";

import React from "react";
import { MiniMap, type MiniMapProps } from "reactflow";

export const FlowMinimap: React.FC<Partial<MiniMapProps>> = (props) => {
  return (
    <MiniMap
      nodeStrokeColor="#5E6AD2"
      nodeColor="#C7D2FE"
      nodeBorderRadius={4}
      maskColor="rgba(94, 106, 210, 0.15)"
      className="rounded-lg border-2 border-gray-300 !bg-gray-50 dark:border-gray-600 dark:!bg-gray-800"
      style={{
        height: 150,
        width: 220,
      }}
      zoomable
      pannable
      aria-label="Minimapa do fluxograma"
      tabIndex={0}
      {...props}
    />
  );
};
