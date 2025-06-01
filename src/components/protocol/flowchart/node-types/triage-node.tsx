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
  const { title, description } = data;

  return (
    <div
      className={cn(
        "medical-flow-node medical-triage-node",
        selected && "selected",
      )}
    >
      <Activity className="medical-node-icon" />

      <div className="medical-node-content">
        <div className="medical-node-title">{title}</div>
        {description && (
          <div className="medical-node-subtitle">{description}</div>
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
