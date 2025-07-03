/**
 * Summary Node - Clinical flowchart node for attendance summary
 */

import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { type SummaryNodeData } from "@/types/flowchart-clinical";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

interface SummaryNodeProps extends NodeProps {
  data: SummaryNodeData;
}

export function SummaryNode({ data, selected }: SummaryNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />

      <div
        className={cn(
          "min-w-[250px] max-w-[350px] rounded-lg border-2 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 shadow-lg",
          selected ? "border-purple-500" : "border-purple-300",
          data.condicional === "oculto" && "opacity-50",
        )}
      >
        {/* Header */}
        <div className="mb-3 flex items-center gap-2 border-b border-purple-200 pb-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900">{data.label}</h3>
        </div>

        {/* Condition */}
        {data.condicao && (
          <p className="mb-2 text-xs text-orange-600">
            Condição: {data.condicao}
          </p>
        )}

        {/* Description */}
        {data.descricao && (
          <div
            className="text-xs leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: data.descricao }}
          />
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
