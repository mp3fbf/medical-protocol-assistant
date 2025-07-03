/**
 * Server-Sent Events endpoint for real-time protocol generation progress
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  generationProgressEmitter,
  type GenerationProgressEvent,
} from "@/lib/events/generation-progress";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ protocolId: string }> },
) {
  const { protocolId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get("sessionId");

  // Create a new ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "connected",
            protocolId,
            sessionId,
            message: "Conectado ao servidor de progresso em tempo real",
          })}\n\n`,
        ),
      );

      // Subscribe to progress events for this protocol
      console.log(
        `[SSE] Subscribing to progress events for protocol: ${protocolId}`,
      );

      const unsubscribe = generationProgressEmitter.subscribeToProtocol(
        protocolId,
        (event: GenerationProgressEvent) => {
          try {
            console.log(`[SSE] Sending progress event for ${protocolId}:`, {
              type: event.type,
              sections: event.data.sectionsCompleted?.length,
              message: event.data.message,
            });

            // Send the progress event to the client
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );
          } catch (error) {
            console.error("[SSE] Error sending progress event:", error);
          }
        },
      );

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":heartbeat\n\n"));
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Clean up on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  // Send headers for SSE
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disable Nginx buffering
  });

  return new NextResponse(stream, { headers });
}
