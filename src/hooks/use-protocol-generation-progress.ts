/**
 * Hook for tracking real-time protocol generation progress
 * Provides progress updates, error handling, and recovery options
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/api/client";
import type { ModularGenerationProgress } from "@/lib/ai/generator-modular";

export interface GenerationProgress {
  status: "idle" | "researching" | "generating" | "error" | "success";
  currentStep: "research" | "generation" | "validation" | "complete";
  totalSections: number;
  completedSections: number[];
  currentGroup?: string;
  message: string;
  error?: {
    message: string;
    sessionId?: string;
    canRetry: boolean;
    canContinue: boolean;
  };
  startTime?: number;
  estimatedTimeRemaining?: number;
}

interface UseProtocolGenerationProgressOptions {
  onProgress?: (progress: GenerationProgress) => void;
  onComplete?: (protocolId: string) => void;
  onError?: (error: Error) => void;
}

export function useProtocolGenerationProgress(
  options?: UseProtocolGenerationProgressOptions,
) {
  const [progress, setProgress] = useState<GenerationProgress>({
    status: "idle",
    currentStep: "research",
    totalSections: 13,
    completedSections: [],
    message: "Pronto para iniciar",
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Handle generation errors with recovery options
  const handleGenerationError = useCallback(
    (error: any, genSessionId?: string) => {
      const errorMessage =
        error.message || "Erro desconhecido durante a geração";
      const isO3Error = errorMessage.includes("verified to use the model `o3`");
      const hasSessionId = genSessionId || error.cause?.sessionId;
      const completedSections = error.cause?.completedSections || 0;

      setProgress({
        status: "error",
        currentStep: "generation",
        totalSections: 13,
        completedSections: Array.from(
          { length: completedSections },
          (_, i) => i + 1,
        ),
        message: "Erro durante a geração do protocolo",
        error: {
          message: isO3Error
            ? "O modelo O3 requer verificação da sua organização na OpenAI. Aguarde 15 minutos ou use outro modelo."
            : errorMessage,
          sessionId: hasSessionId,
          canRetry: true,
          canContinue: !!hasSessionId && completedSections > 0,
        },
      });

      if (hasSessionId) {
        setSessionId(hasSessionId);
      }

      options?.onError?.(error);
    },
    [options],
  );

  // Calculate estimated time remaining based on average time per section
  const updateEstimatedTime = useCallback((completedCount: number) => {
    if (!startTimeRef.current || completedCount === 0) return;

    const elapsedTime = Date.now() - startTimeRef.current;
    const avgTimePerSection = elapsedTime / completedCount;
    const remainingSections = 13 - completedCount;
    const estimatedRemaining = avgTimePerSection * remainingSections;

    setProgress((prev) => ({
      ...prev,
      estimatedTimeRemaining: Math.round(estimatedRemaining / 1000), // in seconds
    }));
  }, []);

  // Connect to SSE endpoint for real-time updates
  const connectToProgressStream = useCallback(
    (protocolId: string, genSessionId?: string) => {
      // Clean up previous connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create SSE connection
      const url = `/api/generation/progress/${protocolId}${genSessionId ? `?sessionId=${genSessionId}` : ""}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data: ModularGenerationProgress = JSON.parse(event.data);

          setProgress((prev) => ({
            ...prev,
            status: "generating",
            currentStep: "generation",
            currentGroup: data.currentGroup,
            completedSections: data.sectionsCompleted,
            message: data.message,
          }));

          updateEstimatedTime(data.sectionsCompleted.length);
          options?.onProgress?.(progress);
        } catch (error) {
          console.error("Failed to parse progress update:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource.close();
        eventSourceRef.current = null;
      };

      eventSource.addEventListener("complete", (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        setProgress((prev) => ({
          ...prev,
          status: "success",
          currentStep: "complete",
          completedSections: Array.from({ length: 13 }, (_, i) => i + 1),
          message: "Protocolo gerado com sucesso!",
        }));
        eventSource.close();
        eventSourceRef.current = null;
        options?.onComplete?.(data.protocolId);
      });

      eventSource.addEventListener("error", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleGenerationError(new Error(data.message), data.sessionId);
        } catch (e) {
          handleGenerationError(new Error("Connection error"));
        }
        eventSource.close();
        eventSourceRef.current = null;
      });
    },
    [options, updateEstimatedTime, handleGenerationError],
  );

  // tRPC mutations
  const createProtocolMutation = trpc.protocol.create.useMutation();
  const resumeGenerationMutation =
    trpc.generation.resumeGeneration.useMutation();

  // Start protocol generation
  const startGeneration = useCallback(
    async (
      protocolData: any,
      mode: "automatic" | "manual" | "material_based",
    ) => {
      try {
        startTimeRef.current = Date.now();
        setProgress({
          status: "researching",
          currentStep: "research",
          totalSections: 13,
          completedSections: [],
          message:
            mode === "material_based"
              ? "Processando documentos enviados..."
              : "Iniciando pesquisa médica...",
          startTime: startTimeRef.current,
        });

        // Use the existing mutation but we'll intercept the protocol ID
        // to set up progress tracking
        const result = await createProtocolMutation.mutateAsync(protocolData);

        if (result.id) {
          // Connect to progress stream
          connectToProgressStream(result.id, sessionId || undefined);
        }

        return result;
      } catch (error: any) {
        handleGenerationError(error);
        throw error;
      }
    },
    [
      sessionId,
      connectToProgressStream,
      createProtocolMutation,
      handleGenerationError,
    ],
  );

  // Retry generation from the beginning
  const retryGeneration = useCallback(
    async (protocolData: any) => {
      setSessionId(null); // Clear session to start fresh
      return startGeneration(protocolData, protocolData.generationMode);
    },
    [startGeneration],
  );

  // Continue generation from where it failed
  const continueGeneration = useCallback(
    async (protocolId: string) => {
      if (!sessionId) {
        throw new Error("No session ID available to continue");
      }

      try {
        setProgress((prev) => ({
          ...prev,
          status: "generating",
          currentStep: "generation",
          message: `Continuando da seção ${prev.completedSections.length + 1}...`,
          error: undefined,
        }));

        // Call a special endpoint to resume generation
        const result = await resumeGenerationMutation.mutateAsync({
          protocolId,
          sessionId,
        });

        // Reconnect to progress stream
        connectToProgressStream(protocolId, sessionId);

        return result;
      } catch (error: any) {
        handleGenerationError(error);
        throw error;
      }
    },
    [
      sessionId,
      connectToProgressStream,
      resumeGenerationMutation,
      handleGenerationError,
    ],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    progress,
    startGeneration,
    retryGeneration,
    continueGeneration,
    isGenerating:
      progress.status === "researching" || progress.status === "generating",
    hasError: progress.status === "error",
    canContinue: progress.error?.canContinue || false,
  };
}
