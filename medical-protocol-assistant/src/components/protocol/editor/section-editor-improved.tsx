/**
 * Improved Section Editor Component - Enhanced UX/UI
 *
 * Improvements:
 * - Typography: 16px body text with 1.5 line-height
 * - Visual hierarchy with styled h3 subtitles
 * - Content width limited to 720px
 * - Better list formatting with proper indentation
 * - Modular vertical spacing (8, 16, 24, 32px)
 * - Save indicator with timestamp
 * - Differentiated primary/secondary buttons
 */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ProtocolSectionData } from "@/types/protocol";
import type { StandardSectionDefinition } from "@/types/ai-generation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  User,
  Building,
  Stethoscope,
  Plus,
  Trash2,
  Calendar,
  Hash,
  FileText,
  CheckCircle,
} from "lucide-react";
import { ensureHtml, isHtml } from "@/lib/utils/html-converter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  formatProtocolContent,
  formatSection3Content,
} from "@/lib/utils/content-formatter";
import {
  parseAndFormatProtocolText,
  cleanHtmlFromText,
} from "@/lib/utils/protocol-text-formatter";
import { parseMedicalProtocolContent } from "@/lib/utils/medical-content-parser";
import { simpleFormatProtocolContent } from "@/lib/utils/simple-formatter";

interface SectionEditorProps {
  section: ProtocolSectionData;
  sectionDefinition?: StandardSectionDefinition | null;
  isEditing: boolean;
  onContentChange: (newContent: ProtocolSectionData["content"]) => void;
  lastSaved?: Date | null;
}

export const SectionEditorImproved: React.FC<SectionEditorProps> = ({
  section,
  sectionDefinition,
  isEditing,
  onContentChange,
  lastSaved,
}) => {
  const [localContent, setLocalContent] = useState(section.content);
  const isUserEditingRef = useRef(false);

  // Quick debug log
  console.log(
    `[SectionEditor] Section ${section.sectionNumber}, isEditing: ${isEditing}`,
  );

  useEffect(() => {
    setLocalContent(section.content);
    isUserEditingRef.current = false;
  }, [section.sectionNumber, section.content]);

  const immediateOnContentChange = useCallback(
    (newContent: any) => {
      onContentChange(newContent);
    },
    [onContentChange],
  );

  const handleContentUpdate = (newContent: any) => {
    isUserEditingRef.current = true;
    setLocalContent(newContent);
    immediateOnContentChange(newContent);
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 100);
  };

  // Enhanced styles for better typography and hierarchy
  const contentStyles = cn(
    "prose prose-gray dark:prose-invert",
    "max-w-[720px] mx-auto", // Limited width for better readability
    "prose-base", // 16px base font size
    "prose-p:text-base prose-p:leading-relaxed", // 16px paragraphs with 1.5 line-height
    "prose-headings:font-semibold",
    "prose-h3:text-xl prose-h3:text-gray-800 dark:prose-h3:text-gray-200 prose-h3:mb-4 prose-h3:mt-8", // Larger h3
    "prose-h4:text-lg prose-h4:text-gray-700 dark:prose-h4:text-gray-300 prose-h4:mb-3 prose-h4:mt-6", // h4 for sub-sections
    "prose-strong:text-gray-900 dark:prose-strong:text-gray-100", // Bold text emphasis
    "prose-ul:pl-6 prose-ul:space-y-2", // Primary list indentation
    "prose-ol:pl-6 prose-ol:space-y-2",
    "prose-li:text-base prose-li:leading-relaxed",
    // Nested list styles
    "prose-ul>li>ul:pl-6 prose-ul>li>ul:mt-2", // Secondary indentation
    "prose-ol>li>ol:pl-6 prose-ol>li>ol:mt-2",
    "prose-ul>li>ul>li:text-[15px]", // Slightly smaller nested items
    "prose-ol>li>ol>li:text-[15px]",
    // Better spacing
    "[&>*+*]:mt-6", // More space between top-level elements
    "[&>p+p]:mt-4", // Consistent paragraph spacing
  );

  // Section card styles with enhanced spacing
  const cardStyles = cn(
    "rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
    "p-8", // Increased padding
    "shadow-sm",
  );

  // Enhanced input styles
  const inputStyles = cn(
    "text-base", // 16px text
    "h-11", // Slightly taller inputs
  );

  // Enhanced label styles
  const labelStyles = cn(
    "text-sm font-medium",
    "text-gray-700 dark:text-gray-300",
    "mb-2", // More space below labels
  );

  // Section 1: Metadata Editor - Enhanced
  const renderMetadataEditor = () => {
    const metadata =
      typeof localContent === "object" && localContent !== null
        ? (localContent as Record<string, any>)
        : {};

    return (
      <div className="mx-auto max-w-[720px] space-y-8">
        {/* Protocol Identification */}
        <div className={cardStyles}>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 p-2.5">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Identificação do Protocolo
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="codigoProtocolo" className={labelStyles}>
                Código do Protocolo
              </Label>
              <Input
                id="codigoProtocolo"
                value={metadata.codigoProtocolo || ""}
                onChange={(e) =>
                  handleContentUpdate({
                    ...metadata,
                    codigoProtocolo: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="Ex: BRAD-001"
                className={inputStyles}
              />
            </div>
            <div>
              <Label htmlFor="versao" className={labelStyles}>
                Versão
              </Label>
              <Input
                id="versao"
                value={metadata.versao || ""}
                onChange={(e) =>
                  handleContentUpdate({
                    ...metadata,
                    versao: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="Ex: 1.0"
                className={inputStyles}
              />
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="tituloCompleto" className={labelStyles}>
              Título Completo
            </Label>
            <Input
              id="tituloCompleto"
              value={metadata.tituloCompleto || ""}
              onChange={(e) =>
                handleContentUpdate({
                  ...metadata,
                  tituloCompleto: e.target.value,
                })
              }
              disabled={!isEditing}
              placeholder="Ex: Protocolo de Atendimento à Bradiarritmia"
              className={inputStyles}
            />
          </div>
        </div>

        {/* Organization & Dates */}
        <div className={cardStyles}>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Organização e Datas
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="origemOrganizacao" className={labelStyles}>
                Origem/Organização
              </Label>
              <Input
                id="origemOrganizacao"
                value={metadata.origemOrganizacao || ""}
                onChange={(e) =>
                  handleContentUpdate({
                    ...metadata,
                    origemOrganizacao: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="Ex: Sancta Maggiore / Prevent Senior"
                className={inputStyles}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <Label htmlFor="dataElaboracao" className={labelStyles}>
                  Data de Elaboração
                </Label>
                <Input
                  id="dataElaboracao"
                  type="date"
                  value={metadata.dataElaboracao || ""}
                  onChange={(e) =>
                    handleContentUpdate({
                      ...metadata,
                      dataElaboracao: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className={inputStyles}
                />
              </div>
              <div>
                <Label htmlFor="dataUltimaRevisao" className={labelStyles}>
                  Última Revisão
                </Label>
                <Input
                  id="dataUltimaRevisao"
                  type="date"
                  value={metadata.dataUltimaRevisao || ""}
                  onChange={(e) =>
                    handleContentUpdate({
                      ...metadata,
                      dataUltimaRevisao: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className={inputStyles}
                />
              </div>
              <div>
                <Label htmlFor="dataProximaRevisao" className={labelStyles}>
                  Próxima Revisão
                </Label>
                <Input
                  id="dataProximaRevisao"
                  type="date"
                  value={metadata.dataProximaRevisao || ""}
                  onChange={(e) =>
                    handleContentUpdate({
                      ...metadata,
                      dataProximaRevisao: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className={inputStyles}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ambitoAplicacao" className={labelStyles}>
                Âmbito de Aplicação
              </Label>
              <Textarea
                id="ambitoAplicacao"
                value={metadata.ambitoAplicacao || ""}
                onChange={(e) =>
                  handleContentUpdate({
                    ...metadata,
                    ambitoAplicacao: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="Ex: Pronto-atendimentos da rede Sancta Maggiore/Prevent Senior"
                rows={3}
                className={cn(inputStyles, "resize-none leading-relaxed")}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section 2: Technical Record Editor - Enhanced
  const renderTechnicalRecordEditor = () => {
    const data =
      typeof localContent === "object" && localContent !== null
        ? (localContent as Record<string, any>)
        : {};
    const autores = Array.isArray(data.autores) ? data.autores : [""];
    const revisores = Array.isArray(data.revisores)
      ? data.revisores
      : [{ nome: "", especialidade: "" }];
    const aprovadores = Array.isArray(data.aprovadores)
      ? data.aprovadores
      : [{ nome: "", cargo: "" }];

    const updateAuthors = (newAuthors: string[]) => {
      handleContentUpdate({ ...data, autores: newAuthors });
    };

    const updateReviewers = (
      newReviewers: Array<{ nome: string; especialidade: string }>,
    ) => {
      handleContentUpdate({ ...data, revisores: newReviewers });
    };

    const updateApprovers = (
      newApprovers: Array<{ nome: string; cargo: string }>,
    ) => {
      handleContentUpdate({ ...data, aprovadores: newApprovers });
    };

    return (
      <div className="mx-auto max-w-[720px] space-y-8">
        {/* Authors */}
        <div className={cardStyles}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 p-2.5">
                <User className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Autores
              </h3>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateAuthors([...autores, ""])}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {autores.map((autor: string, index: number) => (
              <div key={index} className="flex gap-3">
                <Input
                  value={autor}
                  onChange={(e) => {
                    const newAuthors = [...autores];
                    newAuthors[index] = e.target.value;
                    updateAuthors(newAuthors);
                  }}
                  disabled={!isEditing}
                  placeholder="Nome completo do autor"
                  className={cn(inputStyles, "flex-1")}
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const newAuthors = autores.filter(
                        (_: any, i: number) => i !== index,
                      );
                      updateAuthors(newAuthors);
                    }}
                    className="rounded-lg p-2.5 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reviewers */}
        <div className={cardStyles}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Revisores
              </h3>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateReviewers([
                    ...revisores,
                    { nome: "", especialidade: "" },
                  ])
                }
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {revisores.map(
              (
                revisor: { nome: string; especialidade: string },
                index: number,
              ) => (
                <div key={index} className="flex gap-3">
                  <Input
                    value={revisor.nome || ""}
                    onChange={(e) => {
                      const newReviewers = [...revisores];
                      newReviewers[index] = {
                        ...newReviewers[index],
                        nome: e.target.value,
                      };
                      updateReviewers(newReviewers);
                    }}
                    disabled={!isEditing}
                    placeholder="Nome do revisor"
                    className={cn(inputStyles, "flex-1")}
                  />
                  <Input
                    value={revisor.especialidade || ""}
                    onChange={(e) => {
                      const newReviewers = [...revisores];
                      newReviewers[index] = {
                        ...newReviewers[index],
                        especialidade: e.target.value,
                      };
                      updateReviewers(newReviewers);
                    }}
                    disabled={!isEditing}
                    placeholder="Especialidade"
                    className={cn(inputStyles, "flex-1")}
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newReviewers = revisores.filter(
                          (_: any, i: number) => i !== index,
                        );
                        updateReviewers(newReviewers);
                      }}
                      className="rounded-lg p-2.5 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Approvers */}
        <div className={cardStyles}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2.5">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Aprovadores
              </h3>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateApprovers([...aprovadores, { nome: "", cargo: "" }])
                }
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {aprovadores.map(
              (aprovador: { nome: string; cargo: string }, index: number) => (
                <div key={index} className="flex gap-3">
                  <Input
                    value={aprovador.nome || ""}
                    onChange={(e) => {
                      const newApprovers = [...aprovadores];
                      newApprovers[index] = {
                        ...newApprovers[index],
                        nome: e.target.value,
                      };
                      updateApprovers(newApprovers);
                    }}
                    disabled={!isEditing}
                    placeholder="Nome do aprovador"
                    className={cn(inputStyles, "flex-1")}
                  />
                  <Input
                    value={aprovador.cargo || ""}
                    onChange={(e) => {
                      const newApprovers = [...aprovadores];
                      newApprovers[index] = {
                        ...newApprovers[index],
                        cargo: e.target.value,
                      };
                      updateApprovers(newApprovers);
                    }}
                    disabled={!isEditing}
                    placeholder="Cargo"
                    className={cn(inputStyles, "flex-1")}
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newApprovers = aprovadores.filter(
                          (_: any, i: number) => i !== index,
                        );
                        updateApprovers(newApprovers);
                      }}
                      className="rounded-lg p-2.5 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    );
  };

  // Translation mapping
  const fieldTranslations: Record<string, string> = {
    name: "Nome",
    dose: "Dose",
    route: "Via",
    frequency: "Frequência",
    duration: "Duração",
    notes: "Observações",
    medicamentos: "Medicamentos",
    tratamentoPacientesInstaveis: "Tratamento Pacientes Instáveis",
    intervencoesNaoFarmacologicas: "Intervenções Não Farmacológicas",
    definicao: "Definição",
    epidemiologia: "Epidemiologia",
    inclusao: "Inclusão",
    exclusao: "Exclusão",
    exameFisico: "Exame Físico",
    sinaisVitais: "Sinais Vitais",
    anamnese: "Anamnese",
    anamneseFocada: "Anamnese Focada",
    exameFisicoRelevante: "Exame Físico Relevante",
    objetivos: "Objetivos",
    indicadores: "Indicadores",
    escopo: "Escopo",
    escopoClinico: "Escopo Clínico",
    validade: "Validade",
    contatos: "Contatos",
  };

  // Format structured content to HTML with enhanced typography
  const formatStructuredContent = (content: any): string => {
    if (typeof content === "string") return content;

    let formatted = "";

    if (Array.isArray(content)) {
      formatted = '<ol class="list-decimal pl-8 space-y-2">';
      content.forEach((item) => {
        formatted += `<li class="text-base leading-relaxed">${formatStructuredContent(item)}</li>`;
      });
      formatted += "</ol>";
      return formatted;
    }

    if (content && typeof content === "object") {
      Object.entries(content).forEach(([key, value]) => {
        let readableKey = fieldTranslations[key];

        if (!readableKey) {
          readableKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
        }

        if (Array.isArray(value)) {
          // Check if it's a nested section (e.g., "3.1", "3.2")
          const isSubsection = /^\d+\.\d+/.test(key);
          const headingTag = isSubsection ? "h4" : "h3";
          const headingClass = isSubsection
            ? "text-lg font-semibold mt-6 mb-3 text-gray-700 dark:text-gray-300"
            : "text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-200";

          formatted += `<${headingTag} class="${headingClass}">${readableKey}</${headingTag}>`;
          formatted += '<ul class="list-disc pl-6 space-y-2">';
          value.forEach((item) => {
            if (typeof item === "object" && item !== null) {
              formatted += `<li class="text-base leading-relaxed">${formatStructuredContent(item)}</li>`;
            } else {
              // Process text to add emphasis on key terms
              const processedItem = item
                .toString()
                .replace(/\b(TVP|TEV|PICC|ISS)\b/g, "<strong>$1</strong>")
                .replace(/\b(Doppler|ultrassom|TC\/RM)\b/g, "<em>$1</em>");
              formatted += `<li class="text-base leading-relaxed">${processedItem}</li>`;
            }
          });
          formatted += "</ul>";
        } else if (typeof value === "object" && value !== null) {
          const isSubsection = /^\d+\.\d+/.test(key);
          const headingTag = isSubsection ? "h4" : "h3";
          const headingClass = isSubsection
            ? "text-lg font-semibold mt-6 mb-3 text-gray-700 dark:text-gray-300"
            : "text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-200";

          formatted += `<${headingTag} class="${headingClass}">${readableKey}</${headingTag}>`;
          formatted += `<div class="pl-4">${formatStructuredContent(value)}</div>`;
        } else if (value) {
          formatted += `<p class="text-base leading-relaxed mb-4"><strong class="font-semibold text-gray-800 dark:text-gray-200">${readableKey}:</strong> ${value}</p>`;
        }
      });
    }

    return formatted;
  };

  // Generic text editor
  const renderTextEditor = () => {
    let textContent: string;

    // Ensure we're working with the current section's content
    const currentContent = localContent || section.content;

    if (typeof currentContent === "string") {
      // First, clean any HTML that might have leaked into the content
      const cleanedContent = cleanHtmlFromText(currentContent);

      // Apply formatting based on section type
      if (
        section.sectionNumber === 3 ||
        section.sectionNumber === 4 ||
        section.sectionNumber === 5
      ) {
        // Use the simple formatter for guaranteed results
        textContent = simpleFormatProtocolContent(cleanedContent);
      } else {
        textContent = formatProtocolContent(cleanedContent);
      }
    } else if (currentContent) {
      textContent = ensureHtml(formatStructuredContent(currentContent));
    } else {
      textContent = "";
    }

    return (
      <div className="mx-auto max-w-[720px] space-y-6">
        {typeof currentContent === "string" || !currentContent ? (
          <RichTextEditor
            content={textContent}
            onChange={handleContentUpdate}
            disabled={!isEditing}
            placeholder="Digite o conteúdo desta seção..."
            className="min-h-[400px]"
          />
        ) : (
          <div>
            {isEditing ? (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <AlertDescription className="text-base">
                    <strong>Modo de edição:</strong> Para editar conteúdo
                    estruturado, use a opção &quot;Gerar com IA&quot; ou edite o
                    texto abaixo e salve para converter em formato estruturado.
                  </AlertDescription>
                </Alert>
                <RichTextEditor
                  content={textContent}
                  onChange={(content) => {
                    handleContentUpdate(content);
                  }}
                  placeholder="Digite o conteúdo formatado..."
                  className="min-h-[300px]"
                />
              </div>
            ) : (
              <div
                className={cn(
                  contentStyles,
                  "protocol-content",
                  section.sectionNumber === 3 && "section-3-content",
                )}
                dangerouslySetInnerHTML={{ __html: textContent }}
              />
            )}
          </div>
        )}

        {sectionDefinition && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 p-2.5">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                  Orientações
                </h4>
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {sectionDefinition.description}
                </p>
                {sectionDefinition.contentSchemaDescription && (
                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estrutura esperada:
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {sectionDefinition.contentSchemaDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Read-only display with enhanced typography
  const renderReadOnlyDisplay = () => {
    let displayContent;

    if (typeof localContent === "string") {
      let formattedContent: string;

      // First, clean any HTML that might have leaked into the content
      const cleanedContent = cleanHtmlFromText(localContent);
      // Apply formatting based on section type
      if (
        section.sectionNumber === 3 ||
        section.sectionNumber === 4 ||
        section.sectionNumber === 5
      ) {
        // Use the simple formatter for guaranteed results
        formattedContent = simpleFormatProtocolContent(cleanedContent);
      } else {
        formattedContent = formatProtocolContent(cleanedContent);
      }

      displayContent = (
        <div
          className={cn(
            contentStyles,
            "protocol-content",
            section.sectionNumber === 3 && "section-3-content",
          )}
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      );
    } else if (typeof localContent === "object" && localContent !== null) {
      if (section.sectionNumber === 1) {
        const metadata = localContent as Record<string, any>;
        displayContent = (
          <div className="mx-auto max-w-[720px] space-y-8">
            <div className={cardStyles}>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Código
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {metadata.codigoProtocolo || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Versão
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {metadata.versao || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Título
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {metadata.tituloCompleto || "—"}
                </p>
              </div>
              <div className="mt-6">
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Organização
                </p>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {metadata.origemOrganizacao || "—"}
                </p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-6">
                <div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Elaboração
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {metadata.dataElaboracao || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Última Revisão
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {metadata.dataUltimaRevisao || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Próxima Revisão
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {metadata.dataProximaRevisao || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Âmbito
                </p>
                <p className="text-base leading-relaxed text-gray-900 dark:text-gray-100">
                  {metadata.ambitoAplicacao || "—"}
                </p>
              </div>
            </div>
          </div>
        );
      } else {
        const formattedHtml = ensureHtml(formatStructuredContent(localContent));
        displayContent = (
          <div
            className={contentStyles}
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />
        );
      }
    } else {
      displayContent = (
        <div className="py-16 text-center">
          <p className="text-base text-gray-500 dark:text-gray-400">
            Nenhum conteúdo definido
          </p>
        </div>
      );
    }

    return <>{displayContent}</>;
  };

  const getEditorForSection = () => {
    if (!isEditing) {
      return renderReadOnlyDisplay();
    }

    switch (section.sectionNumber) {
      case 1:
        return renderMetadataEditor();
      case 2:
        return renderTechnicalRecordEditor();
      default:
        return renderTextEditor();
    }
  };

  // Save indicator with timestamp
  const SaveIndicator = () => {
    if (!lastSaved) return null;

    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg dark:bg-gray-800">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Salvo às {formatTime(lastSaved)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative space-y-6">
      {/* DEBUG BUTTON - REMOVE AFTER TESTING */}
      <div className="fixed right-4 top-20 z-50 rounded bg-red-500 p-2 text-white">
        <div className="font-mono text-xs">
          <div>Section: {section.sectionNumber}</div>
          <div>isEditing: {isEditing ? "TRUE" : "FALSE"}</div>
          <div>Content type: {typeof localContent}</div>
          <div>
            Has HTML:{" "}
            {typeof localContent === "string" && localContent.includes("<")
              ? "YES"
              : "NO"}
          </div>
        </div>
      </div>
      {getEditorForSection()}
      {isEditing && <SaveIndicator />}
    </div>
  );
};
