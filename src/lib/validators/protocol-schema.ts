/**
 * Zod Schemas for Protocol Validation
 *
 * This file contains Zod schemas used to validate inputs for tRPC procedures
 * related to medical protocols.
 */
import { z } from "zod";
import { ProtocolStatus } from "@prisma/client"; 

export const ProtocolIdInputSchema = z.object({
  protocolId: z.string().cuid("ID de protocolo inválido (esperado CUID)."), 
});

export const ProtocolVersionIdInputSchema = z.object({
  versionId: z.string().cuid("ID de versão de protocolo inválido (esperado CUID)."), // Changed to CUID
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
});

export const UpdateProtocolInputSchema = z.object({
  protocolId: z.string().cuid(), 
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
});

export const ListProtocolsInputSchema = z.object({
  status: z.nativeEnum(ProtocolStatus).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional().default("updatedAt"), 
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"), 
});

export const ProtocolSectionContentSchema = z.object({
  title: z.string(),
  content: z.any(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const ProtocolFullContentSchema = z.record(
  z.string().regex(/^\d{1,2}$/), 
  ProtocolSectionContentSchema,
);

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

export const NewProtocolVersionContentInputSchema = z.object({
  content: ProtocolFullContentSchema,
  flowchart: FlowchartDataSchema,
  changelogNotes: z.string().optional(),
});

export const UpdateProtocolVersionInputSchema = z.object({
  protocolId: z.string().cuid(), 
  content: ProtocolFullContentSchema.optional(), 
  flowchart: FlowchartDataSchema.optional(), 
  changelogNotes: z.string().optional(),
});

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