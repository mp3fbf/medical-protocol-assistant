/**
 * Section Editor Component for Protocol Content
 *
 * Handles editing of individual protocol sections with specialized forms
 * for different section types (metadata, structured content, etc.)
 */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ProtocolSectionData } from "@/types/protocol";
import type { StandardSectionDefinition } from "@/types/ai-generation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Building,
  Stethoscope,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";

interface SectionEditorProps {
  section: ProtocolSectionData;
  sectionDefinition?: StandardSectionDefinition | null;
  isEditing: boolean;
  onContentChange: (newContent: ProtocolSectionData["content"]) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  sectionDefinition,
  isEditing,
  onContentChange,
}) => {
  const [localContent, setLocalContent] = useState(section.content);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const isUserEditingRef = useRef(false); // Track if user is actively editing

  // CRITICAL FIX: Sync with parent content but avoid infinite loops
  useEffect(() => {
    // Only sync if user is not actively editing (prevents overwriting during typing)
    if (!isUserEditingRef.current) {
      setLocalContent(section.content);
      setJsonError(null);
    }
  }, [section.sectionNumber, section.content]); // Sync when section OR parent content changes

  // Immediate content change callback (no debounce to prevent conflicts)
  const immediateOnContentChange = useCallback(
    (newContent: any) => {
      onContentChange(newContent);
    },
    [onContentChange],
  );

  const handleContentUpdate = (newContent: any) => {
    // Mark that user is actively editing
    isUserEditingRef.current = true;

    // Update local content immediately for UI responsiveness
    setLocalContent(newContent);

    // Call parent update immediately (no debounce)
    immediateOnContentChange(newContent);

    // Reset editing flag after a short delay
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 100);
  };

  const handleJsonStringChange = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonError(null);
      handleContentUpdate(parsed);
    } catch (_error) {
      setJsonError("JSON inválido - verifique a sintaxe");
      // Still update local state for editing
      setLocalContent(jsonString);
    }
  };

  // Section 1: Metadata Editor
  const renderMetadataEditor = () => {
    const metadata =
      typeof localContent === "object" && localContent !== null
        ? (localContent as Record<string, any>)
        : {};

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="codigoProtocolo">Código do Protocolo</Label>
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
            />
          </div>
          <div>
            <Label htmlFor="versao">Versão</Label>
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
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tituloCompleto">Título Completo</Label>
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
          />
        </div>

        <div>
          <Label htmlFor="origemOrganizacao">Origem/Organização</Label>
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
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="dataElaboracao">Data de Elaboração</Label>
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
            />
          </div>
          <div>
            <Label htmlFor="dataUltimaRevisao">Última Revisão</Label>
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
            />
          </div>
          <div>
            <Label htmlFor="dataProximaRevisao">Próxima Revisão</Label>
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
            />
          </div>
        </div>

        <div>
          <Label htmlFor="ambitoAplicacao">Âmbito de Aplicação</Label>
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
          />
        </div>
      </div>
    );
  };

  // Section 2: Technical Record Editor
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Autores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                />
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAuthors = autores.filter(
                        (_: any, i: number) => i !== index,
                      );
                      updateAuthors(newAuthors);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => updateAuthors([...autores, ""])}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Autor
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Reviewers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Revisores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                  />
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newReviewers = revisores.filter(
                          (_: any, i: number) => i !== index,
                        );
                        updateReviewers(newReviewers);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
            )}
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updateReviewers([
                    ...revisores,
                    { nome: "", especialidade: "" },
                  ])
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Revisor
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Approvers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Aprovadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                  />
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newApprovers = aprovadores.filter(
                          (_: any, i: number) => i !== index,
                        );
                        updateApprovers(newApprovers);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
            )}
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updateApprovers([...aprovadores, { nome: "", cargo: "" }])
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Aprovador
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Format structured content for display
  const formatStructuredContent = (content: any): string => {
    if (typeof content === "string") return content;

    let formatted = "";

    // Handle arrays
    if (Array.isArray(content)) {
      return content
        .map((item, index) => `${index + 1}. ${formatStructuredContent(item)}`)
        .join("\n");
    }

    // Handle objects with known structures
    if (content && typeof content === "object") {
      Object.entries(content).forEach(([key, value]) => {
        // Convert camelCase to readable format
        const readableKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();

        if (Array.isArray(value)) {
          formatted += `${readableKey}:\n`;
          value.forEach((item) => {
            formatted += `  • ${item}\n`;
          });
          formatted += "\n";
        } else if (typeof value === "object" && value !== null) {
          formatted += `${readableKey}:\n${formatStructuredContent(value)}\n\n`;
        } else if (value) {
          formatted += `${readableKey}: ${value}\n\n`;
        }
      });
    }

    return formatted.trim();
  };

  // Generic text editor for other sections
  const renderTextEditor = () => {
    const textContent = isEditing
      ? typeof localContent === "string"
        ? localContent
        : JSON.stringify(localContent, null, 2)
      : formatStructuredContent(localContent);

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="sectionContent">Conteúdo da Seção</Label>
          <Textarea
            id="sectionContent"
            value={textContent}
            onChange={(e) => {
              if (typeof localContent === "string") {
                handleContentUpdate(e.target.value);
              } else {
                handleJsonStringChange(e.target.value);
              }
            }}
            disabled={!isEditing}
            rows={12}
            className={isEditing ? "font-mono text-sm" : "text-sm"}
            placeholder="Digite o conteúdo desta seção..."
          />
          {jsonError && isEditing && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{jsonError}</AlertDescription>
            </Alert>
          )}
        </div>

        {sectionDefinition && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Orientações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sectionDefinition.description}
              </p>
              {sectionDefinition.contentSchemaDescription && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Estrutura esperada:
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {sectionDefinition.contentSchemaDescription}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Read-only display for non-editing mode
  const renderReadOnlyDisplay = () => {
    let displayContent;

    if (typeof localContent === "string") {
      displayContent = localContent;
    } else if (typeof localContent === "object" && localContent !== null) {
      // For structured content, show a formatted view
      if (section.sectionNumber === 1) {
        const metadata = localContent as Record<string, any>;
        displayContent = (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Código:</strong>{" "}
                {metadata.codigoProtocolo || "Não definido"}
              </div>
              <div>
                <strong>Versão:</strong> {metadata.versao || "Não definido"}
              </div>
            </div>
            <div>
              <strong>Título:</strong>{" "}
              {metadata.tituloCompleto || "Não definido"}
            </div>
            <div>
              <strong>Organização:</strong>{" "}
              {metadata.origemOrganizacao || "Não definido"}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <strong>Elaboração:</strong>{" "}
                {metadata.dataElaboracao || "Não definido"}
              </div>
              <div>
                <strong>Última Revisão:</strong>{" "}
                {metadata.dataUltimaRevisao || "Não definido"}
              </div>
              <div>
                <strong>Próxima Revisão:</strong>{" "}
                {metadata.dataProximaRevisao || "Não definido"}
              </div>
            </div>
            <div>
              <strong>Âmbito:</strong>{" "}
              {metadata.ambitoAplicacao || "Não definido"}
            </div>
          </div>
        );
      } else {
        displayContent = (
          <div className="whitespace-pre-wrap rounded border bg-gray-50 p-4 text-sm dark:bg-gray-800">
            {formatStructuredContent(localContent)}
          </div>
        );
      }
    } else {
      displayContent = (
        <p className="text-gray-500">Nenhum conteúdo definido</p>
      );
    }

    return (
      <div className="space-y-4">
        {typeof displayContent === "string" ? (
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{displayContent}</p>
          </div>
        ) : (
          displayContent
        )}
      </div>
    );
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
