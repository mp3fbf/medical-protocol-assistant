/**
 * Global event system for protocol generation progress
 *
 * This allows communication between tRPC procedures and SSE endpoints
 * In production, this should use Redis pub/sub or similar
 */

import { EventEmitter } from "events";
import type { ModularGenerationProgress } from "@/lib/ai/generator-modular";

export interface GenerationProgressEvent {
  protocolId: string;
  sessionId: string;
  type: "progress" | "error" | "complete";
  data: {
    currentGroup?: string;
    groupIndex?: number;
    totalGroups?: number;
    sectionsCompleted?: number[];
    message?: string;
    percentage?: number;
    error?: string;
    estimatedTimeRemaining?: number;
  };
  timestamp: string;
}

class GenerationProgressEmitter extends EventEmitter {
  private static instance: GenerationProgressEmitter;

  private constructor() {
    super();
    // Increase max listeners to handle multiple concurrent generations
    this.setMaxListeners(100);
  }

  static getInstance(): GenerationProgressEmitter {
    if (!GenerationProgressEmitter.instance) {
      GenerationProgressEmitter.instance = new GenerationProgressEmitter();
    }
    return GenerationProgressEmitter.instance;
  }

  /**
   * Emit progress update for a specific protocol generation
   */
  emitProgress(
    protocolId: string,
    sessionId: string,
    progress: ModularGenerationProgress,
  ) {
    const event: GenerationProgressEvent = {
      protocolId,
      sessionId,
      type: "progress",
      data: {
        currentGroup: progress.currentGroup,
        groupIndex: progress.groupIndex,
        totalGroups: progress.totalGroups,
        sectionsCompleted: progress.sectionsCompleted,
        message: progress.message,
        percentage: Math.round((progress.sectionsCompleted.length / 13) * 100),
        estimatedTimeRemaining: this.estimateTimeRemaining(progress),
      },
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[GenerationProgress] Emitting progress for protocol ${protocolId}:`,
      {
        group: progress.currentGroup,
        sections: progress.sectionsCompleted.length,
        percentage: event.data.percentage,
        listeners: this.listenerCount(`progress:${protocolId}`),
      },
    );

    this.emit(`progress:${protocolId}`, event);
    this.emit("progress:all", event); // For monitoring
  }

  /**
   * Emit error event
   */
  emitError(protocolId: string, sessionId: string, error: string) {
    const event: GenerationProgressEvent = {
      protocolId,
      sessionId,
      type: "error",
      data: {
        error,
        message: `Erro durante a geração: ${error}`,
      },
      timestamp: new Date().toISOString(),
    };

    this.emit(`progress:${protocolId}`, event);
    this.emit("progress:all", event);
  }

  /**
   * Emit completion event
   */
  emitComplete(
    protocolId: string,
    sessionId: string,
    sectionsCompleted: number[],
  ) {
    const event: GenerationProgressEvent = {
      protocolId,
      sessionId,
      type: "complete",
      data: {
        sectionsCompleted,
        message: "Protocolo gerado com sucesso!",
        percentage: 100,
      },
      timestamp: new Date().toISOString(),
    };

    this.emit(`progress:${protocolId}`, event);
    this.emit("progress:all", event);
  }

  /**
   * Subscribe to progress updates for a specific protocol
   */
  subscribeToProtocol(
    protocolId: string,
    callback: (event: GenerationProgressEvent) => void,
  ) {
    this.on(`progress:${protocolId}`, callback);

    // Return unsubscribe function
    return () => {
      this.off(`progress:${protocolId}`, callback);
    };
  }

  /**
   * Estimate remaining time based on current progress
   */
  private estimateTimeRemaining(progress: ModularGenerationProgress): number {
    // Assume average of 45 seconds per section for O3
    const sectionsRemaining = 13 - progress.sectionsCompleted.length;
    return sectionsRemaining * 45; // seconds
  }
}

// Export singleton instance
export const generationProgressEmitter =
  GenerationProgressEmitter.getInstance();
