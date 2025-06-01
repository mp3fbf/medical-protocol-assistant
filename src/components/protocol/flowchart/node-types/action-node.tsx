/**
 * Professional Medical Action Node for ReactFlow.
 * Clean, readable design for medical protocols.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { ActionNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

export const ActionNode: React.FC<NodeProps<ActionNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, actions } = data;

  return (
    <div
      className={cn(
        "medical-flow-node medical-action-node",
        selected && "selected",
      )}
    >
      <FileText className="medical-node-icon" />

      <div className="medical-node-content">
        <div className="medical-node-title">{title}</div>

        {/* Action checklist */}
        {actions && actions.length > 0 && (
          <div className="medical-action-list">
            {actions.map((action, index) => (
              <div key={index} className="medical-action-item">
                <div className="medical-action-checkbox" />
                <span
                  className="medical-action-text"
                  dangerouslySetInnerHTML={{ __html: action }}
                />
              </div>
            ))}
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
