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

/**
 * @see https://trpc.io/docs/v11/server/adapters/fetch#used-with-nextjs-app-router
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts) => createContext(opts),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
