/**
 * Protocol Editor Page - Dynamic route for editing a specific protocol.
 * Example URL: /protocols/uuid-of-protocol (Note: Now expecting CUIDs)
 */
"use client";

import React, { useEffect } from "react"; // Added useEffect for title update
import { useParams } from "next/navigation";
import { ProtocolEditorLayoutUltraV2 as ProtocolEditorLayout } from "@/components/protocol/editor/protocol-editor-layout-ultra-v2";
import { useProtocolEditorState } from "@/hooks/use-protocol-editor-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UltraButton } from "@/components/ui/ultra-button";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { SkeletonEditor } from "@/components/ui/skeleton";
import { GenerationStatusDisplay } from "@/components/protocol/generation/generation-status-display";
import { trpc } from "@/lib/api/client";
import { RealProgressBar } from "@/components/protocol/generation/real-progress-bar";

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
    protocolStatus,
    protocolCreatorId,
  } = useProtocolEditorState(protocolId);

  const { userId, userRole } = useCurrentUser();

  // Mutation to start generation
  const startGenerationMutation = trpc.generation.startGeneration.useMutation({
    onSuccess: () => {
      // Refresh the protocol data to get updated generation status
      if (protocolId) {
        fetchProtocolData(protocolId);
      }
    },
    onError: (error) => {
      console.error("[ProtocolEditPage] Failed to start generation:", error);
    },
  });

  const handleStartGeneration = () => {
    if (protocolId) {
      startGenerationMutation.mutate({
        protocolId,
      });
    }
  };

  const handleResumeGeneration = () => {
    // For now, resume just restarts the generation
    // Later we can implement proper session resumption
    handleStartGeneration();
  };

  useEffect(() => {
    if (protocolTitle && !isLoading) {
      document.title = `${protocolTitle} | Editor de Protocolo`;
    } else if (isLoading) {
      document.title = "Carregando Protocolo... | Editor de Protocolo";
    }
  }, [protocolTitle, isLoading]);

  if (isLoading && !protocolData) {
    // Show loading only if data isn't there yet
    return <SkeletonEditor />;
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 text-center dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <UltraGlassCard className="max-w-md p-8">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-xl bg-red-100 p-3 dark:bg-red-900/20">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-red-900 dark:text-red-100">
            Erro ao Carregar Protocolo
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
          <UltraButton
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => protocolId && fetchProtocolData(protocolId)}
          >
            Tentar Novamente
          </UltraButton>
        </UltraGlassCard>
      </div>
    );
  }

  if (!protocolId || (protocolId === "new" && !protocolData)) {
    // This case might occur if navigated to /protocols/new directly when it should be the editor page
    // or if ID is somehow lost. useProtocolEditorState handles new protocol init.
    // If still loading and protocolId is 'new', let the loading state in useProtocolEditorState handle it.
    if (isLoading) {
      return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 text-center dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary-500" />
            <div className="absolute inset-0 animate-pulse bg-primary-500/20 blur-xl" />
          </div>
          <h1 className="mt-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300">
            Inicializando novo protocolo...
          </h1>
        </div>
      );
    }
    // If not loading and still here with 'new', it implies something went wrong or initial state
    // For a true "new" protocol from scratch via editor, useProtocolEditorState should provide initial empty data.
  }

  // Check if protocol needs generation
  // TODO: Re-enable when generationStatus is added to the schema
  // if (
  //   generationStatus &&
  //   generationStatus !== "COMPLETED" &&
  //   protocolId &&
  //   !isLoading
  // ) {
  //   return (
  //     <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  //       <div className="mx-auto max-w-4xl">
  //         {/* Show real-time progress when generation is in progress */}
  //         {generationStatus === "IN_PROGRESS" && (
  //           <RealProgressBar
  //             protocolId={protocolId}
  //             sessionId={`gen-${Date.now()}`}
  //             onComplete={() => {
  //               // Refresh protocol data to load the generated content
  //               fetchProtocolData(protocolId);
  //             }}
  //             onError={(error) => {
  //               console.error("[ProtocolEditPage] Generation error:", error);
  //               // Refresh to update status to FAILED
  //               fetchProtocolData(protocolId);
  //             }}
  //           />
  //         )}

  //         {/* Show status display for NOT_STARTED or FAILED states */}
  //         {(generationStatus === "NOT_STARTED" ||
  //           generationStatus === "FAILED") && (
  //           <GenerationStatusDisplay
  //             generationStatus={generationStatus}
  //             protocolId={protocolId}
  //             protocolTitle={protocolTitle}
  //             onStartGeneration={handleStartGeneration}
  //             onResumeGeneration={handleResumeGeneration}
  //             isGenerating={startGenerationMutation.isPending}
  //           />
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <ProtocolEditorLayout
      protocolId={protocolId || ""}
      protocolTitle={protocolTitle}
      protocolData={protocolData}
      flowchartData={flowchartData}
      currentSectionNumber={currentSectionNumber}
      currentVersionId={currentVersionId || undefined}
      validationIssues={validationIssues}
      validationLoading={validation.isLoading}
      _validationLastValidated={validation.lastValidated}
      autoValidate={validation.autoValidate}
      isLoading={isLoading} // Pass the loading state for individual panes if needed
      onSelectSection={selectSection}
      onToggleAutoValidate={validation.toggleAutoValidate}
      onValidateNow={validation.validate}
      onUpdateSectionContent={updateSectionContent}
      onSaveChanges={saveProtocol}
      isSaving={isSaving}
      protocolStatus={protocolStatus}
      userRole={userRole}
      isCreator={protocolCreatorId === userId}
    />
  );
}
