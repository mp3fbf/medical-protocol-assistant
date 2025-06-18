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
- Always update @README.md and @docs/project-roadmap.md and run pnpm build before each commit

### Common Errors and Solutions

**ThemeProvider Error (FREQUENT ISSUE)**:

- **Error**: `useTheme must be used within a ThemeProvider`
- **Cause**: ThemeToggle component used outside ThemeProvider context (usually in login page)
- **SOLUTION**: DO NOT use ThemeToggle in the login page or any page outside the (auth) group
- **Why**: Login page renders before GlobalProviders are ready, causing context error
- **Note**: ThemeProvider is in GlobalProviders but login page has special rendering

### Database Schema

- `User` - Authentication with hashed passwords and roles
- `Protocol` - Main protocol entities with metadata
- `ProtocolVersion` - Immutable versions of protocol content
- `AuditLog` - Track all protocol creation and modification events

### Performance Requirements

**⚠️ IMPORTANTE: QUALIDADE SOBRE VELOCIDADE ⚠️**

- **PRIORIDADE ABSOLUTA**: Qualidade e completude do conteúdo médico
- **SEM ECONOMIA**: Não economizar tokens ou tempo se comprometer qualidade
- **COMPLEXIDADE ESPERADA**: Protocolos são obrigatoriamente complexos e extensos
- **NUNCA IMPLEMENTAR ATALHOS** que reduzam qualidade para ganhar performance

Tempos aceitáveis (mas NÃO são limitantes):

- AI protocol generation: 5-15 minutos (O3 pode levar o tempo necessário)
- Document export: <30 seconds
- Page load times: <3 seconds for authenticated routes
- Protocol validation: <30 seconds para análise completa

### UI/UX Design System

**Ultra Design System v2** - A modern, mathematical design system:

- **Mathematical Spacing**: Based on Golden Ratio (1.618) for harmonious proportions
- **Glassmorphism Effects**: Modern glass-like UI elements with backdrop blur
- **Gradient System**: Vibrant gradients (indigo → purple → pink) for CTAs
- **Typography**: Fluid responsive sizing with excellent readability
- **Animations**: Smooth Spring physics-based transitions
- **Information Density**: Maximized screen real estate usage
- **Accessibility**: Full support for `prefers-reduced-motion` and high contrast

### Current Status

**✅ Completed Features:**

- Complete authentication system with RBAC
- Full protocol editor with 13-section navigation
- Comprehensive validation system with medical safety checks
- AI-powered protocol generation (multiple modes) with dynamic progress messages
- Material upload and document parsing
- Smart flowchart generation with medical intelligence
- Professional validation UI with error categorization
- Document export functionality (PDF/DOCX) with ABNT formatting
- Protocol status management with role-based permissions
- Dashboard with real-time statistics (excluding archived protocols)
- Protocol list with search, filtering by status, and sorting
- Auto-validation with debouncing (2-second delay)
- Flowchart visualization with ReactFlow integration
- Dynamic loading messages during protocol and flowchart generation
- Fullscreen mode for flowchart visualization
- Custom flowchart controls with better layout and tooltips
- **Manual flowchart editing capabilities** with node creation, deletion, and connection management
- **First-visit onboarding system** for flowchart editor with "Don't show again" option
- **Rich text editor (TipTap)** with full formatting support (bold, italic, lists, tables, alignment)
- **Ultra Design System v2** with mathematical spacing based on Golden Ratio
- **Redesigned homepage** with modern glassmorphism effects and improved contrast
- **Protocol Editor Ultra V2** with maximum information density and compact layout
- **Removed wasteful sidebar** - navigation integrated into header for better space utilization
- **Dedicated flowchart page** at `/protocols/[id]/flowchart` for focused visualization
- **Visual flowchart indicators** showing when protocols have/don't have flowcharts
- **Dynamic button states** that change based on flowchart existence

**🔄 Known Issues (Pending):**

- Protocol version comparison not yet implemented
- Batch export functionality pending
- Real-time collaboration features not implemented

**📋 Next Priority Tasks:**

- Add protocol version comparison feature
- Implement advanced collaboration features
- Add batch export functionality
- Enhanced analytics and monitoring
- Mobile app development
