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
import { ProtocolStatus, UserRole } from "@prisma/client";
import { StatusSelector } from "../status-selector";
import { toast } from "sonner";
import {
  Play,
  ToggleLeft,
  ToggleRight,
  FileText,
  FileType,
  GitBranch,
} from "lucide-react";
import { trpc } from "@/lib/api/client";
import { useDynamicLoading } from "@/hooks/use-dynamic-loading";

interface ProtocolEditorLayoutProps {
  protocolId: string;
  protocolTitle: string;
  protocolData: ProtocolFullContent | null;
  flowchartData: FlowchartDefinition | null;
  currentSectionNumber: number;
  validationIssues: ValidationIssue[]; // Use the specific type
  validationLoading?: boolean;
  validationLastValidated?: Date | null;
  autoValidate?: boolean;
  isLoading: boolean;
  currentVersionId?: string;
  onSelectSection: (sectionNumber: number) => void;
  onToggleAutoValidate?: () => void;
  onValidateNow?: () => void;
  onUpdateSectionContent: (
    sectionNumber: number,
    newContent: ProtocolSectionData["content"],
  ) => void;
  onSaveChanges: () => Promise<boolean>;
  isSaving?: boolean;
  protocolStatus?: ProtocolStatus;
  userRole?: UserRole;
  isCreator?: boolean;
}

export const ProtocolEditorLayout: React.FC<ProtocolEditorLayoutProps> = ({
  protocolId,
  protocolTitle,
  protocolData,
  flowchartData,
  currentSectionNumber,
  validationIssues,
  validationLoading = false,
  validationLastValidated,
  autoValidate = true,
  isLoading,
  currentVersionId,
  onSelectSection,
  onToggleAutoValidate,
  onValidateNow,
  onUpdateSectionContent,
  onSaveChanges,
  isSaving = false,
  protocolStatus,
  userRole = UserRole.CREATOR,
  isCreator = false,
}) => {
  const exportMutation = trpc.export.exportProtocol.useMutation();
  const flowchartMutation = trpc.flowchart.generateAndSave.useMutation();
  const utils = trpc.useUtils();

  const flowchartLoading = useDynamicLoading([
    { message: "🧠 Analisando estrutura do protocolo...", duration: 2000 },
    {
      message: "🔍 Identificando pontos de decisão críticos...",
      duration: 2500,
    },
    { message: "💊 Mapeando medicamentos e dosagens...", duration: 2000 },
    { message: "🔗 Conectando fluxos de atendimento...", duration: 2500 },
    { message: "✨ Aplicando inteligência médica...", duration: 2000 },
    { message: "🎨 Otimizando layout visual...", duration: 1500 },
  ]);

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
        <div className="flex items-center gap-4">
          <h2 className="truncate text-xl font-semibold text-gray-800 dark:text-gray-100">
            {isLoading ? "Carregando Protocolo..." : protocolTitle}
          </h2>

          {/* Status Selector */}
          {protocolStatus && !isLoading && (
            <StatusSelector
              protocolId={protocolId}
              currentStatus={protocolStatus}
              userRole={userRole}
              isCreator={isCreator}
            />
          )}
        </div>

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

          {/* Export Buttons */}
          <div className="flex items-center gap-2 border-l border-gray-300 pl-3 dark:border-gray-600">
            <button
              onClick={async () => {
                const toastId = toast.loading("Gerando PDF...");
                try {
                  const result = await exportMutation.mutateAsync({
                    protocolId,
                    versionId: currentVersionId || "",
                    format: "pdf",
                  });

                  if (result.url) {
                    window.open(result.url, "_blank");
                    toast.success("PDF gerado com sucesso!", { id: toastId });
                  }
                } catch (error) {
                  console.error("Export error:", error);
                  toast.error("Erro ao gerar PDF", { id: toastId });
                }
              }}
              className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              disabled={isLoading || !currentVersionId}
              title="Exportar como PDF"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>

            <button
              onClick={async () => {
                const toastId = toast.loading("Gerando DOCX...");
                try {
                  const result = await exportMutation.mutateAsync({
                    protocolId,
                    versionId: currentVersionId || "",
                    format: "docx",
                  });

                  if (result.url) {
                    window.open(result.url, "_blank");
                    toast.success("DOCX gerado com sucesso!", { id: toastId });
                  }
                } catch (error) {
                  console.error("Export error:", error);
                  toast.error("Erro ao gerar DOCX", { id: toastId });
                }
              }}
              className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              disabled={isLoading || !currentVersionId}
              title="Exportar como Word"
            >
              <FileType className="h-4 w-4" />
              DOCX
            </button>
          </div>

          {/* Generate Flowchart Button */}
          <div className="flex items-center gap-2 border-l border-gray-300 pl-3 dark:border-gray-600">
            <button
              onClick={async () => {
                if (!protocolData) return;

                flowchartLoading.start();
                try {
                  const sectionOneContent = protocolData["1"]?.content;
                  const condition =
                    typeof sectionOneContent === "string"
                      ? sectionOneContent
                      : protocolTitle;

                  const result = await flowchartMutation.mutateAsync({
                    protocolId,
                    condition,
                    content: protocolData,
                    options: {
                      mode: "smart",
                      includeLayout: true,
                      includeMedications: true,
                    },
                  });

                  if (result) {
                    // Invalidate the protocol query to refresh the flowchart data
                    await utils.protocol.getById.invalidate({ protocolId });
                    flowchartLoading.stop(
                      true,
                      "Fluxograma gerado com sucesso! 🎉",
                    );
                  }
                } catch (error) {
                  console.error("Flowchart generation error:", error);
                  flowchartLoading.stop(false, "Erro ao gerar fluxograma");
                }
              }}
              className="flex items-center gap-1 rounded-md bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
              disabled={
                isLoading || !protocolData || flowchartMutation.isPending
              }
              title="Gerar Fluxograma Inteligente"
            >
              <GitBranch className="h-4 w-4" />
              {flowchartMutation.isPending ? "Gerando..." : "Gerar Fluxograma"}
            </button>
          </div>
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
