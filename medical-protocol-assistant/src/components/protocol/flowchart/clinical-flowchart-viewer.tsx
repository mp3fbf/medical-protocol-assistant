/**
 * Component for viewing clinical format flowcharts
 * Provides rich visualization of questionnaires, conducts, and conditional logic
 */

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import type {
  ClinicalFlowchart,
  ClinicalNode,
} from "@/types/flowchart-clinical";
import { clinicalToStandard } from "@/lib/utils/flowchart-converter";

// Import existing node components
import { StartNode } from "./node-types/start-node";
import { EndNode } from "./node-types/end-node";
import { DecisionNode } from "./node-types/decision-node";
import { ActionNode } from "./node-types/action-node";
import { TriageNode } from "./node-types/triage-node";

interface ClinicalFlowchartViewerProps {
  flowchart: ClinicalFlowchart;
  className?: string;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  editable?: boolean;
}

// Custom node types for standard visualization
const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  decision: DecisionNode,
  action: ActionNode,
  triage: TriageNode,
};

export function ClinicalFlowchartViewer({
  flowchart,
  className,
  onNodesChange,
  onEdgesChange,
  editable = false,
}: ClinicalFlowchartViewerProps) {
  // Convert clinical format to standard format for visualization
  const standardFlowchart = useMemo(() => {
    return clinicalToStandard(flowchart);
  }, [flowchart]);

  // Initialize nodes and edges state
  const [nodes, setNodes, handleNodesChange] = useNodesState(
    standardFlowchart.nodes,
  );
  const [edges, setEdges, handleEdgesChange] = useEdgesState(
    standardFlowchart.edges,
  );

  // Handle changes if editable
  const handleNodesChangeWrapper = (changes: any) => {
    if (editable) {
      handleNodesChange(changes);
      if (onNodesChange) {
        onNodesChange(nodes);
      }
    }
  };

  const handleEdgesChangeWrapper = (changes: any) => {
    if (editable) {
      handleEdgesChange(changes);
      if (onEdgesChange) {
        onEdgesChange(edges);
      }
    }
  };

  return (
    <div className={cn("h-full w-full", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChangeWrapper}
        onEdgesChange={handleEdgesChangeWrapper}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
          style: {
            strokeWidth: 2,
            stroke: "#94a3b8",
          },
        }}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Background gap={12} size={1} className="bg-gray-50 dark:bg-gray-900" />
        <Controls className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
        <MiniMap
          className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          nodeColor={(node) => {
            switch (node.type) {
              case "start":
                return "#10b981";
              case "end":
                return "#ef4444";
              case "decision":
                return "#3b82f6";
              case "action":
                return "#8b5cf6";
              case "triage":
                return "#f59e0b";
              default:
                return "#6b7280";
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

// Component to display rich clinical data in a panel
export function ClinicalDataPanel({ node }: { node: ClinicalNode }) {
  const { data } = node;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h3 className="text-lg font-semibold">{data.label}</h3>
        {data.descricao && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {data.descricao}
          </p>
        )}
      </div>

      {node.type === "custom" &&
        "questions" in data &&
        data.questions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Questionário:</h4>
            {data.questions.map((question) => (
              <div
                key={question.id}
                className="border-l-2 border-gray-200 pl-4 dark:border-gray-700"
              >
                <p className="text-sm font-medium">{question.titulo}</p>
                {question.descricao && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {question.descricao}
                  </p>
                )}
                {question.select !== "B" && question.options.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type={question.select === "E" ? "checkbox" : "radio"}
                          disabled
                          defaultChecked={option.preselected}
                          className="h-3 w-3"
                        />
                        <span className="text-xs">{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {node.type === "conduct" &&
        "condutaDataNode" in data &&
        data.condutaDataNode && (
          <div className="space-y-3">
            {data.condutaDataNode.medicamento.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">Medicamentos:</h4>
                <div className="mt-1 space-y-2 pl-4">
                  {data.condutaDataNode.medicamento.map((med) => (
                    <div key={med.id} className="text-xs">
                      <p className="font-medium">{med.nome}</p>
                      <div
                        className="text-gray-600 dark:text-gray-400"
                        dangerouslySetInnerHTML={{ __html: med.posologia }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.condutaDataNode.exame.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">Exames:</h4>
                <div className="mt-1 space-y-1 pl-4">
                  {data.condutaDataNode.exame.map((exam) => (
                    <div key={exam.id} className="text-xs">
                      <p className="font-medium">{exam.nome}</p>
                      {exam.indicacao && (
                        <p className="text-gray-600 dark:text-gray-400">
                          Indicação: {exam.indicacao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.condutaDataNode.orientacao.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">Orientações:</h4>
                <div className="mt-1 space-y-1 pl-4">
                  {data.condutaDataNode.orientacao.map((orient) => (
                    <div key={orient.id} className="text-xs">
                      <div
                        className="text-gray-600 dark:text-gray-400"
                        dangerouslySetInnerHTML={{ __html: orient.conteudo }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {data.condicao && data.condicao !== "SEMPRE" && (
        <div className="mt-2 rounded bg-yellow-50 p-2 text-xs dark:bg-yellow-900/20">
          <span className="font-medium">Condição:</span> {data.condicao}
        </div>
      )}
    </div>
  );
}
