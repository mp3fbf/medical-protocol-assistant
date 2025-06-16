/**
 * Improved Protocol Editor Layout - Enhanced UX/UI based on feedback
 *
 * Improvements:
 * - Wider sidebar (280px) with full text visibility
 * - Sticky section header in editor
 * - Better visual hierarchy and contrast
 * - Progress indicator with clear numbers
 * - CTA buttons for navigation
 * - Responsive sidebar collapse
 */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SectionEditorImproved } from "./section-editor-improved";
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
  ChevronRight,
  Menu,
  Eye,
  Maximize2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { trpc } from "@/lib/api/client";
import { useDynamicLoading } from "@/hooks/use-dynamic-loading";
import { UltraButton } from "@/components/ui/ultra-button";
import { UltraBadge } from "@/components/ui/ultra-badge";
import { cn } from "@/lib/utils";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export const ProtocolEditorLayoutImproved: React.FC<
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
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false); // Start in read-only mode

  useEffect(() => {
    setIsPageLoaded(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentSection = protocolData
    ? {
        ...protocolData[currentSectionNumber.toString()],
        sectionNumber: currentSectionNumber,
      }
    : null;

  const currentSectionDef = SECTION_DEFINITIONS[currentSectionNumber - 1];

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
        toast.success(`Export concluído!`);
      } else {
        toast.error(`Erro ao gerar ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error("Erro ao exportar protocolo");
      console.error("Export error:", error);
    }
  };

  const handleGenerateFlowchart = async () => {
    toast.info("Geração de fluxograma em desenvolvimento");
  };

  // Validation stats
  const _errorCount = validationIssues.filter(
    (issue) => issue.severity === "error",
  ).length;
  const _warningCount = validationIssues.filter(
    (issue) => issue.severity === "warning",
  ).length;
  const _infoCount = 0; // Info severity not supported in current validation system
  const totalIssues = validationIssues.length;

  const getSectionInfo = (sectionNumber: number) => {
    const issues = validationIssues.filter(
      (issue) => issue.sectionNumber === sectionNumber,
    );
    const hasContent =
      protocolData && protocolData[sectionNumber.toString()]?.content;
    return { issues, hasContent };
  };

  const canUserUpdateStatus = () => {
    if (userRole === UserRole.ADMIN) return true;
    if (
      userRole === UserRole.REVIEWER &&
      protocolStatus === ProtocolStatus.REVIEW
    )
      return true;
    if (
      userRole === UserRole.CREATOR &&
      isCreator &&
      protocolStatus === ProtocolStatus.DRAFT
    )
      return true;
    return false;
  };

  // Calculate progress
  const completedSections = SECTION_DEFINITIONS.filter(
    (def) =>
      protocolData && protocolData[def.sectionNumber.toString()]?.content,
  ).length;
  const totalSections = SECTION_DEFINITIONS.length;
  const progressPercentage = Math.round(
    (completedSections / totalSections) * 100,
  );

  // Navigation helpers
  const goToNextSection = () => {
    if (currentSectionNumber < totalSections) {
      onSelectSection(currentSectionNumber + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionNumber > 1) {
      onSelectSection(currentSectionNumber - 1);
    }
  };

  if (!isPageLoaded) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
        {/* Ultra Compact Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            {/* Left: Navigation and Title */}
            <div className="flex items-center gap-4">
              <Link
                href="/protocols"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm">Voltar</span>
              </Link>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={
                  sidebarCollapsed
                    ? "Abrir menu de seções"
                    : "Fechar menu de seções"
                }
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Protocol Title */}
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {protocolTitle}
                </h1>
                {flowchartData && (
                  <UltraBadge status="info" size="sm">
                    Fluxograma
                  </UltraBadge>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {completedSections}/{totalSections} seções
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {/* Center: Status */}
            <div className="flex items-center gap-4">
              {canUserUpdateStatus() && protocolStatus && (
                <StatusSelector
                  currentStatus={protocolStatus}
                  protocolId={protocolId}
                  userRole={userRole}
                  isCreator={isCreator}
                />
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Toggle Edit Mode Button */}
              <Button
                variant={isEditingMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditingMode(!isEditingMode)}
                className="gap-2"
              >
                {isEditingMode ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Editar
                  </>
                )}
              </Button>

              <UltraButton
                variant="primary"
                size="sm"
                icon={<Save className="h-4 w-4" />}
                onClick={async () => {
                  const success = await onSaveChanges();
                  if (success) {
                    setLastSaved(new Date());
                  }
                }}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary-500 to-indigo-600"
              >
                Salvar Rascunho
              </UltraButton>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

              {flowchartData ? (
                <Link href={`/protocols/${protocolId}/flowchart`}>
                  <UltraButton
                    variant="secondary"
                    size="sm"
                    icon={<Eye className="h-4 w-4" />}
                  >
                    Ver Fluxograma
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </UltraButton>
                </Link>
              ) : (
                <UltraButton
                  variant="secondary"
                  size="sm"
                  icon={<GitBranch className="h-4 w-4" />}
                  onClick={handleGenerateFlowchart}
                >
                  Gerar Fluxograma
                  <ArrowRight className="ml-1 h-4 w-4" />
                </UltraButton>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Enhanced Sidebar */}
          <div
            className={cn(
              "border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
              "overflow-hidden shadow-sm transition-all duration-300",
              sidebarCollapsed ? "w-0" : "w-80", // Increased width
              isMobile &&
                !sidebarCollapsed &&
                "absolute left-0 top-0 z-40 h-full",
            )}
          >
            <div className="h-full overflow-y-auto">
              {/* Sidebar Header */}
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Navegação do Protocolo
                  </h3>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 p-4">
                {SECTION_DEFINITIONS.map((def) => {
                  const { issues, hasContent } = getSectionInfo(
                    def.sectionNumber,
                  );
                  const isActive = currentSectionNumber === def.sectionNumber;
                  const errorCount = issues.filter(
                    (i) => i.severity === "error",
                  ).length;
                  const warningCount = issues.filter(
                    (i) => i.severity === "warning",
                  ).length;

                  return (
                    <Tooltip key={def.sectionNumber}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onSelectSection(def.sectionNumber)}
                          className={cn(
                            "w-full rounded-lg px-4 py-3 text-left transition-all duration-200",
                            "group flex items-center gap-3",
                            isActive
                              ? "bg-primary-600 text-white shadow-md"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700",
                          )}
                        >
                          {/* Progress Indicator */}
                          <div className="relative flex-shrink-0">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                                hasContent
                                  ? isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : isActive
                                    ? "bg-white/10 text-white/70"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                              )}
                            >
                              {hasContent ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                def.sectionNumber
                              )}
                            </div>
                            {issues.length > 0 && (
                              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {issues.length}
                              </div>
                            )}
                          </div>

                          {/* Section Title - No truncation */}
                          <div className="min-w-0 flex-1">
                            <h4
                              className={cn(
                                "text-sm font-medium",
                                isActive
                                  ? "text-white"
                                  : "text-gray-700 dark:text-gray-300",
                              )}
                            >
                              {def.titlePT}
                            </h4>
                            {issues.length > 0 && (
                              <div className="mt-1 flex items-center gap-2 text-xs">
                                {errorCount > 0 && (
                                  <span
                                    className={cn(
                                      "flex items-center gap-1",
                                      isActive
                                        ? "text-red-200"
                                        : "text-red-600 dark:text-red-400",
                                    )}
                                  >
                                    <AlertCircle className="h-3 w-3" />
                                    {errorCount}
                                  </span>
                                )}
                                {warningCount > 0 && (
                                  <span
                                    className={cn(
                                      "flex items-center gap-1",
                                      isActive
                                        ? "text-amber-200"
                                        : "text-amber-600 dark:text-amber-400",
                                    )}
                                  >
                                    <Info className="h-3 w-3" />
                                    {warningCount}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Active Indicator */}
                          {isActive && (
                            <ChevronRight className="h-5 w-5 flex-shrink-0 text-white" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{def.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile sidebar overlay */}
          {isMobile && !sidebarCollapsed && (
            <div
              className="fixed inset-0 z-30 bg-black/50"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Main Editor Area */}
          <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Sticky Section Header */}
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary-600">
                      {currentSectionNumber}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentSectionDef?.titlePT}
                    </h2>
                  </div>
                  {currentSection?.content && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousSection}
                    disabled={currentSectionNumber === 1}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={goToNextSection}
                    disabled={currentSectionNumber === totalSections}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Próxima
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-5xl p-8">
                {currentSection && (
                  <SectionEditorImproved
                    key={`section-${currentSectionNumber}`}
                    section={currentSection}
                    sectionDefinition={currentSectionDef || null}
                    isEditing={isEditingMode}
                    onContentChange={(newContent) =>
                      onUpdateSectionContent(currentSectionNumber, newContent)
                    }
                    lastSaved={lastSaved}
                  />
                )}
              </div>
            </div>

            {/* Fixed CTA Footer */}
            <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Seção {currentSectionNumber} de {totalSections}
                </div>

                <div className="flex items-center gap-4">
                  {/* Export buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("pdf")}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("docx")}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      DOCX
                    </Button>
                  </div>

                  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

                  {/* Main CTA */}
                  {currentSectionNumber === totalSections ? (
                    <Button
                      variant="default"
                      size="default"
                      onClick={() =>
                        toast.info("Protocolo completo! Revise e finalize.")
                      }
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Finalizar Protocolo
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="default"
                      onClick={goToNextSection}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      Continuar para Próxima Seção
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
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
    </TooltipProvider>
  );
};
