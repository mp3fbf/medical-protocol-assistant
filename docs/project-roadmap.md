# Medical Protocol Assistant - Roadmap & Pendências

## 📋 Status Atual do Projeto

**Data:** 29 de maio de 2025  
**Versão:** v1.1  
**Stack:** Next.js 15.3.2, Prisma, PostgreSQL (Supabase), tRPC, OpenAI

### 🎯 **Visão Geral**

O projeto tem uma **arquitetura sólida** mas está funcionalmente **60% incompleto**. A infraestrutura está robusta, mas faltam integrações críticas entre os componentes já desenvolvidos.

---

## 🚦 Estado dos Módulos

### ✅ **CONCLUÍDO** (Funcional)

#### 🔐 Autenticação & Autorização

- NextAuth com email/password ✅
- RBAC (CREATOR/REVIEWER/ADMIN) ✅
- Middleware de proteção de rotas ✅
- Sistema de permissões ✅

#### 💾 Database & Estado

- Schema Prisma completo (13 seções, versioning, audit) ✅
- Operações CRUD básicas ✅
- Sistema de versionamento imutável ✅
- Migrações e seed funcionais ✅

#### 🎨 Interface Base

- Layout responsivo com header/sidebar ✅
- Sistema de roteamento (/dashboard, /protocols) ✅
- Componentes UI (shadcn) configurados ✅
- Editor de protocolo com 3 colunas ✅

### ⚠️ **PARCIALMENTE IMPLEMENTADO** (Requer Integração)

#### 🤖 IA & Geração

- **Status**: Módulos existem mas desconectados
- OpenAI client configurado mas não usado ⚠️
- Prompts detalhados para cada seção ⚠️
- Research API definida mas não integrada ⚠️
- Schemas de validação prontos mas não executados ⚠️

#### ✏️ Editor de Protocolos

- **Status**: Interface funciona, falta funcionalidade
- Navegação entre 13 seções funcional ⚠️
- Salvamento básico implementado ⚠️
- Editor de texto simples (textarea) ⚠️
- Validação visual não conectada ⚠️

#### 📊 Flowcharts & Visualização

- **Status**: Componentes ReactFlow existem mas vazios
- Estrutura para nodes personalizados ⚠️
- Auto-layout com dagre configurado ⚠️
- Renderização não implementada ⚠️

### ❌ **NÃO IMPLEMENTADO** (Crítico para MVP)

#### 🎯 Workflows Principais

- **Fluxo de criação assistida por IA** ❌
- **Pesquisa médica automatizada** ❌
- **Geração de fluxogramas automática** ❌
- **Exportação para PDF/DOCX** ❌
- **Sistema de validação cross-section** ❌

#### 🔧 Funcionalidades Avançadas

- **Editor de texto rico** ❌
- **Tabela de medicamentos** ❌
- **Comparação de versões** ❌
- **Colaboração em tempo real** ❌
- **Dashboard com estatísticas** ❌

---

## 📋 **ROADMAP DE IMPLEMENTAÇÃO**

### 🚀 **FASE 1: MVP Funcional** (2-3 semanas)

**Objetivo**: Tornar o app funcional end-to-end

#### Sprint 1: Core AI Pipeline (1 semana)

1. **✅ Conectar formulário → pesquisa → geração**

   - ✅ `src/app/(auth)/protocols/new/page.tsx` → trigger AI research
   - ✅ `src/lib/ai/research.ts` → integrar com UI
   - ✅ `src/lib/ai/generator.ts` → conectar geração com editor

2. **Camada de abstração para modelos de IA**

   - ✅ Criar sistema modular para trocar provedores (OpenAI → Anthropic → Local)
   - ✅ Registry de providers com configuração centralizada
   - Migrar cliente OpenAI existente para nova arquitetura

3. **Sistema de upload de material**

   - Funcionalidade para upload de documentos (PDF, DOCX, TXT)
   - Parser de material médico existente
   - Modo híbrido: material + pesquisa IA complementar

4. **✅ Resolver problemas de estado no editor**

   - ✅ Corrigir vazamento de conteúdo entre seções
   - ✅ Implementar salvamento otimista
   - ✅ Adicionar loading states

5. **Sistema básico de validação**
   - Conectar `src/lib/validators/*` com editor
   - Mostrar erros em tempo real
   - Validação estrutural das 13 seções

#### Sprint 2: Visualização & Export (1 semana)

4. **Flowchart funcional**

   - Renderizar nodes a partir dos dados do protocolo
   - Auto-layout básico
   - Edição simples de nodes

5. **Exportação básica**

   - Botões para PDF/DOCX no header
   - Geração usando libs existentes
   - Download direto

6. **Editor melhorado**
   - Rich text editor (TipTap ou similar)
   - Tabela básica de medicamentos
   - Preview mode

#### Sprint 3: Polish & Testing (0.5 semana)

7. **Dashboard funcional**

   - Estatísticas reais de protocolos
   - Lista com filtros funcionais
   - Search implementado

8. **Error handling & UX**
   - Error boundaries
   - Loading states
   - Toast notifications

### 🎯 **FASE 2: Otimização** (1-2 semanas)

**Objetivo**: Melhorar experiência e performance

9. **IA Avançada**

   - Geração seção por seção
   - Sugestões contextuais
   - Melhoria iterativa

10. **Collaboration Features**

    - Comentários em seções
    - Sistema básico de review
    - Histórico de mudanças

11. **Advanced Export**
    - Templates ABNT completos
    - Batch export
    - Custom formatting

### 🚀 **FASE 3: Produção** (1 semana)

**Objetivo**: Deploy e monitoring

12. **Deployment**

    - CI/CD completo
    - Monitoring básico
    - Backup strategy

13. **Performance**
    - Caching inteligente
    - Code splitting
    - Database optimization

---

## 🎯 **PRÓXIMOS PASSOS IMEDIATOS**

### Esta Semana (Prioridade 1)

1. **✅ [CRÍTICO] Corrigir editor de seções**

   - ✅ Resolver vazamento de conteúdo
   - ✅ Garantir isolamento entre seções
   - ✅ Testar salvamento

2. **✅ [ALTA] Conectar pipeline de IA**

   - ✅ Form creation → trigger research
   - ✅ Research results → protocol generation
   - ✅ Generated content → populate editor

3. **🔄 [NOVA] Abstração de modelos IA**

   - ✅ Sistema modular de providers
   - 🔄 Migrar cliente OpenAI existente
   - Permitir switching fácil entre providers

4. **🔄 [NOVA] Sistema de upload de material**

   - Interface para upload de documentos
   - Parser para extrair texto médico
   - Modo: material próprio + pesquisa complementar

5. **[ALTA] Implementar validação básica**
   - Rodar validators nas 13 seções
   - Mostrar status visual
   - Highlight problemas

### Próxima Semana (Prioridade 2)

4. **[MÉDIA] Flowchart básico**

   - Renderizar nodes simples
   - Layout automático
   - Conexão com dados

5. **[MÉDIA] Exportação funcional**
   - PDF generation working
   - Download UI
   - Basic formatting

### Terceira Semana (Prioridade 3)

6. **[BAIXA] Rich text editor**
7. **[BAIXA] Dashboard stats**
8. **[BAIXA] Advanced features**

---

## 🛠️ **TAREFAS TÉCNICAS ESPECÍFICAS**

### 1. **Resolver Editor State Issues**

```typescript
// Problema atual em src/hooks/use-protocol-editor-state.ts
// - updateSectionContent causando race conditions
// - Local content sendo perdido no save
// - Section bleeding entre seções

// Solução:
// - Implementar state machine para editor
// - Debounce updates
// - Optimistic updates com rollback
```

### 2. **Conectar AI Pipeline**

```typescript
// src/app/(auth)/protocols/new/page.tsx
const handleAIGeneration = async (formData) => {
  // 1. Trigger research
  const research = await trpc.research.search.mutate(formData);

  // 2. Generate protocol
  const protocol = await trpc.ai.generateProtocol.mutate({
    research,
    mode: formData.mode,
  });

  // 3. Navigate to editor
  router.push(`/protocols/${protocol.id}`);
};
```

### 3. **Implementar Validação**

```typescript
// src/components/protocol/editor/validation-report-display.tsx
// Conectar com src/lib/validators/* existentes
// Rodar validação em background
// Mostrar resultados em tempo real
```

### 4. **Flowchart Integration**

```typescript
// src/components/protocol/flowchart/protocol-flowchart-canvas.tsx
// Usar dados reais do protocol.flowchart
// Implementar save flowchart changes
// Auto-layout com dagre
```

---

## 📊 **MÉTRICAS DE SUCESSO**

### MVP Success Criteria

- [ ] Usuário consegue criar protocolo com IA end-to-end
- [ ] Editor não perde dados entre seções
- [ ] Validação mostra problemas reais
- [ ] Export PDF/DOCX funciona
- [ ] Flowchart renderiza corretamente

### Performance Targets

- [ ] Geração IA < 30s
- [ ] Export < 5s
- [ ] Editor responsivo < 2s
- [ ] Page load < 3s

### Quality Gates

- [ ] 80% test coverage em business logic
- [ ] 0 critical bugs em production
- [ ] 95% uptime
- [ ] < 3 user-reported issues/week

---

## 🔗 **Links Úteis**

- **Technical Spec**: `Opus 4/technical specification.md`
- **Project Rules**: `Opus 4/project rules.md`
- **Current Issues**: GitHub Issues
- **Deploy**: Vercel Dashboard
- **Database**: Supabase Dashboard

---

## 📝 **Notas de Desenvolvimento**

### Decisões Arquiteturais Pendentes

1. **Rich Text Editor**: TipTap vs Lexical vs custom
2. **Real-time Sync**: WebSockets vs polling vs SSE
3. **File Storage**: Supabase vs direct API
4. **Caching Strategy**: React Query vs SWR vs custom

### Technical Debt

1. **Type Safety**: Eliminar `as any` em JSON fields
2. **Error Handling**: Centralizar error boundaries
3. **Performance**: Implement code splitting
4. **Security**: Add rate limiting

### Conhecimento Crítico

- **13 Seções Obrigatórias**: Todo protocolo deve ter todas
- **ABNT Formatting**: Export deve seguir padrão específico
- **Medicina Baseada em Evidências**: IA deve referenciar fontes
- **Fluxogramas Daktus**: Formato específico da Prevent Senior

---

_Última atualização: 29/05/2025 - Claude Code_
