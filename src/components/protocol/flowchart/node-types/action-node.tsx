/**
 * Ultra Modern Action Node for ReactFlow.
 * Features glassmorphism with action checklist.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { ActionNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { Zap, FileText, PlayCircle } from "lucide-react";

const getNodeIcon = (priority?: ActionNodeData["priority"]) => {
  switch (priority) {
    case "high":
      return <Zap className="ultra-node-icon text-red-500" />;
    case "medium":
      return <PlayCircle className="ultra-node-icon text-yellow-500" />;
    default:
      return <FileText className="ultra-node-icon text-blue-500" />;
  }
};

export const ActionNode: React.FC<NodeProps<ActionNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, actions, priority } = data;

  return (
    <div
      className={cn(
        "ultra-flow-node ultra-action-node",
        "w-64 rounded-2xl",
        selected && "selected",
        priority === "high" && "ultra-pulse"
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
        <div className="ultra-node-title mb-3">{title}</div>
        
        {/* Action checklist with ultra styling */}
        {actions && actions.length > 0 && (
          <div className="space-y-2">
            {actions.map((action, index) => (
              <div 
                key={index} 
                className="flex items-start gap-2 group"
              >
                <div className="mt-0.5 h-4 w-4 rounded-md border-2 border-white/30 bg-white/10 
                              group-hover:bg-white/20 group-hover:border-white/50 
                              transition-all duration-300 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-sm bg-gradient-to-br from-indigo-400 to-purple-400 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <span className="text-xs leading-tight opacity-90 group-hover:opacity-100 
                               transition-opacity duration-300">
                  {action}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Priority badge */}
        {priority && (
          <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 
                        rounded-full bg-white/20 backdrop-blur-sm">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              priority === "high" && "bg-red-400",
              priority === "medium" && "bg-yellow-400",
              priority === "low" && "bg-green-400"
            )} />
            <span className="text-xs font-medium">
              {priority === "high" && "Urgente"}
              {priority === "medium" && "Normal"}
              {priority === "low" && "Baixa"}
            </span>
          </div>
        )}
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
