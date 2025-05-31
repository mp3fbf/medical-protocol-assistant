/**
 * Ultra Modern Medication Node for ReactFlow.
 * Features glassmorphism with medication details.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { MedicationNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { Pill, Syringe, Heart } from "lucide-react";

const getNodeIcon = (priority?: MedicationNodeData["priority"]) => {
  switch (priority) {
    case "high":
      return <Heart className="ultra-node-icon animate-pulse text-red-500" />;
    case "medium":
      return <Syringe className="ultra-node-icon text-orange-500" />;
    default:
      return <Pill className="ultra-node-icon text-purple-500" />;
  }
};

export const MedicationNode: React.FC<NodeProps<MedicationNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const { title, medications, priority } = data;

  return (
    <div
      className={cn(
        "ultra-flow-node ultra-medication-node",
        "min-w-[280px] max-w-xs rounded-2xl",
        selected && "selected",
        priority === "high" && "ultra-pulse",
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

        {/* Medication list with ultra styling */}
        {medications && medications.length > 0 ? (
          <div className="space-y-2">
            {medications.map((med, index) => (
              <div
                key={index}
                className="group rounded-lg border border-white/10 bg-white/10 
                         p-2 backdrop-blur-sm transition-all duration-300
                         hover:border-white/20 hover:bg-white/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {med.name}
                    </div>
                    <div className="mt-0.5 text-xs opacity-90">
                      <span className="font-medium">{med.dose}</span>
                      <span className="mx-1">•</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {med.route}
                      </span>
                      <span className="mx-1">•</span>
                      <span>{med.frequency}</span>
                    </div>
                    {med.duration && (
                      <div className="mt-0.5 text-xs opacity-70">
                        Duração: {med.duration}
                      </div>
                    )}
                  </div>
                  <div
                    className="mt-1 flex h-6 w-6 items-center justify-center rounded-full 
                                bg-gradient-to-br from-purple-400/20 to-pink-400/20 transition-transform group-hover:scale-110"
                  >
                    <Pill className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic opacity-70">
            Nenhum medicamento especificado.
          </p>
        )}

        {/* Warning for high priority medications */}
        {priority === "high" && (
          <div
            className="mt-3 flex items-center gap-2 rounded-lg border 
                        border-red-500/30 bg-red-500/20 px-2 py-1"
          >
            <Heart className="h-3 w-3 animate-pulse text-red-500" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              Medicação de Alta Prioridade
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

