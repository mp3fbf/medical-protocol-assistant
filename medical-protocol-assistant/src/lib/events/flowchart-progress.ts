/**
 * Event emitter for flowchart generation progress
 * Provides real-time updates during modular flowchart generation
 */

import { EventEmitter } from "events";
import type { FlowchartDefinition } from "@/types/flowchart";

export interface FlowchartProgressEvent {
  protocolId: string;
  sessionId: string;
  type: "progress" | "complete" | "error";
  step?: number;
  totalSteps?: number;
  message: string;
  data?: any;
  timestamp: string;
}

class FlowchartProgressEmitter extends EventEmitter {
  emitProgress(
    protocolId: string,
    sessionId: string,
    step: number,
    totalSteps: number,
    message: string,
  ) {
    const event: FlowchartProgressEvent = {
      protocolId,
      sessionId,
      type: "progress",
      step,
      totalSteps,
      message,
      timestamp: new Date().toISOString(),
    };
    this.emit(`flowchart:${protocolId}`, event);
    this.emit("flowchart:progress", event);
  }

  emitComplete(
    protocolId: string,
    sessionId: string,
    flowchart: FlowchartDefinition,
  ) {
    const event: FlowchartProgressEvent = {
      protocolId,
      sessionId,
      type: "complete",
      message: "Fluxograma gerado com sucesso",
      data: flowchart,
      timestamp: new Date().toISOString(),
    };
    this.emit(`flowchart:${protocolId}`, event);
    this.emit("flowchart:complete", event);
  }

  emitError(protocolId: string, sessionId: string, error: string) {
    const event: FlowchartProgressEvent = {
      protocolId,
      sessionId,
      type: "error",
      message: error,
      timestamp: new Date().toISOString(),
    };
    this.emit(`flowchart:${protocolId}`, event);
    this.emit("flowchart:error", event);
  }

  // Helper to create SSE stream for a specific protocol
  createSSEStream(protocolId: string) {
    const encoder = new TextEncoder();

    return new ReadableStream({
      start: (controller) => {
        const listener = (event: FlowchartProgressEvent) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          if (event.type === "complete" || event.type === "error") {
            controller.close();
            this.removeListener(`flowchart:${protocolId}`, listener);
          }
        };

        this.on(`flowchart:${protocolId}`, listener);

        // Send initial connection event
        const connectEvent: FlowchartProgressEvent = {
          protocolId,
          sessionId: `session-${Date.now()}`,
          type: "progress",
          message: "Conectado ao sistema de geração de fluxograma",
          timestamp: new Date().toISOString(),
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`),
        );
      },
    });
  }
}

export const flowchartProgressEmitter = new FlowchartProgressEmitter();

// Set max listeners to handle multiple concurrent generations
flowchartProgressEmitter.setMaxListeners(50);
