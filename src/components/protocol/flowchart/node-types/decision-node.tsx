/**
 * Professional Medical Decision Node for ReactFlow.
 * Rectangular shape with customizable outputs.
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { DecisionNodeData } from "@/types/flowchart";
import { cn } from "@/lib/utils";
import { GitBranch } from "lucide-react";

export const DecisionNode: React.FC<NodeProps<DecisionNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  const {
    title,
    criteria,
    outputs = [
      { id: "yes", label: "Sim", position: "bottom-left" },
      { id: "no", label: "Não", position: "bottom-right" },
    ],
  } = data;

  // Function to get handle position - all outputs use bottom position
  const getHandlePosition = (): Position => {
    return Position.Bottom;
  };

  const getHandleStyle = (
    outputId: string,
    outputIndex: number,
    totalOutputs: number,
  ) => {
    // For dichotomic decisions (yes/no), position handles at 30% and 70% of width
    if (totalOutputs === 2 && (outputId === "yes" || outputId === "no")) {
      if (outputId === "yes") {
        return { bottom: -6, left: "30%", transform: "translateX(-50%)" };
      } else {
        return { bottom: -6, left: "70%", transform: "translateX(-50%)" };
      }
    }

    // For multiple outputs, distribute evenly
    if (totalOutputs > 2) {
      const spacing = 100 / (totalOutputs + 1);
      const position = spacing * (outputIndex + 1);
      return {
        bottom: -6,
        left: `${position}%`,
        transform: "translateX(-50%)",
      };
    }

    // Default center position
    return { bottom: -6, left: "50%", transform: "translateX(-50%)" };
  };

  return (
    <div
      className={cn(
        "medical-flow-node medical-decision-node",
        selected && "selected",
      )}
      style={{ minWidth: "240px", minHeight: "100px" }}
    >
      {/* Icon in top right */}
      <div className="absolute right-3 top-3 opacity-20">
        <GitBranch className="h-5 w-5 text-blue-600" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="medical-node-title mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </div>
        {criteria && (
          <div
            className="medical-node-subtitle mb-3 text-sm text-gray-600 dark:text-gray-400"
            dangerouslySetInnerHTML={{ __html: criteria }}
          />
        )}

        {/* Output labels preview */}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-blue-200 pt-3 dark:border-blue-800">
          {outputs.map((output) => (
            <div key={output.id} className="flex items-center gap-1">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  output.id === "yes" ||
                    output.label?.toLowerCase().includes("sim")
                    ? "bg-green-500"
                    : output.id === "no" ||
                        output.label?.toLowerCase().includes("não")
                      ? "bg-red-500"
                      : "bg-gray-500",
                )}
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {output.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="medical-handle medical-handle-input"
      />

      {/* Dynamic output handles */}
      {outputs.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={getHandlePosition()}
          id={output.id}
          isConnectable={isConnectable}
          style={getHandleStyle(output.id, index, outputs.length)}
          className={cn(
            "medical-handle",
            output.id === "yes" || output.label?.toLowerCase().includes("sim")
              ? "medical-handle-yes"
              : output.id === "no" ||
                  output.label?.toLowerCase().includes("não")
                ? "medical-handle-no"
                : "medical-handle-default",
          )}
        />
      ))}
    </div>
  );
};
