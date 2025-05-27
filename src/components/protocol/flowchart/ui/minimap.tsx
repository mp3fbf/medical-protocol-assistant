/**
 * Minimap component for the ReactFlow canvas.
 */
"use client";

import React from "react";
import { MiniMap, type MiniMapProps } from "reactflow";

export const FlowMinimap: React.FC<Partial<MiniMapProps>> = (props) => {
  return (
    <MiniMap
      nodeStrokeColor={(n) => {
        if (n.type === "input") return "#0041d0";
        if (n.type === "decision") return "#ff0072";
        if (n.type === "action") return "#00ff00";
        return "#eee";
      }}
      nodeColor={(n) => {
        if (n.type === "medication") return "#f0f8ff"; // AliceBlue for medication nodes
        if (n.data?.priority === "high") return "rgba(244, 67, 54, 0.2)";
        if (n.data?.priority === "medium") return "rgba(255, 152, 0, 0.2)";
        if (n.data?.priority === "low") return "rgba(76, 175, 80, 0.2)";
        return "#fff";
      }}
      nodeBorderRadius={2}
      maskColor="rgba(240, 240, 240, 0.6)"
      className="rounded border border-gray-300 !bg-gray-100"
      style={{
        height: 120,
        width: 200,
      }}
      zoomable
      pannable
      {...props}
    />
  );
};
