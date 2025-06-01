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

  // Function to get handle position - outputs on sides
  const getHandlePosition = (
    outputIndex: number,
    totalOutputs: number,
  ): Position => {
    // For 2 outputs (typical yes/no), use left and right
    if (totalOutputs === 2) {
      return outputIndex === 0 ? Position.Left : Position.Right;
    }

    // For odd number of outputs > 2, alternate between left and right
    if (totalOutputs > 2) {
      return outputIndex % 2 === 0 ? Position.Left : Position.Right;
    }

    // Default to right for single output
    return Position.Right;
  };

  const getHandleStyle = (
    outputId: string,
    outputIndex: number,
    totalOutputs: number,
  ) => {
    const position = getHandlePosition(outputIndex, totalOutputs);

    // For 2 outputs, position at 50% height
    if (totalOutputs === 2) {
      if (position === Position.Left) {
        return { top: "50%", left: -6, transform: "translateY(-50%)" };
      } else {
        return { top: "50%", right: -6, transform: "translateY(-50%)" };
      }
    }

    // For multiple outputs, distribute vertically on each side
    if (totalOutputs > 2) {
      const sideOutputs = Math.ceil(totalOutputs / 2);
      const sideIndex = Math.floor(outputIndex / 2);
      const verticalSpacing = 100 / (sideOutputs + 1);
      const verticalPosition = verticalSpacing * (sideIndex + 1);

      if (position === Position.Left) {
        return {
          top: `${verticalPosition}%`,
          left: -6,
          transform: "translateY(-50%)",
        };
      } else {
        return {
          top: `${verticalPosition}%`,
          right: -6,
          transform: "translateY(-50%)",
        };
      }
    }

    // Default single output on right
    return { top: "50%", right: -6, transform: "translateY(-50%)" };
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
          position={getHandlePosition(index, outputs.length)}
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
