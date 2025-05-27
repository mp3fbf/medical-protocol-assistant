/**
 * Protocol Editor Page - Dynamic route for editing a specific protocol.
 * Example URL: /protocols/uuid-of-protocol
 */
"use client"; // This page uses client-side hooks for state and data fetching

import React from "react";
import { useParams } from "next/navigation";
import { ProtocolEditorLayout } from "@/components/protocol/editor/protocol-editor-layout";
import { useProtocolEditorState } from "@/hooks/use-protocol-editor-state";
import { Button } from "@/components/ui/button"; // For error state button

// Note: Metadata for dynamic pages needs to be generated server-side if SEO is important.
// For client-rendered dynamic pages, title can be set using document.title in useEffect.

export default function ProtocolEditPage() {
  const params = useParams();
  const protocolId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    protocolTitle,
    protocolData,
    flowchartData,
    currentSectionNumber,
    validationIssues,
    isLoading,
    error,
    selectSection,
    updateSectionContent,
    saveProtocol,
    fetchProtocolData,
  } = useProtocolEditorState(protocolId);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-destructive">
          Erro ao Carregar Protocolo
        </h1>
        <p className="mb-6 text-gray-600">{error}</p>
        <Button onClick={() => protocolId && fetchProtocolData(protocolId)}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // While the hook handles its own loading state for data,
  // this top-level loading can be for when protocolId itself is not yet available.
  if (!protocolId && !isLoading && !protocolData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-2xl font-semibold">
          ID do Protocolo Inválido
        </h1>
        <p className="mb-6 text-gray-600">
          Não foi possível determinar o ID do protocolo.
        </p>
      </div>
    );
  }

  return (
    <ProtocolEditorLayout
      protocolTitle={protocolTitle}
      protocolData={protocolData}
      flowchartData={flowchartData}
      currentSectionNumber={currentSectionNumber}
      validationIssues={validationIssues} // Pass actual issues when available
      isLoading={isLoading}
      onSelectSection={selectSection}
      onUpdateSectionContent={updateSectionContent}
      onSaveChanges={saveProtocol}
    />
  );
}
