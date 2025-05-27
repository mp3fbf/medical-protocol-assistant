# Medical Protocol Assistant - API Documentation

## Overview

The backend API for the Medical Protocol Assistant is built using **tRPC** on a Next.js server environment. This allows for end-to-end typesafe APIs without manual schema definition or code generation for the client-server interface.

All API interactions from the frontend should utilize the tRPC client (`src/lib/api/client.tsx`).

## Authentication

API routes are protected using NextAuth.js.

- Most procedures require an authenticated session (JWT-based).
- The `protectedProcedure` helper in tRPC (`src/server/api/trpc.ts`) enforces this.
- User roles (`CREATOR`, `REVIEWER`, `ADMIN`) are part of the session and can be used for fine-grained access control within procedures.

## Key Routers and Procedures

The API is organized into several routers, each handling a specific domain. These are combined in `src/server/api/root.ts`.

### 1. `protocolRouter` (`src/server/api/routers/protocol.ts`)

Handles CRUD operations and management of medical protocols.

- **`create(input: CreateProtocolInputSchema)`**: (Mutation) Creates a new protocol with a default first version.
  - Input: `{ title: string, condition: string }`
  - Output: The newly created `Protocol` object with its initial `ProtocolVersion`.
- **`list(input: ListProtocolsInputSchema)`**: (Query) Lists protocols with pagination, filtering (status, search), and sorting.
  - Input: `{ status?: ProtocolStatus, search?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc'|'desc' }`
  - Output: `{ items: ProtocolWithDetails[], totalItems: number, totalPages: number, currentPage: number }`
- **`getById(input: ProtocolIdInputSchema)`**: (Query) Retrieves a single protocol by its ID, including all its versions.
  - Input: `{ protocolId: string }`
  - Output: `ProtocolWithDetails` object or `null`.
- **`update(input: UpdateProtocolVersionInputSchema)`**: (Mutation) Updates a protocol, typically by creating a new version with new content/flowchart. Can also update protocol metadata.
  - Input: `{ protocolId: string, content?: ProtocolFullContent, flowchart?: FlowchartData, changelogNotes?: string, title?: string, condition?: string, status?: ProtocolStatus }`
  - Output: The newly created or updated `ProtocolVersion` or the updated `Protocol`.

### 2. `researchRouter` (`src/server/api/routers/research.ts`)

Handles AI-powered medical literature research.

- **`performResearch(input: DeepResearchQueryInputSchema)`**: (Mutation) Initiates a research task using DeepResearch (mocked) and AI processing.
  - Input: `{ condition: string, sources?: string[], yearRange?: number, keywords?: string[] }`
  - Output: `AggregatedResearchOutput` containing structured findings.

### 3. `generationRouter` (`src/server/api/routers/generation.ts`)

Handles AI-driven generation of protocol content.

- **`generateFullProtocol(input: AIFullProtocolGenerationInputSchema)`**: (Mutation) Generates content for all 13 sections of a protocol.
  - Input: `{ medicalCondition: string, researchData: AIResearchData, specificInstructions?: string }`
  - Output: `AIFullProtocolGenerationOutput` (which is `ProtocolFullContent`).
- **`generateSingleSection(input: AIProtocolSectionInputSchema)`**: (Mutation) Generates content for a single specified protocol section.
  - Input: `{ medicalCondition: string, sectionNumber: number, researchFindings?: AIResearchFinding[], previousSectionsContent?: Partial<ProtocolFullContent>, specificInstructions?: string }`
  - Output: `AIProtocolSectionOutput` (which is `ProtocolSectionData`).

### 4. `exportRouter` (`src/server/api/routers/export.ts`)

Handles exportation of protocol documents.

- **`exportProtocol(input: ExportInputSchema)`**: (Mutation) Generates and prepares a protocol document for download.
  - Input: `{ protocolId: string, versionId: string, format: 'docx' | 'pdf' | 'svg' }`
  - Output: `{ filename: string, url: string (signed URL to Supabase Storage), message: string }`

### 5. `userRouter` (`src/server/api/routers/user.ts`)

Handles user-related information.

- **`getSelf()`**: (Query) Retrieves the session details for the currently authenticated user.
  - Input: None.
  - Output: NextAuth `Session['user']` object (includes id, name, email, role).

## Data Models

Refer to `prisma/schema.prisma` for detailed database models (User, Protocol, ProtocolVersion, AuditLog).
Key TypeScript types derived from these can be found in `src/types/database.ts`, `src/types/protocol.ts`, etc.

## Error Handling

tRPC procedures will throw `TRPCError` on failure. Common codes:

- `BAD_REQUEST`: Invalid input.
- `UNAUTHORIZED`: Authentication required.
- `FORBIDDEN`: Authenticated but not permitted for the action.
- `NOT_FOUND`: Resource not found.
- `INTERNAL_SERVER_ERROR`: Unexpected server-side error.

The client should handle these errors appropriately.

## Using the tRPC Client

The frontend uses a pre-configured tRPC client. Example usage:

```typescript
import { trpc } from '@/lib/api/client';

// Query
const { data, error, isLoading } = trpc.protocol.list.useQuery({ limit: 10 });

// Mutation
const createMutation = trpc.protocol.create.useMutation();
createMutation.mutate({ title: "New Protocol", condition: "Fever" });

Refer to tRPC and React Query documentation for more advanced usage patterns.
```
