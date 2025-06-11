/**
 * Next.js API Route Handler for tRPC
 *
 * This file serves as the entry point for all tRPC API requests.
 * It uses the `fetchRequestHandler` from `@trpc/server/adapters/fetch`
 * to handle incoming requests and route them to the appropriate tRPC procedures.
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { createContext } from "@/server/api/context";
import { appRouter } from "@/server/api/root";

// REMOVE ALL TIMEOUTS FOR O3 TESTING
export const maxDuration = 300; // 5 minutes max on Vercel (maximum allowed)
export const dynamic = "force-dynamic";

/**
 * @see https://trpc.io/docs/v11/server/adapters/fetch#used-with-nextjs-app-router
 */
const handler = async (req: NextRequest) => {
  // Made handler async
  // Clone the request to be able to read its body for logging, as req.text() consumes it
  const clonedReq = req.clone();

  // Log raw body for protocol.create path for debugging E2E
  if (req.nextUrl.pathname.includes("protocol.create")) {
    try {
      const bodyText = await clonedReq.text();
      console.log(
        "[TRPC Handler] Raw request body for protocol.create:",
        bodyText,
      );
    } catch (e) {
      console.error(
        "[TRPC Handler] Error reading raw request body for protocol.create:",
        e,
      );
    }
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req, // Pass the original request to fetchRequestHandler
    router: appRouter,
    createContext: (opts) => createContext(opts),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error, input, type, ctx }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}:\nError: ${error.message}\nInput: ${JSON.stringify(input)}\nType: ${type}\nCode: ${error.code}\nSession User: ${ctx?.session?.user?.id}`,
            );
            if (error.cause) {
              console.error("Cause:", error.cause);
            }
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
