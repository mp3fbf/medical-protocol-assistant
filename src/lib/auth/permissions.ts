/**
 * Permission Constants and Matrices
 *
 * This file defines the permissions available in the system and maps them
 * to user roles. It serves as the single source of truth for what actions
 * each role can perform.
 */
import type { UserRole } from "@/types/database"; // Or directly from @prisma/client

// Define available permission strings
export enum Permission {
  // Protocol Permissions
  CREATE_PROTOCOL = "protocol:create",
  VIEW_ANY_PROTOCOL = "protocol:view:any",
  EDIT_OWN_PROTOCOL = "protocol:edit:own",
  EDIT_ANY_PROTOCOL = "protocol:edit:any",
  DELETE_ANY_PROTOCOL = "protocol:delete:any",
  APPROVE_PROTOCOL = "protocol:approve",

  // User Management Permissions (Admin only)
  MANAGE_USERS = "admin:manage:users",
  VIEW_ADMIN_DASHBOARD = "admin:view:dashboard",

  // General access to authenticated features
  ACCESS_AUTHENTICATED_FEATURES = "app:access:authenticated",
}

export type PermissionStrings = `${Permission}`;

// Define the RBAC matrix: maps roles to their permissions
export const ROLE_PERMISSIONS: Record<UserRole, PermissionStrings[]> = {
  CREATOR: [
    Permission.ACCESS_AUTHENTICATED_FEATURES,
    Permission.CREATE_PROTOCOL,
    Permission.VIEW_ANY_PROTOCOL, // Creators can view any protocol for reference/templating
    Permission.EDIT_OWN_PROTOCOL,
  ],
  REVIEWER: [
    Permission.ACCESS_AUTHENTICATED_FEATURES,
    Permission.CREATE_PROTOCOL, // Reviewers might also create protocols
    Permission.VIEW_ANY_PROTOCOL,
    Permission.EDIT_ANY_PROTOCOL, // Reviewers can edit any protocol
    Permission.APPROVE_PROTOCOL,
  ],
  ADMIN: [
    Permission.ACCESS_AUTHENTICATED_FEATURES,
    Permission.CREATE_PROTOCOL,
    Permission.VIEW_ANY_PROTOCOL,
    Permission.EDIT_ANY_PROTOCOL,
    Permission.DELETE_ANY_PROTOCOL,
    Permission.APPROVE_PROTOCOL,
    Permission.MANAGE_USERS,
    Permission.VIEW_ADMIN_DASHBOARD,
  ],
};
