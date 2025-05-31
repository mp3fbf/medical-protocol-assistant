/**
 * Ultra Text Editor Pane - Clean and modern design
 */
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ProtocolSectionData } from "@/types/protocol";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Sparkles,
  Save,
  Eye,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
} from "lucide-react";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { SectionEditorUltra } from "./section-editor-ultra";

interface TextEditorPaneProps {
  currentSection: ProtocolSectionData | null | undefined;
  onUpdateSectionContent: (
    sectionNumber: number,
    newContent: ProtocolSectionData["content"],
  ) => void;
  _onSaveToDatabase?: () => Promise<boolean>;
  isLoading?: boolean;
}

export const TextEditorPaneUltra: React.FC<TextEditorPaneProps> = ({
  currentSection,
  onUpdateSectionContent,
  _onSaveToDatabase,
  isLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationStatus, setValidationStatus] = useState<
    "valid" | "warning" | "error" | null
  >(null);

  const [localContent, setLocalContent] = useState<any>(null);
  const lastSectionNumberRef = useRef<number | null>(null);

  const sectionDefinition = currentSection
    ? SECTION_DEFINITIONS.find(
        (def) => def.sectionNumber === currentSection.sectionNumber,
      )
    : null;

  useEffect(() => {
    if (!currentSection) return;

    const currentSectionNumber = currentSection.sectionNumber;
    const lastSectionNumber = lastSectionNumberRef.current;

    if (lastSectionNumber !== currentSectionNumber) {
      setLocalContent(currentSection.content);
      setIsDirty(false);
      setValidationStatus(null);
    }

    lastSectionNumberRef.current = currentSectionNumber;
  }, [currentSection]);

  const handleSave = useCallback(async () => {
    if (!currentSection || localContent === null) return;

    try {
      onUpdateSectionContent(currentSection.sectionNumber, localContent);
      setIsDirty(false);
      setLastSaved(new Date());
      setValidationStatus("valid");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setValidationStatus("error");
    }
  }, [currentSection, localContent, onUpdateSectionContent]);

  const handleGenerateWithAI = async () => {
    if (!currentSection || !sectionDefinition) return;

    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      let generatedContent;
      if (sectionDefinition.sectionNumber === 1) {
        generatedContent = {
          codigoProtocolo: `PROT-${Date.now().toString().slice(-6)}`,
          tituloCompleto: currentSection.title || "Protocolo Médico",
          versao: "1.0",
          origemOrganizacao: "Prevent Senior",
          dataElaboracao: new Date().toISOString().split("T")[0],
          dataUltimaRevisao: new Date().toISOString().split("T")[0],
          dataProximaRevisao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          ambitoAplicacao: "Unidades de emergência da rede",
        };
      } else {
        generatedContent = `Conteúdo gerado pela IA para ${sectionDefinition.titlePT}.\n\nEste é um exemplo de conteúdo estruturado baseado em evidências médicas e diretrizes atuais.`;
      }

      setLocalContent(generatedContent);
      setIsDirty(true);
      setValidationStatus("valid");
    } catch (_error) {
      setValidationStatus("error");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing && isDirty) {
      handleSave();
    }
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando seção...
          </p>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <Edit3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Selecione uma Seção
          </h3>
          <p className="max-w-sm text-gray-600 dark:text-gray-400">
            Escolha uma das 13 seções do protocolo para começar a editar.
          </p>
        </div>
      </div>
    );
  }

  // Extract metadata if available (for Section 1)
  const metadata =
    currentSection.sectionNumber === 1 &&
    typeof localContent === "object" &&
    localContent !== null
      ? localContent
      : null;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      {/* Clean Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        {/* Section Title and Actions */}
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {currentSection.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Seção {currentSection.sectionNumber} •{" "}
                {sectionDefinition?.description}
              </p>
            </div>

            <div className="ml-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
                className={cn(
                  "gap-2 transition-all",
                  isGenerating && "animate-pulse",
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar com IA
                  </>
                )}
              </Button>

              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={toggleEditMode}
                className="gap-2"
              >
                {isEditing ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Metadata Display for Section 1 */}
          {metadata && (
            <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Código
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {metadata.codigoProtocolo || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Última Revisão
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {metadata.dataUltimaRevisao || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Próxima Revisão
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {metadata.dataProximaRevisao || "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Clean Status Bar */}
        <div className="flex items-center justify-between bg-gray-50 px-6 py-2 text-xs dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            {/* Edit Status */}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  isDirty ? "animate-pulse bg-amber-500" : "bg-green-500",
                )}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {isDirty ? "Editando" : "Salvo"}
              </span>
            </div>

            {/* Last Saved */}
            {lastSaved && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                {lastSaved.toLocaleTimeString("pt-BR")}
              </div>
            )}

            {/* Validation Status */}
            {validationStatus && (
              <div className="flex items-center gap-1.5">
                {validationStatus === "valid" && (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">
                      Válido
                    </span>
                  </>
                )}
                {validationStatus === "warning" && (
                  <>
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Atenção
                    </span>
                  </>
                )}
                {validationStatus === "error" && (
                  <>
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">Erro</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isDirty && (
              <>
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Database className="h-3 w-3" />
                  Use &quot;Salvar Alterações&quot; no topo para persistir
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="h-7 px-3 text-xs font-medium"
                >
                  <Save className="mr-1.5 h-3 w-3" />
                  Aplicar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isGenerating && (
            <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando conteúdo baseado em evidências médicas...
                </div>
              </AlertDescription>
            </Alert>
          )}

          <SectionEditorUltra
            section={{
              sectionNumber: currentSection.sectionNumber,
              title: currentSection.title,
              content: localContent ?? currentSection.content ?? "",
            }}
            sectionDefinition={sectionDefinition}
            isEditing={isEditing}
            onContentChange={(newContent) => {
              setLocalContent(newContent);
              setIsDirty(true);
              setValidationStatus(null);
            }}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
