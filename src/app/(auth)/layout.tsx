/**
 * Layout for authenticated routes.
 * Wraps pages under /dashboard, /protocols, etc., with the MainLayout
 * which includes Header and Sidebar.
 */
import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
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
  return <MainLayout>{children}</MainLayout>;
}
