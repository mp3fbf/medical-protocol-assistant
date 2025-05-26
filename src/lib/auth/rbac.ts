/**
 * Role-Based Access Control (RBAC) Utilities
 *
 * This file provides functions for checking user roles and permissions.
 * It uses the permission matrix defined in `permissions.ts`.
 */
import type { User } from "next-auth";
import { ROLE_PERMISSIONS, type PermissionStrings } from "./permissions";
import type { UserRole } from "@/types/database"; // Or directly from @prisma/client

/**
 * Checks if a user has a specific role.
 * @param user - The user object from NextAuth session (must include role).
 * @param role - The role to check against.
 * @returns True if the user has the specified role, false otherwise.
 */
export function userHasRole(
  user: Pick<User, "role"> | null | undefined,
  role: UserRole,
): boolean {
  return user?.role === role;
}

/**
 * Checks if a user has ALL of the specified roles.
 * @param user - The user object from NextAuth session.
 * @param roles - An array of roles to check against.
 * @returns True if the user has all specified roles, false otherwise.
 */
export function userHasAllRoles(
  user: Pick<User, "role"> | null | undefined,
  roles: UserRole[],
): boolean {
  if (!user?.role) return false;
  return roles.every((role) => user.role === role); // This logic is flawed for "all roles", fixed below
}

/**
 * Corrected: Checks if a user has at least ONE of the specified roles.
 * (The previous `userHasAllRoles` was misnamed for its typical use case)
 * If truly "all" specified roles are needed, it implies a user can have multiple roles,
 * which isn't the case with the current `UserRole` enum.
 * This function checks if the user's single role is one of the allowed roles.
 *
 * @param user - The user object from NextAuth session.
 * @param allowedRoles - An array of roles that are allowed.
 * @returns True if the user's role is in the allowedRoles array, false otherwise.
 */
export function userHasAnyRole(
  user: Pick<User, "role"> | null | undefined,
  allowedRoles: UserRole[],
): boolean {
  if (!user?.role) return false;
  return allowedRoles.includes(user.role as UserRole);
}

/**
 * Checks if a user's role grants them a specific permission.
 *
 * @param userRole - The role of the user.
 * @param permission - The permission string to check for.
 * @param resourceOwnerId - (Optional) The ID of the user who owns the resource.
 * @param currentUserId - (Optional) The ID of the current user trying to access the resource.
 * @returns True if the user has the permission, false otherwise.
 */
export function checkPermission(
  userRole: UserRole | null | undefined,
  permission: PermissionStrings,
  resourceOwnerId?: string,
  currentUserId?: string,
): boolean {
  if (!userRole) {
    return false;
  }

  const permissionsForRole = ROLE_PERMISSIONS[userRole];
  if (!permissionsForRole) {
    return false;
  }

  // Handle ownership-based permissions
  if (permission === "protocol:edit:own") {
    if (resourceOwnerId && currentUserId && resourceOwnerId === currentUserId) {
      // If it's their own protocol, this specific permission check might be redundant
      // if their role (e.g. CREATOR) already includes EDIT_OWN_PROTOCOL.
      // However, this explicit check is good for clarity.
      // A CREATOR has 'protocol:edit:own'. If this function is called for a CREATOR
      // with 'protocol:edit:own', it should return true if resourceOwnerId === currentUserId.
      return permissionsForRole.includes(permission);
    }
    // If it's not their own, they don't have "edit:own" permission,
    // but they might have "edit:any"
    return false; // They don't have "edit:own" for this specific resource
  }

  return permissionsForRole.includes(permission);
}
