/**
 * Minimap component for the ReactFlow canvas.
 */
"use client";

import React from "react";
import { MiniMap, type MiniMapProps } from "reactflow";

export const FlowMinimap: React.FC<Partial<MiniMapProps>> = (props) => {
  return (
    <MiniMap
      nodeStrokeColor="#94a3b8"
      nodeColor="#e2e8f0"
      nodeBorderRadius={4}
      maskColor="rgba(148, 163, 184, 0.15)"
      className="rounded-lg border-2 border-gray-300 !bg-white"
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
