# Implementation Plan

## Project Foundation

- [x] **Step 1 – Initialize Next.js Project Structure** (Effort: S, Risk: Low, Rollback: Safe)

  - **Task**: Create Next.js 14 project with TypeScript, configure folder structure, install core dependencies.
  - **Files**:
    - `package.json`: Next.js 14, TypeScript, core dependencies
    - `tsconfig.json`: strict TypeScript configuration
    - `tailwind.config.js`: custom color palette and design tokens
    - `next.config.js`: basic configuration
    - `src/app/layout.tsx`: root layout with providers
    - `src/app/page.tsx`: landing page placeholder
  - **Step Dependencies**: none
  - **User Instructions**: Run `pnpm create next-app medical-protocol-assistant --typescript --tailwind --app`

- [x] **Step 2 – Setup Development Environment** (Effort: S, Risk: Low, Rollback: Safe)
  - **Task**: Configure ESLint, Prettier, Husky, and development tooling.
  - **Files**:
    - `.eslintrc.json`: strict ESLint rules for TypeScript
    - `.prettierrc`: code formatting rules
    - `.husky/pre-commit`: lint-staged configuration
    - `.env.example`: environment variables template
    - `README.md`: project setup instructions
  - **Step Dependencies**: Step 1
  - **User Instructions**: Copy `.env.example` to `.env.local` and fill in placeholder values

## Database & Schema Setup

- [ ] **Step 3 – Configure Database Schema** (Effort: M, Risk: Med, Rollback: Reversible)

  - **Task**: Setup Prisma with PostgreSQL schema for protocols, users, versions, and audit logging.
  - **Files**:
    - `prisma/schema.prisma`: complete database schema with all entities
    - `prisma/migrations/`: initial migration files
    - `src/lib/db/client.ts`: Prisma client configuration
    - `src/lib/db/seed.ts`: seed data for development
  - **Step Dependencies**: Step 1
  - **User Instructions**: Setup PostgreSQL locally with Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15`
  - **Rollback**: Drop database and re-run migrations if schema changes needed

- [ ] **Step 4 – Database Connection & Types** (Effort: S, Risk: Low, Rollback: Safe)
  - **Task**: Generate Prisma types and setup database connection utilities.
  - **Files**:
    - `src/types/database.ts`: generated Prisma types exports
    - `src/lib/db/queries.ts`: common database query helpers
    - `src/lib/db/constants.ts`: database constants and enums
  - **Step Dependencies**: Step 3
  - **User Instructions**: Run `npx prisma generate` and `npx prisma db push`

## Authentication & Authorization

- [ ] **Step 5 – NextAuth Configuration** (Effort: M, Risk: Med, Rollback: Reversible)

  - **Task**: Setup NextAuth with credentials provider and session management.
  - **Files**:
    - `src/lib/auth/config.ts`: NextAuth configuration with credentials
    - `src/lib/auth/providers.ts`: authentication providers setup
    - `src/app/api/auth/[...nextauth]/route.ts`: NextAuth API route
    - `src/middleware.ts`: auth middleware for protected routes
    - `src/types/auth.ts`: authentication type definitions
  - **Step Dependencies**: Step 4
  - **User Instructions**: Generate NEXTAUTH_SECRET with `openssl rand -base64 32`

- [ ] **Step 6 – Role-Based Access Control** (Effort: M, Risk: Low, Rollback: Safe)
  - **Task**: Implement RBAC system with creator/reviewer/admin roles.
  - **Files**:
    - `src/lib/auth/rbac.ts`: role validation and permission checking
    - `src/lib/auth/permissions.ts`: permission constants and matrices
    - `src/hooks/use-auth.ts`: authentication React hook
    - `src/components/auth/protected-route.tsx`: route protection component
  - **Step Dependencies**: Step 5
  - **User Instructions**: none

## Core API Layer

- [ ] **Step 7 – tRPC Server Setup** (Effort: M, Risk: Low, Rollback: Safe)

  - **Task**: Configure tRPC with context, middleware, and basic router structure.
  - **Files**:
    - `src/server/api/trpc.ts`: tRPC server configuration
    - `src/server/api/context.ts`: request context with auth and db
    - `src/server/api/root.ts`: root router combining all routers
    - `src/app/api/trpc/[trpc]/route.ts`: tRPC API route handler
    - `src/lib/api/client.ts`: tRPC client configuration
  - **Step Dependencies**: Step 6
  - **User Instructions**: none

- [ ] **Step 8 – Protocol API Router** (Effort: M, Risk: Low, Rollback: Safe)
  - **Task**: Create tRPC router for protocol CRUD operations with validation.
  - **Files**:
    - `src/server/api/routers/protocol.ts`: protocol management endpoints
    - `src/lib/validators/protocol.ts`: Zod schemas for protocol validation
    - `src/server/api/routers/user.ts`: user management endpoints
    - `src/types/protocol.ts`: TypeScript types for protocols
  - **Step Dependencies**: Step 7
  - **User Instructions**: none

## AI Integration Foundation

- [ ] **Step 9 – OpenAI Client Setup** (Effort: S, Risk: Med, Rollback: Safe)

  - **Task**: Configure OpenAI client with structured output and error handling.
  - **Files**:
    - `src/lib/ai/client.ts`: OpenAI client configuration
    - `src/lib/ai/types.ts`: AI request/response types
    - `src/lib/ai/errors.ts`: AI-specific error handling
    - `src/lib/ai/config.ts`: AI model configuration and limits
  - **Step Dependencies**: Step 1
  - **User Instructions**: Obtain OpenAI API key and add to environment variables

- [ ] **Step 10 – Medical Research Integration** (Effort: L, Risk: High, Rollback: Safe)
  - **Task**: Implement DeepResearch API integration for medical literature search.
  - **Files**:
    - `src/lib/ai/research.ts`: research API client and data extraction
    - `src/lib/ai/prompts/research.ts`: research prompt templates
    - `src/server/api/routers/research.ts`: research endpoints
    - `src/types/research.ts`: research data types
    - `src/lib/ai/research.test.ts`: research functionality tests
  - **Step Dependencies**: Step 9
  - **User Instructions**: Configure DeepResearch API credentials if available, otherwise implement mock responses

## Protocol Generation Engine

- [ ] **Step 11 – AI Protocol Generation** (Effort: L, Risk: High, Rollback: Safe)

  - **Task**: Create AI-powered protocol generation with all 13 sections and structured output.
  - **Files**:
    - `src/lib/ai/generator.ts`: main protocol generation logic
    - `src/lib/ai/prompts/sections.ts`: section-specific prompts for all 13 sections
    - `src/lib/ai/prompts/medical.ts`: medical protocol generation prompts
    - `src/lib/validators/medical.ts`: medical content validation schemas
    - `src/server/api/routers/generation.ts`: generation API endpoints
  - **Step Dependencies**: Step 10
  - **User Instructions**: none

- [ ] **Step 12 – Protocol Validation Engine** (Effort: L, Risk: Med, Rollback: Safe)
  - **Task**: Build comprehensive validation system for protocol structure and content consistency.
  - **Files**:
    - `src/lib/validators/protocol-structure.ts`: structural validation rules
    - `src/lib/validators/medication.ts`: medication validation against CSV
    - `src/lib/validators/cross-validation.ts`: text-flowchart consistency checks
    - `src/lib/validators/completeness.ts`: completeness validation rules
    - `public/data/medications.csv`: medication database
  - **Step Dependencies**: Step 11
  - **User Instructions**: Upload medication CSV file to public/data/ folder

## Document Generation System

- [ ] **Step 13 – Word Document Generation** (Effort: L, Risk: Med, Rollback: Safe)

  - **Task**: Implement DOCX generation with ABNT formatting and template compliance.
  - **Files**:
    - `src/lib/generators/docx.ts`: Word document generation with docx library
    - `src/lib/generators/templates.ts`: ABNT template configuration
    - `public/templates/protocol-template.docx`: base Word template
    - `src/server/api/routers/export.ts`: document export endpoints
  - **Step Dependencies**: Step 8
  - **User Instructions**: Add ABNT-compliant Word template to public/templates/

- [ ] **Step 14 – PDF and SVG Export** (Effort: M, Risk: Low, Rollback: Safe)
  - **Task**: Add PDF export and SVG flowchart generation capabilities.
  - **Files**:
    - `src/lib/generators/pdf.ts`: PDF generation using react-pdf
    - `src/lib/generators/svg.ts`: SVG flowchart export
    - `src/lib/generators/utils.ts`: shared generation utilities
  - **Step Dependencies**: Step 13
  - **User Instructions**: none

## Flowchart System

- [ ] **Step 15 – ReactFlow Integration** (Effort: L, Risk: Med, Rollback: Safe)

  - **Task**: Setup ReactFlow for visual flowchart editing with custom nodes and medical-specific components.
  - **Files**:
    - `src/components/flowchart/canvas.tsx`: main flowchart canvas component
    - `src/components/flowchart/nodes/decision-node.tsx`: decision point nodes
    - `src/components/flowchart/nodes/action-node.tsx`: action/treatment nodes
    - `src/components/flowchart/nodes/medication-node.tsx`: medication table nodes
    - `src/lib/flowchart/types.ts`: flowchart data types
  - **Step Dependencies**: Step 8
  - **User Instructions**: none

- [ ] **Step 16 – Flowchart Auto-Generation** (Effort: L, Risk: High, Rollback: Safe)
  - **Task**: Generate flowcharts automatically from protocol text using AI and layout algorithms.
  - **Files**:
    - `src/lib/flowchart/generator.ts`: text-to-flowchart conversion
    - `src/lib/flowchart/layout.ts`: automatic layout using dagre
    - `src/lib/ai/prompts/flowchart.ts`: flowchart generation prompts
    - `src/lib/flowchart/validation.ts`: flowchart consistency validation
  - **Step Dependencies**: Step 15
  - **User Instructions**: none

## Frontend Components

- [ ] **Step 17 – UI Component Library** (Effort: M, Risk: Low, Rollback: Safe)

  - **Task**: Setup shadcn/ui components and custom medical protocol UI components.
  - **Files**:
    - `src/components/ui/`: shadcn base components (button, input, dialog, etc.)
    - `src/components/layout/sidebar.tsx`: navigation sidebar
    - `src/components/layout/header.tsx`: page header with user menu
    - `src/components/protocol/section-editor.tsx`: individual section editor
    - `src/components/protocol/medication-table.tsx`: medication input table
  - **Step Dependencies**: Step 5
  - **User Instructions**: Run `npx shadcn-ui@latest init` to setup component library

- [ ] **Step 18 – Protocol Editor Interface** (Effort: L, Risk: Med, Rollback: Safe)

  - **Task**: Build main protocol editing interface with side-by-side text and flowchart views.
  - **Files**:
    - `src/app/(auth)/protocols/[id]/page.tsx`: main protocol editor page
    - `src/components/protocol/editor/protocol-editor.tsx`: main editor component
    - `src/components/protocol/editor/section-list.tsx`: section navigation
    - `src/components/protocol/validation/report.tsx`: validation results display
    - `src/hooks/use-protocol.ts`: protocol management hook
  - **Step Dependencies**: Step 17
  - **User Instructions**: none

- [ ] **Step 19 – Dashboard and Protocol Management** (Effort: M, Risk: Low, Rollback: Safe)
  - **Task**: Create dashboard, protocol list, and management interfaces.
  - **Files**:
    - `src/app/(auth)/dashboard/page.tsx`: main dashboard
    - `src/app/(auth)/protocols/page.tsx`: protocol list with filtering
    - `src/app/(auth)/protocols/new/page.tsx`: new protocol creation
    - `src/components/protocol/list/protocol-card.tsx`: protocol list item
    - `src/components/dashboard/stats.tsx`: dashboard statistics
  - **Step Dependencies**: Step 18
  - **User Instructions**: none

## Quality Assurance & Testing

- [ ] **Step 20 – Testing Infrastructure** (Effort: M, Risk: Low, Rollback: Safe)

  - **Task**: Setup testing framework with unit, integration, and E2E tests.
  - **Files**:
    - `vitest.config.ts`: Vitest configuration for unit tests
    - `playwright.config.ts`: Playwright E2E test configuration
    - `tests/setup.ts`: test environment setup
    - `tests/unit/validators.test.ts`: validation logic tests
    - `tests/integration/api.test.ts`: API endpoint tests
  - **Step Dependencies**: Step 8
  - **User Instructions**: none

- [ ] **Step 21 – AI Prompt Testing** (Effort: M, Risk: Med, Rollback: Safe)
  - **Task**: Create comprehensive tests for AI prompts and generation quality.
  - **Files**:
    - `tests/unit/ai/prompts.test.ts`: prompt template tests
    - `tests/integration/ai/generation.test.ts`: AI generation quality tests
    - `tests/fixtures/protocols.ts`: test protocol examples
    - `src/lib/ai/evaluation.ts`: AI output evaluation metrics
  - **Step Dependencies**: Step 20
  - **User Instructions**: Set test OpenAI API key with lower rate limits

## CI/CD & Quality Gates

- [ ] **Step 22 – GitHub Actions CI** (Effort: S, Risk: Low, Rollback: Safe)

  - **Task**: Setup continuous integration with linting, testing, and build verification.
  - **Files**:
    - `.github/workflows/ci.yml`: CI pipeline with test, lint, build steps
    - `.github/workflows/test.yml`: comprehensive test suite
    - `.github/dependabot.yml`: automated dependency updates
  - **Step Dependencies**: Step 21
  - **User Instructions**: Add repository secrets for `OPENAI_API_KEY`, `DATABASE_URL`, `NEXTAUTH_SECRET`

- [ ] **Step 23 – Code Quality Enforcement** (Effort: S, Risk: Low, Rollback: Safe)
  - **Task**: Add code coverage reporting and quality gates.
  - **Files**:
    - `.github/workflows/coverage.yml`: coverage reporting workflow
    - `vitest.config.ts`: coverage configuration
    - `.github/workflows/security.yml`: security scanning
  - **Step Dependencies**: Step 22
  - **User Instructions**: Configure branch protection rules requiring CI checks

## Infrastructure & Deployment

- [ ] **Step 24 – AWS Infrastructure Setup** (Effort: L, Risk: High, Rollback: Manual)

  - **Task**: Create Terraform configuration for AWS infrastructure (RDS, S3, ECS).
  - **Files**:
    - `infra/terraform/main.tf`: main Terraform configuration
    - `infra/terraform/database.tf`: RDS PostgreSQL setup
    - `infra/terraform/storage.tf`: S3 bucket configuration
    - `infra/terraform/compute.tf`: ECS/Fargate setup
    - `infra/terraform/variables.tf`: environment variables
  - **Step Dependencies**: Step 22
  - **User Instructions**: Setup AWS credentials, run `terraform init` and `terraform plan`
  - **Rollback**: Run `terraform destroy` to remove all resources

- [ ] **Step 25 – Production Deployment** (Effort: L, Risk: High, Rollback: Manual)
  - **Task**: Deploy application to production with monitoring and health checks.
  - **Files**:
    - `Dockerfile`: production container configuration
    - `docker-compose.yml`: local development stack
    - `.github/workflows/deploy.yml`: production deployment workflow
    - `infra/terraform/monitoring.tf`: CloudWatch monitoring setup
  - **Step Dependencies**: Step 24
  - **User Instructions**: Configure production environment variables, run deployment pipeline
  - **Rollback**: Revert to previous ECS task definition, restore database from backup if needed

## Final Integration & Documentation

- [ ] **Step 26 – Documentation & Examples** (Effort: M, Risk: Low, Rollback: Safe)
  - **Task**: Create comprehensive documentation with protocol examples and user guides.
  - **Files**:
    - `docs/user-guide.md`: Portuguese user documentation
    - `docs/api/README.md`: API documentation
    - `docs/examples/bradycardia-protocol.md`: example protocol documentation
    - `docs/examples/itu-protocol.md`: complex flowchart example
    - `docs/deployment.md`: deployment and maintenance guide
  - **Step Dependencies**: Step 25
  - **User Instructions**: Review documentation for accuracy and completeness
