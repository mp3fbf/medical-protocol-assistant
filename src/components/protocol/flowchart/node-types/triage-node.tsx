/**
 * Professional Medical Triage Node for ReactFlow.
 * Clean, readable design for medical protocols.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { TriageNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

// Helper to decode HTML entities for display
function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

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
        <div className="medical-node-title">{decodeHtmlEntities(title)}</div>
        {description && (
          <div className="medical-node-subtitle">
            {decodeHtmlEntities(description)}
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
