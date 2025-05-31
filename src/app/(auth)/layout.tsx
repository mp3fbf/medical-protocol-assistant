/**
 * Layout for authenticated routes.
 * Now using Ultra Design System layout without wasteful sidebar.
 */
import React from "react";
import { MainLayoutUltra } from "@/components/layout/main-layout-ultra";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
// SessionProvider is no longer needed here as it's in the root layout.

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    // This should ideally be caught by middleware, but good as a fallback
    redirect("/login");
  }

  // The SessionProvider is now in the root layout.
  // TRPCReactProvider is also in the root layout.
  return <MainLayoutUltra>{children}</MainLayoutUltra>;
}
