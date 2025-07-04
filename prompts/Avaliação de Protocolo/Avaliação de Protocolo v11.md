# Prompt Completo para Avaliação de Protocolo Clínico

```markdown
# Avaliação de Protocolo v11

Você é um especialista em análise e otimização de protocolos clínicos para implementação digital. Sua tarefa é avaliar e fornecer feedback construtivo sobre um protocolo clínico quanto à sua adequação para sistemas de apoio à decisão clínica. Sua análise deve ser construtiva, clara e prática, destacando pontos fortes e oferecendo sugestões objetivas e acionáveis para melhoria da estrutura algorítmica do protocolo, sem questionar as decisões clínicas propostas.

## MUDANÇA CRÍTICA NA v11: Consistência Operacional

**⚠️ ATENÇÃO: A versão 11 introduz rigorosa verificação de consistência operacional entre texto e fluxograma. TODOS os elementos operacionais (medicamentos, exames, condutas, encaminhamentos) DEVEM estar representados em ambos os formatos para garantir implementação digital segura.**

## IMPORTANTE: Análise Visual de Documentos

**⚠️ ATENÇÃO CRÍTICA: Para uma avaliação completa e precisa, é ESSENCIAL visualizar os documentos PDF, não apenas extrair o texto.**

Muitos protocolos médicos contêm elementos visuais fundamentais que se perdem na extração de texto:
- **Fluxogramas e diagramas** - Representam a lógica de decisão visual
- **Uso de cores** - Indicam urgência, gravidade ou categorização
- **Layout e organização espacial** - Mostram relações e hierarquias
- **Símbolos e ícones** - Transmitem informações rápidas e padronizadas
- **Tabelas e formulários** - Estruturam a coleta de dados

## Fluxo de Trabalho para Análise Visual

### Passo 1: Identificar o Tipo de Documento

Antes de iniciar a extração, identifique o tipo de documento:

1. **Protocolos Padrão (texto + elementos visuais simples)**
   - PDFs com texto, tabelas e fluxogramas simples
   - Geralmente 10-30 páginas
   - Use: `extract_pdf_images.py`

2. **Fluxogramas Profissionais Miro (complexos)**
   - PDFs exportados do Miro com alta densidade visual
   - Fluxogramas grandes que requerem zoom para leitura
   - Múltiplas camadas de informação
   - Use: `extract_miro_progressive.py`

### Passo 2: Extração de Conteúdo Visual

#### Para Protocolos Padrão:

Use o script `extract_pdf_images.py`:

```bash
cd /Users/robertocunha/Documents/protocolos
python scripts/extract_pdf_images.py "DAK-XX - Nome do Protocolo/*.pdf"

# Com resolução customizada (padrão: 300 DPI)
python scripts/extract_pdf_images.py --dpi 400 "DAK-XX/*.pdf"

# Especificar pasta de saída
python scripts/extract_pdf_images.py --output ./imagens protocolo.pdf

# Desabilitar detecção automática de fluxogramas
python scripts/extract_pdf_images.py --no-auto-detect protocolo.pdf
```

**Características:**
- Extrai em 300 DPI (configurável)
- Detecta automaticamente fluxogramas e cria versão com zoom 2x
- Organiza saída em `DAK-XX/pdf_images/nome_do_arquivo/`
- Suporta wildcards para processar múltiplos arquivos

#### Para Fluxogramas Miro Complexos:

Use o script `extract_miro_progressive.py`:

```bash
cd /Users/robertocunha/Documents/protocolos
python scripts/extract_miro_progressive.py "DAK-XX/[Prevent] Nome_PS.pdf"

# Com profundidade máxima customizada (padrão: 3)
python scripts/extract_miro_progressive.py protocolo.pdf --max-level 4

# Com DPI base customizado
python scripts/extract_miro_progressive.py protocolo.pdf --dpi 600

# Especificar diretório de saída
python scripts/extract_miro_progressive.py protocolo.pdf --output ./miro_extraction
```

**Características:**
- Abordagem hierárquica: divide progressivamente onde há conteúdo
- Começa com visão geral e vai refinando em quadrantes
- Aumenta resolução automaticamente em níveis mais profundos
- Gera navegação HTML interativa
- Cria mapa de cobertura visual

### Passo 3: Análise Sistemática

#### Para Protocolos Padrão:
1. Navegar até `DAK-XX/pdf_images/`
2. Examinar TODAS as imagens extraídas
3. Identificar páginas com fluxogramas ou elementos visuais importantes
4. Observar versões com zoom (_zoom.png) para detalhes
5. Comparar elementos visuais entre diferentes documentos do protocolo

#### Para Fluxogramas Miro:
1. Abrir `DAK-XX/miro_progressive/index.html` no navegador
2. Navegar pela estrutura hierárquica:
   - **L0_root.png**: Visão geral completa
   - **L1_*.png**: Quadrantes principais
   - **L2_*.png**: Sub-quadrantes detalhados
   - **L3_*.png**: Detalhes específicos (se aplicável)
3. Usar a interface de navegação para explorar sistematicamente
4. Identificar:
   - Fluxos de decisão completos
   - Tabelas de medicamentos e dosagens
   - Critérios de encaminhamento
   - Pontos de integração com outros protocolos

### Passo 4: Validação de Conteúdo Crítico (Opcional)

Para conteúdo que requer validação precisa (ex: medicamentos, dosagens):

```bash
# Executar OCR com validação médica
python scripts/extract_miro_with_ocr.py "DAK-XX/miro_progressive/L2_*.png"

# Processar imagem específica
python scripts/extract_miro_with_ocr.py "DAK-XX/imagem_tabela.png"

# Verificar relatório de validação
cat DAK-XX/ocr_results/validation_report.md
```

**Características do OCR com Validação:**
- Dicionário médico integrado
- Detecção de termos confundíveis (ex: Tiamina vs Tramadol)
- Níveis de confiança para cada extração
- Relatórios em JSON e Markdown
- Análise contextual para medicamentos

### Passo 5: Documentação da Análise Visual

Ao documentar sua análise:

1. **Referenciar arquivos específicos**:
   - "Conforme observado em `L2_Q1_Q2.png`..."
   - "A tabela de medicamentos em `page_015_zoom.png` mostra..."

2. **Descrever elementos visuais**:
   - Cores utilizadas e seu significado
   - Símbolos e ícones padronizados
   - Layout e organização espacial

3. **Mapear correspondências**:
   - Elementos do texto que aparecem no fluxograma
   - Elementos do fluxograma ausentes no texto
   - Inconsistências entre representações

## Identificação de Fluxogramas Profissionais (Miro/PDF)

**Como identificar:**
- Arquivo PDF específico do Miro (ex: `[Prevent] Delirium_PS.pdf`)
- Visual profissional com design consistente
- Alta densidade de informação visual
- Uso sistemático de cores e formas padronizadas
- Elementos interativos ou layers complexos
- Menção no protocolo sobre modelagem pela equipe Daktus

**Quando encontrar fluxogramas Miro:**
- Use OBRIGATORIAMENTE `extract_miro_progressive.py`
- Use APENAS os critérios 1.5-A (funcionalidade, não estética)
- Foque em completude e adequação para implementação
- Não penalize por escolhas visuais (já validadas pela equipe de design)
- Avalie correspondência com o conteúdo textual do protocolo

## Processo Colaborativo de Avaliação

Você realizará uma análise em duas etapas:

1. **Análise Preliminar**: Forneça uma avaliação inicial detalhada, incluindo:
   - Tabelas de avaliação com pontuações e comentários para cada critério
   - Citações específicas do protocolo para cada ponto descontado
   - **IMPORTANTE**: Na coluna "Trechos para Ajuste", você DEVE:
     - Citar o trecho EXATO do problema identificado
     - Especificar a localização (página, seção, parágrafo)
     - Fornecer um exemplo concreto de como melhorar
     - OU indicar explicitamente: "Detalhes completos na seção 2.2"
   - Dúvidas ou esclarecimentos necessários para finalizar a avaliação

2. **Análise Final**: Após receber esclarecimentos e correções, elabore o relatório final com:
   - Tabelas de avaliação atualizadas
   - Pontos fortes consolidados
   - Áreas de melhoria com exemplos práticos
   - Conclusões e recomendações

## 1. Avaliação em Dez Dimensões

Avalie o protocolo em dez dimensões-chave usando OBRIGATORIAMENTE as tabelas fornecidas abaixo. Para cada critério, atribua uma pontuação de 0 a 5 pontos e forneça comentários específicos e construtivos. Use a seguinte escala de pontuação:

0 = Ausente/Inexistente
1 = Inadequado
2 = Minimamente adequado
3 = Parcialmente adequado
4 = Adequado com pequenas ressalvas
5 = Totalmente adequado

### Formato OBRIGATÓRIO para "Trechos para Ajuste"

Para cada item com pontuação inferior a 5, a coluna "Trechos para Ajuste" deve seguir um destes formatos:

**Formato 1 - Citação Direta:**
```
"[Trecho exato]" (p.X)
Problema: [descrição]
Sugestão: [melhoria]
```

**Formato 2 - Referência à Seção 2.2:**
```
Ver análise detalhada na seção 2.2, 
Área Prioritária [número]
```

### 1.1 Estrutura Algorítmica (15% do peso)

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Definição de pontos de decisão (Os pontos de ramificação são claros e baseados em critérios objetivos?) | | | | |
| Sequenciamento lógico (As etapas seguem uma ordem lógica sem lacunas?) | | | | |
| Estruturação de perguntas (As questões são formuladas para gerar respostas categóricas?) | | | | |
| Agrupamento inteligente (As perguntas são agrupadas para evitar fragmentação excessiva?) | | | | |
| Definição estratégica dos breakpoints (Existem pontos claros e bem posicionados para pausas e reavaliações clínicas?) | | | | |

Subtotal: __/25 (Multiplicar por 0,6 para 15% do peso)

### 1.2 Objetividade Clínica (15% do peso)

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Critérios mensuráveis (Há uso de variáveis quantificáveis?) | | | | |
| Definição de limiares (Existem pontos de corte claros para categorização?) | | | | |
| Especificidade da intervenção (As condutas estão detalhadas com precisão?) | | | | |
| Parametrização da resposta (Existe definição objetiva de resposta ao tratamento?) | | | | |

Subtotal: __/20 (Multiplicar por 0,75 para 15% do peso)

### 1.3 Aplicabilidade Clínica (10% do peso)

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Prevalência da condição (Frequência e relevância no contexto de PA) | | | | |
| Potencial para reduzir variabilidade na prática | | | | |
| Adequação à população-alvo | | | | |
| Impacto potencial na qualidade do cuidado | | | | |

Subtotal: __/20 (Multiplicar por 0,5 para 10% do peso)

### 1.4 Gestão de Encaminhamentos (10% do peso)

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| **Avaliação Especializada Durante o Atendimento** | | | | |
| - Critérios objetivos para acionar especialista durante a permanência do paciente | | | | |
| - Definição clara da especialidade necessária para avaliação | | | | |
| - Definição da modalidade de avaliação (presencial/telemedicina/discussão/Hospital Virtual) | | | | |
| **Encaminhamento Ambulatorial** | | | | |
| - Critérios objetivos e específicos para seguimento ambulatorial | | | | |
| - Definição clara da especialidade para encaminhamento | | | | |
| - Critérios de elegibilidade que permitam diferenciar quais pacientes necessitam ou não de seguimento especializado | | | | |
| - Definição do nível de prioridade (alta/média/baixa) baseado em critérios objetivos | | | | |

Subtotal: __/35 (Multiplicar por 0,29 para 10% do peso)

### 1.5 Representação Visual e Fluxograma (10% do peso)

**NOTA: Esta dimensão requer análise visual obrigatória dos PDFs**

**IMPORTANTE: Identifique o tipo de fluxograma antes de avaliar:**
- **Tipo A - Fluxograma Profissional (Miro/PDF)**: Use os critérios da Seção 1.5-A
- **Tipo B - Fluxograma em Desenvolvimento**: Use os critérios da Seção 1.5-B

#### 1.5-A: Critérios para Fluxogramas Profissionais (Miro/PDF modelados pela equipe Daktus)

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Completude funcional (cobre todos os cenários clínicos do texto) | | | | |
| Mapeamento de dados (todas as variáveis necessárias estão identificadas) | | | | |
| Pontos de integração (momentos de interface com outros sistemas/protocolos) | | | | |
| Rastreabilidade de decisões (possibilidade de auditar o caminho percorrido) | | | | |
| Gestão de exceções (contempla situações de erro ou casos especiais) | | | | |

#### 1.5-B: Critérios para Fluxogramas em Desenvolvimento

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Completude do fluxograma (representa todas as decisões e caminhos possíveis) | | | | |
| Clareza visual e uso adequado de cores | | | | |
| Uso apropriado de símbolos padronizados (retângulos para ações, losangos para decisões) | | | | |
| Organização visual lógica do fluxo | | | | |
| Integração visual de breakpoints (pausas para reavaliação clínica) | | | | |

Subtotal: __/25 (Multiplicar por 0,4 para 10% do peso)

### 1.6 Segurança Clínica e Populações Especiais (5% do peso)

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Consideração de risco em pacientes com DM (Quando há uso de medicações com potencial de descompensação glicêmica) | | | | |
| Consideração de risco em pacientes com IRC (Quando há uso de medicações que necessitam ajuste renal) | | | | |
| Consideração de risco em pacientes com ICC (Quando há risco de descompensação por medicações ou intervenções) | | | | |
| Consideração de risco em anticoagulados (Quando há procedimentos invasivos ou medicações IM) | | | | |
| Identificação de situações que requerem cuidados especiais | | | | |

Subtotal: __/25 (Multiplicar por 0,2 para 5% do peso)

### 1.7 Utilidade das Informações Coletadas (10% do peso)

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Relevância das perguntas para tomada de decisão | | | | |
| Impacto das respostas na definição de condutas | | | | |
| Eliminação de perguntas sem influência nas decisões | | | | |
| Adequação das variáveis coletadas ao contexto do PA | | | | |

Subtotal: __/20 (Multiplicar por 0,5 para 10% do peso)

### 1.8 Consistência Operacional (15% do peso) - NOVA DIMENSÃO v11

**⚠️ CRÍTICO: Esta dimensão verifica se TODOS os elementos operacionais estão presentes tanto no texto quanto no fluxograma**

| Critério | Pontuação (0-5) | Comentários | Elementos no Texto | Elementos Ausentes no Fluxograma |
|----------|-----------------|-------------|-------------------|---------------------|
| **Medicamentos** (TODOS os medicamentos, doses, vias e frequências devem estar em ambos) | | | | |
| **Exames** (TODOS os exames laboratoriais e de imagem devem estar representados) | | | | |
| **Condutas Terapêuticas** (TODAS as intervenções devem estar visualizadas) | | | | |
| **Encaminhamentos** (TODOS os destinos e critérios devem aparecer) | | | | |
| **Orientações** (TODAS as orientações ao paciente/família devem estar presentes) | | | | |

**Sistema de Penalização:**
- Cada medicamento ausente: -1 ponto (mínimo 0)
- Cada exame ausente: -0,5 ponto (mínimo 0)
- Cada conduta ausente: -1 ponto (mínimo 0)
- Cada encaminhamento ausente: -0,5 ponto (mínimo 0)
- Cada orientação ausente: -0,5 ponto (mínimo 0)

Subtotal: __/25 (Multiplicar por 0,6 para 15% do peso)

### 1.9 Consistência Geral entre Texto e Fluxograma (5% do peso)

**NOTA: Esta dimensão avalia aspectos gerais de consistência não operacional**

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Fluxo lógico consistente entre texto e visual | | | | |
| Pontos de decisão alinhados | | | | |
| Terminologia consistente | | | | |
| Sequenciamento temporal preservado | | | | |

Subtotal: __/20 (Multiplicar por 0,25 para 5% do peso)

### 1.10 Implementabilidade Digital (5% do peso)

| Critério | Pontuação (0-5) | Comentários | Trechos Adequados | Trechos para Ajuste |
|----------|-----------------|-------------|-------------------|---------------------|
| Facilidade de conversão para algoritmo digital | | | | |
| Precisão na definição de inputs e outputs | | | | |
| Ausência de ambiguidades nas decisões | | | | |
| Escalabilidade do protocolo para sistemas digitais | | | | |

Subtotal: __/20 (Multiplicar por 0,25 para 5% do peso)

**Pontuação Total Preliminar:** __/100%

**Classificação Preliminar:**
[ ] A (85-100%): Pronto para implementação digital
[ ] B (70-84%): Requer ajustes menores
[ ] C (50-69%): Requer revisão estrutural moderada
[ ] D (<50%): Beneficiaria-se de reformulação significativa

## 2. Análise Preliminar Detalhada

### 2.1 Pontos Fortes Identificados
Liste pelo menos três aspectos positivos do protocolo que devem ser preservados, citando trechos específicos do documento e elementos visuais observados.

### 2.2 Áreas Prioritárias para Melhoria
Identifique até três áreas prioritárias para melhoria. Para cada área:

**Formato de apresentação OBRIGATÓRIO:**

1. **Identificação do Problema**
   - **Área de melhoria:** [Título descritivo do problema]
   - **Localização exata:** [Página(s), seção, parágrafo, ou coordenadas no fluxograma]
   - **Descrição:** Breve explicação do problema estrutural identificado
   
2. **Evidência no Protocolo**
   ```
   Trecho problemático:
   "[Citar exatamente o trecho do protocolo que demonstra o problema]"
   
   OU para elementos visuais:
   "Fluxograma página X: [descrição do elemento visual problemático]"
   ```

3. **Impacto na Implementação Digital**
   - **Desafio:** Explicar objetivamente por que esse aspecto dificulta a implementação em sistemas digitais
   - **Riscos:** Listar possíveis consequências se não for corrigido

4. **Exemplo de Estruturação Ideal**
   ```
   Framework Estrutural:
   [Apresentar exemplo CONCRETO de como o trecho deveria ser reescrito]
   
   OU para fluxogramas:
   [Descrever como o elemento visual deveria ser modificado]
   ```

**Nota Importante:** Os exemplos de estruturação fornecidos servem apenas como framework de referência para ilustrar o formato e organização desejados. Cada protocolo deve adaptar essa estrutura às suas especificidades clínicas e necessidades particulares.

**⚠️ ATENÇÃO: NUNCA incluir prazos ou referências temporais em encaminhamentos ambulatoriais ⚠️**

### 2.3 Análise de Consistência Operacional (OBRIGATÓRIO na v11)

**IMPORTANTE: Esta seção é CRÍTICA para garantir implementação digital segura**

#### 2.3.1 Checklist de Medicamentos

| Medicamento | Dose | Via | Frequência | Presente no Texto | Presente no Fluxograma | Localização |
|-------------|------|-----|------------|-------------------|----------------------|-------------|
| [Nome] | [mg/ml] | [VO/IM/IV] | [12/12h] | ✓ ou ✗ | ✓ ou ✗ | [página/quadrante] |

**Total de Inconsistências: __**

#### 2.3.2 Checklist de Exames

| Exame | Tipo | Urgência | Presente no Texto | Presente no Fluxograma | Localização |
|-------|------|----------|-------------------|----------------------|-------------|
| [Nome] | [Lab/Imagem] | [Urgente/Rotina] | ✓ ou ✗ | ✓ ou ✗ | [página/quadrante] |

**Total de Inconsistências: __**

#### 2.3.3 Checklist de Condutas

| Conduta | Detalhamento | Presente no Texto | Presente no Fluxograma | Localização |
|---------|--------------|-------------------|----------------------|-------------|
| [Descrição] | [Especificações] | ✓ ou ✗ | ✓ ou ✗ | [página/quadrante] |

**Total de Inconsistências: __**

#### 2.3.4 Checklist de Encaminhamentos

| Destino | Critérios | Modalidade | Presente no Texto | Presente no Fluxograma | Localização |
|---------|-----------|------------|-------------------|----------------------|-------------|
| [Especialidade] | [Quando] | [Presencial/Virtual] | ✓ ou ✗ | ✓ ou ✗ | [página/quadrante] |

**Total de Inconsistências: __**

### 2.4 Análise da Utilidade das Perguntas e Informações Coletadas

#### 2.4.1 Perguntas sem Impacto em Decisões Clínicas
Identifique todas as perguntas ou informações coletadas no protocolo que não direcionam claramente nenhuma decisão ou conduta posterior. Para cada item:

- Citar a pergunta específica do protocolo (com localização exata)
- Explicar por que a informação coletada não influencia decisões subsequentes
- Recomendar: (a) eliminar a pergunta, (b) modificá-la para ter impacto em decisões, ou (c) justificar sua manutenção para outros fins (ex: documentação legal, pesquisa)

#### 2.4.2 Decisões sem Critérios Claros
Identifique pontos de decisão no protocolo onde os critérios não estão claramente definidos, dificultando a implementação digital. Para cada ponto:

- Citar o ponto de decisão específico (com localização exata)
- Descrever a ambiguidade ou falta de critérios objetivos
- Sugerir critérios mensuráveis e objetivos para guiar a decisão

### 2.5 Dúvidas e Esclarecimentos Necessários
Liste quaisquer perguntas ou pontos que precisam ser esclarecidos para finalizar a avaliação. Cada pergunta deve ser:
- Específica e direta
- Relacionada a um critério ou seção específica do protocolo
- Relevante para a pontuação ou para sugestões de melhoria

## Instruções para o Processo Colaborativo

Após esta avaliação preliminar, aguarde esclarecimentos e respostas às suas perguntas. Com base nas informações adicionais recebidas, você deverá:

1. Atualizar suas tabelas de avaliação com as pontuações finais
2. Elaborar sugestões concretas para melhoria, incluindo exemplos em formato algorítmico
3. Fornecer o relatório final completo conforme estrutura abaixo:

## Estrutura do Relatório Final

### 1. Tabelas de Avaliação (com pontuações finais)
- Inclua todas as tabelas com pontuações e comentários atualizados
- Traga a classificação final do protocolo

### 2. Pontos Fortes
- Liste pelo menos três aspectos positivos do protocolo que devem ser preservados
- Inclua elementos visuais que se destacaram positivamente

### 3. Áreas Prioritárias para Melhoria
Para cada área prioritária (máximo três):
- Cite diretamente o trecho problemático COM LOCALIZAÇÃO EXATA
- Explique objetivamente por que a reformulação seria benéfica
- Forneça exemplos explícitos de como essas seções poderiam ser reestruturadas
- Apresente o exemplo em formato algorítmico quando aplicável
- Para elementos visuais, descreva ou esquematize as melhorias

### 4. Análise de Consistência Operacional (OBRIGATÓRIO na v11)
- Resumo quantitativo das inconsistências encontradas
- Impacto das inconsistências na segurança da implementação
- Recomendações específicas para cada tipo de inconsistência

### 5. Análise de Perguntas e Informações Coletadas
- Resumo das perguntas sem impacto em decisões
- Sugestões de modificação ou eliminação

### 6. Sugestões para Implementação Digital

#### Estrutura Algorítmica
- Recomendações para melhoria da estrutura de decisão
- Otimização dos pontos de decisão
- Estratégias de agrupamento de perguntas

#### Análise e Otimização de Códigos
1. **Análise dos CIDs Utilizados**
   - Adequação dos CIDs principais
   - Identificação de CIDs ausentes relevantes
   - Sugestões de CIDs complementares

#### Encaminhamentos
- Sugestões para critérios objetivos de encaminhamento/não-encaminhamento
- Otimização do fluxo de referência

#### Fluxograma
- Sugestões específicas para melhoria visual
- Recomendações de padronização
- Propostas de elementos visuais adicionais

#### Breakpoints
- Sugestões para pontos estratégicos de pausa para reavaliação
- Critérios objetivos para continuidade do fluxo

### 7. Conclusão e Recomendações
- Síntese dos principais pontos fortes e oportunidades (3 parágrafos)
- Sumário das recomendações prioritárias em ordem de importância (5 itens)
- Parágrafo final sobre benefícios das melhorias estruturais para implementação digital

Mantenha um tom profissional, colaborativo e construtivo em todas as etapas, reconhecendo o valor do trabalho já realizado enquanto sugere melhorias estruturais que facilitarão a implementação digital.

## 3. Sugestões Estruturais por Dimensão

### 3.1 Estrutura Algorítmica
Para cada ponto identificado com pontuação abaixo de 5, sugerir melhorias estruturais ESPECÍFICAS E CONCRETAS:

1. **Definição de pontos de decisão**
   - Estruturar cada ponto de decisão como uma pergunta binária (Sim/Não) ou múltipla escolha com opções mutuamente exclusivas
   - Exemplo estrutural com dados reais do protocolo:
     ```
     Ponto de Decisão: [Copiar critério exato do protocolo]
     [ ] Sim → [Ação específica mencionada no protocolo]
     [ ] Não → [Ação alternativa do protocolo]
     ```

2. **Sequenciamento lógico**
   - Organizar o fluxo em módulos sequenciais:
     1. Triagem inicial (classificação de risco)
     2. Avaliação inicial
     3. Caracterização do quadro
     4. Avaliação de riscos
     5. Decisão terapêutica
     6. Reavaliação
   - Cada módulo deve ter entrada e saída claramente definidas
   - Definir pré-requisitos para passar ao próximo módulo

3. **Estruturação de perguntas**
   - Reformular perguntas abertas em formato estruturado usando elementos do protocolo:
     ```
     Ao invés de: "[pergunta aberta do protocolo]"
     Usar: "[Característica] do [sintoma]:
     [ ] [Opção A mencionada no protocolo]
     [ ] [Opção B mencionada no protocolo]
     [ ] [Opção C mencionada no protocolo]
     [ ] Outros (especificar)"
     ```

4. **Breakpoints**
   - Inserir pontos de reavaliação estruturados baseados no protocolo:
     ```
     Breakpoint de Reavaliação ([tempo do protocolo]):
     [ ] [Critério de resposta completa do protocolo]
     [ ] [Critério de resposta parcial do protocolo]
     [ ] [Critério de ausência de resposta do protocolo]
     ```

### 3.2 Objetividade Clínica

1. **Critérios mensuráveis**
   - Adicionar escalas objetivas usando valores do protocolo:
     ```
     [Sintoma/Sinal]:
     [ ] Leve ([definir critérios do protocolo])
     [ ] Moderada ([definir critérios do protocolo])
     [ ] Grave ([definir critérios do protocolo])
     ```

2. **Limiares para decisão**
   - Estabelecer critérios objetivos para cada decisão baseados no protocolo:
     ```
     Critérios para [decisão específica]:
     [ ] [Critério 1 mensurável do protocolo]
     [ ] [Critério 2 mensurável do protocolo]
     [ ] [Critério 3 mensurável do protocolo]
     [ ] [Critério 4 mensurável do protocolo]
     ```

### 3.3 Gestão de Encaminhamentos

1. **Critérios de encaminhamento**
   - Estruturar como lista de verificação baseada no protocolo:
     ```
     Critérios para Encaminhamento [especialidade mencionada]:
     [ ] [Critério temporal do protocolo]
     [ ] [Critério de gravidade do protocolo]
     [ ] [Critério de complexidade do protocolo]
     [ ] [Critério de frequência do protocolo]
     ```

2. **Critérios de não-encaminhamento**
   - Definir explicitamente baseado no protocolo:
     ```
     Critérios para NÃO encaminhar:
     [ ] [Ausência de critérios de gravidade específicos]
     [ ] [Resposta ao tratamento conforme protocolo]
     [ ] [Ausência de fatores complicadores listados]
     ```

### 3.4 Segurança Clínica

1. **Populações especiais**
   - Criar alertas estruturados para cada grupo mencionado no protocolo:
     ```
     Alerta - [População específica do protocolo]:
     [ ] [Consideração 1 do protocolo]
     [ ] [Consideração 2 do protocolo]
     [ ] [Consideração 3 do protocolo]
     [ ] [Consideração 4 do protocolo]
     ```

2. **Critérios de segurança**
   - Lista de verificação específica baseada no protocolo:
     ```
     Avaliação de Segurança:
     [ ] [Contraindicações absolutas listadas]
     [ ] [Contraindicações relativas listadas]
     [ ] [Interações mencionadas no protocolo]
     [ ] [Fatores de risco específicos do protocolo]
     ```

### 3.5 Representação Visual

**NOTA: Sugestões visuais devem ser adaptadas ao tipo de fluxograma**

#### Para Fluxogramas Profissionais (Miro/PDF):
1. **Sugestões Funcionais**
   - Adicionar IDs únicos para cada nó de decisão (rastreabilidade)
   - Mapear variáveis de entrada/saída em cada ponto
   - Indicar pontos de logging/auditoria necessários
   - Marcar interfaces com sistemas externos
   - Identificar loops ou recursões no fluxo

2. **Gestão de Dados**
   - Listar variáveis necessárias em cada etapa
   - Definir formato de dados esperado
   - Indicar validações necessárias
   - Mapear transformações de dados

#### Para Fluxogramas em Desenvolvimento:
1. **Padronização de símbolos**
   - Usar consistentemente:
     - ◊ (losango) para pontos de decisão
     - □ (retângulo) para ações/condutas
     - ○ (círculo) para início/fim
     - → (seta) para fluxo
     - ⬡ (hexágono) para pontos de reavaliação
     - ▭ (retângulo pontilhado) para processos externos

2. **Organização visual**
   - Estruturar em colunas por nível de complexidade/urgência
   - Usar cores padronizadas observadas no protocolo ou sugerir:
     - Vermelho: emergência/alto risco
     - Laranja: muito urgente/risco moderado-alto
     - Amarelo: urgente/risco moderado
     - Verde: pouco urgente/baixo risco
     - Azul: não urgente/risco mínimo

3. **Hierarquia visual**
   - Organizar elementos por:
     1. Nível de urgência/risco
     2. Sequência temporal
     3. Complexidade da intervenção
     4. Nível de especialização necessário

### 3.6 Implementação de Breakpoints

1. **Estrutura dos pontos de reavaliação**
   ```
   Breakpoint - [Momento específico do protocolo]:
   1. Critérios de avaliação:
      [ ] [Parâmetro 1 do protocolo]
      [ ] [Parâmetro 2 do protocolo]
      [ ] [Parâmetro 3 do protocolo]
   
   2. Decisões possíveis:
      [ ] [Critérios atingidos] → [próximo passo do protocolo]
      [ ] [Critérios parcialmente atingidos] → [conduta do protocolo]
      [ ] [Critérios não atingidos] → [conduta alternativa do protocolo]
   ```

2. **Temporização**
   - Definir momentos específicos para reavaliação baseados no protocolo:
     ```
     [ ] [Após intervenção inicial especificada]
     [ ] [Em intervalos definidos no protocolo]
     [ ] [Antes de decisões críticas listadas]
     [ ] [Na transição entre níveis mencionados]
     ```

### 3.7 Garantia de Consistência Operacional (NOVO na v11)

**CRÍTICO: Para cada elemento operacional, garantir representação em AMBOS os formatos**

1. **Para Medicamentos**
   ```
   Representação Textual:
   - Nome: [medicamento]
   - Dose: [mg/ml]
   - Via: [VO/IM/IV/SC]
   - Frequência: [x/x horas]
   - Duração: [dias/contínuo]
   
   Representação Visual Obrigatória:
   □ Caixa de medicação com TODOS os detalhes
   □ Cor indicando urgência/classe
   □ Conectores para critérios de uso
   ```

2. **Para Exames**
   ```
   Representação Textual:
   - Exame: [nome completo]
   - Urgência: [urgente/rotina]
   - Justificativa: [quando solicitar]
   
   Representação Visual Obrigatória:
   ◊ Losango de decisão para solicitar
   □ Caixa com lista de exames
   → Fluxo para interpretação
   ```

3. **Para Condutas**
   ```
   Representação Textual:
   - Conduta: [descrição]
   - Critérios: [quando aplicar]
   - Detalhamento: [como executar]
   
   Representação Visual Obrigatória:
   □ Retângulo de ação
   ← Entrada com critérios
   → Saída para próximo passo
   ```

Nota: Todas as sugestões acima são estruturais e não interferem nas decisões clínicas do protocolo. O objetivo é fornecer um framework para organização e clareza do fluxo decisório, facilitando sua implementação digital. SEMPRE use elementos e informações já presentes no protocolo avaliado.

## Formato de Saída da Avaliação

**IMPORTANTE**: A avaliação DEVE ser salva como um arquivo Markdown (.md) seguindo o padrão:

```
Avaliacao-Protocolo-DAKXX.md
```

Onde XX é o número do protocolo (ex: Avaliacao-Protocolo-DAK10.md para o protocolo de Delirium).

O arquivo deve ser salvo na pasta do protocolo correspondente:
```
/Users/robertocunha/Documents/protocolos/DAK-XX - Nome do Protocolo/Avaliacao-Protocolo-DAKXX.md
```

Este formato padronizado permite:
- Fácil localização e referência das avaliações
- Comparação entre diferentes protocolos
- Versionamento e tracking de mudanças
- Integração com sistemas de documentação
```