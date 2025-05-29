/**
 * VERSÃO CORRIGIDA - Enhanced pane for editing protocol sections with PROPER ISOLATION
 */
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ProtocolSectionData } from "@/types/protocol";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Sparkles,
  Save,
  Eye,
  Edit3,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { SectionEditor } from "./section-editor";

interface TextEditorPaneProps {
  currentSection: ProtocolSectionData | null | undefined;
  onUpdateSectionContent: (
    sectionNumber: number,
    newContent: ProtocolSectionData["content"],
  ) => void;
  _onSaveToDatabase?: () => Promise<boolean>;
  isLoading?: boolean;
}

export const TextEditorPane: React.FC<TextEditorPaneProps> = ({
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

  // CORREÇÃO CRÍTICA: Armazenar conteúdo editado localmente
  const [localContent, setLocalContent] = useState<any>(null);
  const lastSectionNumberRef = useRef<number | null>(null);

  // Get section definition for AI assistance
  const sectionDefinition = currentSection
    ? SECTION_DEFINITIONS.find(
        (def) => def.sectionNumber === currentSection.sectionNumber,
      )
    : null;

  // CORREÇÃO: Resetar conteúdo local quando mudar de seção
  useEffect(() => {
    if (!currentSection) return;

    const currentSectionNumber = currentSection.sectionNumber;
    const lastSectionNumber = lastSectionNumberRef.current;

    // Se mudou de seção OU é primeira carga
    if (lastSectionNumber !== currentSectionNumber) {
      console.log(
        "[FIXED] Seção mudou de",
        lastSectionNumber,
        "para",
        currentSectionNumber,
      );
      console.log("[FIXED] Resetando conteúdo local para o original");

      // IMPORTANTE: Resetar para o conteúdo original da nova seção
      setLocalContent(currentSection.content);
      setIsDirty(false);
      setValidationStatus(null);
    }

    lastSectionNumberRef.current = currentSectionNumber;
  }, [currentSection]); // Watch the entire section object for changes

  const handleSave = useCallback(async () => {
    if (!currentSection || localContent === null) {
      console.log("[FIXED] Nada para salvar");
      return;
    }

    try {
      console.log("[FIXED] Salvando conteúdo local para estado principal");

      // Salvar no estado principal
      onUpdateSectionContent(currentSection.sectionNumber, localContent);

      // Marcar como salvo
      setIsDirty(false);
      setLastSaved(new Date());
      setValidationStatus("valid");

      console.log("[FIXED] Conteúdo salvo com sucesso");
    } catch (error) {
      console.error("[FIXED] Erro ao salvar:", error);
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
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-500">Carregando seção...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Edit3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              Selecione uma Seção
            </h3>
            <p className="max-w-sm text-gray-500">
              Escolha uma das 13 seções do protocolo na navegação à esquerda
              para começar a editar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header with Section Info and Actions */}
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Seção {currentSection.sectionNumber}: {currentSection.title}
            </h3>
            {sectionDefinition && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {sectionDefinition.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {validationStatus && (
              <div className="flex items-center">
                {validationStatus === "valid" && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {validationStatus === "warning" && (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                {validationStatus === "error" && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>

            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={toggleEditMode}
            >
              {isEditing ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {isDirty && (
              <span className="flex items-center">
                <div className="mr-1 h-2 w-2 rounded-full bg-orange-400" />
                Editando...
              </span>
            )}
            {lastSaved && (
              <span>Atualizado {lastSaved.toLocaleTimeString("pt-BR")}</span>
            )}
            <span className="text-xs text-blue-600">
              💾 Use &quot;Salvar Alterações&quot; no topo para persistir no
              banco
            </span>
          </div>

          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-6 px-2 text-xs"
              disabled={!currentSection || !isDirty}
            >
              <Save className="mr-1 h-3 w-3" />
              Aplicar
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isGenerating && (
            <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-900/30">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando conteúdo baseado em evidências médicas...
                </div>
              </AlertDescription>
            </Alert>
          )}

          {currentSection ? (
            <div>
              <div className="mb-2 border border-yellow-200 bg-yellow-50 p-2 text-xs">
                <strong>🔧 VERSÃO CORRIGIDA:</strong> S
                {currentSection.sectionNumber} | Editing:{" "}
                {isEditing ? "✅" : "❌"} | Dirty: {isDirty ? "🔴" : "⚪"} |
                Local: {localContent !== null ? "✅" : "❌"}
              </div>
              <SectionEditor
                section={{
                  sectionNumber: currentSection.sectionNumber,
                  title: currentSection.title,
                  // CORREÇÃO: Sempre usar conteúdo local
                  content: localContent ?? currentSection.content ?? "",
                }}
                sectionDefinition={sectionDefinition}
                isEditing={isEditing}
                onContentChange={(newContent) => {
                  console.log(
                    "[FIXED] Conteúdo mudou, atualizando LOCAL apenas",
                  );
                  setLocalContent(newContent);
                  setIsDirty(true);
                  setValidationStatus(null);
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Nenhuma seção selecionada</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
