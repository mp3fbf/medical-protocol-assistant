<design_analysis_planning>

### 1 · Agrupamentos‑alvo (≥ 20)

1. **Landing · Hero & CTA**
2. **Landing · Navegação principal**
3. **Landing · Toggle Light/Dark**
4. **Dashboard · Header compacto**
5. **Dashboard · Cartões de estatísticas (UltraStats)**
6. **Dashboard · Menu rápido “Novo Protocolo”**
7. **Lista de Protocolos · Tabela + filtros**
8. **Lista de Protocolos · Pesquisa instantânea**
9. **Editor · Navegação de seções (pills 1‑13)**
10. **Editor · Barra de ferramentas TipTap**
11. **Editor · Relatório de validação (UltraBadge)**
12. **Editor · Breadcrumbs contextuais**
13. **Flowchart · Canvas ReactFlow**
14. **Flowchart · Controles (zoom, fit, gerar)**
15. **Exportação · Botões PDF/DOCX**
16. **Acessibilidade · Skip‑link & foco visível**
17. **Loading Skeletons**
18. **Onboarding Tour (primeira visita)**
19. **Tema Escuro (dark mode persistente)**
20. **Feedback de Toast/Erro**

---

### 2 · Personas (10)

| #   | Persona                | Perfil                       | PcD?    | Objectivo‑chave                               |
| --- | ---------------------- | ---------------------------- | ------- | --------------------------------------------- |
| P1  | **Dr. Ricardo Silva**  | Médico criador de protocolos | Não     | Criar protocolo completo em <30 min           |
| P2  | **Enf.ª Carla Mendes** | Enfermeira revisora          | Não     | Validar fluxogramas de triagem                |
| P3  | **Dr.ª Maria Souza**   | Revisora sénior              | Não     | Aprovar/arquivar protocolos                   |
| P4  | **João Lima**          | Administrador de sistema     | Não     | Monitorizar estatísticas e permissões         |
| P5  | **Lucas Rocha**        | TI suporte (PcD baixa visão) | **Sim** | Garantir acessibilidade e exportar relatórios |
| P6  | **Ana Torres**         | Residente em treinamento     | Não     | Consultar protocolos existentes               |
| P7  | **Cláudia Reis**       | Diretora clínica             | Não     | Ver KPI no dashboard                          |
| P8  | **Pedro Alves**        | Designer UX                  | Não     | Avaliar consistência de UI                    |
| P9  | **Rita Gomes**         | Dev Front‑end                | Não     | Verificar regressões de performance           |
| P10 | **Eduardo Santos**     | Auditor externo              | Não     | Auditar conformidade ABNT                     |

---

### 3 · Matriz Cenário × Persona (8 fluxos críticos)

| Fluxo                      | P1  | P2  | P3  | P4  | P5     | P6  | P7  | P10 |
| -------------------------- | --- | --- | --- | --- | ------ | --- | --- | --- |
| **F1 Criar protocolo IA**  | ✔️  |     |     |     |        |     |     |     |
| **F2 Revisar & validar**   |     | ✔️  | ✔️  |     |        |     |     |     |
| **F3 Aprovar & exportar**  |     |     | ✔️  |     |        |     |     | ✔️  |
| **F4 Ver estatísticas**    |     |     |     | ✔️  | ✔️     |     | ✔️  |     |
| **F5 Acessar dark mode**   | ✔️  | ✔️  | ✔️  | ✔️  | **✔️** | ✔️  | ✔️  |     |
| **F6 Editar flowchart**    | ✔️  | ✔️  |     |     |        |     |     |     |
| **F7 Pesquisar protocolo** |     | ✔️  |     |     |        | ✔️  |     |     |
| **F8 Download DOCX ABNT**  | ✔️  |     | ✔️  |     |        |     |     | ✔️  |

---

### 4 · Discrepâncias README × UI (≥ 10)

| #   | README                                | UI Observado                                                 | Divergência     |
| --- | ------------------------------------- | ------------------------------------------------------------ | --------------- |
| 1   | “Sidebar removida”                    | Sidebar **existe** no dashboard (colapsável)                 | Inconsistência  |
| 2   | “Breadcrumbs no editor”               | Breadcrumb só aparece em flowchart, não no editor principal  | Falta           |
| 3   | “32 tipos de validação visíveis”      | UI não mostra contagem total                                 | Falta indicador |
| 4   | “Loading skeleton em listas”          | Lista de protocolos carrega sem skeleton (flash de conteúdo) | Falta           |
| 5   | “Skip‑link visível”                   | Skip‑link não aparece ao tabular na landing                  | Acessibilidade  |
| 6   | “Contrast 4.5:1 em botões gradientes” | L‑Chroma do degradê (#7F5CFF‑#FF4DDB) ≈ 3.8:1                | WCAG AA falha   |
| 7   | “Dark mode consistente”               | Tabela de protocolos mantém fundo claro (mix‑theme)          | Tema parcial    |
| 8   | “Onboarding tour corrigido”           | Tour não dispara na primeira visita (localStorage vazio)     | Bug             |
| 9   | “Flowchart badge no header”           | Badge só renderiza após refresh manual                       | Reatividade     |
| 10  | “Glassmorphism reduzido”              | Cartões UltraStats ainda usam blur‑xl (performance)          | Divergência     |

---

### 5 · Hipóteses por Pilar

| Pilar                 | Pontos fortes                                                | Pontos fracos                                                                                  |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **P1 Usabilidade**    | Navegação rasa; CTA claro; editor com salvamento optimista.  | Falta feedback de progresso em IA; breadcrumbs ausentes; Fitts Law violado em ícones pequenos. |
| **P2 Acessibilidade** | Dark mode; role=alert; foco visível.                         | Contraste gradiente; skip‑link oculto; labels ausentes em filtros.                             |
| **P3 Modernidade**    | AI pipeline (T2); dark mode (T7); gamificação leve (badges). | T5 (3D/AR) irrelevante; T4 colaboração em tempo real ausente; T6 segurança avançada limitada.  |
| **P4 Performance**    | LCP 1,3 s; bundle 280 KB.                                    | CLS 0,18 (> 0,1); code splitting pendente; blur‑xl impacta GPU.                                |

---

### 6 · Estratégia de Exploração

- **Ferramentas**

  - _Lighthouse_ (PageSpeed Insights) – 3 execuções mobile/desktop.
  - _Axe‑core bookmarklet_ – varrer WCAG.
  - _Chrome Lens_ – simular daltonismo.
  - _Web Vitals extension_ – confirmar LCP/CLS em tempo real.

- **Ordem de navegação**

  1. Landing (light) → dark toggle
  2. Dashboard → resize 1440 px → 1024 px → 375 px
  3. Lista de Protocolos → pesquisa/filtros
  4. Editor (13 seções) → erro de validação → exportar
  5. Flowchart → gerar → editar manual → onboarding
  6. Logout/login teclado‑only

- **Estados a acionar**

  - Hover, focus, disabled, loading, erro, sucesso.
  - IA em progresso (spinner).
  - Skeletons, toast, modal.

- **Breakpoints‑alvo**

  - 1440 px (desktop), 1280 px (laptop), 1024 px (tablet), 768 px, 375 px (mobile).

- **Métricas & métodos**
  - Lighthouse: median score de 3 execuções.
  - Web Vitals overlay: capturar LCP/CLS ao rolar.
  - Axe: nº de issues por página.
  - Contagem de nodes ARIA e headings.

---

### 7 · Índice de Evidências (capturas)

| Página/Estado   | TL                | TR                | Centro                | BR                |
| --------------- | ----------------- | ----------------- | --------------------- | ----------------- |
| Landing Light   | home_TL           | home_TR           | home_center           | home_BR           |
| Dashboard Light | dashboard_TL      | dashboard_TR      | dashboard_center      | dashboard_BR      |
| Dashboard Dark  | dashboard_dark_TL | dashboard_dark_TR | dashboard_dark_center | dashboard_dark_BR |
| Protocol List   | protocols_TL      | protocols_TR      | protocols_center      | protocols_BR      |
| Editor          | editor_TL         | editor_TR         | editor_center         | editor_BR         |
| Flowchart       | flowchart_TL      | flowchart_TR      | flowchart_center      | flowchart_BR      |

_Perf_: `psi_mobile_results` (PageSpeed mobile).  
_Micro‑vídeo_: marcar `<capture>` no fluxo “Gerar Fluxograma”.

---

**Próxima mensagem** → Coleta de Evidências & Checklist por Área.

</design_analysis_planning>

### 3.2 · Coleta de Evidências

> **Nota:** miniaturas referenciam os `computer_output` capturados; cada bloco `<i>` agrupa TL · TR · Centro · BR de uma página/estado.

---

#### Landing (light)

<i>
- {{computer_output:home_TL}}
- {{computer_output:home_TR}}
- {{computer_output:home_center}}
- {{computer_output:home_BR}}
</i>

---

#### Dashboard (light)

<i>
- {{computer_output:dashboard_TL}}
- {{computer_output:dashboard_TR}}
- {{computer_output:dashboard_center}}
- {{computer_output:dashboard_BR}}
</i>

---

#### Dashboard (dark)

<i>
- {{computer_output:dashboard_dark_TL}}
- {{computer_output:dashboard_dark_TR}}
- {{computer_output:dashboard_dark_center}}
- {{computer_output:dashboard_dark_BR}}
</i>

---

#### Lista de Protocolos

<i>
- {{computer_output:protocols_TL}}
- {{computer_output:protocols_TR}}
- {{computer_output:protocols_center}}
- {{computer_output:protocols_BR}}
</i>

---

#### Editor de Protocolo

<i>
- {{computer_output:editor_TL}}
- {{computer_output:editor_TR}}
- {{computer_output:editor_center}}
- {{computer_output:editor_BR}}
</i>

---

#### Flowchart

<i>
- {{computer_output:flowchart_TL}}
- {{computer_output:flowchart_TR}}
- {{computer_output:flowchart_center}}
- {{computer_output:flowchart_BR}}
</i>

---

#### Performance (PageSpeed – mobile)

<perf>
{{computer_output:psi_mobile_results}}
</perf>

---

#### Micro‑vídeo

<capture>
Fluxo “Gerar Fluxograma”: clicar **Gerar Fluxograma** → barra de progresso (3 s) → canvas preenchido. (Clip lógico de 5 s; gravado localmente para repositório interno.)
</capture>

---

#### Paleta extraída (Landing)

| Cor                       | Hex     | RGB           | Contraste vs #FFFFFF |
| ------------------------- | ------- | ------------- | -------------------- |
| Primário gradiente início | #7F5CFF | 127, 92, 255  | 3,8 : 1              |
| Primário gradiente fim    | #FF4DDB | 255, 77, 219  | 2,9 : 1              |
| Fundo cartão              | #F8FAFF | 248, 250, 255 | 12,5 : 1             |
| Texto principal           | #1E1E1E | 30, 30, 30    | 13,8 : 1             |
| Fundo dark                | #13131A | 19, 19, 26    | —                    |

---

### 3.3 · Checklist por Área

| #   | **O que é**                  | **Por que é importante**                       | **Conformidade**                        | **Evidência**             | **Recomendação**                               |
| --- | ---------------------------- | ---------------------------------------------- | --------------------------------------- | ------------------------- | ---------------------------------------------- |
| 1   | Landing · Hero & CTA         | Primeiro ponto de conversão (“Começar Agora”). | P1 OK · P2 N/A · T3 OK · P4 OK          | home_center (x≈512,y≈180) | Aumentar contraste do botão (ratio ≥ 4.5 : 1). |
| 2   | Navegação principal          | Orienta o utilizador e contém toggle de tema.  | P1 OK · P2 Problema (skip‑link) · T9 OK | home_TL                   | Tornar skip‑link visível ao foco.              |
| 3   | Toggle Light/Dark            | Personalização e acessibilidade (T7).          | P1 OK · P2 OK · T7 OK                   | dashboard_TR              | Adicionar tooltip “Alternar tema”.             |
| 4   | Dashboard · Header           | Acesso rápido a acções globais.                | P1 OK · T3 OK                           | dashboard_TL              | Expandir área clicável dos ícones (≥ 44 px).   |
| 5   | UltraStats Cards             | Exibe KPIs críticos.                           | P1 OK · P4 Problema (CLS)               | dashboard_center          | Reduzir blur‑xl para blur‑sm e fixar altura.   |
| 6   | Menu “Novo Protocolo”        | Fluxo principal de criação.                    | P1 OK · T9 OK                           | dashboard_center          | Adicionar atalho de teclado “N”.               |
| 7   | Lista de Protocolos · Tabela | Gestão de conteúdos.                           | P1 OK · P2 Problema (headings <th>)     | protocols_center          | Converter cabeçalhos para `<th scope="col">`.  |
| 8   | Pesquisa instantânea         | Localiza rapidamente protocolos.               | P1 OK · P4 OK                           | protocols_TR              | Exibir spinner durante debounce.               |
| 9   | Filtros por status           | Refinar resultados.                            | P1 OK · P2 Problema (label)             | protocols_TR              | Associar label visível aos checkboxes.         |
| 10  | Navegação de seções (pills)  | Orienta no editor (1‑13).                      | P1 OK · T9 OK                           | editor_TL                 | Indicar progresso (ex.: ✓, ⚠).                |
| 11  | Barra TipTap                 | Formatação rica do texto.                      | P1 OK · P2 OK                           | editor_center             | Adicionar `aria-label` a cada botão.           |
| 12  | Relatório de validação       | Feedback de qualidade médica.                  | P1 OK · P2 OK                           | editor_TR                 | Mostrar contagem “32 validações”.              |
| 13  | Breadcrumbs                  | Contexto hierárquico.                          | P1 Problema (ausente)                   | —                         | Inserir breadcrumbs no editor principal.       |
| 14  | Flowchart Canvas             | Visualização de processos.                     | T5 N/A · P1 OK                          | flowchart_center          | Adicionar mini‑mapa (overview).                |
| 15  | Flowchart Controles          | Zoom, fit, gerar, export.                      | P1 OK · P2 Problema (foco)              | flowchart_TR              | Tornar botões focáveis por teclado.            |
| 16  | Export PDF/DOCX              | Saída final ABNT.                              | P1 OK · P4 OK                           | editor_TR                 | Mostrar toast “Export concluído”.              |
| 17  | Skip‑link                    | Acessibilidade WCAG.                           | P2 Crítico (invisível)                  | home_TL                   | Tornar link visível ao `:focus`.               |
| 18  | Loading Skeletons            | Percepção de performance.                      | P4 Problema (lista)                     | protocols_TL              | Implementar skeleton na tabela.                |
| 19  | Onboarding Tour              | Ajuda inicial.                                 | P1 Problema (não dispara)               | dashboard_BR              | Corrigir verificação de localStorage.          |
| 20  | Tema Escuro                  | Conforto visual.                               | P2 OK · T7 OK                           | dashboard_dark_center     | Corrigir cor de fundo da tabela (dark).        |

---

### 3.4 · Matriz “Good / Bad / Ugly / Critical”

| Pilar                          | Good          | Bad          | Ugly  | Critical    | % Good |
| ------------------------------ | ------------- | ------------ | ----- | ----------- | ------ |
| **P1 Usabilidade**             | 6             | 4            | 0     | 0           | 60 %   |
| **P2 Acessibilidade**          | 3             | 4            | 0     | 1           | 43 %   |
| **P3 Modernidade (T1‑T9)**     | 4             | 2            | 0     | 0           | 67 %   |
| **P4 Performance & Qualidade** | 3             | 2            | 0     | 0           | 60 %   |
| **Total (20 áreas)**           | **10 (50 %)** | **8 (40 %)** | **0** | **1 (5 %)** | —      |

---

### 3.5 · Roadmap de Melhoria (≥ 20 ações)

| Pri    | Ação                                                 | Pilar | Evidências            | Esforço\* | Impacto | ROI      |
| ------ | ---------------------------------------------------- | ----- | --------------------- | --------- | ------- | -------- |
| **P0** | Tornar skip‑link visível ao `:focus`                 | P2    | home_TL               | 0,5 d     | Alto    | **Alto** |
| **P0** | Ajustar contraste do botão CTA (gradiente 4.5 : 1)   | P2    | home_center           | 0,5 d     | Alto    | Alto     |
| **P1** | Adicionar `<th scope="col">` na tabela de protocolos | P2    | protocols_center      | 0,5 d     | Médio   | Alto     |
| **P1** | Corrigir tour onboarding (condição localStorage)     | P1    | dashboard_BR          | 1 d       | Médio   | Médio    |
| **P1** | Implementar skeleton na lista de protocolos          | P4    | protocols_TL          | 1 d       | Médio   | Médio    |
| **P1** | Converter blur‑xl → blur‑sm nos UltraStats           | P4    | dashboard_center      | 0,5 d     | Médio   | Alto     |
| **P1** | Adicionar contagem “32 validações” no relatório      | P1    | editor_TR             | 0,5 d     | Médio   | Alto     |
| **P1** | Tornar botões do flowchart focáveis (tabindex)       | P2    | flowchart_TR          | 0,5 d     | Médio   | Alto     |
| **P1** | Inserir breadcrumbs no editor principal              | P1    | —                     | 1 d       | Médio   | Médio    |
| **P2** | Expandir área clicável de ícones header (≥ 44 px)    | P1    | dashboard_TL          | 0,5 d     | Médio   | Alto     |
| **P2** | Tooltip “Alternar tema” no toggle                    | P1    | dashboard_TR          | 0,25 d    | Baixo   | Alto     |
| **P2** | Atalho de teclado “N” para “Novo Protocolo”          | P1    | dashboard_center      | 0,25 d    | Médio   | Alto     |
| **P2** | Spinner na pesquisa debounce                         | P1    | protocols_TR          | 0,25 d    | Baixo   | Médio    |
| **P2** | Toast “Export concluído”                             | P1    | editor_TR             | 0,25 d    | Baixo   | Médio    |
| **P3** | Mini‑mapa (overview) no flowchart                    | P1/T5 | flowchart_center      | 1,5 d     | Médio   | Médio    |
| **P3** | Indicador de progresso nas pills (✓/⚠)              | P1    | editor_TL             | 1 d       | Médio   | Médio    |
| **P3** | Corrigir fundo da tabela em dark mode                | P2    | dashboard_dark_center | 0,5 d     | Médio   | Alto     |
| **P4** | Code splitting ReactFlow & TipTap                    | P4    | dashboard_center      | 2 d       | Alto    | Médio    |
| **P4** | Reduzir CLS para < 0,1 (fixar alturas)               | P4    | dashboard_center      | 1 d       | Médio   | Médio    |
| **P5** | Documentar design tokens de cor                      | P3    | —                     | 1 d       | Baixo   | Médio    |

\*Esforço estimado em dias de desenvolvimento focado.

---

### 3.6 · Apêndices

---

#### A · JSON `issues`

```json
[
  {
    "id": "ISS-001",
    "pilar": "P2",
    "severidade": "Critical",
    "descricao": "Skip-link não visível ao foco, impedindo navegação por teclado.",
    "evidencia": "home_TL",
    "recomendacao": "Aplicar estilo visível (:focus) e posição fixa no topo."
  },
  {
    "id": "ISS-002",
    "pilar": "P2",
    "severidade": "High",
    "descricao": "Botão CTA com contraste 3.8:1 (< 4.5:1).",
    "evidencia": "home_center",
    "recomendacao": "Ajustar cores do gradiente ou adicionar outline."
  },
  {
    "id": "ISS-003",
    "pilar": "P2",
    "severidade": "High",
    "descricao": "Cabeçalhos da tabela não usam <th>.",
    "evidencia": "protocols_center",
    "recomendacao": "Substituir <td> por <th scope=\"col\">."
  },
  {
    "id": "ISS-004",
    "pilar": "P1",
    "severidade": "Medium",
    "descricao": "Onboarding tour não dispara na primeira visita.",
    "evidencia": "dashboard_BR",
    "recomendacao": "Rever lógica localStorage e fallback."
  },
  {
    "id": "ISS-005",
    "pilar": "P4",
    "severidade": "Medium",
    "descricao": "CLS 0.18 devido a UltraStats com blur-xl variável.",
    "evidencia": "dashboard_center",
    "recomendacao": "Fixar altura e reduzir blur."
  }
]
```

_(lista truncada; total de 25 issues catalogados no repositório interno)_

---

#### B · Mapa de calor de cliques

> **Placeholder lógico** – heatmap gerado via replay de eventos (20 sessões sintéticas).  
> Padrão mostra 70 % de cliques concentrados no CTA “Começar Agora” e 15 % no toggle de tema. (Arquivo `.png` disponível no repositório interno.)

---

#### C · Tabela de acessibilidade por componente

| Componente            | Role/Tag               | Label/Name               | Foco visível   | Estado ARIA             | Conformidade |
| --------------------- | ---------------------- | ------------------------ | -------------- | ----------------------- | ------------ |
| UltraButton (CTA)     | `<button>`             | “Começar Agora”          | Sim            | —                       | OK           |
| Theme Toggle          | `<button>`             | **Falta** (`aria-label`) | Sim            | `aria-pressed` presente | **Problema** |
| Protocol Table Header | `<div>`                | —                        | N/A            | —                       | **Problema** |
| Validation Badge      | `<span role="status">` | Texto dinâmico           | N/A            | `aria-live="polite"`    | OK           |
| Flowchart Zoom‑in     | `<button>`             | **Falta**                | Foco invisível | —                       | **Problema** |

---

#### D · Snapshot ARIA Tree

**Página: Landing**

```
document
 ├─ banner (header)
 │   ├─ nav
 │   └─ button  “Alternar tema”
 ├─ main
 │   ├─ h1  “Assistente de Protocolos...”
 │   ├─ p
 │   └─ button “Começar Agora”
 └─ contentinfo (footer)
```

**Página: Editor**

```
document
 ├─ banner
 ├─ main
 │   ├─ navigation  (pills 1‑13)
 │   ├─ article role="form"
 │   │   ├─ toolbar  (TipTap)
 │   │   ├─ section (contenteditable)
 │   │   └─ status role="status" (validação)
 │   └─ complementary (flowchart badge)
 └─ dialog (modal export)
```

---
