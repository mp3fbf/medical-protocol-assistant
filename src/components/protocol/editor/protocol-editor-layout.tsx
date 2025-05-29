/**
 * Main layout component for the protocol editor interface.
 * Arranges section navigation, text editor pane, flowchart pane, and validation report.
 */
"use client";
import React from "react";
import { SectionNavigationList } from "./section-navigation-list";
import { TextEditorPane } from "./text-editor-pane";
import { FlowchartPane } from "./flowchart-pane";
import { ValidationReportDisplay } from "./validation-report-display";
import type {
  ProtocolSectionData,
  ProtocolFullContent,
} from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart";
import type { ValidationIssue } from "@/types/validation"; // Corrected import
import { toast } from "sonner";
import { Play, ToggleLeft, ToggleRight } from "lucide-react";

interface ProtocolEditorLayoutProps {
  protocolTitle: string;
  protocolData: ProtocolFullContent | null;
  flowchartData: FlowchartDefinition | null;
  currentSectionNumber: number;
  validationIssues: ValidationIssue[]; // Use the specific type
  validationLoading?: boolean;
  validationLastValidated?: Date | null;
  autoValidate?: boolean;
  isLoading: boolean;
  onSelectSection: (sectionNumber: number) => void;
  onToggleAutoValidate?: () => void;
  onValidateNow?: () => void;
  onUpdateSectionContent: (
    sectionNumber: number,
    newContent: ProtocolSectionData["content"],
  ) => void;
  onSaveChanges: () => Promise<boolean>;
  isSaving?: boolean;
}

export const ProtocolEditorLayout: React.FC<ProtocolEditorLayoutProps> = ({
  protocolTitle,
  protocolData,
  flowchartData,
  currentSectionNumber,
  validationIssues,
  validationLoading = false,
  validationLastValidated,
  autoValidate = true,
  isLoading,
  onSelectSection,
  onToggleAutoValidate,
  onValidateNow,
  onUpdateSectionContent,
  onSaveChanges,
  isSaving = false,
}) => {
  const currentSection = protocolData
    ? {
        ...protocolData[currentSectionNumber.toString()],
        sectionNumber: currentSectionNumber, // Ensure sectionNumber is always present
      }
    : null;

  return (
    <div className="protocol-editor-layout flex h-[calc(100vh-4rem)] flex-col">
      {/* Header for Protocol Title and Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="truncate text-xl font-semibold text-gray-800 dark:text-gray-100">
          {isLoading ? "Carregando Protocolo..." : protocolTitle}
        </h2>

        <div className="flex items-center gap-3">
          {/* Validation Controls */}
          <div className="flex items-center gap-2 border-r border-gray-300 pr-3 dark:border-gray-600">
            <button
              onClick={onValidateNow}
              className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
              disabled={validationLoading}
            >
              {validationLoading ? (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <Play className="h-3 w-3" />
              )}
              Validar
            </button>

            <button
              onClick={onToggleAutoValidate}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              title={
                autoValidate
                  ? "Desabilitar validação automática"
                  : "Habilitar validação automática"
              }
            >
              {autoValidate ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
              Auto
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={async () => {
              try {
                const success = await onSaveChanges();
                if (success) {
                  toast.success("✅ Protocolo salvo com sucesso!", {
                    description:
                      "Todas as alterações foram persistidas no banco de dados.",
                  });
                } else {
                  toast.error("❌ Erro ao salvar protocolo", {
                    description:
                      "Ocorreu um erro ao salvar as alterações. Tente novamente.",
                  });
                }
              } catch (error) {
                console.error(error);
                toast.error("❌ Erro ao salvar protocolo", {
                  description: "Ocorreu um erro inesperado. Tente novamente.",
                });
              }
            }}
            className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            disabled={isLoading || isSaving}
          >
            {isSaving && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="grid flex-1 grid-cols-[280px_1fr_1fr] overflow-hidden">
        {/* Column 1: Section Navigation & Validation Report */}
        <div className="flex flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="h-1/2 border-b border-gray-200 p-2 dark:border-gray-700">
            <SectionNavigationList
              currentSectionNumber={currentSectionNumber}
              onSelectSection={onSelectSection}
            />
          </div>
          <div className="h-1/2 max-h-[500px] min-h-[350px]">
            <ValidationReportDisplay
              issues={validationIssues}
              isLoading={validationLoading}
              lastValidated={validationLastValidated}
            />
          </div>
        </div>

        {/* Column 2: Text Editor Pane */}
        <div className="flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700">
          <TextEditorPane
            currentSection={currentSection}
            onUpdateSectionContent={onUpdateSectionContent}
            _onSaveToDatabase={onSaveChanges}
            isLoading={isLoading}
          />
        </div>

        {/* Column 3: Flowchart Pane */}
        <div className="flex flex-col overflow-hidden">
          <FlowchartPane
            flowchartData={flowchartData}
            isLoading={isLoading}
            protocolTitle={protocolTitle}
          />
        </div>
      </div>
    </div>
  );
};
