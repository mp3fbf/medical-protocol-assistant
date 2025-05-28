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
- Database runs on Docker via `docker-compose up -d` on port 54322

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
- **OpenAI** integration for protocol generation

### Core Concepts
- **Medical Protocols**: 13-section structured documents with metadata, indications, procedures, and flowcharts
- **Protocol Versions**: Immutable versions with audit logging for all changes
- **Role-Based Access**: Users have creator, reviewer, or admin permissions
- **AI Generation**: Structured prompts generate protocol content and flowcharts
- **Document Export**: Generate DOCX/PDF with ABNT medical formatting standards

### Key Directories
- `/src/app/` - Next.js App Router with (auth) protected routes
- `/src/components/protocol/` - Protocol-specific UI components
- `/src/lib/ai/` - OpenAI integration and structured prompts
- `/src/lib/validators/` - Zod schemas for data validation
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