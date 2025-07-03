/**
 * Hook for real-time protocol generation progress using Server-Sent Events
 */
import { useEffect, useState, useCallback } from "react";
import type { GenerationProgressEvent } from "@/lib/events/generation-progress";

export interface RealGenerationProgressState {
  isConnected: boolean;
  currentSection: string;
  sectionsCompleted: number[];
  totalSections: number;
  percentage: number;
  message: string;
  error?: string;
  estimatedTimeRemaining?: number;
}

export function useRealGenerationProgress(
  protocolId: string | null,
  sessionId?: string | null,
) {
  const [state, setState] = useState<RealGenerationProgressState>({
    isConnected: false,
    currentSection: "",
    sectionsCompleted: [],
    totalSections: 13,
    percentage: 0,
    message: "Aguardando início da geração...",
  });

  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (!protocolId) return;

    // Close existing connection if any
    if (eventSource) {
      eventSource.close();
    }

    const url = sessionId
      ? `/api/generation/progress/${protocolId}?sessionId=${sessionId}`
      : `/api/generation/progress/${protocolId}`;

    const source = new EventSource(url);

    source.onopen = () => {
      console.log(
        "[SSE] Connected to progress stream for protocol:",
        protocolId,
      );
      setState((prev) => ({ ...prev, isConnected: true }));
    };

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle initial connection message
        if (data.type === "connected") {
          console.log("[SSE] Connection confirmed:", data.message);
          return;
        }

        // Handle progress events
        const progressEvent = data as GenerationProgressEvent;
        console.log(
          "[SSE] Received event:",
          progressEvent.type,
          progressEvent.data,
        );

        switch (progressEvent.type) {
          case "progress":
            setState((prev) => ({
              ...prev,
              currentSection: data.data.currentGroup || "",
              sectionsCompleted: data.data.sectionsCompleted || [],
              percentage: data.data.percentage || 0,
              message: data.data.message || "",
              estimatedTimeRemaining: data.data.estimatedTimeRemaining,
              error: undefined,
            }));
            break;

          case "error":
            setState((prev) => ({
              ...prev,
              error: data.data.error,
              message: data.data.message || "Erro durante a geração",
            }));
            break;

          case "complete":
            setState((prev) => ({
              ...prev,
              sectionsCompleted: data.data.sectionsCompleted || [],
              percentage: 100,
              message: data.data.message || "Protocolo gerado com sucesso!",
              error: undefined,
            }));
            break;
        }
      } catch (error) {
        console.error("[SSE] Error parsing message:", error);
      }
    };

    source.onerror = (error) => {
      console.error("[SSE] Connection error:", error);
      setState((prev) => ({
        ...prev,
        isConnected: false,
        error: "Conexão perdida com o servidor",
      }));

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (protocolId) {
          connect();
        }
      }, 5000);
    };

    setEventSource(source);
  }, [protocolId, sessionId, eventSource]);

  // Connect when protocolId changes
  useEffect(() => {
    if (protocolId) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
    };
  }, [protocolId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Disconnect function
  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setState((prev) => ({ ...prev, isConnected: false }));
    }
  }, [eventSource]);

  return {
    ...state,
    connect,
    disconnect,
  };
}
