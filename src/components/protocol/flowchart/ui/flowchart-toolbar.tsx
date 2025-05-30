/**
 * Toolbar for flowchart editing operations
 */
"use client";

import React from "react";
import {
  Trash2,
  Save,
  Circle,
  Square,
  Diamond,
  Pill,
  Activity,
  HelpCircle,
} from "lucide-react";

interface FlowchartToolbarProps {
  onAddNode: (type: string) => void;
  onDeleteSelected: () => void;
  onSave: () => void;
  hasChanges: boolean;
  canDelete: boolean;
  onHelp?: () => void;
}

export const FlowchartToolbar: React.FC<FlowchartToolbarProps> = ({
  onAddNode,
  onDeleteSelected,
  onSave,
  hasChanges,
  canDelete,
  onHelp,
}) => {
  const nodeTypes = [
    { type: "start", icon: Circle, label: "Início", color: "text-green-600" },
    { type: "end", icon: Circle, label: "Fim", color: "text-red-600" },
    {
      type: "triage",
      icon: Activity,
      label: "Triagem",
      color: "text-blue-600",
    },
    {
      type: "decision",
      icon: Diamond,
      label: "Decisão",
      color: "text-yellow-600",
    },
    { type: "action", icon: Square, label: "Ação", color: "text-purple-600" },
    {
      type: "medication",
      icon: Pill,
      label: "Medicação",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Adicionar Nó:
        </span>
        {nodeTypes.map(({ type, icon: Icon, label, color }) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            className={`flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${color}`}
            title={`Adicionar ${label}`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {onHelp && (
          <>
            <button
              onClick={onHelp}
              className="flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Ajuda"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Ajuda</span>
            </button>
            <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
          </>
        )}

        <button
          onClick={onDeleteSelected}
          disabled={!canDelete}
          className="flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-red-900/20"
          title="Deletar selecionados (Delete)"
        >
          <Trash2 className="h-4 w-4" />
          <span>Deletar</span>
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        <button
          onClick={onSave}
          disabled={!hasChanges}
          className="flex items-center gap-1 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
          title="Salvar alterações"
        >
          <Save className="h-4 w-4" />
          <span>Salvar</span>
          {hasChanges && (
            <span className="ml-1 h-2 w-2 rounded-full bg-white"></span>
          )}
        </button>
      </div>
    </div>
  );
};
