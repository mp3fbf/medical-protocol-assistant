/**
 * Controls component for the ReactFlow canvas (zoom, fit view, etc.).
 */
"use client";

import React from "react";
import { Controls, type ControlProps } from "reactflow";

export const FlowControls: React.FC<Partial<ControlProps>> = (props) => {
  return (
    <Controls
      showZoom
      showFitView
      showInteractive
      className="react-flow__controls" // Default class for potential global styling
      {...props}
    />
  );
};
