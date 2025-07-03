/**
 * Protected Route/Component Wrapper
 *
 * This component conditionally renders its children based on the user's
 * authentication status, roles, or specific permissions.
 * It's intended for client-side UI protection (e.g., hiding buttons or sections)
 * rather than full-page route protection, which is handled by NextAuth middleware.
 */
"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/database";
import type { PermissionStrings } from "@/lib/auth/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[]; // A single role or an array of allowed roles
  requiredPermission?: PermissionStrings;
  resourceOwnerId?: string; // For ownership-based permission checks
  fallback?: React.ReactNode; // Optional: Component to render if access is denied
  showWhileLoading?: boolean; // Optional: Whether to render children while auth status is loading
  loadingFallback?: React.ReactNode; // Optional: Component to render while loading
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  resourceOwnerId,
  fallback = null,
  showWhileLoading = false,
  loadingFallback = null,
}: ProtectedRouteProps): React.ReactElement | null {
  const {
    user: _user,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    hasPermission,
  } = useAuth();

  if (isLoading) {
    if (showWhileLoading) {
      return <>{children}</>;
    }
    return <>{loadingFallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  let roleCheckPassed = true;
  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      roleCheckPassed = hasAnyRole(requiredRole);
    } else {
      roleCheckPassed = hasRole(requiredRole);
    }
  }

  let permissionCheckPassed = true;
  if (requiredPermission) {
    permissionCheckPassed = hasPermission(requiredPermission, resourceOwnerId);
  }

  if (roleCheckPassed && permissionCheckPassed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
