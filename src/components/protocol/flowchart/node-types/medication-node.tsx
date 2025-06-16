/**
 * Professional Medical Medication Node for ReactFlow.
 * Clean, readable design for medical protocols.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { MedicationNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";

// Helper to decode HTML entities for display
function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

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
        <div className="medical-node-title">{decodeHtmlEntities(title)}</div>

        {/* Medication list */}
        {medications && medications.length > 0 ? (
          <div className="medical-medication-list">
            {medications.map((med, index) => (
              <div key={index} className="medical-medication-item">
                <div className="medical-medication-name">
                  {decodeHtmlEntities(med.name)}
                </div>
                <div className="medical-medication-details">
                  <span className="dose">{decodeHtmlEntities(med.dose)}</span>
                  <span className="separator">•</span>
                  <span className="route">{decodeHtmlEntities(med.route)}</span>
                  <span className="separator">•</span>
                  <span className="frequency">
                    {decodeHtmlEntities(med.frequency)}
                  </span>
                </div>
                {med.duration && (
                  <div className="medical-medication-duration">
                    Duração: {decodeHtmlEntities(med.duration)}
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
