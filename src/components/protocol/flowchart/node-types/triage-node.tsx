/**
 * Custom Triage Node for ReactFlow.
 * Displays triage criteria or initial assessment points.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { TriageNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";

const getNodeColors = (priority?: TriageNodeData["priority"]) => {
  switch (priority) {
    case "high":
      return "bg-danger/20 border-danger text-danger-foreground"; // Red for high priority triage
    case "medium":
      return "bg-warning/20 border-warning text-warning-foreground"; // Yellow for medium
    case "low":
      return "bg-success/20 border-success text-success-foreground"; // Green for low
    default:
      return "bg-teal-100/50 border-teal-500 text-teal-800"; // Default triage color
  }
};

export const TriageNode: React.FC<NodeProps<TriageNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, description, priority } = data;
  const colors = getNodeColors(priority);

  return (
    <div
      className={cn(
        "w-48 rounded-lg border-2 p-3 shadow-lg", // Slightly more prominent shadow for triage
        colors,
        selected && "ring-2 ring-primary-500 ring-offset-2",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!h-2 !w-2 !bg-gray-500"
      />
      <div className="mb-1 truncate text-sm font-bold">{title}</div>
      {description && <p className="text-xs text-opacity-80">{description}</p>}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!h-2 !w-2 !bg-gray-500"
      />
    </div>
  );
};
