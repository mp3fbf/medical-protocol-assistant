/**
 * Ultra Modern Decision Node for ReactFlow.
 * Diamond shape with glassmorphism and gradient effects.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { DecisionNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { HelpCircle, AlertTriangle, Info } from "lucide-react";

const getNodeIcon = (priority?: DecisionNodeData["priority"]) => {
  switch (priority) {
    case "high":
      return (
        <AlertTriangle
          className="ultra-node-icon"
          style={{ top: "8px", right: "8px" }}
        />
      );
    case "medium":
      return (
        <Info
          className="ultra-node-icon"
          style={{ top: "8px", right: "8px" }}
        />
      );
    default:
      return (
        <HelpCircle
          className="ultra-node-icon"
          style={{ top: "8px", right: "8px" }}
        />
      );
  }
};

export const DecisionNode: React.FC<NodeProps<DecisionNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, criteria, priority } = data;

  return (
    <div
      className={cn(
        "ultra-flow-node ultra-decision-node ultra-decision-wrapper",
        "rounded-xl",
        selected && "selected",
        priority === "high" && "ultra-pulse",
      )}
    >
      {/* Animated gradient background */}
      <div className="ultra-gradient-bg rounded-xl" />

      {/* Glassmorphism effect enhancement */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />

      {/* Content wrapper with counter-rotation */}
      <div className="ultra-decision-content">
        {/* Icon - positioned absolutely to not rotate */}
        {getNodeIcon(priority)}

        <div className="ultra-node-title text-center">{title}</div>
        {criteria && (
          <div className="ultra-node-subtitle mt-1 text-center text-xs">
            {criteria}
          </div>
        )}
      </div>

      {/* Handles for Yes/No paths */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="ultra-handle ultra-handle-target"
        style={{
          top: "-6px",
          left: "50%",
          transform: "translateX(-50%) rotate(-45deg)",
        }}
      />

      {/* Yes handle - bottom left */}
      <Handle
        type="source"
        position={Position.Left}
        id="yes"
        isConnectable={isConnectable}
        className="ultra-handle ultra-handle-source !border-green-500"
        style={{
          left: "-6px",
          bottom: "30%",
          transform: "rotate(-45deg)",
        }}
      />

      {/* No handle - bottom right */}
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        isConnectable={isConnectable}
        className="ultra-handle ultra-handle-source !border-red-500"
        style={{
          right: "-6px",
          bottom: "30%",
          transform: "rotate(-45deg)",
        }}
      />

      {/* Visual indicators for Yes/No */}
      <div
        className="absolute text-xs font-bold text-green-600"
        style={{ left: "15%", bottom: "15%", transform: "rotate(-45deg)" }}
      >
        SIM
      </div>
      <div
        className="absolute text-xs font-bold text-red-600"
        style={{ right: "15%", bottom: "15%", transform: "rotate(-45deg)" }}
      >
        NÃO
      </div>
    </div>
  );
};

