/**
 * Custom Decision Node for ReactFlow.
 * Displays a decision point with criteria.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { DecisionNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils"; // Assuming cn utility from shadcn or similar

const getNodeColors = (priority?: DecisionNodeData["priority"]) => {
  switch (priority) {
    case "high":
      return "bg-danger/20 border-danger text-danger-foreground";
    case "medium":
      return "bg-warning/20 border-warning text-warning-foreground";
    case "low":
      return "bg-success/20 border-success text-success-foreground";
    default:
      return "bg-gray-100 border-gray-400 text-gray-800";
  }
};

export const DecisionNode: React.FC<NodeProps<DecisionNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, criteria, priority } = data;
  const colors = getNodeColors(priority);

  return (
    <div
      className={cn(
        "flex h-32 w-48 items-center justify-center rounded-md border-2 p-2 shadow-md",
        colors,
        selected && "ring-2 ring-primary-500 ring-offset-2",
        "rotate-45 transform", // Diamond shape requires rotating the outer container
      )}
      style={{
        // Dimensions before rotation to ensure content fits
        width: "10rem", // Approx 160px
        height: "10rem", // Approx 160px
      }}
    >
      <div className="-rotate-45 transform text-center">
        {" "}
        {/* Counter-rotate content */}
        <div className="mb-1 truncate text-xs font-semibold">{title}</div>
        <div className="text-xxs truncate">{criteria}</div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!h-2 !w-2 !bg-gray-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes" // Example for conditional path
        isConnectable={isConnectable}
        className="!h-2 !w-2 !bg-green-500"
        style={{ bottom: -4, left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="no" // Example for conditional path
        isConnectable={isConnectable}
        className="!h-2 !w-2 !bg-red-500"
        style={{ right: -4, top: "30%" }}
      />
      {/* Add more handles as needed, e.g., Left for "No" and Bottom for "Yes" if preferred */}
    </div>
  );
};
