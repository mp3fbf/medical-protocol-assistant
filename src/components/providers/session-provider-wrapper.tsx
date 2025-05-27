/**
 * SessionProviderWrapper Client Component
 *
 * This component is a client-side wrapper for NextAuth's SessionProvider.
 * It allows us to use SessionProvider within a Server Component (like the root layout)
 * by fetching the session on the server and passing it as a prop.
 */
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth"; // Import the Session type

interface SessionProviderWrapperProps {
  children: React.ReactNode;
  session: Session | null; // The session object obtained from getServerSession
}

export default function SessionProviderWrapper({
  children,
  session,
}: SessionProviderWrapperProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
