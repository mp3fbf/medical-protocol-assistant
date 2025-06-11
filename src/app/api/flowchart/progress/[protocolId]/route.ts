/**
 * SSE endpoint for flowchart generation progress
 */
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { flowchartProgressEmitter } from "@/lib/events/flowchart-progress";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ protocolId: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const protocolId = params.protocolId;
  console.log(`[SSE] Client connected for flowchart progress: ${protocolId}`);

  const stream = flowchartProgressEmitter.createSSEStream(protocolId);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
