/**
 * Audit Logging Utilities
 *
 * Provides functions to consistently log audit events throughout the application.
 */
import type { PrismaClient, AuditLog } from "@prisma/client";
import type { JsonValue } from "@/types/database"; // Using JsonValue for details

export interface AuditEventData {
  userId?: string; // Optional: for system events or unauthenticated actions
  action: string; // e.g., "PROTOCOL_CREATE", "USER_LOGIN_FAILED"
  resourceType?: string; // e.g., "Protocol", "User", "ProtocolVersion"
  resourceId?: string; // ID of the affected resource
  details?: JsonValue; // Any additional JSON-ifiable details
  ipAddress?: string; // Optional: if available from request context
}

/**
 * Logs an audit event to the database.
 *
 * @param db - The PrismaClient instance.
 * @param eventData - The data for the audit event.
 * @returns The created AuditLog entry or null if logging failed.
 */
export async function logAuditEvent(
  db: PrismaClient,
  eventData: AuditEventData,
): Promise<AuditLog | null> {
  try {
    const auditEntry = await db.auditLog.create({
      data: {
        userId: eventData.userId,
        action: eventData.action,
        resourceType: eventData.resourceType,
        resourceId: eventData.resourceId,
        details: eventData.details || undefined, // Ensure undefined if null/empty
        ipAddress: eventData.ipAddress,
      },
    });
    console.log(
      `[AUDIT] Action: ${eventData.action}, User: ${eventData.userId || "System"}, Resource: ${eventData.resourceType || "N/A"}:${eventData.resourceId || "N/A"}`,
    );
    return auditEntry;
  } catch (error) {
    console.error(
      "Failed to log audit event:",
      error,
      "Event Data:",
      eventData,
    );
    // Depending on severity, you might want to handle this error more actively
    // For now, just logging and returning null
    return null;
  }
}

// Define common action strings as constants (optional but good practice)
export const AuditActions = {
  // Protocol Actions
  PROTOCOL_CREATE: "PROTOCOL_CREATE",
  PROTOCOL_UPDATE_METADATA: "PROTOCOL_UPDATE_METADATA", // If separate from versioning
  PROTOCOL_VERSION_CREATE: "PROTOCOL_VERSION_CREATE",
  PROTOCOL_STATUS_CHANGE: "PROTOCOL_STATUS_CHANGE",
  PROTOCOL_DELETE: "PROTOCOL_DELETE", // If implemented
  PROTOCOL_EXPORT: "PROTOCOL_EXPORT",

  // User Actions
  USER_LOGIN_SUCCESS: "USER_LOGIN_SUCCESS",
  USER_LOGIN_FAILURE: "USER_LOGIN_FAILURE",
  USER_LOGOUT: "USER_LOGOUT",
  USER_PASSWORD_RESET_REQUEST: "USER_PASSWORD_RESET_REQUEST",
  USER_PASSWORD_RESET_SUCCESS: "USER_PASSWORD_RESET_SUCCESS",
  USER_ROLE_CHANGE: "USER_ROLE_CHANGE", // Admin action

  // AI Actions
  AI_RESEARCH_PERFORMED: "AI_RESEARCH_PERFORMED",
  AI_PROTOCOL_GENERATED_FULL: "AI_PROTOCOL_GENERATED_FULL",
  AI_PROTOCOL_GENERATED_SECTION: "AI_PROTOCOL_GENERATED_SECTION",

  // System Actions
  SYSTEM_ERROR: "SYSTEM_ERROR",
};
