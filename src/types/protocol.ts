/**
 * TypeScript Types for Medical Protocols
 *
 * This file defines the core data structures for medical protocols,
 * their sections, and versions, as used throughout the application.
 */
import type {
  Protocol,
  ProtocolStatus,
  ProtocolVersion,
  User,
  JsonValue,
} from "./database";

// Represents the content of a single section within a protocol.
// This is a generic structure; specific sections might have more detailed content types.
export interface ProtocolSectionData {
  sectionNumber: number;
  title: string;
  content: string | Record<string, any>; // Can be simple text or structured JSON
  metadata?: Record<string, any>; // Optional metadata like completion status
}

// Represents the full content of a protocol, typically stored in ProtocolVersion.content
// It's a map where keys are section numbers (as strings) and values are ProtocolSectionData.
export type ProtocolFullContent = Record<string, ProtocolSectionData>; // e.g. { "1": {...}, "2": {...}, ... "13": {...} }

// Represents the structure of flowchart data, typically stored in ProtocolVersion.flowchart
export interface FlowchartData {
  nodes: any[]; // Replace 'any' with specific FlowNode type later
  edges: any[]; // Replace 'any' with specific FlowEdge type later
  layout?: any; // Optional layout information
}

// Extends the Supabase ProtocolVersion to include parsed content and flowchart
// Uses Omit to avoid conflicts with the Json types from Supabase
export interface ProtocolVersionWithDetails
  extends Omit<ProtocolVersion, "content" | "flowchart"> {
  content: ProtocolFullContent; // Parsed content
  flowchart: FlowchartData; // Parsed flowchart data
  createdBy: User; // Include user details
}

// Extends the Supabase Protocol to include its versions and creator
export interface ProtocolWithDetails extends Protocol {
  versions: ProtocolVersionWithDetails[];
  createdBy: User;
  // Could also include the latest version directly for convenience
  latestVersion?: ProtocolVersionWithDetails | null;
}

// Input for creating a new protocol
export interface CreateProtocolPayload {
  title: string;
  condition: string;
  // Optional initial content for the first version
  initialContent?: ProtocolFullContent;
  initialFlowchart?: FlowchartData;
}

// Input for updating an existing protocol's metadata or creating a new version
export interface UpdateProtocolPayload {
  protocolId: string;
  title?: string;
  condition?: string;
  status?: ProtocolStatus;
  // If newVersionContent is provided, a new ProtocolVersion will be created
  newVersionContent?: {
    content: ProtocolFullContent;
    flowchart: FlowchartData;
    changelogNotes?: string;
  };
}
