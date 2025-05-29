/**
 * GlobalProviders Client Component
 *
 * This component consolidates all top-level client-side providers,
 * such as NextAuth's SessionProvider and tRPC's TRPCReactProvider.
 * It takes the server-fetched session as a prop to initialize SessionProvider.
 */
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { TRPCReactProvider } from "@/lib/api/client";
import { Toaster } from "sonner";

interface GlobalProvidersProps {
  children: React.ReactNode;
  session: Session | null;
}

export function GlobalProviders({ children, session }: GlobalProvidersProps) {
  return (
    <SessionProvider session={session}>
      <TRPCReactProvider>
        {children}
        <Toaster position="top-center" richColors closeButton duration={5000} />
      </TRPCReactProvider>
    </SessionProvider>
  );
}
