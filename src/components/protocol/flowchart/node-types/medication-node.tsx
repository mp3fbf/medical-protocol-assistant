/**
 * Custom Medication Node for ReactFlow.
 * Displays a table or list of medications.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { MedicationNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";

const getNodeColors = (priority?: MedicationNodeData["priority"]) => {
  switch (priority) {
    case "high":
      return "bg-danger/20 border-danger text-danger-foreground";
    case "medium":
      return "bg-warning/20 border-warning text-warning-foreground";
    case "low":
      return "bg-success/20 border-success text-success-foreground";
    default:
      return "bg-purple-100/50 border-purple-500 text-purple-800"; // Default medication color
  }
};

export const MedicationNode: React.FC<NodeProps<MedicationNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, medications, priority } = data;
  const colors = getNodeColors(priority);

  return (
    <div
      className={cn(
        "min-w-56 max-w-xs rounded-md border-2 p-3 shadow-md", // min-w-56, max-w-xs
        colors,
        selected && "ring-2 ring-primary-500 ring-offset-2",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!h-2 !w-2 !bg-gray-500"
      />
      <div className="mb-2 truncate text-sm font-semibold">{title}</div>
      {medications && medications.length > 0 ? (
        <div className="space-y-1 text-xs">
          {medications.slice(0, 3).map((med, index) => (
            <div key={index} className="truncate border-b border-dashed pb-1">
              <span className="font-medium">{med.name}:</span> {med.dose}{" "}
              {med.route}, {med.frequency}
              {med.duration && `, ${med.duration}`}
            </div>
          ))}
          {medications.length > 3 && (
            <div className="text-xxs italic">...e mais medicamentos.</div>
          )}
        </div>
      ) : (
        <p className="text-xs italic">Nenhum medicamento especificado.</p>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!h-2 !w-2 !bg-gray-500"
      />
    </div>
  );
};
