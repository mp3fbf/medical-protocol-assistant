/**
 * Question Node - Clinical flowchart node with questionnaires
 */

import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { type CustomNodeData, type Question } from "@/types/flowchart-clinical";
import { cn } from "@/lib/utils";

interface QuestionNodeProps extends NodeProps {
  data: CustomNodeData;
}

export function QuestionNode({ data, selected }: QuestionNodeProps) {
  const renderQuestion = (question: Question, index: number) => {
    const isMultipleChoice = question.select === "E";
    const isSingleChoice = question.select === "F";
    const isTextInput = question.select === "B";

    return (
      <div key={question.id} className="mb-4 last:mb-0">
        <div className="mb-2 flex items-start gap-2">
          {question.uid && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-600">
              {question.uid}
            </span>
          )}
          <h4 className="flex-1 text-sm font-semibold text-gray-800">
            {question.titulo}
          </h4>
        </div>

        {question.descricao && (
          <p className="mb-2 text-xs text-gray-600">{question.descricao}</p>
        )}

        {/* Multiple choice options */}
        {(isMultipleChoice || isSingleChoice) &&
          question.options.length > 0 && (
            <div className="space-y-1">
              {question.options.map((option, optIndex) => (
                <div
                  key={`${question.id}-opt-${optIndex}`}
                  className="flex items-start gap-2 py-1"
                >
                  <input
                    type={isMultipleChoice ? "checkbox" : "radio"}
                    name={question.id}
                    defaultChecked={option.preselected}
                    className="mt-0.5"
                    disabled
                  />
                  <label className="flex-1 text-xs text-gray-700">
                    {option.label}
                    {option.exclusive && (
                      <span className="ml-1 text-xs text-gray-500">
                        (exclusiva)
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}

        {/* Text input */}
        {isTextInput && (
          <textarea
            className="nodrag nowheel w-full resize-none rounded border border-gray-300 px-2 py-1 text-xs"
            rows={2}
            placeholder="Digite aqui..."
            disabled
            onWheel={(e) => e.stopPropagation()}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />

      <div
        className={cn(
          "min-w-[300px] max-w-[400px] rounded-lg border-2 bg-white p-4 shadow-lg",
          selected ? "border-blue-500" : "border-gray-300",
          data.condicional === "oculto" && "opacity-50",
        )}
      >
        {/* Header */}
        <div className="mb-3 border-b border-gray-200 pb-2">
          <h3 className="text-sm font-bold text-gray-900">{data.label}</h3>
          {data.condicao && data.condicao !== "SEMPRE" && (
            <p className="mt-1 text-xs text-orange-600">
              Condição: {data.condicao}
            </p>
          )}
        </div>

        {/* Questions */}
        <div
          className="nodrag nowheel max-h-[400px] space-y-3 overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          {data.questions.map((question, index) =>
            renderQuestion(question, index),
          )}
        </div>

        {/* Description */}
        {data.descricao && (
          <div
            className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-600"
            dangerouslySetInnerHTML={{ __html: data.descricao }}
          />
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
