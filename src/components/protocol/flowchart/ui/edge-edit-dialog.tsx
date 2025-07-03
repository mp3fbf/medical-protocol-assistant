/**
 * Dialog for editing edge properties
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
import { Trash2 } from "lucide-react";
import type { Edge } from "reactflow";
import type { CustomFlowNode } from "@/types/flowchart";

interface EdgeEditDialogProps {
  edge: Edge | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (edgeId: string, label: string) => void;
  onDelete: (edgeId: string) => void;
  nodes?: CustomFlowNode[];
}

export const EdgeEditDialog: React.FC<EdgeEditDialogProps> = ({
  edge,
  isOpen,
  onClose,
  onSave,
  onDelete,
  nodes = [],
}) => {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (edge) {
      setLabel((edge.label as string) || "");
    }
  }, [edge]);

  const handleSave = useCallback(() => {
    if (edge) {
      onSave(edge.id, label);
      onClose();
    }
  }, [edge, label, onSave, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Enter to save
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }

      // ESC to close
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleSave]);

  const handleDelete = () => {
    if (edge && confirm("Tem certeza que deseja deletar esta conexão?")) {
      onDelete(edge.id);
      onClose();
    }
  };

  if (!edge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Conexão</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edge-label">Label da Conexão</Label>
            <Input
              id="edge-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Sim, Não, Continuar..."
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Deixe vazio para remover o label
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Origem:</strong>{" "}
              {nodes.find((n) => n.id === edge.source)?.data.title ||
                edge.source}
              <br />
              <strong>Destino:</strong>{" "}
              {nodes.find((n) => n.id === edge.target)?.data.title ||
                edge.target}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="mr-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
