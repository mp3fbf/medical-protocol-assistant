/**
 * Conduct Node - Clinical flowchart node for medical conducts
 */

import React, { useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import {
  type ConductNodeData,
  hasConductData,
} from "@/types/flowchart-clinical";
import { cn } from "@/lib/utils";
import {
  FileText,
  Pill,
  FlaskConical,
  UserCheck,
  MessageSquare,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface ConductNodeProps extends NodeProps {
  data: ConductNodeData;
}

export function ConductNode({ data, selected }: ConductNodeProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const toggleSection = (section: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent node click event
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const conductData = hasConductData(data) ? data.condutaDataNode : null;

  const getSectionCount = (section: string) => {
    if (!conductData) return 0;
    switch (section) {
      case "orientacao":
        return conductData.orientacao?.length || 0;
      case "exame":
        return conductData.exame?.length || 0;
      case "medicamento":
        return conductData.medicamento?.length || 0;
      case "encaminhamento":
        return conductData.encaminhamento?.length || 0;
      case "mensagem":
        return conductData.mensagem?.length || 0;
      default:
        return 0;
    }
  };

  const sections = [
    { key: "orientacao", label: "Orientações", icon: FileText, color: "blue" },
    { key: "exame", label: "Exames", icon: FlaskConical, color: "green" },
    { key: "medicamento", label: "Medicamentos", icon: Pill, color: "orange" },
    {
      key: "encaminhamento",
      label: "Encaminhamentos",
      icon: UserCheck,
      color: "purple",
    },
    { key: "mensagem", label: "Mensagens", icon: MessageSquare, color: "pink" },
  ];

  return (
    <>
      <Handle type="target" position={Position.Top} />

      <div
        className={cn(
          "min-w-[350px] max-w-[450px] rounded-lg border-2 bg-white p-4 shadow-lg",
          selected ? "border-red-500" : "border-red-300",
          data.condicional === "oculto" && "opacity-50",
        )}
      >
        {/* Header */}
        <div className="mb-3 border-b border-gray-200 pb-2">
          <h3 className="text-sm font-bold text-gray-900">{data.label}</h3>
          {data.condicao && (
            <p className="mt-1 text-xs text-orange-600">
              Condição: {data.condicao}
            </p>
          )}
          {data.conduta && (
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 text-xs",
                data.conduta === "conclusao" && "bg-green-100 text-green-700",
                data.conduta === "encaminhamento" &&
                  "bg-blue-100 text-blue-700",
                data.conduta === "retorno" && "bg-yellow-100 text-yellow-700",
              )}
            >
              {data.conduta}
            </span>
          )}
        </div>

        {/* Description */}
        {data.descricao && (
          <div
            className="mb-3 text-xs text-gray-700"
            dangerouslySetInnerHTML={{ __html: data.descricao }}
          />
        )}

        {/* Conduct sections */}
        {conductData && (
          <div className="space-y-2">
            {sections.map((section) => {
              const count = getSectionCount(section.key);
              if (count === 0) return null;

              const isExpanded = expandedSections.has(section.key);
              const Icon = section.icon;

              return (
                <div
                  key={section.key}
                  className="overflow-hidden rounded-lg border"
                >
                  <button
                    className={cn(
                      "nodrag", // Prevent drag on button
                      "flex w-full items-center justify-between px-3 py-2",
                      "border-l-4 transition-colors hover:bg-gray-50",
                      section.color === "blue" && "border-blue-500",
                      section.color === "green" && "border-green-500",
                      section.color === "orange" && "border-orange-500",
                      section.color === "purple" && "border-purple-500",
                      section.color === "pink" && "border-pink-500",
                    )}
                    onClick={(e) => toggleSection(section.key, e)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          section.color === "blue" && "text-blue-600",
                          section.color === "green" && "text-green-600",
                          section.color === "orange" && "text-orange-600",
                          section.color === "purple" && "text-purple-600",
                          section.color === "pink" && "text-pink-600",
                        )}
                      />
                      <span className="text-sm font-medium">
                        {section.label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-xs",
                          section.color === "blue" &&
                            "bg-blue-100 text-blue-700",
                          section.color === "green" &&
                            "bg-green-100 text-green-700",
                          section.color === "orange" &&
                            "bg-orange-100 text-orange-700",
                          section.color === "purple" &&
                            "bg-purple-100 text-purple-700",
                          section.color === "pink" &&
                            "bg-pink-100 text-pink-700",
                        )}
                      >
                        {count}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div
                      className="nodrag nowheel max-h-[200px] overflow-y-auto border-t bg-gray-50 px-3 py-2"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {section.key === "orientacao" &&
                        conductData.orientacao?.map((item, idx) => (
                          <div key={item.id} className="mb-2 last:mb-0">
                            <h5 className="text-xs font-semibold">
                              {item.nome}
                            </h5>
                            <div
                              className="mt-1 text-xs text-gray-600"
                              dangerouslySetInnerHTML={{
                                __html: item.conteudo,
                              }}
                            />
                          </div>
                        ))}

                      {section.key === "exame" &&
                        conductData.exame?.map((item, idx) => (
                          <div key={item.id} className="mb-2 last:mb-0">
                            <h5 className="text-xs font-semibold">
                              {item.nome}
                            </h5>
                            <p className="text-xs text-gray-600">
                              Código: {item.codigo} | CID: {item.cid}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.indicacao}
                            </p>
                          </div>
                        ))}

                      {section.key === "medicamento" &&
                        conductData.medicamento?.map((item, idx) => (
                          <div key={item.id} className="mb-2 last:mb-0">
                            <h5 className="text-xs font-semibold">
                              {item.nomeMed}
                            </h5>
                            <div
                              className="text-xs text-gray-600"
                              dangerouslySetInnerHTML={{
                                __html: item.posologia,
                              }}
                            />
                          </div>
                        ))}

                      {section.key === "mensagem" &&
                        conductData.mensagem?.map((item, idx) => (
                          <div key={item.id} className="mb-2 last:mb-0">
                            <h5 className="text-xs font-semibold">
                              {item.nome}
                            </h5>
                            <div
                              className="text-xs text-gray-600"
                              dangerouslySetInnerHTML={{
                                __html: item.conteudo,
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
