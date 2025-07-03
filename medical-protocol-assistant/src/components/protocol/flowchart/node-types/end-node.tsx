/**
 * End Node Component
 * Represents the conclusion of a medical protocol flowchart
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { EndNodeData } from "@/types/flowchart";
import { CheckCircle } from "lucide-react";

// Helper to decode HTML entities for display
function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export const EndNode: React.FC<NodeProps<EndNodeData>> = ({ data }) => {
  return (
    <div className="relative rounded-lg border-2 border-red-500 bg-red-50 px-4 py-3 shadow-md transition-shadow hover:shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: "#ef4444" }}
      />
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-red-600" />
        <div>
          <div className="text-sm font-semibold text-gray-800">
            {decodeHtmlEntities(data.title)}
          </div>
          {data.description && (
            <div className="mt-1 text-xs text-gray-600">
              {decodeHtmlEntities(data.description)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
