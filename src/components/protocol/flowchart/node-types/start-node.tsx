/**
 * Start Node Component
 * Represents the beginning of a medical protocol flowchart
 */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { StartNodeData } from "@/types/flowchart";
import { Play } from "lucide-react";

// Helper to decode HTML entities for display
function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export const StartNode: React.FC<NodeProps<StartNodeData>> = ({ data }) => {
  return (
    <div className="relative rounded-lg border-2 border-green-500 bg-green-50 px-4 py-3 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-center gap-2">
        <Play className="h-5 w-5 text-green-600" />
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
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: "#10b981" }}
      />
    </div>
  );
};
