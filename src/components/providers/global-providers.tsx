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
import { AccessibleToaster } from "@/components/ui/accessible-toaster";
import { ThemeProvider } from "@/contexts/theme-context";

interface GlobalProvidersProps {
  children: React.ReactNode;
  session: Session | null;
}

export function GlobalProviders({ children, session }: GlobalProvidersProps) {
  return (
    <ThemeProvider>
      <SessionProvider session={session}>
        <TRPCReactProvider>
          {children}
          <AccessibleToaster position="top-center" richColors />
        </TRPCReactProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
