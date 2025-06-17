/**
 * tRPC Client Configuration
 *
 * This file configures the tRPC client for frontend usage.
 * It integrates with React Query for data fetching, mutations, and caching.
 */
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React, { useState } from "react";
import superjson from "superjson";

import type { AppRouter } from "@/server/api/root";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser should use an absolute URL.
    // Use NEXT_PUBLIC_APP_URL if available (e.g., for consistency in test environments),
    // otherwise, default to window.location.origin.
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  // Server-side
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const trpc = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
            // MAXIMUM TIMEOUT FOR O3 TESTING
            retry: 0, // No retries
            retryDelay: 0,
            // Allow queries to run for up to 7 days
            cacheTime: 604800000, // 7 days
            // @ts-ignore - undocumented but works
            fetchOptions: {
              timeout: 604800000, // 7 days
            },
          },
          mutations: {
            retry: 0, // No retries for mutations
            // @ts-ignore - undocumented but works
            fetchOptions: {
              timeout: 604800000, // 7 days
            },
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`, // Ensures getBaseUrl() provides the scheme and host
          transformer: superjson,
          // MAXIMUM TIMEOUT FOR O3 TESTING
          fetch: (url, options) => {
            // Override fetch with custom timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 604800000); // 7 days

            return fetch(url, {
              ...options,
              signal: controller.signal,
              // Keep connection alive
              keepalive: true,
              // No cache to ensure fresh responses
              cache: "no-store",
            }).finally(() => clearTimeout(timeoutId));
          },
          headers() {
            return {
              connection: "keep-alive",
              "keep-alive": "timeout=86400, max=1000",
            };
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </trpc.Provider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
