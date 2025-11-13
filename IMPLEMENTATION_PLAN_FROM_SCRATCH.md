# 🚀 PLANO DE IMPLEMENTAÇÃO DO ZERO
## Medical Protocol Assistant - WebApp React

**Data:** 13/11/2025
**Objetivo:** Criar do ZERO um webapp React para geração de protocolos médicos
**Timeline:** Flexível ("faz direito")
**Desenvolvedor:** Claude Code (implementação completa)

---

## 📋 ÍNDICE

1. [Arquitetura e Stack](#arquitetura)
2. [Estrutura de Pastas](#estrutura)
3. [Schema do Banco](#database)
4. [Sistema de Fluxogramas](#fluxogramas)
5. [Multi-Provider IA](#ai-providers)
6. [Validação Médica](#validacao)
7. [Fases de Implementação](#fases)
8. [Código de Exemplo](#codigo)

---

## 🏗️ ARQUITETURA E STACK {#arquitetura}

### Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│   Next.js 15 App Router + TypeScript + TailwindCSS         │
│   shadcn/ui + TipTap + Custom SVG Flowcharts               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Backend)                   │
│   /api/protocols - CRUD                                     │
│   /api/generate - AI generation (multi-provider)            │
│   /api/validate - Medical validation                        │
│   /api/export - PDF/DOCX generation                         │
│   /api/upload - Document parsing                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬────────────┐
        ▼              ▼              ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│  SUPABASE   │ │  OpenAI  │ │Anthropic │ │Google Gemini │
│  PostgreSQL │ │  GPT-4o  │ │  Claude  │ │   Gemini Pro │
│  + Auth     │ │          │ │   Sonnet │ │              │
│  + Realtime │ │          │ │          │ │              │
│  + Storage  │ │          │ │          │ │              │
└─────────────┘ └──────────┘ └──────────┘ └──────────────┘
```

### Stack Tecnológico Completo

```yaml
Frontend:
  Framework: Next.js 15.3.2 (App Router)
  Language: TypeScript 5.4+
  UI Library: React 18.3
  Styling: TailwindCSS 3.4
  Components: shadcn/ui (Radix UI primitives)
  Icons: Lucide React

Editor:
  Rich Text: TipTap 2.x (editor médico)
  Flowcharts: Custom SVG renderer (IA-generated JSON)
  Forms: React Hook Form + Zod validation

State Management:
  Server State: TanStack Query v5
  Client State: Zustand (minimal)

Backend:
  Runtime: Next.js API Routes
  Database: Supabase PostgreSQL
  ORM/Client: Supabase JS SDK v2
  Auth: Supabase Auth (JWT)
  Storage: Supabase Storage (documents)
  Realtime: Supabase Realtime (progress updates)

AI Providers:
  Primary: OpenAI GPT-4o (gpt-4o-2024-08-06)
  Secondary: Anthropic Claude Sonnet
  Tertiary: Google Gemini Pro
  Strategy: Fallback chain (se 1 falha, tenta 2, depois 3)

Document Processing:
  PDF Reading: pdf-parse
  DOCX Reading: mammoth
  PDF Generation: @react-pdf/renderer
  DOCX Generation: docx.js

Medical APIs:
  PubMed: E-utilities API (NIH)

Validation:
  Schema: Zod
  Medical Rules: Custom validators (32 regras)
  AI-Assisted: Claude/GPT para validação contextual

Deploy:
  Frontend + API: Vercel
  Database: Supabase Cloud
  CDN: Vercel Edge Network

DevTools:
  Package Manager: pnpm
  Linting: ESLint + Prettier
  Type Checking: TypeScript strict mode
  Testing: Vitest + Playwright (futuramente)
```

---

## 📁 ESTRUTURA DE PASTAS {#estrutura}

```
medical-protocol-assistant/
├── app/                                    # Next.js App Router
│   ├── (auth)/                            # Auth group
│   │   ├── login/
│   │   │   └── page.tsx                   # Login page
│   │   └── layout.tsx                     # Auth layout
│   │
│   ├── (dashboard)/                       # Protected routes
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # Dashboard home
│   │   ├── protocols/
│   │   │   ├── page.tsx                   # Protocols list
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # New protocol wizard
│   │   │   └── [id]/
│   │   │       ├── page.tsx               # Protocol editor
│   │   │       ├── flowchart/
│   │   │       │   └── page.tsx           # Flowchart view
│   │   │       ├── versions/
│   │   │       │   └── page.tsx           # Version history
│   │   │       └── export/
│   │   │           └── page.tsx           # Export options
│   │   └── layout.tsx                     # Dashboard layout
│   │
│   ├── api/                               # API Routes
│   │   ├── protocols/
│   │   │   ├── route.ts                   # GET, POST protocols
│   │   │   └── [id]/
│   │   │       ├── route.ts               # GET, PATCH, DELETE
│   │   │       └── versions/
│   │   │           └── route.ts           # Version management
│   │   ├── generate/
│   │   │   ├── route.ts                   # POST - start generation
│   │   │   └── status/[jobId]/
│   │   │       └── route.ts               # GET - check status
│   │   ├── validate/
│   │   │   └── route.ts                   # POST - validate protocol
│   │   ├── flowchart/
│   │   │   ├── generate/
│   │   │   │   └── route.ts               # POST - generate flowchart
│   │   │   └── parse/
│   │   │       └── route.ts               # POST - parse text to nodes
│   │   ├── export/
│   │   │   ├── pdf/
│   │   │   │   └── route.ts               # GET - export PDF
│   │   │   └── docx/
│   │   │       └── route.ts               # GET - export DOCX
│   │   ├── upload/
│   │   │   └── route.ts                   # POST - upload & parse document
│   │   └── research/
│   │       └── pubmed/
│   │           └── route.ts               # GET - search PubMed
│   │
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Landing page
│   └── globals.css                        # Global styles
│
├── components/                            # React Components
│   ├── ui/                                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── protocol/                          # Protocol-specific components
│   │   ├── protocol-list.tsx              # List view
│   │   ├── protocol-card.tsx              # Card component
│   │   ├── protocol-form.tsx              # Create/Edit form
│   │   ├── protocol-wizard.tsx            # Step-by-step wizard
│   │   │
│   │   ├── editor/                        # Protocol editor
│   │   │   ├── protocol-editor.tsx        # Main editor container
│   │   │   ├── tiptap-editor.tsx          # TipTap integration
│   │   │   ├── section-navigator.tsx      # 13 sections nav
│   │   │   ├── ai-suggestions.tsx         # AI inline suggestions
│   │   │   └── validation-panel.tsx       # Real-time validation
│   │   │
│   │   ├── flowchart/                     # Flowchart components
│   │   │   ├── flowchart-renderer.tsx     # SVG renderer
│   │   │   ├── flowchart-node.tsx         # Custom node types
│   │   │   ├── flowchart-edge.tsx         # Custom edges
│   │   │   └── flowchart-toolbar.tsx      # Actions toolbar
│   │   │
│   │   └── export/                        # Export components
│   │       ├── export-dialog.tsx
│   │       ├── pdf-preview.tsx
│   │       └── docx-preview.tsx
│   │
│   ├── generation/                        # AI Generation components
│   │   ├── generation-dialog.tsx          # Generation wizard
│   │   ├── generation-progress.tsx        # Progress indicator
│   │   ├── provider-selector.tsx          # Choose AI provider
│   │   └── generation-options.tsx         # Temperature, context, etc
│   │
│   ├── dashboard/                         # Dashboard components
│   │   ├── stats-card.tsx
│   │   ├── recent-protocols.tsx
│   │   └── activity-feed.tsx
│   │
│   └── layout/                            # Layout components
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
│
├── lib/                                   # Core business logic
│   ├── supabase/                          # Supabase setup
│   │   ├── client.ts                      # Client-side client
│   │   ├── server.ts                      # Server-side client
│   │   └── middleware.ts                  # Auth middleware
│   │
│   ├── ai/                                # AI integration
│   │   ├── providers/
│   │   │   ├── openai.ts                  # OpenAI SDK wrapper
│   │   │   ├── anthropic.ts               # Anthropic SDK wrapper
│   │   │   ├── gemini.ts                  # Gemini SDK wrapper
│   │   │   └── types.ts                   # Common types
│   │   ├── generator.ts                   # Main generation orchestrator
│   │   ├── prompts.ts                     # Prompt templates
│   │   ├── fallback.ts                    # Provider fallback logic
│   │   └── streaming.ts                   # Streaming utilities
│   │
│   ├── validation/                        # Medical validation
│   │   ├── rules/                         # 32 validation rules
│   │   │   ├── structure.ts               # ABNT structure (13 sections)
│   │   │   ├── medication.ts              # Medication validation
│   │   │   ├── dosage.ts                  # Dosage validation
│   │   │   ├── terminology.ts             # Medical terminology
│   │   │   ├── completeness.ts            # Required fields
│   │   │   └── cross-validation.ts        # Text vs flowchart
│   │   ├── validator.ts                   # Main validator
│   │   └── ai-validator.ts                # AI-assisted validation
│   │
│   ├── flowchart/                         # Flowchart logic
│   │   ├── generator.ts                   # IA → JSON structure
│   │   ├── parser.ts                      # Text → flowchart nodes
│   │   ├── layout.ts                      # Auto-layout algorithm
│   │   ├── renderer.ts                    # JSON → SVG
│   │   └── types.ts                       # Flowchart types
│   │
│   ├── export/                            # Export logic
│   │   ├── pdf/
│   │   │   ├── generator.ts               # PDF generation
│   │   │   ├── templates/
│   │   │   │   └── abnt-template.tsx      # ABNT template
│   │   │   └── styles.ts                  # PDF styles
│   │   └── docx/
│   │       ├── generator.ts               # DOCX generation
│   │       └── template.ts                # ABNT DOCX template
│   │
│   ├── upload/                            # Document processing
│   │   ├── pdf-parser.ts                  # Parse PDF
│   │   ├── docx-parser.ts                 # Parse DOCX
│   │   └── protocol-extractor.ts          # Extract protocol sections
│   │
│   ├── research/                          # Medical research
│   │   └── pubmed.ts                      # PubMed API client
│   │
│   └── utils/                             # Utilities
│       ├── cn.ts                          # className merger
│       ├── dates.ts                       # Date formatting
│       ├── validation.ts                  # Zod helpers
│       └── constants.ts                   # App constants
│
├── types/                                 # TypeScript types
│   ├── protocol.ts                        # Protocol types
│   ├── flowchart.ts                       # Flowchart types
│   ├── validation.ts                      # Validation types
│   ├── ai.ts                              # AI types
│   └── database.ts                        # Supabase generated types
│
├── hooks/                                 # Custom React hooks
│   ├── use-protocol.ts                    # Protocol data hook
│   ├── use-generation.ts                  # Generation status hook
│   ├── use-validation.ts                  # Validation hook
│   ├── use-realtime.ts                    # Supabase realtime hook
│   └── use-debounce.ts                    # Debounce hook
│
├── config/                                # Configuration
│   ├── site.ts                            # Site metadata
│   ├── navigation.ts                      # Navigation items
│   └── providers.ts                       # AI provider configs
│
├── public/                                # Static assets
│   ├── icons/
│   └── images/
│
├── supabase/                              # Supabase files
│   ├── migrations/                        # SQL migrations
│   │   ├── 20250113000000_initial_schema.sql
│   │   ├── 20250113000001_add_versions.sql
│   │   └── 20250113000002_add_realtime.sql
│   └── seed.sql                           # Seed data
│
├── .env.local                             # Environment variables
├── .env.example                           # Environment template
├── next.config.js                         # Next.js config
├── tailwind.config.ts                     # Tailwind config
├── tsconfig.json                          # TypeScript config
├── package.json                           # Dependencies
└── README.md                              # Documentation
```

---

## 🗄️ SCHEMA DO BANCO DE DADOS {#database}

### Tabelas Principais

```sql
-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('creator', 'reviewer', 'admin')),
  hospital TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. PROTOCOLS
-- ============================================
CREATE TABLE public.protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  condition TEXT NOT NULL,
  context TEXT NOT NULL CHECK (context IN (
    'emergency', 'icu', 'ambulatory', 'ward',
    'telemedicine', 'transport', 'home_care', 'surgical'
  )),
  target_population TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'generating', 'review', 'approved', 'archived', 'failed'
  )),

  -- Content (JSONB - 13 seções ABNT)
  content JSONB,

  -- Flowchart (JSON estruturado)
  flowchart JSONB,

  -- Metadata
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Generation tracking
  generation_provider TEXT, -- 'openai' | 'anthropic' | 'gemini'
  generation_progress TEXT, -- '3/13 sections'
  generation_started_at TIMESTAMPTZ,
  generation_completed_at TIMESTAMPTZ,
  generation_error TEXT
);

-- Indexes
CREATE INDEX idx_protocols_created_by ON public.protocols(created_by);
CREATE INDEX idx_protocols_status ON public.protocols(status);
CREATE INDEX idx_protocols_context ON public.protocols(context);
CREATE INDEX idx_protocols_condition ON public.protocols(condition);

-- RLS Policies
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own protocols"
  ON public.protocols FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create protocols"
  ON public.protocols FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own protocols"
  ON public.protocols FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own draft protocols"
  ON public.protocols FOR DELETE
  USING (created_by = auth.uid() AND status = 'draft');

-- ============================================
-- 3. PROTOCOL_VERSIONS
-- ============================================
CREATE TABLE public.protocol_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,

  -- Snapshot of content
  content JSONB NOT NULL,
  flowchart JSONB,

  -- Metadata
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changelog TEXT,

  UNIQUE(protocol_id, version_number)
);

-- Indexes
CREATE INDEX idx_versions_protocol ON public.protocol_versions(protocol_id);
CREATE INDEX idx_versions_created_at ON public.protocol_versions(created_at DESC);

-- RLS Policies
ALTER TABLE public.protocol_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of accessible protocols"
  ON public.protocol_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.protocols
      WHERE id = protocol_id AND created_by = auth.uid()
    )
  );

-- ============================================
-- 4. VALIDATION_RESULTS
-- ============================================
CREATE TABLE public.validation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,

  -- Validation data
  validation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_valid BOOLEAN NOT NULL,
  score INTEGER, -- 0-100

  -- Issues (array of validation errors)
  issues JSONB, -- [{ rule: 'dosage', severity: 'error', message: '...', section: 8 }]

  -- Metadata
  validated_by TEXT, -- 'system' | 'ai' | user_id
  validation_duration_ms INTEGER
);

-- Indexes
CREATE INDEX idx_validation_protocol ON public.validation_results(protocol_id);
CREATE INDEX idx_validation_date ON public.validation_results(validation_date DESC);

-- RLS Policies
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view validations of own protocols"
  ON public.validation_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.protocols
      WHERE id = protocol_id AND created_by = auth.uid()
    )
  );

-- ============================================
-- 5. UPLOADED_DOCUMENTS
-- ============================================
CREATE TABLE public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID REFERENCES public.protocols(id) ON DELETE SET NULL,

  -- File info
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf' | 'docx'
  storage_path TEXT NOT NULL, -- Supabase Storage path

  -- Extracted content
  extracted_text TEXT,
  parsed_sections JSONB, -- Tentativa de parse em 13 seções

  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT
);

-- Indexes
CREATE INDEX idx_documents_protocol ON public.uploaded_documents(protocol_id);
CREATE INDEX idx_documents_uploaded_by ON public.uploaded_documents(uploaded_by);

-- RLS Policies
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON public.uploaded_documents FOR SELECT
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can upload documents"
  ON public.uploaded_documents FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- ============================================
-- 6. AUDIT_LOGS
-- ============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- 'protocol.created', 'protocol.approved', etc
  resource_type TEXT, -- 'protocol', 'version', etc
  resource_id UUID,

  details JSONB, -- Additional context
  ip_address TEXT
);

-- Indexes
CREATE INDEX idx_audit_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_resource ON public.audit_logs(resource_type, resource_id);

-- RLS Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protocols_updated_at
  BEFORE UPDATE ON public.protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unnamed User'),
    'creator'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('protocol-documents', 'protocol-documents', false);

-- Storage policies
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'protocol-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'protocol-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Tipos TypeScript Gerados

```typescript
// types/database.ts (auto-gerado por Supabase CLI)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'creator' | 'reviewer' | 'admin'
          hospital: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'creator' | 'reviewer' | 'admin'
          hospital?: string | null
          avatar_url?: string | null
        }
        Update: {
          name?: string
          role?: 'creator' | 'reviewer' | 'admin'
          hospital?: string | null
          avatar_url?: string | null
        }
      }
      protocols: {
        Row: {
          id: string
          code: string
          title: string
          condition: string
          context: ProtocolContext
          target_population: string | null
          status: ProtocolStatus
          content: ProtocolContent | null
          flowchart: FlowchartData | null
          created_by: string
          created_at: string
          updated_at: string
          generation_provider: string | null
          generation_progress: string | null
          generation_started_at: string | null
          generation_completed_at: string | null
          generation_error: string | null
        }
        Insert: {
          code: string
          title: string
          condition: string
          context: ProtocolContext
          target_population?: string | null
          status?: ProtocolStatus
          content?: ProtocolContent | null
          flowchart?: FlowchartData | null
          created_by: string
        }
        Update: {
          title?: string
          condition?: string
          context?: ProtocolContext
          target_population?: string | null
          status?: ProtocolStatus
          content?: ProtocolContent | null
          flowchart?: FlowchartData | null
          generation_progress?: string | null
          generation_error?: string | null
        }
      }
      // ... demais tabelas
    }
  }
}

// Custom types
export type ProtocolContext =
  | 'emergency'
  | 'icu'
  | 'ambulatory'
  | 'ward'
  | 'telemedicine'
  | 'transport'
  | 'home_care'
  | 'surgical'

export type ProtocolStatus =
  | 'draft'
  | 'generating'
  | 'review'
  | 'approved'
  | 'archived'
  | 'failed'

export interface ProtocolContent {
  sections: ProtocolSection[]
}

export interface ProtocolSection {
  number: number // 1-13
  title: string
  content: string // HTML/Markdown
  completed: boolean
}

export interface FlowchartData {
  nodes: FlowchartNode[]
  edges: FlowchartEdge[]
  metadata: {
    generatedBy: 'ai' | 'manual'
    generatedAt: string
    layout: 'auto' | 'manual'
  }
}

export interface FlowchartNode {
  id: string
  type: 'start' | 'end' | 'decision' | 'action' | 'process' | 'medication'
  label: string
  x: number
  y: number
  width: number
  height: number
  data?: Record<string, any> // Custom data per type
}

export interface FlowchartEdge {
  id: string
  source: string // node id
  target: string // node id
  label?: string // "Sim", "Não", etc
  color?: string
  style?: 'solid' | 'dashed' | 'dotted'
}
```

---

## 🎨 SISTEMA DE FLUXOGRAMAS {#fluxogramas}

### Problema Identificado

Você mencionou: **"não consegui resultados bons nem com Mermaid nem com ReactFlow"**

### Solução Proposta: IA → JSON → Custom SVG Renderer

#### Fluxo Completo

```
1. GERAÇÃO
   Texto do protocolo → AI (Claude/GPT) → JSON estruturado

2. LAYOUT
   JSON → Algoritmo de layout (Dagre/custom) → Posições (x,y)

3. RENDERIZAÇÃO
   JSON + Posições → Custom SVG React → Visual

4. EDIÇÃO (opcional)
   User clica → Atualiza JSON → Re-renderiza
```

#### Implementação Detalhada

```typescript
// lib/flowchart/types.ts
export interface FlowchartNode {
  id: string
  type: 'start' | 'end' | 'decision' | 'action' | 'process' | 'medication'
  label: string
  description?: string
  x: number
  y: number
  width: number
  height: number

  // Type-specific data
  data?: {
    // Para 'medication'
    drugName?: string
    dosage?: string
    route?: string

    // Para 'decision'
    question?: string

    // Para 'action'
    actionType?: string
  }
}

export interface FlowchartEdge {
  id: string
  source: string
  target: string
  label?: string
  color?: string
  sourceHandle?: string // Para decisions (múltiplas saídas)
  targetHandle?: string
}

export interface FlowchartData {
  nodes: FlowchartNode[]
  edges: FlowchartEdge[]
  metadata: {
    generatedBy: 'ai' | 'manual'
    generatedAt: string
    layout: 'dagre' | 'manual'
  }
}
```

```typescript
// lib/flowchart/generator.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateFlowchart(
  protocolText: string,
  context: string
): Promise<FlowchartData> {

  const prompt = `Você é um especialista em criar fluxogramas clínicos.

Analise este protocolo médico e crie um fluxograma estruturado:

CONTEXTO: ${context}
PROTOCOLO:
${protocolText}

Retorne JSON no seguinte formato:
{
  "nodes": [
    {
      "id": "node-1",
      "type": "start",
      "label": "Paciente chega ao PS",
      "description": "Triagem inicial"
    },
    {
      "id": "node-2",
      "type": "decision",
      "label": "Dor torácica?",
      "data": {
        "question": "Paciente apresenta dor torácica?"
      }
    },
    {
      "id": "node-3",
      "type": "action",
      "label": "ECG 12 derivações",
      "description": "Realizar ECG imediatamente"
    },
    {
      "id": "node-4",
      "type": "medication",
      "label": "AAS 200mg",
      "data": {
        "drugName": "AAS",
        "dosage": "200mg",
        "route": "VO"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    },
    {
      "id": "edge-2",
      "source": "node-2",
      "target": "node-3",
      "label": "Sim",
      "sourceHandle": "yes"
    },
    {
      "id": "edge-3",
      "source": "node-2",
      "target": "node-5",
      "label": "Não",
      "sourceHandle": "no"
    }
  ]
}

REGRAS:
- Use tipos: start, end, decision, action, process, medication
- Decisions têm 2+ saídas (Sim/Não, ou múltiplas opções)
- Medication nodes para administração de medicamentos
- Action nodes para procedimentos
- Process nodes para processos complexos
- Inclua "sourceHandle" em edges de decision nodes
- Máximo 20 nodes (simplicidade)
- Labels claros e concisos (max 50 chars)

Retorne APENAS o JSON, sem markdown.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  // Parse JSON
  let json = content.text.trim()

  // Remove markdown code blocks se existir
  json = json.replace(/```json\n?/g, '').replace(/```\n?/g, '')

  const flowchartData = JSON.parse(json)

  // Apply auto-layout (Dagre)
  const layouted = applyAutoLayout(flowchartData)

  return {
    ...layouted,
    metadata: {
      generatedBy: 'ai',
      generatedAt: new Date().toISOString(),
      layout: 'dagre'
    }
  }
}
```

```typescript
// lib/flowchart/layout.ts
import dagre from 'dagre'

export function applyAutoLayout(data: FlowchartData): FlowchartData {
  const g = new dagre.graphlib.Graph()

  // Configure graph
  g.setGraph({
    rankdir: 'TB', // Top to Bottom
    nodesep: 80,
    ranksep: 100,
    marginx: 50,
    marginy: 50
  })

  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes with dimensions
  data.nodes.forEach(node => {
    const width = getNodeWidth(node)
    const height = getNodeHeight(node)

    g.setNode(node.id, { width, height })
  })

  // Add edges
  data.edges.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  // Calculate layout
  dagre.layout(g)

  // Apply positions to nodes
  const layoutedNodes = data.nodes.map(node => {
    const position = g.node(node.id)
    return {
      ...node,
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height
    }
  })

  return {
    ...data,
    nodes: layoutedNodes
  }
}

function getNodeWidth(node: FlowchartNode): number {
  const baseWidth = 180
  const labelLength = node.label.length
  return Math.max(baseWidth, labelLength * 8)
}

function getNodeHeight(node: FlowchartNode): number {
  switch (node.type) {
    case 'start':
    case 'end':
      return 60
    case 'decision':
      return 80
    case 'medication':
      return 100
    default:
      return 70
  }
}
```

```typescript
// components/protocol/flowchart/flowchart-renderer.tsx
'use client'

import React from 'react'
import { FlowchartData, FlowchartNode, FlowchartEdge } from '@/lib/flowchart/types'

interface Props {
  data: FlowchartData
  editable?: boolean
  onNodeClick?: (node: FlowchartNode) => void
  className?: string
}

export function FlowchartRenderer({ data, editable, onNodeClick, className }: Props) {
  // Calculate SVG dimensions
  const bounds = calculateBounds(data.nodes)
  const viewBox = `${bounds.minX - 50} ${bounds.minY - 50} ${bounds.width + 100} ${bounds.height + 100}`

  return (
    <div className={className}>
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Render edges first (behind nodes) */}
        {data.edges.map(edge => (
          <FlowchartEdgeComponent key={edge.id} edge={edge} nodes={data.nodes} />
        ))}

        {/* Render nodes */}
        {data.nodes.map(node => (
          <FlowchartNodeComponent
            key={node.id}
            node={node}
            onClick={() => onNodeClick?.(node)}
            editable={editable}
          />
        ))}
      </svg>
    </div>
  )
}

function calculateBounds(nodes: FlowchartNode[]) {
  const xs = nodes.map(n => n.x - n.width / 2)
  const ys = nodes.map(n => n.y - n.height / 2)
  const maxXs = nodes.map(n => n.x + n.width / 2)
  const maxYs = nodes.map(n => n.y + n.height / 2)

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...maxXs),
    maxY: Math.max(...maxYs),
    width: Math.max(...maxXs) - Math.min(...xs),
    height: Math.max(...maxYs) - Math.min(...ys)
  }
}
```

```typescript
// components/protocol/flowchart/flowchart-node.tsx
interface NodeProps {
  node: FlowchartNode
  onClick?: () => void
  editable?: boolean
}

function FlowchartNodeComponent({ node, onClick, editable }: NodeProps) {
  const x = node.x - node.width / 2
  const y = node.y - node.height / 2

  switch (node.type) {
    case 'start':
    case 'end':
      return (
        <g onClick={onClick} className={editable ? 'cursor-pointer' : ''}>
          {/* Rounded rectangle */}
          <rect
            x={x}
            y={y}
            width={node.width}
            height={node.height}
            rx={node.height / 2}
            fill={node.type === 'start' ? '#10b981' : '#ef4444'}
            stroke="#000"
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={14}
            fontWeight="bold"
          >
            {node.label}
          </text>
        </g>
      )

    case 'decision':
      return (
        <g onClick={onClick} className={editable ? 'cursor-pointer' : ''}>
          {/* Diamond shape */}
          <path
            d={`
              M ${node.x} ${y}
              L ${x + node.width} ${node.y}
              L ${node.x} ${y + node.height}
              L ${x} ${node.y}
              Z
            `}
            fill="#fbbf24"
            stroke="#000"
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontWeight="bold"
          >
            {node.label}
          </text>
        </g>
      )

    case 'medication':
      return (
        <g onClick={onClick} className={editable ? 'cursor-pointer' : ''}>
          {/* Rectangle with icon */}
          <rect
            x={x}
            y={y}
            width={node.width}
            height={node.height}
            rx={8}
            fill="#a78bfa"
            stroke="#000"
            strokeWidth={2}
          />
          {/* Medication icon (pill) */}
          <text x={node.x} y={y + 25} textAnchor="middle" fontSize={20}>
            💊
          </text>
          <text
            x={node.x}
            y={y + 50}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={13}
            fontWeight="bold"
          >
            {node.label}
          </text>
          {node.data?.dosage && (
            <text
              x={node.x}
              y={y + 70}
              textAnchor="middle"
              fill="#fff"
              fontSize={11}
            >
              {node.data.dosage} {node.data.route}
            </text>
          )}
        </g>
      )

    case 'action':
    case 'process':
    default:
      return (
        <g onClick={onClick} className={editable ? 'cursor-pointer' : ''}>
          {/* Rectangle */}
          <rect
            x={x}
            y={y}
            width={node.width}
            height={node.height}
            rx={6}
            fill="#60a5fa"
            stroke="#000"
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={13}
            fontWeight={node.type === 'action' ? 'bold' : 'normal'}
          >
            {node.label}
          </text>
        </g>
      )
  }
}
```

```typescript
// components/protocol/flowchart/flowchart-edge.tsx
interface EdgeProps {
  edge: FlowchartEdge
  nodes: FlowchartNode[]
}

function FlowchartEdgeComponent({ edge, nodes }: EdgeProps) {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)

  if (!sourceNode || !targetNode) return null

  // Calculate connection points
  const sourcePoint = getConnectionPoint(sourceNode, edge.sourceHandle)
  const targetPoint = getConnectionPoint(targetNode, edge.targetHandle, 'target')

  // Create curved path
  const path = createCurvedPath(sourcePoint, targetPoint)

  return (
    <g>
      {/* Arrow path */}
      <path
        d={path}
        fill="none"
        stroke={edge.color || '#6b7280'}
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
      />

      {/* Label */}
      {edge.label && (
        <text
          x={(sourcePoint.x + targetPoint.x) / 2}
          y={(sourcePoint.y + targetPoint.y) / 2 - 10}
          textAnchor="middle"
          fill="#374151"
          fontSize={11}
          fontWeight="bold"
        >
          {edge.label}
        </text>
      )}

      {/* Arrowhead definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth={10}
          markerHeight={10}
          refX={9}
          refY={3}
          orient="auto"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill={edge.color || '#6b7280'}
          />
        </marker>
      </defs>
    </g>
  )
}

function getConnectionPoint(
  node: FlowchartNode,
  handle?: string,
  type: 'source' | 'target' = 'source'
) {
  // Decision nodes have multiple output handles
  if (node.type === 'decision' && handle) {
    const offset = handle === 'yes' ? node.width / 4 : -node.width / 4
    return {
      x: node.x + (type === 'source' ? offset : 0),
      y: type === 'source' ? node.y + node.height / 2 : node.y - node.height / 2
    }
  }

  // Default: center bottom for source, center top for target
  return {
    x: node.x,
    y: type === 'source' ? node.y + node.height / 2 : node.y - node.height / 2
  }
}

function createCurvedPath(from: Point, to: Point): string {
  const dx = to.x - from.x
  const dy = to.y - from.y

  // Control points for Bezier curve
  const controlY = from.y + dy / 2

  return `
    M ${from.x} ${from.y}
    C ${from.x} ${controlY},
      ${to.x} ${controlY},
      ${to.x} ${to.y}
  `
}

interface Point {
  x: number
  y: number
}
```

### Exemplo de Uso

```typescript
// app/(dashboard)/protocols/[id]/flowchart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { FlowchartRenderer } from '@/components/protocol/flowchart/flowchart-renderer'
import { Button } from '@/components/ui/button'
import { generateFlowchart } from '@/lib/flowchart/generator'

export default function FlowchartPage() {
  const params = useParams()
  const [flowchart, setFlowchart] = useState<FlowchartData | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegenerate() {
    setLoading(true)
    try {
      // Fetch protocol content
      const response = await fetch(`/api/protocols/${params.id}`)
      const protocol = await response.json()

      // Generate flowchart from protocol text
      const protocolText = protocol.content.sections
        .map((s: any) => s.content)
        .join('\n\n')

      const newFlowchart = await generateFlowchart(protocolText, protocol.context)

      setFlowchart(newFlowchart)

      // Save to database
      await fetch(`/api/protocols/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowchart: newFlowchart })
      })

    } catch (error) {
      console.error('Failed to generate flowchart:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fluxograma</h1>
        <div className="flex gap-2">
          <Button onClick={handleRegenerate} disabled={loading}>
            {loading ? 'Gerando...' : '🔄 Regerar com IA'}
          </Button>
          <Button variant="outline">💾 Exportar SVG</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {flowchart ? (
          <FlowchartRenderer
            data={flowchart}
            editable={false}
            className="min-h-[600px]"
          />
        ) : (
          <div className="flex items-center justify-center h-[600px]">
            <p className="text-gray-500">
              Nenhum fluxograma gerado. Clique em "Regerar com IA" para criar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Vantagens desta Abordagem

✅ **IA tem controle total:** Claude/GPT pode criar estruturas complexas sem limitações de bibliotecas
✅ **Customizável:** Tipos de nós especializados (medication, decision, etc)
✅ **Layout automático:** Dagre posiciona automaticamente
✅ **Performance:** SVG nativo é mais rápido que ReactFlow
✅ **Editável:** JSON pode ser modificado programaticamente
✅ **Exportável:** SVG pode ser salvo como imagem ou PDF

---

## 🤖 MULTI-PROVIDER IA {#ai-providers}

### Estratégia: Fallback Chain

```
1. Tenta OpenAI GPT-4o
   ↓ (se falhar)
2. Tenta Anthropic Claude Sonnet
   ↓ (se falhar)
3. Tenta Google Gemini Pro
   ↓ (se todos falharem)
4. Retorna erro para usuário
```

### Implementação

```typescript
// lib/ai/providers/types.ts
export interface AIProvider {
  name: string
  generate(prompt: string, options?: GenerationOptions): Promise<string>
  generateStreaming(
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: GenerationOptions
  ): Promise<void>
}

export interface GenerationOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export type ProviderName = 'openai' | 'anthropic' | 'gemini'
```

```typescript
// lib/ai/providers/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const openaiProvider: AIProvider = {
  name: 'openai',

  async generate(prompt, options = {}) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        ...(options.systemPrompt
          ? [{ role: 'system' as const, content: options.systemPrompt }]
          : []
        ),
        { role: 'user' as const, content: prompt }
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4000,
    })

    return response.choices[0]?.message?.content || ''
  },

  async generateStreaming(prompt, onChunk, options = {}) {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        ...(options.systemPrompt
          ? [{ role: 'system' as const, content: options.systemPrompt }]
          : []
        ),
        { role: 'user' as const, content: prompt }
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4000,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        onChunk(content)
      }
    }
  }
}
```

```typescript
// lib/ai/providers/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const anthropicProvider: AIProvider = {
  name: 'anthropic',

  async generate(prompt, options = {}) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens ?? 4000,
      temperature: options.temperature ?? 0.3,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    return content.type === 'text' ? content.text : ''
  },

  async generateStreaming(prompt, onChunk, options = {}) {
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens ?? 4000,
      temperature: options.temperature ?? 0.3,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta') {
        onChunk(event.delta.text)
      }
    }
  }
}
```

```typescript
// lib/ai/providers/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiProvider: AIProvider = {
  name: 'gemini',

  async generate(prompt, options = {}) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const fullPrompt = options.systemPrompt
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt

    const result = await model.generateContent(fullPrompt)
    const response = result.response
    return response.text()
  },

  async generateStreaming(prompt, onChunk, options = {}) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const fullPrompt = options.systemPrompt
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt

    const result = await model.generateContentStream(fullPrompt)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        onChunk(text)
      }
    }
  }
}
```

```typescript
// lib/ai/fallback.ts
import { openaiProvider } from './providers/openai'
import { anthropicProvider } from './providers/anthropic'
import { geminiProvider } from './providers/gemini'
import type { AIProvider, GenerationOptions, ProviderName } from './providers/types'

const providers: Record<ProviderName, AIProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
}

const fallbackOrder: ProviderName[] = ['openai', 'anthropic', 'gemini']

export async function generateWithFallback(
  prompt: string,
  options?: GenerationOptions
): Promise<{ content: string; provider: ProviderName }> {

  const errors: Array<{ provider: ProviderName; error: Error }> = []

  for (const providerName of fallbackOrder) {
    try {
      console.log(`[AI] Tentando provider: ${providerName}`)

      const provider = providers[providerName]
      const content = await provider.generate(prompt, options)

      console.log(`[AI] Sucesso com ${providerName}`)

      return { content, provider: providerName }

    } catch (error) {
      console.error(`[AI] Falha com ${providerName}:`, error)
      errors.push({
        provider: providerName,
        error: error as Error
      })
    }
  }

  // Todos falharam
  throw new Error(
    `Todos os providers de IA falharam:\n${errors.map(e =>
      `${e.provider}: ${e.error.message}`
    ).join('\n')}`
  )
}

// Para streaming com fallback
export async function generateStreamingWithFallback(
  prompt: string,
  onChunk: (chunk: string) => void,
  options?: GenerationOptions
): Promise<{ provider: ProviderName }> {

  for (const providerName of fallbackOrder) {
    try {
      console.log(`[AI] Tentando streaming com ${providerName}`)

      const provider = providers[providerName]
      await provider.generateStreaming(prompt, onChunk, options)

      console.log(`[AI] Streaming concluído com ${providerName}`)

      return { provider: providerName }

    } catch (error) {
      console.error(`[AI] Streaming falhou com ${providerName}:`, error)
      // Tenta próximo provider
    }
  }

  throw new Error('Todos os providers de IA falharam no streaming')
}
```

### Uso no Gerador de Protocolos

```typescript
// lib/ai/generator.ts
import { generateWithFallback } from './fallback'
import { createProtocolPrompt } from './prompts'
import type { ProtocolSection } from '@/types/protocol'

export async function generateProtocol(input: {
  title: string
  condition: string
  context: string
  targetPopulation?: string
}): Promise<ProtocolSection[]> {

  const prompt = createProtocolPrompt(input)

  const { content, provider } = await generateWithFallback(prompt, {
    temperature: 0.3,
    maxTokens: 4000,
    systemPrompt: 'Você é um especialista em protocolos médicos ABNT.'
  })

  // Parse response
  const sections = parseProtocolResponse(content)

  // Log qual provider foi usado
  console.log(`[Generator] Protocolo gerado com ${provider}`)

  return sections
}

function parseProtocolResponse(content: string): ProtocolSection[] {
  // Remove markdown code blocks
  let json = content.trim()
  json = json.replace(/```json\n?/g, '').replace(/```\n?/g, '')

  const parsed = JSON.parse(json)

  return parsed.sections.map((section: any) => ({
    number: Number(section.number),
    title: section.title,
    content: section.content,
    completed: true
  }))
}
```

## ✅ VALIDAÇÃO MÉDICA - 32 REGRAS {#validacao}

### Estratégia de Validação

Vamos implementar **validação híbrida**: regras programáticas + IA-assisted.

```
Protocolo
   ↓
1. Validação Estrutural (rápida)
   → 13 seções presentes?
   → Campos obrigatórios preenchidos?
   ↓
2. Validação Médica (regras programáticas)
   → Dosagens válidas?
   → Medicamentos existem?
   → Terminologia correta?
   ↓
3. Validação Contextual (IA)
   → Claude/GPT revisa conteúdo médico
   → Sugere melhorias
   ↓
4. Score Final (0-100)
```

### 32 Regras de Validação

```typescript
// lib/validation/rules/structure.ts

export const structureRules = [
  {
    id: 'rule-001',
    name: 'Todas as 13 seções ABNT presentes',
    severity: 'error' as const,
    validate: (protocol: Protocol) => {
      const requiredSections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      const presentSections = protocol.content?.sections.map(s => s.number) || []

      const missing = requiredSections.filter(n => !presentSections.includes(n))

      return {
        valid: missing.length === 0,
        message: missing.length > 0
          ? `Seções faltando: ${missing.join(', ')}`
          : 'Todas as seções presentes'
      }
    }
  },

  {
    id: 'rule-002',
    name: 'Título não vazio',
    severity: 'error' as const,
    validate: (protocol) => ({
      valid: protocol.title && protocol.title.length >= 5,
      message: 'Título deve ter pelo menos 5 caracteres'
    })
  },

  {
    id: 'rule-003',
    name: 'Código no formato correto',
    severity: 'error' as const,
    validate: (protocol) => {
      // Formato: PA-CARDIO-001 ou similar
      const regex = /^[A-Z]{2,4}-[A-Z]{3,10}-\d{3}$/
      return {
        valid: regex.test(protocol.code),
        message: 'Código deve estar no formato: PA-CARDIO-001'
      }
    }
  },

  {
    id: 'rule-004',
    name: 'Seção 2 (Objetivo) tem conteúdo',
    severity: 'error' as const,
    validate: (protocol) => {
      const section2 = protocol.content?.sections.find(s => s.number === 2)
      return {
        valid: section2 && section2.content.length >= 50,
        message: 'Seção Objetivo deve ter pelo menos 50 caracteres'
      }
    }
  }
]

// lib/validation/rules/medication.ts

export const medicationRules = [
  {
    id: 'rule-010',
    name: 'Nomes de medicamentos em maiúsculas',
    severity: 'warning' as const,
    validate: (protocol) => {
      const section8 = protocol.content?.sections.find(s => s.number === 8)
      if (!section8) return { valid: true, message: '' }

      // Busca medicamentos conhecidos
      const medications = extractMedications(section8.content)
      const invalid = medications.filter(m => m !== m.toUpperCase())

      return {
        valid: invalid.length === 0,
        message: invalid.length > 0
          ? `Medicamentos devem estar em maiúsculas: ${invalid.join(', ')}`
          : 'Formatação de medicamentos OK'
      }
    }
  },

  {
    id: 'rule-011',
    name: 'Dosagens têm unidades',
    severity: 'error' as const,
    validate: (protocol) => {
      const section8 = protocol.content?.sections.find(s => s.number === 8)
      if (!section8) return { valid: true, message: '' }

      // Regex para dosagens: "500mg", "10ml", etc
      const dosageRegex = /\d+\s?(mg|g|ml|mcg|UI|mEq)/gi
      const hasDosages = dosageRegex.test(section8.content)

      return {
        valid: hasDosages,
        message: hasDosages
          ? 'Dosagens com unidades OK'
          : 'Seção de medicamentos deve especificar dosagens com unidades'
      }
    }
  },

  {
    id: 'rule-012',
    name: 'Doses máximas especificadas',
    severity: 'warning' as const,
    validate: (protocol) => {
      const section8 = protocol.content?.sections.find(s => s.number === 8)
      if (!section8) return { valid: true, message: '' }

      const hasMaxDose = /dose máxima|máximo de|não exceder/i.test(section8.content)

      return {
        valid: hasMaxDose,
        message: hasMaxDose
          ? 'Doses máximas especificadas'
          : 'Considere adicionar doses máximas para medicamentos'
      }
    }
  }
]

// lib/validation/rules/terminology.ts

export const terminologyRules = [
  {
    id: 'rule-020',
    name: 'Termos médicos em português correto',
    severity: 'warning' as const,
    validate: (protocol) => {
      const content = protocol.content?.sections.map(s => s.content).join(' ') || ''

      // Erros comuns
      const typos = {
        'infarto do miocardio': 'infarto do miocárdio',
        'hipertensao': 'hipertensão',
        'sindrome': 'síndrome'
      }

      const found = Object.keys(typos).filter(typo =>
        content.toLowerCase().includes(typo)
      )

      return {
        valid: found.length === 0,
        message: found.length > 0
          ? `Possíveis erros ortográficos: ${found.join(', ')}`
          : 'Terminologia OK'
      }
    }
  },

  {
    id: 'rule-021',
    name: 'Abreviações definidas',
    severity: 'info' as const,
    validate: (protocol) => {
      const content = protocol.content?.sections.map(s => s.content).join(' ') || ''

      // Abreviações comuns
      const abbreviations = ['ECG', 'PA', 'FC', 'FR', 'SpO2', 'IAM', 'AVC']

      const used = abbreviations.filter(abbr =>
        content.includes(abbr)
      )

      // Verifica se foram definidas
      const defined = used.filter(abbr =>
        new RegExp(`${abbr}\\s*\\(`).test(content)
      )

      return {
        valid: used.length === defined.length,
        message: used.length > defined.length
          ? `Abreviações não definidas: ${used.filter(a => !defined.includes(a)).join(', ')}`
          : 'Abreviações definidas OK'
      }
    }
  }
]

// lib/validation/rules/cross-validation.ts

export const crossValidationRules = [
  {
    id: 'rule-030',
    name: 'Fluxograma corresponde ao texto',
    severity: 'warning' as const,
    validate: (protocol) => {
      if (!protocol.flowchart) {
        return { valid: true, message: 'Sem fluxograma para validar' }
      }

      const textContent = protocol.content?.sections
        .map(s => s.content.toLowerCase())
        .join(' ') || ''

      const flowchartLabels = protocol.flowchart.nodes
        .map(n => n.label.toLowerCase())

      // Verifica se nós principais do fluxograma aparecem no texto
      const missingInText = flowchartLabels.filter(label => {
        const keywords = label.split(' ').filter(w => w.length > 4)
        return keywords.length > 0 &&
               !keywords.some(kw => textContent.includes(kw))
      })

      return {
        valid: missingInText.length === 0,
        message: missingInText.length > 0
          ? `Nós do fluxograma não mencionados no texto: ${missingInText.slice(0, 3).join(', ')}`
          : 'Fluxograma consistente com texto'
      }
    }
  }
]

// lib/validation/rules/completeness.ts

export const completenessRules = [
  {
    id: 'rule-040',
    name: 'Todas as seções têm conteúdo',
    severity: 'error' as const,
    validate: (protocol) => {
      const sections = protocol.content?.sections || []
      const empty = sections.filter(s =>
        !s.content || s.content.trim().length < 20
      )

      return {
        valid: empty.length === 0,
        message: empty.length > 0
          ? `Seções vazias ou muito curtas: ${empty.map(s => s.number).join(', ')}`
          : 'Todas as seções completas'
      }
    }
  },

  {
    id: 'rule-041',
    name: 'Referências bibliográficas presentes',
    severity: 'warning' as const,
    validate: (protocol) => {
      const section11 = protocol.content?.sections.find(s => s.number === 11)
      if (!section11) return { valid: false, message: 'Seção de referências ausente' }

      // Busca padrões de referências
      const hasReferences =
        /\d{4}/.test(section11.content) && // Ano
        /et al|\./.test(section11.content) // Formatação

      return {
        valid: hasReferences,
        message: hasReferences
          ? 'Referências presentes'
          : 'Seção de referências parece vazia'
      }
    }
  }
]
```

### Validador Principal

```typescript
// lib/validation/validator.ts

import { structureRules } from './rules/structure'
import { medicationRules } from './rules/medication'
import { terminologyRules } from './rules/terminology'
import { crossValidationRules } from './rules/cross-validation'
import { completenessRules } from './rules/completeness'
import type { Protocol } from '@/types/protocol'

export interface ValidationRule {
  id: string
  name: string
  severity: 'error' | 'warning' | 'info'
  validate: (protocol: Protocol) => ValidationResult
}

export interface ValidationResult {
  valid: boolean
  message: string
}

export interface ValidationReport {
  isValid: boolean
  score: number // 0-100
  totalRules: number
  passed: number
  issues: ValidationIssue[]
}

export interface ValidationIssue {
  ruleId: string
  ruleName: string
  severity: 'error' | 'warning' | 'info'
  message: string
  section?: number
}

// Todas as 32 regras
const allRules: ValidationRule[] = [
  ...structureRules,
  ...medicationRules,
  ...terminologyRules,
  ...crossValidationRules,
  ...completenessRules
  // ... até completar 32 regras
]

export async function validateProtocol(
  protocol: Protocol
): Promise<ValidationReport> {

  const issues: ValidationIssue[] = []
  let passed = 0

  // Roda todas as regras
  for (const rule of allRules) {
    try {
      const result = rule.validate(protocol)

      if (result.valid) {
        passed++
      } else {
        issues.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: result.message
        })
      }
    } catch (error) {
      console.error(`Erro ao validar regra ${rule.id}:`, error)
    }
  }

  // Calcula score
  const score = calculateScore(issues, allRules.length)

  // Protocolo é válido se não tem erros críticos
  const hasErrors = issues.some(i => i.severity === 'error')

  return {
    isValid: !hasErrors,
    score,
    totalRules: allRules.length,
    passed,
    issues
  }
}

function calculateScore(
  issues: ValidationIssue[],
  totalRules: number
): number {
  // Penalidades por severidade
  const penalties = {
    error: 10,
    warning: 5,
    info: 1
  }

  const totalPenalty = issues.reduce(
    (sum, issue) => sum + penalties[issue.severity],
    0
  )

  const maxPenalty = totalRules * 10 // Todos errors
  const score = Math.max(0, Math.round(100 * (1 - totalPenalty / maxPenalty)))

  return score
}
```

### Validação IA-Assisted

```typescript
// lib/validation/ai-validator.ts

import { generateWithFallback } from '../ai/fallback'
import type { Protocol } from '@/types/protocol'

export async function aiValidateProtocol(
  protocol: Protocol
): Promise<{
  suggestions: string[]
  issues: Array<{ section: number; issue: string; suggestion: string }>
  score: number
}> {

  const content = protocol.content?.sections
    .map(s => `## Seção ${s.number}: ${s.title}\n${s.content}`)
    .join('\n\n') || ''

  const prompt = `Você é um especialista em protocolos médicos brasileiros.

Analise este protocolo e identifique:
1. Erros médicos
2. Dosagens incorretas
3. Contraindicações faltando
4. Terminologia inadequada
5. Falta de informações críticas

PROTOCOLO:
Título: ${protocol.title}
Condição: ${protocol.condition}
Contexto: ${protocol.context}

${content}

Retorne JSON:
{
  "score": 85,
  "issues": [
    {
      "section": 8,
      "issue": "Dose de AAS pode ser maior",
      "suggestion": "Considere 300mg para IAM"
    }
  ],
  "suggestions": [
    "Adicionar contraindicações para AAS",
    "Especificar tempo de reavaliação"
  ]
}

Retorne APENAS o JSON.`

  try {
    const { content: response } = await generateWithFallback(prompt, {
      temperature: 0.2,
      maxTokens: 2000
    })

    let json = response.trim()
    json = json.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    return JSON.parse(json)

  } catch (error) {
    console.error('[AI Validator] Erro:', error)
    return {
      suggestions: [],
      issues: [],
      score: 0
    }
  }
}
```

---

## 📅 FASES DE IMPLEMENTAÇÃO {#fases}

### FASE 1: Setup e Fundação (Semana 1)

**Objetivo:** Projeto configurado, database pronto, auth funcionando

#### Tarefas:

**1.1 Inicializar Projeto**
```bash
# Criar novo projeto Next.js
pnpx create-next-app@latest medical-protocol-v2 \
  --typescript \
  --tailwind \
  --app \
  --import-alias "@/*"

cd medical-protocol-v2
pnpm install

# Adicionar dependências
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add @tanstack/react-query zustand
pnpm add react-hook-form zod
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add lucide-react
pnpm add openai @anthropic-ai/sdk @google/generative-ai

pnpm add -D @types/node
```

**1.2 Setup Supabase**
```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase  # Mac
# ou
npm install -g supabase

# Inicializar Supabase no projeto
supabase init

# Criar projeto no Supabase Cloud
# https://supabase.com/dashboard

# Copiar credenciais para .env.local
```

**.env.local:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# AI Providers
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GEMINI_API_KEY=AIzxxx
```

**1.3 Criar Schema do Banco**
```bash
# Copiar SQL do schema acima para:
# supabase/migrations/20250113000000_initial_schema.sql

# Aplicar migrations
supabase db push
```

**1.4 Setup shadcn/ui**
```bash
pnpx shadcn@latest init
# Configurar: Default style, Slate color, CSS variables

# Adicionar componentes necessários
pnpx shadcn@latest add button
pnpx shadcn@latest add card
pnpx shadcn@latest add dialog
pnpx shadcn@latest add input
pnpx shadcn@latest add select
pnpx shadcn@latest add textarea
pnpx shadcn@latest add badge
pnpx shadcn@latest add toast
pnpx shadcn@latest add dropdown-menu
```

**1.5 Implementar Auth**
- Criar `lib/supabase/client.ts` e `lib/supabase/server.ts`
- Criar `app/(auth)/login/page.tsx`
- Implementar middleware de auth
- Testar: criar usuário, login, logout

**Entregáveis:**
- ✅ Projeto Next.js configurado
- ✅ Supabase conectado
- ✅ Database com schema aplicado
- ✅ Auth funcionando
- ✅ shadcn/ui configurado

---

### FASE 2: CRUD de Protocolos (Semana 2)

**Objetivo:** Criar, listar, editar, deletar protocolos

#### Tarefas:

**2.1 API Routes**
- `app/api/protocols/route.ts` - GET (list), POST (create)
- `app/api/protocols/[id]/route.ts` - GET, PATCH, DELETE
- Integrar com Supabase
- Validação com Zod

**2.2 Frontend - Listagem**
- `app/(dashboard)/protocols/page.tsx`
- `components/protocol/protocol-list.tsx`
- `components/protocol/protocol-card.tsx`
- Filtros, busca, ordenação

**2.3 Frontend - Criação**
- `app/(dashboard)/protocols/new/page.tsx`
- Wizard: título → condição → contexto → criar
- Form com React Hook Form + Zod

**2.4 Frontend - Edição**
- `app/(dashboard)/protocols/[id]/page.tsx`
- Editor básico (textarea por enquanto)
- Salvar mudanças

**Entregáveis:**
- ✅ CRUD completo funcionando
- ✅ UI para gerenciar protocolos
- ✅ Validação de formulários

---

### FASE 3: Geração por IA (Semana 3-4)

**Objetivo:** Gerar protocolos com multi-provider IA

#### Tarefas:

**3.1 Implementar Providers**
- `lib/ai/providers/openai.ts`
- `lib/ai/providers/anthropic.ts`
- `lib/ai/providers/gemini.ts`
- `lib/ai/fallback.ts` - lógica de fallback

**3.2 Prompts de Geração**
- `lib/ai/prompts.ts`
- Prompt para gerar 13 seções ABNT
- Testes com cada provider

**3.3 API de Geração**
- `app/api/generate/route.ts`
- Recebe: title, condition, context
- Gera com fallback
- Salva no banco
- Retorna protocolo completo

**3.4 Frontend de Geração**
- `components/generation/generation-dialog.tsx`
- Botão "Gerar com IA"
- Progresso (simples por enquanto)
- Exibe resultado

**3.5 Progress Tracking (opcional)**
- Supabase Realtime para updates
- `hooks/use-generation-progress.ts`
- UI mostra "Gerando seção 3/13..."

**Entregáveis:**
- ✅ Multi-provider IA funcionando
- ✅ Geração completa de protocolos
- ✅ Fallback automático

---

### FASE 4: Editor Rico (Semana 5)

**Objetivo:** Editor TipTap para editar protocolos

#### Tarefas:

**4.1 Setup TipTap**
```bash
pnpm add @tiptap/react @tiptap/starter-kit
pnpm add @tiptap/extension-underline
pnpm add @tiptap/extension-text-align
pnpm add @tiptap/extension-table
pnpm add @tiptap/extension-table-row
pnpm add @tiptap/extension-table-cell
pnpm add @tiptap/extension-table-header
```

**4.2 Criar Editor Component**
- `components/protocol/editor/tiptap-editor.tsx`
- Toolbar: negrito, itálico, listas, alinhamento
- Tabelas para medicamentos
- Auto-save (debounced)

**4.3 Navegador de Seções**
- `components/protocol/editor/section-navigator.tsx`
- Lista 13 seções
- Clica, rola para seção
- Indicador de completude

**4.4 Integrar no Editor de Protocolo**
- Substituir textarea por TipTap
- Salvar HTML no banco
- Preview mode

**Entregáveis:**
- ✅ Editor rico funcionando
- ✅ Formatação completa
- ✅ Auto-save

---

### FASE 5: Fluxogramas (Semana 6)

**Objetivo:** Geração automática de fluxogramas

#### Tarefas:

**5.1 Implementar Generator**
- `lib/flowchart/generator.ts` - IA → JSON
- `lib/flowchart/layout.ts` - Auto-layout com Dagre
- Testes de geração

**5.2 Renderer SVG**
- `components/protocol/flowchart/flowchart-renderer.tsx`
- `components/protocol/flowchart/flowchart-node.tsx`
- `components/protocol/flowchart/flowchart-edge.tsx`
- Renderiza SVG customizado

**5.3 API e Página**
- `app/api/flowchart/generate/route.ts`
- `app/(dashboard)/protocols/[id]/flowchart/page.tsx`
- Botão "Gerar Fluxograma"

**5.4 Exportar SVG**
- Botão "Baixar SVG"
- Download do flowchart

**Entregáveis:**
- ✅ Fluxogramas gerados automaticamente
- ✅ Renderização SVG customizada
- ✅ Export SVG

---

### FASE 6: Validação (Semana 7)

**Objetivo:** 32 regras de validação médica

#### Tarefas:

**6.1 Implementar Regras**
- `lib/validation/rules/structure.ts` (4 regras)
- `lib/validation/rules/medication.ts` (8 regras)
- `lib/validation/rules/terminology.ts` (6 regras)
- `lib/validation/rules/cross-validation.ts` (4 regras)
- `lib/validation/rules/completeness.ts` (10 regras)

**6.2 Validador Principal**
- `lib/validation/validator.ts`
- Roda todas as regras
- Calcula score

**6.3 Validação IA**
- `lib/validation/ai-validator.ts`
- Claude revisa conteúdo
- Sugestões contextuais

**6.4 API e Frontend**
- `app/api/validate/route.ts`
- `components/protocol/editor/validation-panel.tsx`
- Exibe issues inline
- Score visual

**Entregáveis:**
- ✅ 32 regras implementadas
- ✅ Validação IA funcionando
- ✅ UI de validação

---

### FASE 7: Export PDF/DOCX (Semana 8)

**Objetivo:** Exportar protocolos em formatos oficiais

#### Tarefas:

**7.1 Setup Bibliotecas**
```bash
pnpm add @react-pdf/renderer docx
```

**7.2 Template ABNT PDF**
- `lib/export/pdf/generator.ts`
- `lib/export/pdf/templates/abnt-template.tsx`
- Formatação ABNT completa
- Include flowchart

**7.3 Template ABNT DOCX**
- `lib/export/docx/generator.ts`
- `lib/export/docx/template.ts`
- Estilos ABNT

**7.4 API e UI**
- `app/api/export/pdf/route.ts`
- `app/api/export/docx/route.ts`
- Botões de export no protocolo
- Download automático

**Entregáveis:**
- ✅ Export PDF funcionando
- ✅ Export DOCX funcionando
- ✅ Formatação ABNT correta

---

### FASE 8: Upload de Documentos (Semana 9)

**Objetivo:** Upload PDF/DOCX e extração de conteúdo

#### Tarefas:

**8.1 Setup Parsers**
```bash
pnpm add pdf-parse mammoth
```

**8.2 Implementar Parsers**
- `lib/upload/pdf-parser.ts`
- `lib/upload/docx-parser.ts`
- `lib/upload/protocol-extractor.ts` - tenta identificar seções

**8.3 API e Storage**
- `app/api/upload/route.ts`
- Upload para Supabase Storage
- Parse do documento
- Extração de texto

**8.4 Frontend**
- `components/protocol/upload-dialog.tsx`
- Drag & drop
- Progress bar
- Preview do texto extraído

**Entregáveis:**
- ✅ Upload funcionando
- ✅ Parsing de PDF/DOCX
- ✅ Extração de conteúdo

---

### FASE 9: Versionamento (Semana 10)

**Objetivo:** Sistema de versões de protocolos

#### Tarefas:

**9.1 API de Versões**
- `app/api/protocols/[id]/versions/route.ts`
- Criar nova versão (snapshot)
- Listar versões
- Restaurar versão antiga

**9.2 Auto-Versioning**
- Hook que cria versão ao aprovar
- Changelog automático

**9.3 Frontend**
- `app/(dashboard)/protocols/[id]/versions/page.tsx`
- Timeline de versões
- Diff entre versões (básico)
- Botão "Restaurar"

**Entregáveis:**
- ✅ Versionamento funcionando
- ✅ Histórico completo
- ✅ Restauração de versões

---

### FASE 10: Pesquisa Médica PubMed (Semana 11)

**Objetivo:** Buscar artigos científicos no PubMed

#### Tarefas:

**10.1 Implementar Cliente PubMed**
- `lib/research/pubmed.ts`
- E-utilities API (NIH)
- Parse XML response

**10.2 API**
- `app/api/research/pubmed/route.ts`
- Recebe: query (condition, keywords)
- Retorna: artigos relevantes

**10.3 Frontend**
- `components/protocol/research-panel.tsx`
- Busca inline no editor
- Exibe artigos
- Botão "Adicionar referência"

**Entregáveis:**
- ✅ Busca PubMed funcionando
- ✅ Integração no editor

---

### FASE 11: Dashboard e Polish (Semana 12)

**Objetivo:** Dashboard, estatísticas, melhorias finais

#### Tarefas:

**11.1 Dashboard**
- `app/(dashboard)/dashboard/page.tsx`
- Stats cards (protocolos criados, aprovados, etc)
- Gráficos simples
- Atividade recente

**11.2 Polish e Refinamentos**
- Loading states everywhere
- Error boundaries
- Empty states
- Micro-interactions
- Acessibilidade

**11.3 Testing**
- Testes críticos com Vitest
- E2E com Playwright (fluxos principais)

**11.4 Documentation**
- README atualizado
- Deploy guide
- User guide básico

**Entregáveis:**
- ✅ Dashboard funcional
- ✅ App polished
- ✅ Pronto para produção

---

## 💻 CÓDIGO DE EXEMPLO COMPLETO {#codigo}

### Exemplo: API Route de Geração

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { generateProtocol } from '@/lib/ai/generator'
import type { Database } from '@/types/database'

const generateSchema = z.object({
  title: z.string().min(5),
  condition: z.string().min(3),
  context: z.enum([
    'emergency', 'icu', 'ambulatory', 'ward',
    'telemedicine', 'transport', 'home_care', 'surgical'
  ]),
  targetPopulation: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse and validate input
    const body = await request.json()
    const input = generateSchema.parse(body)

    // 3. Generate protocol code
    const code = generateProtocolCode(input.context)

    // 4. Create protocol record (status: generating)
    const { data: protocol, error: insertError } = await supabase
      .from('protocols')
      .insert({
        code,
        title: input.title,
        condition: input.condition,
        context: input.context,
        target_population: input.targetPopulation,
        status: 'generating',
        created_by: user.id,
        generation_started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Generate] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create protocol' },
        { status: 500 }
      )
    }

    // 5. Generate content with IA (async)
    // Em produção, isso seria um job em queue
    // Por simplicidade, fazemos direto (com timeout)

    try {
      const sections = await generateProtocol(input)

      // 6. Update protocol with content
      const { error: updateError } = await supabase
        .from('protocols')
        .update({
          content: { sections },
          status: 'draft',
          generation_completed_at: new Date().toISOString()
        })
        .eq('id', protocol.id)

      if (updateError) {
        console.error('[Generate] Update error:', updateError)
      }

      return NextResponse.json({
        success: true,
        protocol: {
          ...protocol,
          content: { sections }
        }
      })

    } catch (genError) {
      console.error('[Generate] Generation error:', genError)

      // Mark as failed
      await supabase
        .from('protocols')
        .update({
          status: 'failed',
          generation_error: (genError as Error).message
        })
        .eq('id', protocol.id)

      return NextResponse.json(
        { error: 'Failed to generate protocol content' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[Generate] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateProtocolCode(context: string): string {
  const prefix = {
    emergency: 'PA',
    icu: 'UTI',
    ambulatory: 'AMB',
    ward: 'ENF',
    telemedicine: 'TLM',
    transport: 'TRP',
    home_care: 'AD',
    surgical: 'CC'
  }[context]

  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${Date.now()}-${random}`
}
```

### Exemplo: Hook de Protocol

```typescript
// hooks/use-protocol.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import type { Protocol } from '@/types/protocol'

type ProtocolRow = Database['public']['Tables']['protocols']['Row']

export function useProtocol(id: string) {
  const supabase = createClientComponentClient<Database>()

  return useQuery({
    queryKey: ['protocol', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as ProtocolRow
    }
  })
}

export function useProtocols() {
  const supabase = createClientComponentClient<Database>()

  return useQuery({
    queryKey: ['protocols'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ProtocolRow[]
    }
  })
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient()
  const supabase = createClientComponentClient<Database>()

  return useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string
      updates: Partial<ProtocolRow>
    }) => {
      const { data, error } = await supabase
        .from('protocols')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['protocol', data.id] })
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
    }
  })
}

export function useDeleteProtocol() {
  const queryClient = useQueryClient()
  const supabase = createClientComponentClient<Database>()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('protocols')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
    }
  })
}
```

### Exemplo: Component de Geração

```typescript
// components/generation/generation-dialog.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface GenerationDialogProps {
  trigger?: React.ReactNode
}

export function GenerationDialog({ trigger }: GenerationDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    condition: '',
    context: 'emergency' as const,
    targetPopulation: ''
  })

  async function handleGenerate() {
    if (!formData.title || !formData.condition) {
      toast.error('Preencha título e condição')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Falha na geração')
      }

      const { protocol } = await response.json()

      toast.success('Protocolo gerado com sucesso!')
      setOpen(false)

      // Redirect to editor
      router.push(`/protocols/${protocol.id}`)

    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Erro ao gerar protocolo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar com IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerar Protocolo com IA</DialogTitle>
          <DialogDescription>
            Preencha as informações básicas e a IA criará um protocolo completo
            no formato ABNT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Protocolo</Label>
            <Input
              id="title"
              placeholder="Ex: Infarto Agudo do Miocárdio"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condição Médica</Label>
            <Input
              id="condition"
              placeholder="Ex: IAM com supradesnivelamento do ST"
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Contexto de Atendimento</Label>
            <Select
              value={formData.context}
              onValueChange={(value: any) =>
                setFormData({ ...formData, context: value })
              }
            >
              <SelectTrigger id="context">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">Pronto Atendimento</SelectItem>
                <SelectItem value="icu">UTI</SelectItem>
                <SelectItem value="ambulatory">Ambulatório</SelectItem>
                <SelectItem value="ward">Enfermaria</SelectItem>
                <SelectItem value="telemedicine">Telemedicina</SelectItem>
                <SelectItem value="transport">Transporte</SelectItem>
                <SelectItem value="home_care">Atenção Domiciliar</SelectItem>
                <SelectItem value="surgical">Centro Cirúrgico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">População-Alvo (opcional)</Label>
            <Input
              id="target"
              placeholder="Ex: Adultos > 18 anos"
              value={formData.targetPopulation}
              onChange={(e) =>
                setFormData({ ...formData, targetPopulation: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Protocolo
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🎯 RESUMO E PRÓXIMOS PASSOS

### O que temos agora:

✅ **Arquitetura completa** definida
✅ **Stack tecnológico** escolhido
✅ **Schema do banco** detalhado
✅ **Sistema de fluxogramas** (solução customizada IA → JSON → SVG)
✅ **Multi-provider IA** com fallback
✅ **32 regras de validação** planejadas
✅ **12 fases de implementação** detalhadas
✅ **Código de exemplo** das partes críticas

### Podemos começar a implementar!

**Opções:**

1. **Implementar Fase 1 agora** (Setup completo)
2. **Criar POC** de alguma parte específica primeiro
3. **Ajustar/refinar** o plano antes de começar
4. **Tirar dúvidas** sobre qualquer parte

**O que você prefere?** 🚀
