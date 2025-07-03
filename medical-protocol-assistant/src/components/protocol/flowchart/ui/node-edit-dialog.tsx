/**
 * Dialog for editing node properties
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CustomFlowNode,
  CustomFlowNodeData,
  FlowchartMedication,
} from "@/types/flowchart";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Link2,
  Settings,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeEditDialogProps {
  node: CustomFlowNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, data: CustomFlowNodeData) => void;
  edges?: any[]; // To show current connections
  nodes?: CustomFlowNode[]; // To get node names
}

export const NodeEditDialog: React.FC<NodeEditDialogProps> = ({
  node,
  isOpen,
  onClose,
  onSave,
  edges = [],
  nodes = [],
}) => {
  const [nodeData, setNodeData] = useState<CustomFlowNodeData>(node.data);

  useEffect(() => {
    setNodeData(node.data);
  }, [node]);

  const handleSave = useCallback(() => {
    // For decision nodes, remove empty output handles ONLY if they existed before
    if (nodeData.type === "decision") {
      const decisionData = nodeData as any;
      const originalOutputs = (node.data as any).outputs || [];

      // Get all connected edges for this node
      const connectedHandles = new Set(
        edges
          .filter((edge) => edge.source === node.id && edge.sourceHandle)
          .map((edge) => edge.sourceHandle),
      );

      // Filter outputs to keep:
      // 1. All connected outputs
      // 2. All newly created outputs (not in original)
      // 3. At least 2 outputs minimum
      if (decisionData.outputs) {
        const filteredOutputs = decisionData.outputs.filter((output: any) => {
          // Keep if it has a connection
          if (connectedHandles.has(output.id)) return true;

          // Keep if it's a new output (not in the original data)
          const isNew = !originalOutputs.some(
            (orig: any) => orig.id === output.id,
          );
          if (isNew) return true;

          // Keep if we need to maintain minimum of 2
          if (decisionData.outputs.length <= 2) return true;

          // Remove old unconnected outputs
          return false;
        });

        // Update the nodeData with filtered outputs
        const updatedData = {
          ...nodeData,
          outputs:
            filteredOutputs.length >= 2
              ? filteredOutputs
              : decisionData.outputs.slice(0, 2),
        };

        onSave(node.id, updatedData);
      } else {
        onSave(node.id, nodeData);
      }
    } else {
      onSave(node.id, nodeData);
    }

    onClose();
  }, [node.id, nodeData, node.data, onSave, onClose, edges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // ESC to close
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleSave]);

  const updateField = (field: string, value: any) => {
    setNodeData((prev) => ({ ...prev, [field]: value }));
  };

  // Get incoming connections (nodes that connect TO this node)
  const getIncomingConnections = () => {
    const incoming = edges.filter((edge) => edge.target === node.id);
    return incoming.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      return {
        nodeTitle: sourceNode?.data.title || "Nó desconhecido",
        nodeType: sourceNode?.type || "unknown",
        handle: edge.sourceHandle || "default",
      };
    });
  };

  // Get outgoing connections (nodes that this node connects TO)
  const getOutgoingConnections = () => {
    const outgoing = edges.filter((edge) => edge.source === node.id);
    return outgoing.map((edge) => {
      const targetNode = nodes.find((n) => n.id === edge.target);
      return {
        nodeTitle: targetNode?.data.title || "Nó desconhecido",
        nodeType: targetNode?.type || "unknown",
        handle: edge.sourceHandle || "default",
        label: edge.label,
      };
    });
  };

  const renderNodeSpecificFields = () => {
    switch (nodeData.type) {
      case "decision":
        return (
          <>
            <div className="space-y-2">
              <Label>Critérios de Decisão</Label>
              <div className="min-h-[120px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <RichTextEditor
                  content={(nodeData as any).criteria || ""}
                  onChange={(content) => updateField("criteria", content)}
                  placeholder="Ex: PAS > 90mmHg, SatO2 > 94%"
                  className="min-h-[120px]"
                />
              </div>
            </div>

            {/* Custom outputs for decision nodes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Saídas do Nó</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentOutputs = (nodeData as any).outputs || [
                      { id: "yes", label: "Sim", position: "bottom-left" },
                      { id: "no", label: "Não", position: "bottom-right" },
                    ];
                    const newOutput = {
                      id: `output-${Date.now()}`,
                      label: "Nova Saída",
                      position: "bottom-center" as const,
                    };
                    updateField("outputs", [...currentOutputs, newOutput]);
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar Saída
                </Button>
              </div>

              <div className="space-y-2">
                {(
                  (nodeData as any).outputs || [
                    { id: "yes", label: "Sim", position: "bottom-left" },
                    { id: "no", label: "Não", position: "bottom-right" },
                  ]
                ).map((output: any, index: number) => {
                  const hasConnection = edges.some(
                    (edge) =>
                      edge.source === node.id &&
                      edge.sourceHandle === output.id,
                  );
                  const originalOutputs = (node.data as any).outputs || [];
                  const isNew = !originalOutputs.some(
                    (orig: any) => orig.id === output.id,
                  );

                  return (
                    <div
                      key={output.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2",
                        hasConnection
                          ? "border-gray-200 dark:border-gray-700"
                          : isNew
                            ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                            : "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20",
                      )}
                    >
                      <div
                        className={cn(
                          "h-3 w-3 flex-shrink-0 rounded-full",
                          output.id === "yes" ||
                            output.label?.toLowerCase().includes("sim")
                            ? "bg-green-500"
                            : output.id === "no" ||
                                output.label?.toLowerCase().includes("não")
                              ? "bg-red-500"
                              : "bg-gray-500",
                        )}
                      />
                      <Input
                        value={output.label}
                        onChange={(e) => {
                          const outputs = [
                            ...((nodeData as any).outputs || []),
                          ];
                          outputs[index] = {
                            ...outputs[index],
                            label: e.target.value,
                          };
                          updateField("outputs", outputs);
                        }}
                        placeholder="Label da saída"
                        className="flex-1"
                      />
                      <Select
                        value={output.position}
                        onValueChange={(value) => {
                          const outputs = [
                            ...((nodeData as any).outputs || []),
                          ];
                          outputs[index] = {
                            ...outputs[index],
                            position: value,
                          };
                          updateField("outputs", outputs);
                        }}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-left">
                            Inferior Esq.
                          </SelectItem>
                          <SelectItem value="bottom-center">
                            Inferior Centro
                          </SelectItem>
                          <SelectItem value="bottom-right">
                            Inferior Dir.
                          </SelectItem>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                      {((nodeData as any).outputs || []).length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const outputs = [
                              ...((nodeData as any).outputs || []),
                            ];
                            outputs.splice(index, 1);
                            updateField("outputs", outputs);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                      {!hasConnection && (
                        <div
                          className={cn(
                            "ml-auto whitespace-nowrap text-xs",
                            isNew
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400",
                          )}
                        >
                          {isNew ? "Nova saída" : "Sem conexão"}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(() => {
                  const originalOutputs = (node.data as any).outputs || [];
                  const currentOutputs = (nodeData as any).outputs || [];
                  const hasOldUnconnected = currentOutputs.some(
                    (output: any) => {
                      const isOld = originalOutputs.some(
                        (orig: any) => orig.id === output.id,
                      );
                      const hasConnection = edges.some(
                        (edge) =>
                          edge.source === node.id &&
                          edge.sourceHandle === output.id,
                      );
                      return isOld && !hasConnection;
                    },
                  );

                  return (
                    hasOldUnconnected &&
                    currentOutputs.length > 2 && (
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                        ⚠️ Saídas antigas sem conexão serão removidas ao salvar
                      </div>
                    )
                  );
                })()}
              </div>
            </div>
          </>
        );

      case "action":
        return (
          <>
            <div className="space-y-2">
              <Label>Ações</Label>
              <div className="min-h-[150px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <RichTextEditor
                  content={(nodeData as any).actions?.join("<br>") || ""}
                  onChange={(content) => {
                    // Convert HTML breaks to array items
                    const actions = content
                      .split(/<br\s*\/?>|<\/p><p>/)
                      .map((action) => action.replace(/<\/?p>/g, "").trim())
                      .filter((a) => a);
                    updateField("actions", actions);
                  }}
                  placeholder="Liste as ações médicas necessárias"
                  className="min-h-[150px]"
                />
              </div>
              <div className="text-xs text-gray-500">
                Dica: Use Enter para separar ações. Cada parágrafo será uma ação
                no fluxograma.
              </div>
            </div>
          </>
        );

      case "medication":
        return (
          <>
            <div className="space-y-4">
              <Label>Medicações</Label>
              {((nodeData as any).medications || []).map(
                (med: FlowchartMedication, index: number) => (
                  <div key={index} className="space-y-2 rounded-md border p-3">
                    <Input
                      placeholder="Nome do medicamento"
                      value={med.name}
                      onChange={(e) => {
                        const meds = [...((nodeData as any).medications || [])];
                        meds[index] = { ...meds[index], name: e.target.value };
                        updateField("medications", meds);
                      }}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Dose"
                        value={med.dose}
                        onChange={(e) => {
                          const meds = [
                            ...((nodeData as any).medications || []),
                          ];
                          meds[index] = {
                            ...meds[index],
                            dose: e.target.value,
                          };
                          updateField("medications", meds);
                        }}
                      />
                      <Input
                        placeholder="Via"
                        value={med.route}
                        onChange={(e) => {
                          const meds = [
                            ...((nodeData as any).medications || []),
                          ];
                          meds[index] = {
                            ...meds[index],
                            route: e.target.value,
                          };
                          updateField("medications", meds);
                        }}
                      />
                      <Input
                        placeholder="Frequência"
                        value={med.frequency}
                        onChange={(e) => {
                          const meds = [
                            ...((nodeData as any).medications || []),
                          ];
                          meds[index] = {
                            ...meds[index],
                            frequency: e.target.value,
                          };
                          updateField("medications", meds);
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const meds = [...((nodeData as any).medications || [])];
                  meds.push({
                    name: "",
                    dose: "",
                    route: "",
                    frequency: "",
                  });
                  updateField("medications", meds);
                }}
              >
                Adicionar Medicação
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Nó: {getNodeTypeLabel(nodeData.type)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Conexões
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Incoming connections */}
              <div className="rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-2 flex items-center gap-2">
                  <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                    Entradas
                  </span>
                </div>
                {getIncomingConnections().length > 0 ? (
                  <div className="space-y-2">
                    {getIncomingConnections().map((conn, idx) => (
                      <div key={idx} className="group flex items-start gap-2">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 transition-transform group-hover:scale-125"></div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                            {conn.nodeTitle}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {getNodeTypeLabel(conn.nodeType)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm italic text-gray-400 dark:text-gray-500">
                    Sem conexões
                  </div>
                )}
              </div>

              {/* Outgoing connections */}
              <div className="rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-2 flex items-center gap-2">
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                    Saídas
                  </span>
                </div>
                {getOutgoingConnections().length > 0 ? (
                  <div className="space-y-2">
                    {getOutgoingConnections().map((conn, idx) => (
                      <div key={idx} className="group flex items-start gap-2">
                        <div
                          className={`mt-1.5 h-2 w-2 rounded-full transition-transform group-hover:scale-125 ${
                            conn.handle === "yes"
                              ? "bg-green-500"
                              : conn.handle === "no"
                                ? "bg-red-500"
                                : "bg-gray-500"
                          }`}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                              {conn.nodeTitle}
                            </span>
                            {conn.label && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  conn.handle === "yes"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : conn.handle === "no"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {conn.label}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {getNodeTypeLabel(conn.nodeType)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm italic text-gray-400 dark:text-gray-500">
                    Sem conexões
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Node Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Configurações do Nó
              </h3>
            </div>
            {/* Title field - available for all node types except start/end */}
            {nodeData.type !== "start" && nodeData.type !== "end" && (
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={nodeData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Digite o título do nó"
                />
              </div>
            )}

            {/* Node-specific fields */}
            {renderNodeSpecificFields()}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 -mx-6 mt-6 border-t bg-white px-6 pt-4 dark:bg-gray-900">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function getNodeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    start: "Início",
    end: "Fim",
    triage: "Triagem",
    decision: "Decisão",
    action: "Ação",
    medication: "Medicação",
  };
  return labels[type] || type;
}
