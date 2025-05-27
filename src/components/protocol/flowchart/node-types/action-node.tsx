/**
 * Custom Action Node for ReactFlow.
 * Displays an action or treatment step.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { ActionNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";

const getNodeColors = (priority?: ActionNodeData["priority"]) => {
  switch (priority) {
    case "high":
      return "bg-danger/20 border-danger text-danger-foreground";
    case "medium":
      return "bg-warning/20 border-warning text-warning-foreground";
    case "low":
      return "bg-success/20 border-success text-success-foreground";
    default:
      return "bg-blue-100/50 border-blue-500 text-blue-800"; // Default action color
  }
};

export const ActionNode: React.FC<NodeProps<ActionNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, actions, priority } = data;
  const colors = getNodeColors(priority);

  return (
    <div
      className={cn(
        "w-48 rounded-md border-2 p-3 shadow-md",
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
      <div className="mb-1 truncate text-sm font-semibold">{title}</div>
      {actions && actions.length > 0 && (
        <ul className="list-inside list-disc pl-1 text-xs">
          {actions.slice(0, 3).map((action, index) => (
            <li key={index} className="truncate">
              {action}
            </li>
          ))}
          {actions.length > 3 && (
            <li className="text-xxs italic">...e mais.</li>
          )}
        </ul>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!h-2 !w-2 !bg-gray-500"
      />
    </div>
  );
};
