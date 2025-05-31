/**
 * Main layout component for the protocol editor interface - ULTRA DESIGN V2.
 * Redesigned for maximum information density and modern UI/UX.
 */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TextEditorPaneUltra } from "./text-editor-pane-ultra";
import { ValidationReportDisplayUltra } from "./validation-report-display-ultra";
import type {
  ProtocolSectionData,
  ProtocolFullContent,
} from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart";
import type { ValidationIssue } from "@/types/validation";
import { ProtocolStatus, UserRole } from "@prisma/client";
import { StatusSelector } from "../status-selector";
import { toast } from "sonner";
import {
  FileText,
  GitBranch,
  Download,
  Save,
  ShieldCheck,
  ChevronLeft,
  Menu,
  Eye,
  Maximize2,
  ArrowRight,
} from "lucide-react";
import { trpc } from "@/lib/api/client";
import { useDynamicLoading } from "@/hooks/use-dynamic-loading";
import { UltraButton } from "@/components/ui/ultra-button";
import { UltraBadge } from "@/components/ui/ultra-badge";
import { cn } from "@/lib/utils";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface ProtocolEditorLayoutProps {
  protocolId: string;
  protocolTitle: string;
  protocolData: ProtocolFullContent | null;
  flowchartData: FlowchartDefinition | null;
  currentSectionNumber: number;
  validationIssues: ValidationIssue[];
  validationLoading?: boolean;
  _validationLastValidated?: Date | null;
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

export const ProtocolEditorLayoutUltraV2: React.FC<
  ProtocolEditorLayoutProps
> = ({
  protocolId,
  protocolTitle,
  protocolData,
  flowchartData,
  currentSectionNumber,
  validationIssues,
  validationLoading: _validationLoading = false,
  _validationLastValidated,
  autoValidate: _autoValidate = true,
  isLoading,
  currentVersionId,
  onSelectSection,
  onToggleAutoValidate: _onToggleAutoValidate,
  onValidateNow: _onValidateNow,
  onUpdateSectionContent,
  onSaveChanges,
  isSaving = false,
  protocolStatus,
  userRole = UserRole.CREATOR,
  isCreator = false,
}) => {
  const exportMutation = trpc.export.exportProtocol.useMutation();
  // const flowchartMutation = trpc.flowchart.generateAndSave.useMutation();
  // const utils = trpc.useUtils();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const _flowchartLoading = useDynamicLoading([
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
        sectionNumber: currentSectionNumber,
      }
    : null;

  const handleExport = async (format: "pdf" | "docx") => {
    try {
      toast.loading(`Gerando arquivo ${format.toUpperCase()}...`);
      const result = await exportMutation.mutateAsync({
        protocolId,
        versionId: currentVersionId || "",
        format,
      });

      if (result.url) {
        window.open(result.url, "_blank");
        toast.success(`${format.toUpperCase()} gerado com sucesso!`);
      } else {
        toast.error(`Erro ao gerar ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error("Erro ao exportar protocolo");
      console.error("Export error:", error);
    }
  };

  const handleGenerateFlowchart = async () => {
    // TODO: Fix flowchart generation with correct params
    toast.info("Geração de fluxograma em desenvolvimento");
  };

  // Validation stats
  const _errorCount = validationIssues.filter(
    (issue) => issue.severity === "error",
  ).length;
  const _warningCount = validationIssues.filter(
    (issue) => issue.severity === "warning",
  ).length;
  const totalIssues = validationIssues.length;

  // Get section info
  const getSectionInfo = (sectionNumber: number) => {
    const section = protocolData?.[sectionNumber.toString()];
    const issues = validationIssues.filter(
      (issue) => issue.sectionNumber === sectionNumber,
    );
    const def = SECTION_DEFINITIONS.find(
      (d) => d.sectionNumber === sectionNumber,
    );
    const hasContent =
      section?.content &&
      (typeof section.content === "string"
        ? section.content.trim()
        : Object.keys(section.content).length > 0);

    return { section, issues, def, hasContent };
  };

  const currentSectionDef = SECTION_DEFINITIONS.find(
    (d) => d.sectionNumber === currentSectionNumber,
  );

  return (
    <div className="protocol-editor-layout relative flex h-[calc(100vh-4rem)] flex-col bg-gray-50 dark:bg-gray-900">
      {/* Ultra Header Bar */}
      <div
        className={cn(
          "relative z-20 border-b border-gray-200 dark:border-gray-700",
          "bg-white/90 shadow-sm backdrop-blur-xl dark:bg-gray-800/90",
          "transition-all duration-700",
          isPageLoaded
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0",
        )}
      >
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Protocol info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 p-2 shadow-lg shadow-primary-500/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isLoading ? "Carregando..." : protocolTitle}
                  </h1>
                  <UltraBadge
                    status="success"
                    size="sm"
                    animate={false}
                    glow={false}
                  >
                    v1.0
                  </UltraBadge>
                  {flowchartData && (
                    <UltraBadge
                      status="info"
                      size="sm"
                      animate={false}
                      glow={false}
                    >
                      <GitBranch className="mr-1 h-3 w-3" />
                      Fluxograma
                    </UltraBadge>
                  )}
                  {protocolStatus && !isLoading && (
                    <StatusSelector
                      protocolId={protocolId}
                      currentStatus={protocolStatus}
                      userRole={userRole}
                      isCreator={isCreator}
                    />
                  )}
                </div>
                {/* Breadcrumb Navigation */}
                <div className="mt-1">
                  <Breadcrumb
                    items={[
                      { label: "Protocolos", href: "/protocols" },
                      {
                        label: protocolTitle || "Carregando...",
                        href: `/protocols/${protocolId}`,
                      },
                      {
                        label: currentSectionDef
                          ? `Seção ${currentSectionNumber}: ${currentSectionDef.titlePT}`
                          : "Editor",
                        current: true,
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/protocols/${protocolId}/flowchart`}>
                <UltraButton
                  variant={flowchartData ? "ghost" : "secondary"}
                  size="sm"
                  icon={<Maximize2 className="h-4 w-4" />}
                  className={cn(!flowchartData && "border-dashed")}
                >
                  {flowchartData ? "Ver Fluxograma" : "Fluxograma Não Gerado"}
                </UltraButton>
              </Link>

              <button
                onClick={() => setShowValidation(!showValidation)}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  showValidation && totalIssues > 0
                    ? "bg-red-100 text-red-700"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                {totalIssues > 0 ? `${totalIssues} problemas` : "Validação"}
              </button>

              <div className="h-6 w-px bg-gray-200" />

              <UltraButton
                variant="ghost"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={() => handleExport("pdf")}
              >
                Exportar
              </UltraButton>
            </div>
          </div>
        </div>

        {/* Context Toolbar */}
        <div className="border-b border-gray-200 px-6 pb-3 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {/* Left: Section Context */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Seção {currentSectionNumber}: {currentSectionDef?.titlePT}
                </h3>
              </div>
              <div
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  currentSection?.content
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {currentSection?.content ? "Em edição" : "Não iniciado"}
              </div>
            </div>

            {/* Center: Progress Dots */}
            <div className="flex items-center gap-1">
              {SECTION_DEFINITIONS.map((def) => {
                const { hasContent } = getSectionInfo(def.sectionNumber);
                const isActive = currentSectionNumber === def.sectionNumber;

                return (
                  <button
                    key={def.sectionNumber}
                    onClick={() => onSelectSection(def.sectionNumber)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-300",
                      isActive
                        ? "w-6 bg-primary-600"
                        : hasContent
                          ? "bg-emerald-500"
                          : "bg-gray-300",
                    )}
                    title={def.titlePT}
                  />
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <UltraButton
                variant="ghost"
                size="sm"
                icon={<Save className="h-4 w-4" />}
                onClick={onSaveChanges}
                disabled={isSaving}
              >
                Salvar Rascunho
              </UltraButton>

              <div className="h-6 w-px bg-gray-200" />

              {flowchartData ? (
                <Link href={`/protocols/${protocolId}/flowchart`}>
                  <UltraButton
                    variant="primary"
                    size="sm"
                    icon={<Eye className="h-4 w-4" />}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600"
                  >
                    Ver Fluxograma
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </UltraButton>
                </Link>
              ) : (
                <UltraButton
                  variant="primary"
                  size="sm"
                  icon={<GitBranch className="h-4 w-4" />}
                  onClick={handleGenerateFlowchart}
                  className="bg-gradient-to-r from-primary-500 to-indigo-600"
                >
                  Gerar Fluxograma
                  <ArrowRight className="ml-1 h-4 w-4" />
                </UltraButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar with Section Details */}
        <div
          className={cn(
            "border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
            "overflow-hidden transition-all duration-300",
            sidebarCollapsed ? "w-0" : "w-72",
          )}
        >
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seções
              </h3>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="rounded-lg p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              {SECTION_DEFINITIONS.map((def) => {
                const { issues, hasContent } = getSectionInfo(
                  def.sectionNumber,
                );
                const isActive = currentSectionNumber === def.sectionNumber;

                return (
                  <button
                    key={def.sectionNumber}
                    onClick={() => onSelectSection(def.sectionNumber)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                      "group flex items-center gap-3",
                      isActive
                        ? "bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-100"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    {/* Progress Indicator */}
                    <div className="relative">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                          hasContent
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                        )}
                      >
                        {hasContent ? "✓" : def.sectionNumber}
                      </div>
                      {issues.length > 0 && (
                        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
                      )}
                    </div>

                    {/* Section Title */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className={cn(
                          "truncate text-sm font-medium",
                          isActive
                            ? "text-primary-900 dark:text-primary-100"
                            : "text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100",
                        )}
                      >
                        {def.titlePT}
                      </h4>
                      {isActive && issues.length > 0 && (
                        <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                          {issues.length}{" "}
                          {issues.length === 1 ? "problema" : "problemas"}
                        </p>
                      )}
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="h-6 w-1 rounded-full bg-primary-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4">
            {/* Text Editor */}
            <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              {currentSection && (
                <TextEditorPaneUltra
                  currentSection={currentSection}
                  onUpdateSectionContent={onUpdateSectionContent}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>

          {/* Validation Report - Ultra Compact */}
          {showValidation && totalIssues > 0 && (
            <div
              className={cn(
                "border-t border-gray-200 dark:border-gray-700",
                "shadow-lg transition-all duration-300",
                "max-h-32 overflow-hidden",
              )}
            >
              <ValidationReportDisplayUltra
                issues={validationIssues}
                isCompact={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
