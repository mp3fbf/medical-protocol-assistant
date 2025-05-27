/**
 * Layout for authenticated routes.
 * Wraps pages under /dashboard, /protocols, etc., with the MainLayout
 * which includes Header and Sidebar.
 */
import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { TRPCReactProvider } from "@/lib/api/client"; // Already in root, but could be here if needed
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
// SessionProvider might be needed if useSession is used in children of MainLayout directly
// For now, assuming MainLayout and its direct children (Header, Sidebar) might use useAuth which uses useSession
import { SessionProvider } from "next-auth/react"; // Important for useAuth hook

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    // This should ideally be caught by middleware, but good as a fallback
    redirect("/login");
  }

  return (
    // The SessionProvider is crucial here if `useAuth` (which uses `useSession`)
    // is called by any components within this layout tree on the client-side.
    // The root layout already has TRPCReactProvider.
    <SessionProvider session={session}>
      <MainLayout>{children}</MainLayout>
    </SessionProvider>
  );
}
