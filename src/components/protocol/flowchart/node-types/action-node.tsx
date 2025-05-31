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
  const { title, actions, priority } = data;

  return (
    <div
      className={cn(
        "medical-flow-node medical-action-node",
        priority === "high" && "medical-priority-high",
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
                <span className="medical-action-text">{action}</span>
              </div>
            ))}
          </div>
        )}

        {priority && (
          <div className={cn("medical-priority-badge", priority)}>
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                priority === "high" && "bg-red-500",
                priority === "medium" && "bg-yellow-500",
                priority === "low" && "bg-green-500",
              )}
            />
            <span>
              {priority === "high" && "Urgente"}
              {priority === "medium" && "Normal"}
              {priority === "low" && "Baixa"}
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
