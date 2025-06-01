import React from "react";
import { EdgeProps, EdgeLabelRenderer, BaseEdge } from "reactflow";

export function OrthogonalEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  style = {},
  markerEnd,
  data,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const sourceHandle = data?.sourceHandle;
  // Create a path with right angles only
  let path: string;

  // Determine if source is from side (decision node) or bottom (other nodes)
  const isSourceSide = sourcePosition === "left" || sourcePosition === "right";

  if (isSourceSide) {
    // Handle lateral outputs (from decision nodes)
    const horizontalOffset = 60; // Distance to go horizontally before turning

    if (sourcePosition === "left") {
      // Left side output
      const midX = sourceX - horizontalOffset;

      if (targetX < sourceX - horizontalOffset) {
        // Target is to the left
        path = `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
      } else {
        // Target is to the right or below
        path = `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
      }
    } else {
      // Right side output
      const midX = sourceX + horizontalOffset;

      if (targetX > sourceX + horizontalOffset) {
        // Target is to the right
        path = `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
      } else {
        // Target is to the left or below
        path = `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
      }
    }
  } else {
    // Handle bottom outputs (from other nodes)
    const verticalOffset = 40;
    const midY = Math.max(
      sourceY + verticalOffset,
      sourceY + (targetY - sourceY) / 2,
    );

    if (Math.abs(targetX - sourceX) < 10) {
      // Vertically aligned
      path = `M ${sourceX},${sourceY} L ${sourceX},${targetY - 20} L ${targetX},${targetY}`;
    } else {
      // Standard orthogonal path
      path = `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
    }
  }

  // Calculate label position
  let labelX: number;
  let labelY: number;

  if (isSourceSide) {
    // For side handles, position label near the first bend
    if (sourcePosition === "left") {
      labelX = sourceX - 30;
      labelY = sourceY;
    } else {
      labelX = sourceX + 30;
      labelY = sourceY;
    }
  } else {
    // For bottom handles, position label below the node
    labelX = sourceX;
    labelY = sourceY + 25;

    // Offset for yes/no to avoid overlap
    if (sourceHandle === "yes") {
      labelX = sourceX - 20;
    } else if (sourceHandle === "no") {
      labelX = sourceX + 20;
    }
  }

  return (
    <>
      <BaseEdge path={path} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 14,
              fontWeight: 700,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <div
              style={{
                background: "white",
                padding: "3px 8px",
                borderRadius: 4,
                border: `2px solid ${sourceHandle === "yes" ? "#059669" : sourceHandle === "no" ? "#dc2626" : "#6b7280"}`,
                color:
                  sourceHandle === "yes"
                    ? "#059669"
                    : sourceHandle === "no"
                      ? "#dc2626"
                      : "#6b7280",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
