/**
 * Dialog for editing node properties
 */
"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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

interface NodeEditDialogProps {
  node: CustomFlowNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, data: CustomFlowNodeData) => void;
}

export const NodeEditDialog: React.FC<NodeEditDialogProps> = ({
  node,
  isOpen,
  onClose,
  onSave,
}) => {
  const [nodeData, setNodeData] = useState<CustomFlowNodeData>(node.data);

  useEffect(() => {
    setNodeData(node.data);
  }, [node]);

  const handleSave = () => {
    onSave(node.id, nodeData);
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setNodeData((prev) => ({ ...prev, [field]: value }));
  };

  const renderNodeSpecificFields = () => {
    switch (nodeData.type) {
      case "decision":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="criteria">Critérios de Decisão</Label>
              <Textarea
                id="criteria"
                value={(nodeData as any).criteria || ""}
                onChange={(e) => updateField("criteria", e.target.value)}
                placeholder="Ex: PAS > 90mmHg, SatO2 > 94%"
                rows={3}
              />
            </div>
          </>
        );

      case "action":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="actions">Ações (uma por linha)</Label>
              <Textarea
                id="actions"
                value={(nodeData as any).actions?.join("\n") || ""}
                onChange={(e) =>
                  updateField(
                    "actions",
                    e.target.value.split("\n").filter((a) => a.trim()),
                  )
                }
                placeholder="Ex: Verificar PA&#10;Monitorar ECG"
                rows={4}
              />
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Editar Nó: {getNodeTypeLabel(nodeData.type)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Priority field - available for most node types */}
          {["triage", "decision", "action", "medication"].includes(
            nodeData.type,
          ) && (
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={(nodeData as any).priority || "medium"}
                onValueChange={(value) => updateField("priority", value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Node-specific fields */}
          {renderNodeSpecificFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
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
