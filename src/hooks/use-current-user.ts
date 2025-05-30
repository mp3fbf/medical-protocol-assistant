/**
 * Hook to get current user data including role
 */
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    userId: session?.user?.id,
    userRole: (session?.user?.role as UserRole) || UserRole.CREATOR,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
