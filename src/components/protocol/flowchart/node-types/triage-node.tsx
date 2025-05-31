/**
 * Professional Medical Triage Node for ReactFlow.
 * Clean, readable design for medical protocols.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { TriageNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

export const TriageNode: React.FC<NodeProps<TriageNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, description, priority } = data;

  return (
    <div
      className={cn(
        "medical-flow-node medical-triage-node",
        priority === "high" && "medical-priority-high",
        selected && "selected"
      )}
    >
      <Activity className="medical-node-icon" />
      
      <div className="medical-node-content">
        <div className="medical-node-title">{title}</div>
        {description && (
          <div className="medical-node-subtitle">{description}</div>
        )}
        
        {priority && (
          <div className={cn("medical-priority-badge", priority)}>
            <div className={cn(
              "h-2 w-2 rounded-full",
              priority === "high" && "bg-red-500",
              priority === "medium" && "bg-yellow-500",
              priority === "low" && "bg-green-500"
            )} />
            <span>
              {priority === "high" && "Alta Prioridade"}
              {priority === "medium" && "Média Prioridade"}
              {priority === "low" && "Baixa Prioridade"}
            </span>
          </div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="medical-handle"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="medical-handle"
      />
    </div>
  );
};