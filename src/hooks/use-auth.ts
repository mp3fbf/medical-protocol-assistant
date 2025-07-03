/**
 * Custom Authentication React Hook
 *
 * This hook provides an easy way to access the user's session, role,
 * and check permissions within React components. It builds upon
 * `useSession` from `next-auth/react`.
 */
import { useSession } from "next-auth/react";
import {
  checkPermission as checkUserPermission,
  userHasRole as checkUserHasRole,
  userHasAnyRole as checkUserHasAnyRole,
} from "@/lib/auth/rbac";
import type { PermissionStrings } from "@/lib/auth/permissions";
import type { UserRole } from "@/types/database";

interface UseAuthReturn {
  user: NonNullable<ReturnType<typeof useSession>["data"]>["user"] | null;
  session: ReturnType<typeof useSession>["data"] | null;
  status: ReturnType<typeof useSession>["status"];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (
    permission: PermissionStrings,
    resourceOwnerId?: string,
  ) => boolean;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  /**
   * Checks if the current user has a specific role.
   */
  const hasRole = (role: UserRole): boolean => {
    if (!user || !user.role) return false;
    return checkUserHasRole(user, role);
  };

  /**
   * Checks if the current user has any of the specified roles.
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user || !user.role) return false;
    return checkUserHasAnyRole(user, roles);
  };

  /**
   * Checks if the current user has a specific permission.
   * Optionally considers resource ownership.
   */
  const hasPermission = (
    permission: PermissionStrings,
    resourceOwnerId?: string,
  ): boolean => {
    if (!user || !user.role) return false;
    return checkUserPermission(
      user.role as UserRole, // Role is asserted as UserRole from session type
      permission,
      resourceOwnerId,
      user.id, // Pass current user's ID for ownership checks
    );
  };

  return {
    user,
    session,
    status,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    hasPermission,
  };
}
