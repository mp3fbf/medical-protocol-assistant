/**
 * Professional Medical Medication Node for ReactFlow.
 * Clean, readable design for medical protocols.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { MedicationNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";

export const MedicationNode: React.FC<NodeProps<MedicationNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, medications } = data;

  return (
    <div
      className={cn(
        "medical-flow-node medical-medication-node",
        selected && "selected",
      )}
    >
      <div className="medical-node-content">
        <div className="medical-node-title">{title}</div>

        {/* Medication list */}
        {medications && medications.length > 0 ? (
          <div className="medical-medication-list">
            {medications.map((med, index) => (
              <div key={index} className="medical-medication-item">
                <div className="medical-medication-name">{med.name}</div>
                <div className="medical-medication-details">
                  <span className="dose">{med.dose}</span>
                  <span className="separator">•</span>
                  <span className="route">{med.route}</span>
                  <span className="separator">•</span>
                  <span className="frequency">{med.frequency}</span>
                </div>
                {med.duration && (
                  <div className="medical-medication-duration">
                    Duração: {med.duration}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="medical-node-subtitle">
            Nenhum medicamento especificado.
          </p>
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
