/**
 * Protocol Editor Page - Dynamic route for editing a specific protocol.
 * Example URL: /protocols/uuid-of-protocol (Note: Now expecting CUIDs)
 */
"use client";

import React, { useEffect } from "react"; // Added useEffect for title update
import { useParams } from "next/navigation";
import { ProtocolEditorLayout } from "@/components/protocol/editor/protocol-editor-layout";
import { useProtocolEditorState } from "@/hooks/use-protocol-editor-state";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ProtocolEditPage() {
  const params = useParams();
  const protocolId = Array.isArray(params.id) ? params.id[0] : params.id;

  // DEBUG: Log the protocolId received from URL params
  console.log("[ProtocolEditPage] protocolId from useParams:", protocolId);

  const {
    protocolTitle,
    protocolData,
    flowchartData,
    currentSectionNumber,
    currentVersionId,
    validationIssues,
    isLoading,
    error,
    selectSection,
    updateSectionContent,
    saveProtocol,
    fetchProtocolData,
    isSaving,
    validation,
  } = useProtocolEditorState(protocolId);

  useEffect(() => {
    if (protocolTitle && !isLoading) {
      document.title = `${protocolTitle} | Editor de Protocolo`;
    } else if (isLoading) {
      document.title = "Carregando Protocolo... | Editor de Protocolo";
    }
  }, [protocolTitle, isLoading]);

  if (isLoading && !protocolData) {
    // Show loading only if data isn't there yet
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary-500" />
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Carregando dados do protocolo...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-destructive">
          Erro ao Carregar Protocolo
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
        <Button onClick={() => protocolId && fetchProtocolData(protocolId)}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!protocolId || (protocolId === "new" && !protocolData)) {
    // This case might occur if navigated to /protocols/new directly when it should be the editor page
    // or if ID is somehow lost. useProtocolEditorState handles new protocol init.
    // If still loading and protocolId is 'new', let the loading state in useProtocolEditorState handle it.
    if (isLoading) {
      return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary-500" />
          <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Inicializando novo protocolo...
          </h1>
        </div>
      );
    }
    // If not loading and still here with 'new', it implies something went wrong or initial state
    // For a true "new" protocol from scratch via editor, useProtocolEditorState should provide initial empty data.
  }

  return (
    <ProtocolEditorLayout
      protocolId={protocolId || ""}
      protocolTitle={protocolTitle}
      protocolData={protocolData}
      flowchartData={flowchartData}
      currentSectionNumber={currentSectionNumber}
      currentVersionId={currentVersionId}
      validationIssues={validationIssues}
      validationLoading={validation.isLoading}
      validationLastValidated={validation.lastValidated}
      autoValidate={validation.autoValidate}
      isLoading={isLoading} // Pass the loading state for individual panes if needed
      onSelectSection={selectSection}
      onToggleAutoValidate={validation.toggleAutoValidate}
      onValidateNow={validation.validate}
      onUpdateSectionContent={updateSectionContent}
      onSaveChanges={saveProtocol}
      isSaving={isSaving}
    />
  );
}
