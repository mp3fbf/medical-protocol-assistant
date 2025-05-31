/**
 * Professional Medical Decision Node for ReactFlow.
 * Diamond shape with clear Yes/No paths.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { DecisionNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

export const DecisionNode: React.FC<NodeProps<DecisionNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, criteria, priority } = data;

  return (
    <div
      className={cn(
        "medical-flow-node medical-decision-node medical-decision-wrapper",
        priority === "high" && "medical-priority-high",
        selected && "selected"
      )}
    >
      <div className="medical-decision-content">
        <HelpCircle className="medical-node-icon" style={{ position: 'static', marginBottom: '4px' }} />
        
        <div className="medical-node-title" style={{ fontSize: '13px' }}>{title}</div>
        {criteria && (
          <div className="medical-node-subtitle" style={{ fontSize: '11px', marginTop: '2px' }}>
            {criteria}
          </div>
        )}
      </div>
      
      {/* Handles positioned for diamond shape */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="medical-handle"
        style={{ top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(-45deg)' }}
      />
      
      {/* Yes handle - left side */}
      <Handle
        type="source"
        position={Position.Left}
        id="yes"
        isConnectable={isConnectable}
        className="medical-handle"
        style={{ left: '-4px', top: '50%', transform: 'translateY(-50%) rotate(-45deg)' }}
      />
      
      {/* No handle - right side */}
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        isConnectable={isConnectable}
        className="medical-handle"
        style={{ right: '-4px', top: '50%', transform: 'translateY(-50%) rotate(-45deg)' }}
      />
      
      {/* Yes/No labels */}
      <div className="medical-decision-yes" style={{ transform: 'rotate(-45deg)' }}>
        SIM
      </div>
      <div className="medical-decision-no" style={{ transform: 'rotate(-45deg)' }}>
        NÃO
      </div>
    </div>
  );
};