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
}: EdgeProps) {
  const sourceHandle = data?.sourceHandle;
  // Create a path with right angles only
  let path: string;

  // All edges now use vertical routing since all handles are at bottom
  // Go down first, then horizontal, then to target
  const verticalOffset = 40; // Distance to go down before turning
  const midY = Math.max(
    sourceY + verticalOffset,
    sourceY + (targetY - sourceY) / 2,
  );

  // Create path with proper spacing
  if (Math.abs(targetX - sourceX) < 10) {
    // If nodes are vertically aligned, use simple path
    path = `M ${sourceX},${sourceY} L ${sourceX},${targetY - 20} L ${targetX},${targetY}`;
  } else {
    // Standard orthogonal path
    path = `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
  }

  // Calculate label position - place it near the source, slightly down from the node
  let labelX = sourceX;
  let labelY = sourceY + 25; // Position label below the node

  // For yes/no handles, offset horizontally to avoid overlap
  if (sourceHandle === "yes") {
    labelX = sourceX - 20; // Slight left offset for "yes"
  } else if (sourceHandle === "no") {
    labelX = sourceX + 20; // Slight right offset for "no"
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
