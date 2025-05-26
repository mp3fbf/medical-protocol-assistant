/**
 * Zod Schemas for Protocol Validation
 *
 * This file contains Zod schemas used to validate inputs for tRPC procedures
 * related to medical protocols.
 */
import { z } from "zod";
import { ProtocolStatus } from "@prisma/client"; // Import enum from Prisma

export const ProtocolIdInputSchema = z.object({
  protocolId: z.string().uuid("ID de protocolo inválido."),
});

export const ProtocolVersionIdInputSchema = z.object({
  versionId: z.string().uuid("ID de versão de protocolo inválido."),
});

export const CreateProtocolInputSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(255, "O título deve ter no máximo 255 caracteres."),
  condition: z
    .string()
    .min(3, "A condição médica deve ter pelo menos 3 caracteres.")
    .max(255, "A condição médica deve ter no máximo 255 caracteres."),
  // Initial content and flowchart can be empty or have a default structure.
  // For now, we assume they are initialized as empty JSON objects by the backend.
  // If AI generates initial content, this schema might need to include it.
});

export const UpdateProtocolInputSchema = z.object({
  protocolId: z.string().uuid(),
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(255, "O título deve ter no máximo 255 caracteres.")
    .optional(),
  condition: z
    .string()
    .min(3, "A condição médica deve ter pelo menos 3 caracteres.")
    .max(255, "A condição médica deve ter no máximo 255 caracteres.")
    .optional(),
  status: z.nativeEnum(ProtocolStatus).optional(),
  // For a full update, this would include content for all 13 sections and flowchart data.
  // This will be expanded in later steps.
  // For now, allowing only metadata updates.
  // content: z.record(z.string(), z.any()).optional(), // Placeholder for 13 sections
  // flowchart: z.object({}).optional(), // Placeholder for flowchart data
});

export const ListProtocolsInputSchema = z.object({
  status: z.nativeEnum(ProtocolStatus).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional().default("updatedAt"), // Default sort field
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"), // Default sort order
});

// Represents the structure of a single section's content.
// This will be refined as specific section editors are built.
export const ProtocolSectionContentSchema = z.object({
  title: z.string(),
  // content can be simple text, or more structured data like lists, tables, etc.
  // Using z.any() for now, to be refined per section.
  content: z.any(),
  // metadata can store things like completion status, last edited by, etc.
  metadata: z.record(z.string(), z.any()).optional(),
});

// Represents the full content of a protocol version (all 13 sections).
// The keys would be section numbers (e.g., "1", "2", ..., "13").
export const ProtocolFullContentSchema = z.record(
  z.string().regex(/^\d{1,2}$/), // Section number as string key
  ProtocolSectionContentSchema,
);

// Placeholder for Flowchart data schema
export const FlowchartDataSchema = z.object({
  nodes: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        data: z.any(),
        position: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .optional()
    .default([]),
  edges: z
    .array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        label: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  layout: z.any().optional(),
});

// Schema for a new protocol version's content
export const NewProtocolVersionContentInputSchema = z.object({
  content: ProtocolFullContentSchema,
  flowchart: FlowchartDataSchema,
  changelogNotes: z.string().optional(),
});

// Schema for updating a protocol version (usually creating a new one)
export const UpdateProtocolVersionInputSchema = z.object({
  protocolId: z.string().uuid(),
  content: ProtocolFullContentSchema.optional(), // Full content of 13 sections
  flowchart: FlowchartDataSchema.optional(), // Flowchart data
  changelogNotes: z.string().optional(),
});

// AI Research Data Schemas
export const AIResearchFindingSchema = z.object({
  id: z.string(),
  source: z.string(),
  findingType: z.enum([
    "diagnostic_criteria",
    "treatment_protocol",
    "geriatric_consideration",
    "dosage_information",
    "numeric_threshold",
    "other",
  ]),
  extractedText: z.string(),
  summary: z.string().optional(),
  objectiveCriteria: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const AIResearchDataSchema = z.object({
  query: z.string(),
  findings: z.array(AIResearchFindingSchema),
  summary: z.string().optional(),
  timestamp: z.string(),
});
