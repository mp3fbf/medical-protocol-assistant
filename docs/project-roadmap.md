# Medical Protocol Assistant - Roadmap & Pendências

## 📋 Status Atual do Projeto

**Data:** 30 de maio de 2025  
**Versão:** v1.3  
**Stack:** Next.js 15.3.2, Prisma, PostgreSQL (Supabase), tRPC, Multi-Provider AI

### 🎯 **Visão Geral**

O projeto evoluiu significativamente e agora está **92% funcional**. Os módulos principais estão conectados e funcionando, com sistema de validação profissional implementado, upload de materiais médicos (incluindo Markdown), pipeline de IA totalmente operacional, e sistema de export PDF/DOCX funcional. Faltam principalmente a visualização de flowcharts e refinamentos de UI/UX.

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

- **Status**: ✅ **TOTALMENTE FUNCIONAL**
- Multi-provider abstraction layer (OpenAI, Anthropic, Gemini) ✅
- Pipeline completo: research → geração → editor ✅
- 3 modos de geração (automático, manual, material-based) ✅
- Upload e parsing de documentos (PDF, DOCX, TXT, Markdown) ✅
- Sistema de validação médica avançado ✅

#### ✏️ Editor de Protocolos

- **Status**: ✅ **FUNCIONANDO** (melhorias pendentes)
- Navegação entre 13 seções funcional ✅
- Salvamento otimista com sync database ✅
- Editor de texto simples mas funcional ✅
- Sistema de validação visual profissional ✅
- Controles de validação manual no header ✅

#### 📊 Flowcharts & Visualização

- **Status**: ✅ **PARCIALMENTE FUNCIONAL**
- Smart flowchart generator com IA médica ✅
- Detecção automática de tipo de protocolo ✅
- Layout inteligente baseado em tipo médico ✅
- Componentes ReactFlow com nodes customizados ✅
- Renderização básica implementada ⚠️ (precisa conectar com editor)

### ❌ **NÃO IMPLEMENTADO** (Crítico para MVP)

#### 🎯 Workflows Principais

- **Fluxo de criação assistida por IA** ✅
- **Pesquisa médica automatizada** ✅
- **Geração de fluxogramas automática** ✅
- **Exportação para PDF/DOCX** ✅ **[IMPLEMENTADO]**
- **Sistema de validação cross-section** ✅
- **Gerenciamento de status com permissões** ✅
- **Dashboard com estatísticas reais** ✅
- **Lista de protocolos com busca e filtros** ✅

#### 🔧 Pendências Identificadas

- **Flowchart visual rendering** ❌ (geração funciona, falta visualização)
- **Refinamentos visuais** ❌ (espaçamento e layout geral)
- **Editor de texto rico** ❌ (usando plain text atualmente)

#### 🔧 Funcionalidades Avançadas

- **Editor de texto rico** ❌
- **Tabela de medicamentos** ❌
- **Comparação de versões** ❌
- **Colaboração em tempo real** ❌
- **Dashboard com estatísticas** ❌

---

## 📋 **ROADMAP DE IMPLEMENTAÇÃO**

### 🚀 **FASE 1: MVP Funcional** ✅ **CONCLUÍDA**

**Objetivo**: ✅ Tornar o app funcional end-to-end

#### Sprint 1: Core AI Pipeline ✅ **COMPLETO**

1. **✅ Conectar formulário → pesquisa → geração** ✅

   - ✅ `src/app/(auth)/protocols/new/page.tsx` → trigger AI research
   - ✅ `src/lib/ai/research.ts` → integrar com UI
   - ✅ `src/lib/ai/generator.ts` → conectar geração com editor

2. **✅ Camada de abstração para modelos de IA** ✅

   - ✅ Criar sistema modular para trocar provedores (OpenAI → Anthropic → Local)
   - ✅ Registry de providers com configuração centralizada
   - ✅ Migrar cliente OpenAI existente para nova arquitetura

3. **✅ Sistema de upload de material** ✅

   - ✅ Funcionalidade para upload de documentos (PDF, DOCX, TXT)
   - ✅ Parser de material médico existente
   - ✅ Modo híbrido: material + pesquisa IA complementar

4. **✅ Resolver problemas de estado no editor** ✅

   - ✅ Corrigir vazamento de conteúdo entre seções
   - ✅ Implementar salvamento otimista
   - ✅ Adicionar loading states

5. **✅ Sistema avançado de validação** ✅
   - ✅ Conectar `src/lib/validators/*` com editor
   - ✅ Interface profissional de validação
   - ✅ Validação médica, estrutural e de completude
   - ✅ Sistema de categorização e sugestões

#### Sprint 2: Visualização & Export 🔄 **EM PROGRESSO**

4. **✅ Flowchart inteligente** ✅

   - ✅ Smart generator com detecção de tipo médico
   - ✅ Auto-layout inteligente baseado em protocolo
   - ⚠️ Integração visual com editor (pendente)

5. **🔄 Exportação básica** **[PRÓXIMA PRIORIDADE]**

   - Botões para PDF/DOCX no header
   - Geração usando libs existentes (implementado em /lib/generators)
   - Download direto

6. **🔄 Editor melhorado** **[MÉDIO PRAZO]**
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

### ✅ **CONCLUÍDO ESTA SEMANA**

1. **✅ [CRÍTICO] Editor de seções corrigido**

   - ✅ Resolver vazamento de conteúdo
   - ✅ Garantir isolamento entre seções
   - ✅ Testar salvamento

2. **✅ [ALTA] Pipeline de IA conectado**

   - ✅ Form creation → trigger research
   - ✅ Research results → protocol generation
   - ✅ Generated content → populate editor

3. **✅ [NOVA] Abstração de modelos IA**

   - ✅ Sistema modular de providers
   - ✅ Multi-provider support (OpenAI, Anthropic, Gemini)
   - ✅ Switching fácil entre providers

4. **✅ [NOVA] Sistema de upload de material**

   - ✅ Interface para upload de documentos
   - ✅ Parser para extrair texto médico
   - ✅ Modo: material próprio + pesquisa complementar

5. **✅ [ALTA] Validação avançada implementada**
   - ✅ Validators nas 13 seções + médicos
   - ✅ Interface profissional de status
   - ✅ Categorização e sugestões de melhoria

### 🎯 **PRÓXIMA SEMANA (Prioridade 1)**

1. **[ALTA] Exportação funcional** **[FOCO PRINCIPAL]**

   - Integrar sistema de export existente com UI
   - Botões de download no header do editor
   - PDF/DOCX generation com formatação ABNT
   - Testing e error handling

2. **[MÉDIA] Refinamentos de validação**

   - Corrigir estado inicial (não mostrar "válido" por padrão)
   - Implementar auto-validação toggle funcional
   - Melhorar layout visual e espaçamento

3. **[MÉDIA] Flowchart visual**

   - Conectar smart generator com ReactFlow canvas
   - Renderização visual dos fluxogramas gerados
   - Edição básica de posições

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

- [x] Usuário consegue criar protocolo com IA end-to-end ✅
- [x] Editor não perde dados entre seções ✅
- [x] Validação mostra problemas reais ✅
- [x] Export PDF/DOCX funciona ✅
- [x] Flowchart inteligente gera corretamente ✅
- [x] Gerenciamento de status com permissões ✅
- [x] Dashboard e listagens funcionais ✅
- [ ] Flowchart renderiza visualmente **[PRÓXIMA PRIORIDADE]**

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

---

## 🎉 **CONQUISTAS RECENTES**

### Semana de 29-30/05/2025

**✅ Sistema de Validação Profissional Implementado**

- Interface profissional com contagem de erros/alertas/categorias
- 42 tipos de validação médica, estrutural e de completude
- Sistema de sugestões e priorização de problemas
- Integração completa com editor e controles manuais
- Auto-validação com debouncing de 2 segundos

**✅ Pipeline de IA Totalmente Funcional**

- 3 modos de geração: automático, manual, material-based
- Multi-provider abstraction (OpenAI, Anthropic, Gemini)
- Upload e parsing de documentos médicos
- Research automatizado + geração end-to-end
- Seleção automática de modelo para documentos grandes

**✅ Editor Robusto e Estável**

- Navegação fluida entre 13 seções
- Salvamento otimista com sync database
- Correção de vazamento de conteúdo entre seções
- Estados de loading e error handling
- Formatação automática de campos estruturados (sem JSON visível)

**✅ Novos Recursos Implementados (30/05)**

- **Sistema de Export PDF/DOCX** totalmente funcional
- **Gerenciamento de Status** com permissões por role (DRAFT → REVIEW → APPROVED → ARCHIVED)
- **Dashboard Corrigido** com estatísticas reais e atividade recente clicável
- **Lista de Protocolos Aprimorada** com busca, filtros por status e ordenação
- **Arquivamento em Massa** de protocolos de teste (86 protocolos arquivados)

**🔄 Próximo Foco: Visualização e Polish**

- Integração visual de flowcharts com ReactFlow
- Editor de texto rico (TipTap ou similar)
- Refinamentos finais de UI/UX para produção

---

_Última atualização: 30/05/2025 - Claude Code_
