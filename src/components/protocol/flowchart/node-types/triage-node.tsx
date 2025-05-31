/**
 * Ultra Modern Triage Node for ReactFlow.
 * Features glassmorphism, gradients, and smooth animations.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { TriageNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

const getNodeIcon = (priority?: TriageNodeData["priority"]) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="ultra-node-icon" />;
    case "medium":
      return <Clock className="ultra-node-icon" />;
    case "low":
      return <CheckCircle className="ultra-node-icon" />;
    default:
      return <Activity className="ultra-node-icon" />;
  }
};

export const TriageNode: React.FC<NodeProps<TriageNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, description, priority } = data;

  return (
    <div
      className={cn(
        "ultra-flow-node ultra-triage-node",
        "w-56 rounded-2xl",
        selected && "selected",
        priority === "high" && "ultra-pulse",
      )}
    >
      {/* Animated gradient background */}
      <div className="ultra-gradient-bg" />

      {/* Glassmorphism effect enhancement */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />

      {/* Icon */}
      {getNodeIcon(priority)}

      {/* Content */}
      <div className="ultra-node-content">
        <div className="ultra-node-title">{title}</div>
        {description && (
          <div className="ultra-node-subtitle">{description}</div>
        )}

        {/* Priority indicator */}
        <div className="mt-2 flex items-center gap-1">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              priority === "high" && "animate-pulse bg-red-500",
              priority === "medium" && "bg-yellow-500",
              priority === "low" && "bg-green-500",
              !priority && "bg-blue-500",
            )}
          />
          <span className="text-xs font-medium opacity-70">
            {priority === "high" && "Alta Prioridade"}
            {priority === "medium" && "Média Prioridade"}
            {priority === "low" && "Baixa Prioridade"}
            {!priority && "Triagem Inicial"}
          </span>
        </div>
      </div>

      {/* Handles with custom styling */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="ultra-handle ultra-handle-target"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="ultra-handle ultra-handle-source"
      />
    </div>
  );
};

