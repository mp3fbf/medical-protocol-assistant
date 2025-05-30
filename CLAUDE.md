# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Production build
- `pnpm lint` - ESLint with auto-fix
- `pnpm format` - Prettier formatting

### Database Operations

- `pnpm prisma:migrate:dev` - Create and apply development migrations
- `pnpm prisma:generate` - Generate Prisma client after schema changes
- `pnpm prisma:studio` - Open database GUI
- `pnpm prisma:seed` - Seed database with test data
- Configure DATABASE_URL in `.env.local` for your database (PostgreSQL/Supabase)

### Testing

- `pnpm test` - Unit tests with Vitest
- `pnpm test:coverage` - Test coverage report
- `pnpm test:e2e` - Playwright end-to-end tests
- `pnpm test:e2e:ui` - Playwright with UI for debugging

## Architecture Overview

### Tech Stack

- **Next.js 14** with App Router and TypeScript
- **tRPC** for type-safe API endpoints
- **Prisma** ORM with PostgreSQL database
- **NextAuth** for authentication with RBAC (CREATOR/REVIEWER/ADMIN)
- **React Query** for server state management
- **ReactFlow** for protocol flowchart visualization
- **Multi-Provider AI** integration (OpenAI, Anthropic, Gemini) with abstraction layer

### Core Concepts

- **Medical Protocols**: 13-section structured documents with metadata, indications, procedures, and flowcharts
- **Protocol Versions**: Immutable versions with audit logging for all changes
- **Role-Based Access**: Users have creator, reviewer, or admin permissions
- **AI Generation**: Multiple generation modes with provider abstraction
  - **Automatic**: AI research + full protocol generation
  - **Manual**: Section-by-section with AI assistance
  - **Material-Based**: Upload documents (PDF/DOCX/TXT) + optional research supplementation
- **Document Upload**: Parse medical materials (PDF, DOCX, TXT, Markdown) to generate protocols
- **Advanced Validation**: Comprehensive medical content validation system ✅ **IMPLEMENTED**
  - **Medical Safety**: Dosage validation, procedure safety checks, contraindication warnings
  - **Completeness**: Required fields validation, section completeness
  - **Evidence-Based**: Bibliography and reference quality validation
  - **Manual Validation**: Click-to-validate with detailed error reporting and categorization
  - **Professional UI**: Error count badges, scrollable issue list, and improvement suggestions
- **Smart Flowchart Generation**: AI-powered flowchart creation with medical intelligence
  - **Protocol Type Detection**: Automatic classification (Emergency, Diagnostic, Therapeutic, Monitoring)
  - **Intelligent Layouts**: Type-specific node arrangements and priorities
  - **Medical Optimization**: Focus on critical decision points and safety protocols
- **Document Export**: Generate DOCX/PDF with ABNT medical formatting standards

### Key Directories

- `/src/app/` - Next.js App Router with (auth) protected routes
- `/src/components/protocol/` - Protocol-specific UI components
- `/src/lib/ai/` - Multi-provider AI integration and structured prompts
  - `/providers/` - AI provider abstraction (OpenAI, Anthropic, Gemini)
  - `/prompts/` - Structured prompts for protocol generation
- `/src/lib/upload/` - Document parsing system for medical materials
- `/src/lib/validators/` - Comprehensive validation system
  - `protocol-schema.ts` - Zod schemas for data validation
  - `medical-content.ts` - Medical-specific validation rules
  - `completeness.ts` - Protocol completeness validation
  - `cross-validation.ts` - Cross-section consistency checks
- `/src/lib/flowchart/` - Smart flowchart generation system
  - `smart-generator.ts` - AI-powered flowchart generation with medical intelligence
  - `generator.ts` - Basic flowchart generation
  - `layout.ts` - Layout algorithms for different protocol types
- `/src/server/api/routers/` - tRPC API endpoints
- `/tests/e2e/` - Playwright tests with authentication setup

### Development Guidelines

- All protocol changes must be audited and logged
- Every protocol requires all 13 medical sections
- UI text in Portuguese, code comments in English
- No `any` types - strict TypeScript enforcement
- Functional components only, no class components
- Tailwind CSS for all styling (no custom CSS)
- Pre-commit hooks run Prettier and ESLint automatically

### Database Schema

- `User` - Authentication with hashed passwords and roles
- `Protocol` - Main protocol entities with metadata
- `ProtocolVersion` - Immutable versions of protocol content
- `AuditLog` - Track all protocol creation and modification events

### Performance Requirements

- AI protocol generation: <30 seconds
- Document export: <5 seconds
- Page load times: <3 seconds for authenticated routes
- Protocol validation: <5 seconds for 13-section analysis

### Current Status

**✅ Completed Features:**

- Complete authentication system with RBAC
- Full protocol editor with 13-section navigation
- Comprehensive validation system with medical safety checks
- AI-powered protocol generation (multiple modes)
- Material upload and document parsing
- Smart flowchart generation with medical intelligence
- Professional validation UI with error categorization
- Document export functionality (PDF/DOCX) with ABNT formatting
- Protocol status management with role-based permissions
- Dashboard with real-time statistics (excluding archived protocols)
- Protocol list with search, filtering by status, and sorting
- Auto-validation with debouncing (2-second delay)

**🔄 Known Issues (Pending):**

- Flowchart visual rendering needs connection with ReactFlow canvas
- Visual layout refinements needed for better spacing and readability
- Rich text editor not implemented (using plain text)

**📋 Next Priority Tasks:**

- Complete flowchart visualization with ReactFlow integration
- Implement rich text editor for better content editing
- Add protocol version comparison feature
- Implement advanced collaboration features
- Add batch export functionality
