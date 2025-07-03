/**
 * Ultra Section Editor Component - Clean and modern design
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
} from "lucide-react";
import { ensureHtml, isHtml } from "@/lib/utils/html-converter";
// import { cn } from "@/lib/utils";
import { UltraButton } from "@/components/ui/ultra-button";

interface SectionEditorProps {
  section: ProtocolSectionData;
  sectionDefinition?: StandardSectionDefinition | null;
  isEditing: boolean;
  onContentChange: (newContent: ProtocolSectionData["content"]) => void;
}

export const SectionEditorUltra: React.FC<SectionEditorProps> = ({
  section,
  sectionDefinition,
  isEditing,
  onContentChange,
}) => {
  const [localContent, setLocalContent] = useState(section.content);
  const isUserEditingRef = useRef(false);

  useEffect(() => {
    if (!isUserEditingRef.current) {
      setLocalContent(section.content);
    }
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

  // Section 1: Metadata Editor - Ultra Clean
  const renderMetadataEditor = () => {
    const metadata =
      typeof localContent === "object" && localContent !== null
        ? (localContent as Record<string, any>)
        : {};

    return (
      <div className="space-y-6">
        {/* Protocol Identification */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 p-2">
              <Hash className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Identificação do Protocolo
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="codigoProtocolo" className="text-sm font-medium">
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
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="versao" className="text-sm font-medium">
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
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="tituloCompleto" className="text-sm font-medium">
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
              className="mt-1"
            />
          </div>
        </div>

        {/* Organization & Dates */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Organização e Datas
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="origemOrganizacao"
                className="text-sm font-medium"
              >
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
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="dataElaboracao" className="text-sm font-medium">
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
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="dataUltimaRevisao"
                  className="text-sm font-medium"
                >
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
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="dataProximaRevisao"
                  className="text-sm font-medium"
                >
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
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ambitoAplicacao" className="text-sm font-medium">
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
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section 2: Technical Record Editor - Ultra Clean
  const renderTechnicalRecordEditor = () => {
    const data =
      typeof localContent === "object" && localContent !== null
        ? (localContent as Record<string, any>)
        : {};
    const autores = Array.isArray(data.autores) ? data.autores : [];
    const revisores = Array.isArray(data.revisores) ? data.revisores : [];
    const aprovadores = Array.isArray(data.aprovadores) ? data.aprovadores : [];

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
      <div className="space-y-6">
        {/* Authors */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 p-2">
                <User className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Autores
              </h3>
            </div>
            {isEditing && (
              <UltraButton
                variant="secondary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => updateAuthors([...autores, ""])}
              >
                Adicionar
              </UltraButton>
            )}
          </div>

          <div className="space-y-2">
            {autores.map((autor: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={autor}
                  onChange={(e) => {
                    const newAuthors = [...autores];
                    newAuthors[index] = e.target.value;
                    updateAuthors(newAuthors);
                  }}
                  disabled={!isEditing}
                  placeholder="Nome completo do autor"
                  className="flex-1"
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const newAuthors = autores.filter(
                        (_: any, i: number) => i !== index,
                      );
                      updateAuthors(newAuthors);
                    }}
                    className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reviewers */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Revisores
              </h3>
            </div>
            {isEditing && (
              <UltraButton
                variant="secondary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() =>
                  updateReviewers([
                    ...revisores,
                    { nome: "", especialidade: "" },
                  ])
                }
              >
                Adicionar
              </UltraButton>
            )}
          </div>

          <div className="space-y-2">
            {revisores.map(
              (
                revisor: { nome: string; especialidade: string },
                index: number,
              ) => (
                <div key={index} className="flex gap-2">
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
                    className="flex-1"
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
                    className="flex-1"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newReviewers = revisores.filter(
                          (_: any, i: number) => i !== index,
                        );
                        updateReviewers(newReviewers);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Approvers */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2">
                <Building className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Aprovadores
              </h3>
            </div>
            {isEditing && (
              <UltraButton
                variant="secondary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() =>
                  updateApprovers([...aprovadores, { nome: "", cargo: "" }])
                }
              >
                Adicionar
              </UltraButton>
            )}
          </div>

          <div className="space-y-2">
            {aprovadores.map(
              (aprovador: { nome: string; cargo: string }, index: number) => (
                <div key={index} className="flex gap-2">
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
                    className="flex-1"
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
                    className="flex-1"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newApprovers = aprovadores.filter(
                          (_: any, i: number) => i !== index,
                        );
                        updateApprovers(newApprovers);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
  };

  // Format structured content to HTML
  const formatStructuredContent = (content: any): string => {
    if (typeof content === "string") return content;

    let formatted = "";

    if (Array.isArray(content)) {
      formatted = "<ol>";
      content.forEach((item) => {
        formatted += `<li>${formatStructuredContent(item)}</li>`;
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
          formatted += `<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">${readableKey}</h3>`;
          formatted += "<ul class='list-disc pl-6'>";
          value.forEach((item) => {
            if (typeof item === "object" && item !== null) {
              formatted += `<li>${formatStructuredContent(item)}</li>`;
            } else {
              formatted += `<li>${item}</li>`;
            }
          });
          formatted += "</ul>";
        } else if (typeof value === "object" && value !== null) {
          formatted += `<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">${readableKey}</h3>`;
          formatted += `<div class="pl-4">${formatStructuredContent(value)}</div>`;
        } else if (value) {
          formatted += `<p class="mb-2"><strong>${readableKey}:</strong> ${value}</p>`;
        }
      });
    }

    return formatted;
  };

  // Generic text editor
  const renderTextEditor = () => {
    let textContent: string;

    if (typeof localContent === "string") {
      textContent = ensureHtml(localContent);
    } else {
      textContent = ensureHtml(formatStructuredContent(localContent));
    }

    return (
      <div className="space-y-4">
        {typeof localContent === "string" || !localContent ? (
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
              <div className="space-y-4">
                <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <AlertDescription className="text-sm">
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
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: textContent }}
              />
            )}
          </div>
        )}

        {sectionDefinition && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 p-2">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Orientações
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sectionDefinition.description}
                </p>
                {sectionDefinition.contentSchemaDescription && (
                  <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Estrutura esperada:
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
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

  // Read-only display
  const renderReadOnlyDisplay = () => {
    let displayContent;

    if (typeof localContent === "string") {
      if (isHtml(localContent)) {
        displayContent = (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: localContent }}
          />
        );
      } else {
        // Ensure plain text is properly formatted as HTML
        displayContent = (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: ensureHtml(localContent) }}
          />
        );
      }
    } else if (typeof localContent === "object" && localContent !== null) {
      if (section.sectionNumber === 1) {
        const metadata = localContent as Record<string, any>;
        displayContent = (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Código
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {metadata.codigoProtocolo || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Versão
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {metadata.versao || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Título
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {metadata.tituloCompleto || "—"}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Organização
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {metadata.origemOrganizacao || "—"}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Elaboração
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {metadata.dataElaboracao || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Última Revisão
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {metadata.dataUltimaRevisao || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Próxima Revisão
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {metadata.dataProximaRevisao || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Âmbito
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  {metadata.ambitoAplicacao || "—"}
                </p>
              </div>
            </div>
          </div>
        );
      } else {
        // Format structured content as HTML for proper display
        const formattedHtml = ensureHtml(formatStructuredContent(localContent));
        displayContent = (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />
        );
      }
    } else {
      displayContent = (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
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

  return <div className="space-y-4">{getEditorForSection()}</div>;
};
