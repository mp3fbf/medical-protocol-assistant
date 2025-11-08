# 🚀 PLANOS DE IMPLEMENTAÇÃO DO ZERO
## Medical Protocol Assistant - 3 Abordagens Completamente Novas

**Data:** 08/11/2025
**Objetivo:** Criar do ZERO um assistente de protocolos médicos com 3 abordagens totalmente diferentes

---

## 💡 O CONCEITO CENTRAL (O que precisamos criar)

### Problema a Resolver

**Hospitais brasileiros precisam criar protocolos clínicos padronizados, mas:**
- Processo manual leva **semanas ou meses**
- Requer conhecimento de formatação ABNT (13 seções específicas)
- Fluxogramas clínicos são complexos de desenhar
- Validação médica é manual e sujeita a erros
- Múltiplos revisores precisam colaborar
- Documentos precisam ser exportados em formatos oficiais (PDF/DOCX)

### Solução Desejada

**Um sistema que:**
1. **Gera protocolos automaticamente** usando IA (GPT, Claude, Gemini)
2. **Formata em padrão ABNT** com 13 seções obrigatórias
3. **Cria fluxogramas visuais** automaticamente do texto médico
4. **Valida conteúdo médico** (dosagens, medicamentos, terminologia)
5. **Permite colaboração** entre médicos (RBAC: criador, revisor, admin)
6. **Exporta PDF/DOCX** prontos para uso hospitalar
7. **Contextualiza por ambiente** (Pronto-Socorro, UTI, Ambulatório, etc.)

### Usuários-Alvo

- **Médicos criadores:** Escrevem protocolos
- **Médicos revisores:** Validam protocolos
- **Administradores:** Gerenciam usuários e aprovações
- **Hospitais/Redes:** Sancta Maggiore, Prevent Senior (Brasil)

---

## ❌ PROBLEMAS DA IMPLEMENTAÇÃO ATUAL (O que NÃO fazer)

### Problemas Técnicos

1. **Timeouts absurdos** (7 dias de timeout HTTP)
2. **Type safety quebrado** (327 usos de `any`)
3. **Dados fake misturados** (dashboard sempre mostra 156 protocolos)
4. **Logs de segurança** (senhas no console)
5. **Retry desabilitado** (qualquer erro = perda total)
6. **Monolito Next.js** (tudo em um processo)
7. **Geração síncrona** (trava o servidor)
8. **Código duplicado** (3 versões do mesmo gerador)
9. **Testes fracos** (20% cobertura)
10. **43.469 linhas** (complexidade excessiva)

### Problemas Arquiteturais

- Tudo junto (frontend + backend + IA + validação)
- Não escala horizontalmente
- Difícil de testar
- Difícil de manter
- Sem separação de responsabilidades

### Problemas de UX

- Tempo de geração sem feedback visual adequado
- Sem modo offline
- Sem colaboração em tempo real
- Exportação lenta

---

## 🎯 TRÊS PLANOS COMPLETAMENTE DO ZERO

Cada plano é uma **abordagem radicalmente diferente** do mesmo problema.

---

## 📘 PLANO 1: SaaS MINIMALISTA
### "Simples, rápido, eficaz - MVP em 4 semanas"

**Filosofia:** Construir o mínimo viável com a melhor experiência possível. Sem over-engineering.

### Arquitetura Ultra-Simples

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (SPA)                      │
│   Svelte 5 + TypeScript + TailwindCSS          │
│   Deploy: Cloudflare Pages (grátis)            │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           API BACKEND (Stateless)               │
│   Deno 2.0 + Hono.js + Supabase SDK            │
│   Deploy: Deno Deploy (grátis até 100k req)    │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  SUPABASE    │      │   OPENAI     │
│  (Database   │      │   API        │
│   + Auth     │      │   (GPT-4o)   │
│   + Storage) │      │              │
└──────────────┘      └──────────────┘
```

### Stack Tecnológico

```yaml
Frontend:
  Framework: Svelte 5 (mais simples que React)
  Language: TypeScript
  Styling: TailwindCSS + DaisyUI
  State: Svelte Stores (built-in)
  Forms: Superforms
  Rich Text: TipTap
  Flowcharts: Mermaid.js (texto → diagrama)

Backend:
  Runtime: Deno 2.0 (seguro, moderno, TypeScript nativo)
  API: Hono.js (ultra-rápido, type-safe)
  Validation: Zod

Database:
  Provider: Supabase (PostgreSQL managed)
  Auth: Supabase Auth (built-in)
  Storage: Supabase Storage (S3-like)
  Realtime: Supabase Realtime (WebSocket)

AI:
  Primary: OpenAI GPT-4o (melhor custo-benefício)
  Fallback: Nenhum (simplicidade)

Deploy:
  Frontend: Cloudflare Pages (grátis)
  Backend: Deno Deploy (grátis até 100k req/mês)
  Database: Supabase Free Tier (até 500MB)

Monitoring:
  Errors: Sentry (free tier)
  Analytics: Plausible (privacy-first)
```

### Modelo de Dados (4 tabelas)

```sql
-- 1. Usuários (via Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('creator', 'reviewer', 'admin')),
  hospital TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Protocolos
CREATE TABLE protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  condition TEXT NOT NULL,
  context TEXT CHECK (context IN ('emergency', 'icu', 'ambulatory', 'ward')),
  status TEXT CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  content JSONB, -- 13 seções ABNT
  flowchart TEXT, -- Mermaid syntax
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Comentários/Revisões
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID REFERENCES protocols(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  section INT, -- qual seção (1-13)
  content TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Audit Log (simples)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Features (Ordem de Implementação)

#### Semana 1: Core MVP
- [ ] Auth com Supabase (email/senha)
- [ ] CRUD de protocolos (criar, listar, editar)
- [ ] Editor simples (textarea + preview)
- [ ] Estrutura ABNT (13 seções vazias)

#### Semana 2: Geração IA
- [ ] Integração OpenAI GPT-4o
- [ ] Prompt otimizado para ABNT
- [ ] Geração das 13 seções
- [ ] Loading com progresso (fake mas bonito)

#### Semana 3: Validação e Fluxograma
- [ ] Validação básica (campos obrigatórios)
- [ ] Validação médica simples (regex para dosagens)
- [ ] Geração de fluxograma (Mermaid.js)
- [ ] Preview de fluxograma

#### Semana 4: Export e Polish
- [ ] Export PDF (HTML → PDF via Puppeteer)
- [ ] Export DOCX (docx.js)
- [ ] Dashboard simples
- [ ] Deploy produção

### Features FORA do MVP

❌ Múltiplos providers de IA (só OpenAI)
❌ Validação médica complexa (só básico)
❌ Colaboração em tempo real (só comentários assíncronos)
❌ Versionamento (só edição simples)
❌ Upload de documentos (só geração via IA)
❌ Pesquisa médica (PubMed, etc.)

### Código de Exemplo (Geração de Protocolo)

```typescript
// backend/routes/generate.ts
import { Hono } from 'hono'
import { OpenAI } from 'openai'
import { z } from 'zod'

const app = new Hono()
const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

const generateSchema = z.object({
  title: z.string().min(5),
  condition: z.string().min(3),
  context: z.enum(['emergency', 'icu', 'ambulatory', 'ward']),
})

app.post('/api/generate', async (c) => {
  // Validação
  const body = await c.req.json()
  const data = generateSchema.parse(body)

  // Prompt
  const prompt = `Você é um especialista em protocolos médicos ABNT.

Crie um protocolo completo para: ${data.condition}
Contexto: ${data.context}
Título: ${data.title}

Estrutura ABNT obrigatória (13 seções):
1. Título e identificação
2. Objetivo
3. População-alvo
4. Definições
5. Critérios de inclusão
6. Critérios de exclusão
7. Conduta
8. Medicações
9. Monitoramento
10. Critérios de alta
11. Referências
12. Fluxograma (Mermaid syntax)
13. Ficha técnica

Retorne JSON:
{
  "sections": [
    { "number": 1, "title": "...", "content": "..." },
    ...
  ],
  "flowchart": "graph TD\n  A[Início]..."
}`

  // Chamada OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const result = JSON.parse(response.choices[0].message.content)

  return c.json(result)
})

export default app
```

### UI/UX (Super Simples)

```
┌─────────────────────────────────────────────────┐
│  Medical Protocol Assistant  [Avatar] [Logout]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  [+ Novo Protocolo]    [Buscar: ________]       │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 📄 Protocolo IAM (Pronto-Socorro)        │   │
│  │    Criado em 05/11/2025 | Rascunho       │   │
│  │    [Editar] [Gerar IA] [Exportar PDF]    │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 📄 Protocolo Sepse (UTI)                 │   │
│  │    Criado em 03/11/2025 | Em revisão     │   │
│  │    [Editar] [Comentários: 3]             │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Vantagens do Plano 1

✅ **Rápido:** MVP em 4 semanas
✅ **Barato:** R$ 0 (tiers grátis) até 1000 usuários
✅ **Simples:** Stack minimalista, fácil de entender
✅ **Moderno:** Svelte 5 + Deno 2.0 (tecnologias 2024)
✅ **Type-safe:** TypeScript em tudo
✅ **Escalável:** Supabase escala automaticamente
✅ **Sem infraestrutura:** Tudo serverless

### Desvantagens do Plano 1

❌ **Features limitadas:** Só o essencial
❌ **Um provider IA:** Só OpenAI (se cair, para tudo)
❌ **Validação básica:** Não tem 32 regras complexas
❌ **Sem colaboração real-time:** Só comentários
❌ **Supabase lock-in:** Difícil migrar depois

### Custo (Primeiros 6 meses)

| Item | Grátis | Pago (após limite) |
|------|--------|-------------------|
| Deno Deploy | 100k req/mês | R$ 0,02/req adicional |
| Cloudflare Pages | Ilimitado | R$ 0 |
| Supabase DB | 500MB / 2GB transfer | R$ 125/mês (Pro) |
| OpenAI API | N/A | ~R$ 0,30/protocolo |
| Sentry | 5k errors/mês | R$ 130/mês |
| **TOTAL MÊS 1-3** | **R$ 0** | - |
| **TOTAL MÊS 4-6** | **~R$ 300/mês** | (estimado para 100 protocolos/mês) |

---

## 📗 PLANO 2: PLATAFORMA NO-CODE/LOW-CODE
### "Empoderar médicos a criar sem programadores"

**Filosofia:** Construir uma plataforma visual onde médicos criam protocolos sem código, usando blocos drag-and-drop.

### Conceito Visual

Imagine um **Notion + Canva + ChatGPT** para protocolos médicos:
- **Editor visual** tipo Notion (blocos)
- **Fluxogramas** tipo Canva (drag-and-drop)
- **IA assistente** tipo ChatGPT (sugere conteúdo)

### Arquitetura

```
┌─────────────────────────────────────────────────┐
│         FRONTEND (Plataforma Visual)             │
│   Next.js 15 + React + Lexical Editor           │
│   + ReactFlow (flowcharts)                      │
│   + shadcn/ui (componentes)                     │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           BACKEND API (Hono.js)                 │
│   Runtime: Bun (ultra-rápido)                   │
│   ORM: Drizzle                                  │
└──────────────────┬───────────────────────────────┘
                   │
        ┌──────────┴──────────┬─────────────┐
        ▼                     ▼             ▼
┌──────────────┐   ┌──────────────┐   ┌──────────┐
│  PostgreSQL  │   │  Redis       │   │  AI APIs │
│  (Neon.tech) │   │  (Upstash)   │   │  Multi-  │
│              │   │              │   │  provider│
└──────────────┘   └──────────────┘   └──────────┘
```

### Stack Tecnológico

```yaml
Frontend:
  Framework: Next.js 15 (App Router)
  Editor: Lexical (Meta, tipo Notion)
  Blocos: Sistema de blocos customizado
  Flowchart: ReactFlow (visual drag-and-drop)
  UI: shadcn/ui + TailwindCSS
  Icons: Lucide React

Backend:
  Runtime: Bun (3x mais rápido que Node)
  Framework: Hono.js
  ORM: Drizzle
  Validation: Zod
  Queue: BullMQ + Redis

Database:
  Primary: Neon (PostgreSQL serverless)
  Cache: Upstash Redis
  Vector DB: Pinecone (para busca semântica)

AI:
  Primary: OpenAI GPT-4o
  Fallback: Anthropic Claude
  Embeddings: OpenAI text-embedding-3-small

Storage:
  Files: Cloudflare R2 (S3-compatible)
  CDN: Cloudflare CDN

Deploy:
  Frontend: Vercel
  Backend: Fly.io
  Queue Workers: Fly.io machines
```

### Sistema de Blocos (Tipo Notion)

```typescript
// Tipos de blocos disponíveis
type BlockType =
  | 'heading1' | 'heading2' | 'heading3'
  | 'paragraph'
  | 'bullet-list' | 'numbered-list'
  | 'table'
  | 'medication' // 💊 Bloco especial: medicamento
  | 'dosage' // 💉 Bloco especial: dosagem
  | 'criteria' // ✅ Bloco especial: critérios
  | 'flowchart-node' // 📊 Bloco especial: nó de fluxograma
  | 'ai-suggestion' // 🤖 Bloco especial: sugestão IA
  | 'reference' // 📚 Bloco especial: referência

// Exemplo de bloco de medicamento
{
  id: 'block_123',
  type: 'medication',
  data: {
    name: 'Dipirona',
    dosage: '500mg',
    route: 'IV',
    frequency: '6/6h',
    maxDose: '4g/dia',
    contraindications: ['Alergia', 'Insuficiência renal'],
    aiValidated: true, // IA validou automaticamente
  }
}
```

### Interface Visual

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 Protocolo: IAM - Pronto Socorro              [Salvar] [▶] │
├─────────────────────────────────────────────────────────────┤
│ [Blocos] [Fluxograma] [IA Assistente] [Validar] [Exportar] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣ Título e Identificação                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ # Infarto Agudo do Miocárdio                           │ │
│  │ Código: PA-CARDIO-001                                  │ │
│  │ [+ Adicionar campo] [🤖 Sugerir com IA]               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  2️⃣ Objetivo                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Estabelecer conduta padronizada para...                │ │
│  │ [✏️ Editar] [🤖 Expandir com IA]                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  8️⃣ Medicações                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [+ Adicionar Medicamento]                               │ │
│  │                                                          │ │
│  │ 💊 AAS                                                  │ │
│  │    Dose: 200mg                                          │ │
│  │    Via: VO                                              │ │
│  │    ✅ Validado pela IA                                  │ │
│  │    [Editar] [Remover]                                   │ │
│  │                                                          │ │
│  │ 💊 Clopidogrel                                          │ │
│  │    Dose: 300mg (ataque)                                 │ │
│  │    ⚠️  IA sugere: considerar 600mg                      │ │
│  │    [Aceitar] [Ignorar] [Editar]                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  12️⃣ Fluxograma                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Modo Visual] [Modo Texto (Mermaid)]                    │ │
│  │                                                          │ │
│  │  ┌─────────┐                                            │ │
│  │  │ Paciente├──→[Dor torácica?]──Sim──→┌──────────┐     │ │
│  │  │  chega  │                           │ ECG 12   │     │ │
│  │  └─────────┘                           │derivações│     │ │
│  │                                         └──────────┘     │ │
│  │  [+ Adicionar Nó] [🤖 Gerar do texto]                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [💡 Sidebar com sugestões da IA em tempo real]            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Features Principais

#### 1. Editor Visual de Blocos (tipo Notion)
- Arrasta e solta blocos
- Blocos especializados (medicamento, dosagem, critérios)
- Transformações de bloco (/ para comandos)
- Colaboração em tempo real (Yjs)

#### 2. IA Assistente Contextual
- Sugestões enquanto escreve
- Auto-complete médico
- Validação em tempo real
- Correção de dosagens
- Sugestão de referências

#### 3. Fluxograma Visual
- Drag-and-drop de nós
- Tipos especiais (decisão, ação, medicamento)
- Geração automática do texto
- Sincronização texto ↔ fluxograma

#### 4. Biblioteca de Templates
- Templates prontos (IAM, Sepse, AVC, etc.)
- Personalizáveis
- Versionamento
- Compartilháveis entre hospitais

#### 5. Validação Inteligente
- IA valida enquanto escreve
- Destaca erros em tempo real
- Sugere correções
- Score de qualidade

#### 6. Colaboração
- Múltiplos usuários simultâneos
- Comentários inline
- Histórico de mudanças
- Aprovações visuais

### Implementação (12 semanas)

#### Fase 1: Editor de Blocos (3 semanas)
- [ ] Setup Next.js + Lexical
- [ ] Sistema de blocos básico
- [ ] Blocos especiais (medicamento, dosagem)
- [ ] Serialização JSON

#### Fase 2: IA Assistente (3 semanas)
- [ ] Integração OpenAI + Claude
- [ ] Sugestões contextuais
- [ ] Validação automática
- [ ] Auto-complete médico
- [ ] Embeddings para busca semântica

#### Fase 3: Fluxograma Visual (2 semanas)
- [ ] ReactFlow integration
- [ ] Tipos de nós customizados
- [ ] Geração automática
- [ ] Sincronização bidirecional

#### Fase 4: Colaboração (2 semanas)
- [ ] Yjs para real-time editing
- [ ] Sistema de comentários
- [ ] Presence awareness (quem está online)
- [ ] Versionamento

#### Fase 5: Templates e Export (2 semanas)
- [ ] Biblioteca de templates
- [ ] Customização de templates
- [ ] Export PDF/DOCX
- [ ] Preview print

### Vantagens do Plano 2

✅ **Empoderamento:** Médicos criam sem programadores
✅ **Visual:** Interface intuitiva tipo Notion
✅ **IA onipresente:** Ajuda em cada passo
✅ **Colaboração:** Tempo real tipo Google Docs
✅ **Flexível:** Templates customizáveis
✅ **Profissional:** UX de produto SaaS moderno

### Desvantagens do Plano 2

❌ **Complexidade:** Editor visual é difícil de construir
❌ **Tempo:** 12 semanas vs 4 (Plano 1)
❌ **Custo maior:** Mais infraestrutura
❌ **Performance:** Real-time é desafiador
❌ **Learning curve:** Médicos precisam aprender interface

### Custo (Mensal após lançamento)

| Item | Custo |
|------|-------|
| Vercel Pro | R$ 100 |
| Fly.io (backend + workers) | R$ 400 |
| Neon PostgreSQL | R$ 100 |
| Upstash Redis | R$ 150 |
| Pinecone (vector DB) | R$ 350 |
| OpenAI API | ~R$ 500 (100 protocolos/mês) |
| Cloudflare R2 | R$ 50 |
| **TOTAL** | **~R$ 1.650/mês** |

---

## 📕 PLANO 3: APP MOBILE-FIRST + OFFLINE
### "Médicos criam protocolos no celular, mesmo sem internet"

**Filosofia:** Médicos usam celular 80% do tempo. Criar um app mobile nativo com IA offline.

### Por Que Mobile-First?

**Realidade dos médicos brasileiros:**
- 📱 Usam celular 24/7 (WhatsApp, prontuários)
- 🏥 Muitos hospitais têm WiFi ruim
- 🚑 Criam protocolos em movimento (plantões, home office)
- ⏱️ Precisam de rapidez (não ficam no desktop)

**Solução:** App mobile que funciona offline, sincroniza quando possível.

### Arquitetura Mobile-First

```
┌─────────────────────────────────────────────────┐
│       MOBILE APP (React Native)                  │
│   iOS + Android                                  │
│   + Expo (deploy over-the-air)                  │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  LOCAL DATABASE  │
         │  SQLite          │
         │  (offline-first) │
         └─────────┬────────┘
                   │
                   ▼ (quando online)
┌─────────────────────────────────────────────────┐
│           SYNC SERVICE (GraphQL)                 │
│   Hasura (GraphQL Engine)                       │
│   + PostgreSQL                                   │
└──────────────────┬───────────────────────────────┘
                   │
        ┌──────────┴──────────┬─────────────┐
        ▼                     ▼             ▼
┌──────────────┐   ┌──────────────┐   ┌──────────┐
│  PostgreSQL  │   │  AI Service  │   │  Storage │
│  (Supabase)  │   │  (Edge)      │   │  (R2)    │
└──────────────┘   └──────────────┘   └──────────┘
```

### Stack Tecnológico

```yaml
Mobile:
  Framework: React Native (Expo)
  Language: TypeScript
  Navigation: React Navigation 6
  UI: NativeBase (componentes mobile)
  Forms: React Hook Form
  State: Zustand
  Offline: WatermelonDB (SQLite offline-first)

Backend:
  GraphQL: Hasura (auto-gera API do PostgreSQL)
  Database: Supabase PostgreSQL
  Realtime: Hasura subscriptions
  Auth: Supabase Auth

AI (Offline-capable):
  On-device: TensorFlow Lite (validação básica)
  Cloud: OpenAI GPT-4o (geração complexa)
  Edge: Cloudflare Workers AI (intermediário)

Storage:
  Documents: Cloudflare R2
  Images: Cloudflare Images

Deploy:
  Mobile: Expo EAS (iOS + Android)
  Backend: Hasura Cloud
  AI Workers: Cloudflare Workers
```

### Features Mobile-First

#### 1. Criação por Voz 🎤
```typescript
// Médico fala, app transcreve e gera protocolo
import { Audio } from 'expo-av'
import Whisper from 'openai-whisper'

async function createProtocolByVoice() {
  // Grava áudio
  const recording = await Audio.Recording.createAsync()

  // Transcreve com Whisper (OpenAI)
  const transcript = await whisper.transcribe(recording.uri)

  // Gera protocolo com GPT-4o
  const protocol = await generateFromTranscript(transcript.text)

  return protocol
}
```

**UX:**
```
┌─────────────────────────────────┐
│  🎤 Criar Protocolo por Voz     │
├─────────────────────────────────┤
│                                  │
│    ┌───────────────────────┐    │
│    │                       │    │
│    │   🔴 Gravando...      │    │
│    │                       │    │
│    │   "Protocolo para     │    │
│    │   sepse em UTI..."    │    │
│    │                       │    │
│    └───────────────────────┘    │
│                                  │
│  [⏸️ Pausar] [⏹️ Finalizar]     │
│                                  │
│  💡 Fale naturalmente, a IA     │
│     vai estruturar para ABNT    │
│                                  │
└─────────────────────────────────┘
```

#### 2. Modo Offline Completo 📴
```typescript
// WatermelonDB: sincronização offline-first
import { Database } from '@nozbe/watermelondb'
import { synchronize } from '@nozbe/watermelondb/sync'

// Cria protocolo offline
const protocol = await database.write(async () => {
  return await protocolsCollection.create(protocol => {
    protocol.title = 'IAM - Pronto Socorro'
    protocol.status = 'draft'
    protocol._status = 'created' // marca para sync
  })
})

// Quando voltar online, sincroniza
await synchronize({
  database,
  pullChanges: async ({ lastPulledAt }) => {
    const response = await fetch(`/api/sync?since=${lastPulledAt}`)
    return response.json()
  },
  pushChanges: async ({ changes }) => {
    await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify(changes)
    })
  },
})
```

**UX Offline:**
```
┌─────────────────────────────────┐
│  📴 Modo Offline                │
│  Suas alterações serão          │
│  sincronizadas quando voltar    │
│  online                          │
├─────────────────────────────────┤
│  📄 Protocolos Salvos (12)      │
│                                  │
│  ✅ IAM - PS (sincronizado)     │
│  🔄 Sepse - UTI (pendente)      │
│  🔄 AVC - PS (pendente)         │
│                                  │
│  [📤 Sincronizar Agora]         │
│  (assim que tiver internet)     │
└─────────────────────────────────┘
```

#### 3. IA On-Device (Validação Rápida) 🧠
```typescript
// TensorFlow Lite para validação offline
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native'

// Modelo treinado para detectar erros comuns
const model = await tf.loadLayersModel('file://./models/medical-validator.json')

// Valida dosagem offline (sem internet!)
function validateDosageOffline(drug: string, dose: number): ValidationResult {
  const input = tf.tensor([[encodeDrug(drug), dose]])
  const prediction = model.predict(input) as tf.Tensor

  return {
    isValid: prediction.dataSync()[0] > 0.8,
    confidence: prediction.dataSync()[0],
    suggestion: prediction.dataSync()[1] // dosagem sugerida
  }
}
```

#### 4. Câmera para Digitalizar Protocolos 📸
```typescript
// Tira foto de protocolo em papel, IA digitaliza
import { Camera } from 'expo-camera'
import Tesseract from 'tesseract.js'

async function scanPaperProtocol() {
  // Tira foto
  const photo = await camera.takePictureAsync()

  // OCR com Tesseract
  const { data: { text } } = await Tesseract.recognize(photo.uri)

  // IA estrutura em ABNT
  const structured = await gpt4o.parse(text, {
    format: 'ABNT_13_sections'
  })

  return structured
}
```

**UX:**
```
┌─────────────────────────────────┐
│  📸 Digitalizar Protocolo       │
├─────────────────────────────────┤
│                                  │
│  ┌─────────────────────────┐    │
│  │    [Viewfinder]         │    │
│  │                          │    │
│  │    📄 Posicione o        │    │
│  │    documento no quadro   │    │
│  │                          │    │
│  └─────────────────────────┘    │
│                                  │
│  [📸 Capturar] [💡 Dicas]       │
│                                  │
│  ✅ Detectado: Protocolo IAM    │
│  🤖 Processando com IA...       │
│                                  │
└─────────────────────────────────┘
```

#### 5. Fluxogramas Touch-Friendly ✏️
```typescript
// Desenha fluxograma com o dedo
import { GestureDetector } from 'react-native-gesture-handler'
import Svg from 'react-native-svg'

function TouchFlowchart() {
  const handleDraw = useCallback((event) => {
    // Converte gesture em nós
    const node = detectNodeType(event.path)

    // IA sugere conexões
    const suggestions = ai.suggestConnections(node, existingNodes)

    addNode(node, suggestions)
  }, [])

  return (
    <GestureDetector onGestureEvent={handleDraw}>
      <Svg width="100%" height="100%">
        {/* Nós do fluxograma */}
      </Svg>
    </GestureDetector>
  )
}
```

#### 6. Notificações Push (Revisões) 🔔
```typescript
// Notifica quando protocolo precisa revisão
import * as Notifications from 'expo-notifications'

Notifications.scheduleNotificationAsync({
  content: {
    title: '📋 Protocolo aguardando sua revisão',
    body: 'Dr. Silva submeteu "Protocolo IAM" para aprovação',
    data: { protocolId: '123' },
  },
  trigger: null, // imediato
})
```

### Telas Principais

#### Tela 1: Home
```
┌─────────────────────────────────┐
│  ☰  Protocolos      [🔔3] [⚙️]  │
├─────────────────────────────────┤
│                                  │
│  🔍 Buscar protocolos...         │
│                                  │
│  [🎤 Criar por Voz]              │
│  [✏️ Criar do Zero]              │
│  [📸 Digitalizar Papel]          │
│  [📁 Usar Template]              │
│                                  │
│  ━━━ Recentes ━━━                │
│                                  │
│  📄 IAM - Pronto Socorro         │
│     Editado há 2h | Rascunho     │
│     [Continuar]                  │
│                                  │
│  📄 Sepse - UTI                  │
│     Criado em 05/11 | Revisão    │
│     💬 3 comentários              │
│                                  │
│  📄 AVC - Pronto Socorro         │
│     Aprovado ✅                  │
│                                  │
└─────────────────────────────────┘
```

#### Tela 2: Editor Mobile
```
┌─────────────────────────────────┐
│  ← IAM - PS           [💾] [⋮]  │
├─────────────────────────────────┤
│  [Seções] [Fluxo] [IA] [👁️]    │
├─────────────────────────────────┤
│                                  │
│  1️⃣ Título ✅                   │
│  2️⃣ Objetivo ✅                 │
│  3️⃣ População-alvo ⚠️           │
│                                  │
│  ▼ 8️⃣ Medicações                │
│  ┌─────────────────────────┐    │
│  │ 💊 AAS 200mg VO         │    │
│  │    ✅ Validado          │    │
│  │    [Editar]             │    │
│  ├─────────────────────────┤    │
│  │ 💊 Clopidogrel 300mg    │    │
│  │    ⚠️ IA sugere 600mg   │    │
│  │    [Ver Sugestão]       │    │
│  └─────────────────────────┘    │
│  [+ Adicionar Medicamento]       │
│                                  │
│  ━━━ Atalhos ━━━                │
│  [🤖 Gerar esta seção com IA]   │
│  [🎤 Ditar conteúdo]            │
│                                  │
└─────────────────────────────────┘
```

#### Tela 3: IA Assistente
```
┌─────────────────────────────────┐
│  🤖 Assistente IA                │
├─────────────────────────────────┤
│                                  │
│  💬 Como posso ajudar?           │
│                                  │
│  [💊 Sugerir medicamentos]       │
│  [✅ Validar protocolo]          │
│  [📊 Gerar fluxograma]           │
│  [📚 Buscar referências]         │
│  [🔍 Revisar dosagens]           │
│                                  │
│  ━━━ Conversa ━━━                │
│                                  │
│  Você: "Qual dose de AAS?"       │
│                                  │
│  🤖: "Para IAM, recomendo:       │
│      • AAS 200-300mg VO          │
│      • Dose de ataque            │
│      • Evidência: ESC 2023"      │
│                                  │
│  [Adicionar ao Protocolo]        │
│                                  │
│  ┌───────────────────────┐       │
│  │ Digite sua pergunta... │       │
│  │ [🎤]           [Enviar]│       │
│  └───────────────────────┘       │
│                                  │
└─────────────────────────────────┘
```

### Implementação (14 semanas)

#### Fase 1: App Base (3 semanas)
- [ ] Setup React Native + Expo
- [ ] Navegação e telas principais
- [ ] UI/UX mobile-first
- [ ] SQLite local database (WatermelonDB)

#### Fase 2: Offline-First (3 semanas)
- [ ] Sincronização bidirecional
- [ ] Conflict resolution
- [ ] Queue de operações offline
- [ ] Status de sincronização

#### Fase 3: IA Cloud + Edge (3 semanas)
- [ ] Integração OpenAI (geração)
- [ ] Cloudflare Workers AI (edge)
- [ ] TensorFlow Lite (on-device)
- [ ] Whisper (voz → texto)

#### Fase 4: Features Mobile (3 semanas)
- [ ] Criação por voz
- [ ] Câmera + OCR
- [ ] Fluxograma touch
- [ ] Notificações push

#### Fase 5: Backend GraphQL (2 semanas)
- [ ] Hasura setup
- [ ] Subscriptions real-time
- [ ] Auth e RBAC
- [ ] Deploy cloud

### Vantagens do Plano 3

✅ **Mobile-first:** Onde médicos realmente trabalham
✅ **Offline:** Funciona sem internet
✅ **Voz:** Criação mãos-livres
✅ **Câmera:** Digitaliza protocolos em papel
✅ **Rápido:** IA on-device para validação
✅ **Moderno:** App nativo iOS + Android
✅ **Push:** Notificações de revisões

### Desvantagens do Plano 3

❌ **Complexidade offline:** Sync é difícil
❌ **Duas plataformas:** iOS + Android
❌ **App stores:** Review process demorado
❌ **Modelo on-device:** Precisa treinar TF Lite
❌ **Limitações mobile:** Tela pequena para edição complexa

### Custo (Mensal)

| Item | Custo |
|------|-------|
| Expo EAS (build + updates) | R$ 450/mês |
| Hasura Cloud | R$ 500/mês |
| Supabase Pro | R$ 125/mês |
| Cloudflare Workers AI | R$ 200/mês |
| OpenAI API | ~R$ 400/mês |
| Cloudflare R2 | R$ 50/mês |
| Apple Developer | R$ 500/ano (R$ 42/mês) |
| Google Play | R$ 130 (one-time) |
| **TOTAL** | **~R$ 1.767/mês** |

---

## 🏆 COMPARAÇÃO FINAL DOS 3 PLANOS

| Critério | Plano 1: Minimalista | Plano 2: No-Code | Plano 3: Mobile |
|----------|---------------------|------------------|-----------------|
| **Tempo** | 4 semanas | 12 semanas | 14 semanas |
| **Custo Inicial** | R$ 0 | R$ 5.000 | R$ 8.000 |
| **Custo Mensal** | R$ 300 | R$ 1.650 | R$ 1.767 |
| **Plataforma** | Web (desktop) | Web (desktop) | Mobile (iOS/Android) |
| **Offline** | ❌ Não | ❌ Não | ✅ Sim |
| **IA** | OpenAI | Multi-provider | Cloud + Edge + On-device |
| **UX** | Simples, funcional | Visual, tipo Notion | Touch, voz, câmera |
| **Colaboração** | Comentários | Tempo real | Assíncrona |
| **Curva Aprendizado** | Baixa | Média | Baixa (familiar mobile) |
| **Escalabilidade** | Boa | Excelente | Boa |
| **Inovação** | Baixa | Alta | Altíssima |
| **Risco** | Baixo | Médio | Alto |
| **Target** | Desktop workers | Power users | Médicos em movimento |

---

## 🎯 RECOMENDAÇÃO POR CONTEXTO

### Escolha PLANO 1 (Minimalista) se:
- ✅ Você quer validar o mercado RÁPIDO (MVP em 1 mês)
- ✅ Orçamento limitado (começa grátis)
- ✅ Médicos trabalham principalmente em desktop
- ✅ Não precisa de offline
- ✅ Time pequeno (1-2 devs)

### Escolha PLANO 2 (No-Code) se:
- ✅ Quer **empoderar médicos** a criar sem programadores
- ✅ Precisa de **colaboração em tempo real**
- ✅ Quer UX diferenciada (tipo Notion)
- ✅ Tem 3 meses para desenvolver
- ✅ Orçamento para infraestrutura (~R$ 1.650/mês)
- ✅ Quer produto premium/profissional

### Escolha PLANO 3 (Mobile) se:
- ✅ Médicos usam celular 80%+ do tempo
- ✅ **Hospitais têm WiFi ruim/inexistente**
- ✅ Quer **criar por voz** (mãos-livres)
- ✅ Precisa **digitalizar protocolos em papel**
- ✅ Tem 3-4 meses para desenvolver
- ✅ Quer inovação disruptiva
- ✅ Pode investir ~R$ 1.767/mês

---

## 📊 MATRIZ DE DECISÃO RÁPIDA

Responda SIM/NÃO:

1. **Médicos usam principalmente celular?**
   - SIM → Plano 3
   - NÃO → Pergunta 2

2. **Precisa validar mercado em <2 meses?**
   - SIM → Plano 1
   - NÃO → Pergunta 3

3. **Quer empoderar médicos sem programadores?**
   - SIM → Plano 2
   - NÃO → Plano 1 (mais simples)

4. **Hospitais têm internet ruim?**
   - SIM → Plano 3 (único com offline)
   - NÃO → Plano 1 ou 2

5. **Orçamento mensal > R$ 1.500?**
   - SIM → Plano 2 ou 3
   - NÃO → Plano 1

---

## 🚀 PRÓXIMOS PASSOS

Qual plano você quer implementar? Posso:

1. **Criar POC** de qualquer plano (2-3 dias)
2. **Setup inicial** completo (repo + config)
3. **Começar implementação** da Fase 1
4. **Responder dúvidas** técnicas sobre qualquer plano
5. **Refinar estimativas** de tempo/custo
6. **Comparar tecnologias** específicas

**Me diz qual plano faz mais sentido para o seu contexto!** 🎯
