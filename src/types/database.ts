/**
 * Centralized export for Prisma-generated database types.
 * This allows for cleaner imports in other parts of the application.
 *
 * Example:
 * import type { User, Protocol } from "@/types/database";
 */
import type {
  User,
  Protocol,
  ProtocolVersion,
  AuditLog,
  UserRole,
  ProtocolStatus,
} from "@prisma/client";

export type {
  User,
  Protocol,
  ProtocolVersion,
  AuditLog,
  UserRole,
  ProtocolStatus,
};

// It can also be useful to export Prisma's utility types if needed elsewhere
// For example:
// export type { Prisma } from "@prisma/client";

// If you have Json types that you want to strongly type, you can define interfaces here
// and use them when interacting with `content` or `flowchart` fields.
// e.g.
// export interface ProtocolContent { /* ... structure of the 13 sections ... */ }
// export interface FlowchartData { /* ... structure of nodes and edges ... */ }
