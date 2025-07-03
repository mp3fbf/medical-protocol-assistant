# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral do Repositório

Este é um repositório de análise e avaliação de protocolos médicos hospitalares, focado em protocolos da rede Sancta Maggiore/Prevent Senior. O sistema avalia protocolos clínicos quanto à sua adequação para implementação digital em sistemas de apoio à decisão clínica.

## Comandos e Scripts Principais

### Scripts Centralizados em `/scripts/`

Todos os scripts reutilizáveis estão agora centralizados na pasta `scripts/` para facilitar manutenção e reutilização.

### Extração de Imagens de PDFs

```bash
# Extrair todos os PDFs de um protocolo
cd /Users/robertocunha/Documents/protocolos
python scripts/extract_pdf_images.py "DAK-XX - Nome do Protocolo/*.pdf"

# Extrair arquivos específicos
python scripts/extract_pdf_images.py arquivo1.pdf arquivo2.pdf

# Com resolução customizada (padrão: 300 DPI)
python scripts/extract_pdf_images.py --dpi 400 "DAK-XX/*.pdf"

# Especificar pasta de saída customizada
python scripts/extract_pdf_images.py --output ./imagens protocolo.pdf
```

**Características do script:**
- Aceita argumentos de linha de comando e wildcards
- Extrai em 300 DPI (configurável via --dpi)
- Detecta automaticamente fluxogramas e cria versão com zoom 2x
- Organiza saída em subpastas: `DAK-XX/pdf_images/nome_do_arquivo/`
- Não requer cópia do script - usar diretamente de `scripts/`

### Análise de Tokens

```bash
# Analisar contagem de tokens em PDFs para estimar custos de processamento
python scripts/analyze_pdf_tokens.py arquivo.pdf
```

### Análise de Fluxogramas

```bash
# Processar e analisar fluxogramas em protocolos
python scripts/analyze_flowcharts.py
```

## Arquitetura e Estrutura

### Organização de Protocolos

```
/protocolos/
├── DAK-XX - [Nome do Protocolo]/
│   ├── *.pdf                           # PDFs originais do protocolo
│   ├── Avaliacao-Protocolo-DAKXX.md   # Relatório de avaliação
│   ├── extract_pdf_*.py               # Scripts de extração
│   ├── pdf_images/                    # Imagens extraídas (pdf2image)
│   └── visual_analysis/               # Imagens extraídas (PyMuPDF)
```

### Sistema de Avaliação (9 Dimensões)

1. **Estrutura Algorítmica** (20%)
2. **Objetividade Clínica** (20%)
3. **Aplicabilidade Clínica** (10%)
4. **Gestão de Encaminhamentos** (15%)
5. **Representação Visual e Fluxograma** (10%)
6. **Segurança Clínica e Populações Especiais** (5%)
7. **Utilidade das Informações Coletadas** (10%)
8. **Consistência entre Texto e Fluxograma** (5%)
9. **Implementabilidade Digital** (5%)

### Metodologia de Avaliação

- **Documento Base**: `/prompts/Avaliação de Protocolo/Avaliação de Protocolo v8.md`
- **Pontuação**: 0-5 para cada critério
- **Classificação Final**:
  - A (85-100%): Pronto para implementação digital
  - B (70-84%): Requer ajustes menores
  - C (50-69%): Requer revisão estrutural moderada
  - D (<50%): Beneficiaria-se de reformulação significativa

## Fluxo de Trabalho para Avaliação

### 1. Extração de Imagens dos PDFs

```bash
# Usar script centralizado para extrair imagens
cd /Users/robertocunha/Documents/protocolos
python scripts/extract_pdf_images.py "DAK-XX - Nome do Protocolo/*.pdf"

# Ou especificar arquivos individualmente
python scripts/extract_pdf_images.py \
  "DAK-XX/arquivo1.pdf" \
  "DAK-XX/arquivo2.pdf"
```

### 2. Análise Visual

- Navegar até `DAK-XX/pdf_images/`
- Examinar TODAS as imagens extraídas, incluindo versões com zoom
- Identificar:
  - Fluxogramas e diagramas de decisão
  - Tabelas de critérios e medicamentos
  - Formulários de coleta de dados
  - Uso de cores para indicar urgência/gravidade
  - Símbolos e ícones padronizados

### 3. Aplicar Metodologia de Avaliação

Usar o template em `/prompts/Avaliação de Protocolo/Avaliação de Protocolo v8.md`:

1. Preencher as 9 tabelas de avaliação com pontuações (0-5)
2. Identificar pontos fortes (mínimo 3) com citações específicas
3. Identificar áreas prioritárias de melhoria (máximo 3) com exemplos
4. Analisar correspondência entre texto e elementos visuais
5. Documentar perguntas que não impactam decisões clínicas

### 4. Gerar Relatório Final

```bash
# Salvar avaliação no formato padrão
/Users/robertocunha/Documents/protocolos/DAK-XX - Nome/Avaliacao-Protocolo-DAKXX.md
```

**Exemplo**: Para o protocolo de Delirium (DAK-10), o arquivo seria:
```
/Users/robertocunha/Documents/protocolos/DAK-10 - Delirium/Avaliacao-Protocolo-DAK10.md
```

## Padrões e Convenções

### Nomenclatura de Arquivos

- Protocolos: `DAK-XX - Nome do Protocolo/`
- Avaliações: `Avaliacao-Protocolo-DAKXX.md`
- Scripts Python: `snake_case.py`
- Imagens extraídas: `NomeArquivo_page_XXX.png`

### Estrutura de Relatórios

1. **Tabelas de Avaliação** com pontuações
2. **Pontos Fortes** com citações específicas
3. **Áreas de Melhoria** com:
   - Identificação do problema
   - Evidência no protocolo
   - Impacto na implementação
   - Exemplo de estruturação ideal
4. **Análise de Correspondência**
5. **Dúvidas e Esclarecimentos**

## Informações Críticas

### Análise Visual Obrigatória

- **NUNCA** avaliar apenas com base em texto extraído
- Fluxogramas contêm lógica essencial não presente no texto
- Cores indicam urgência (vermelho=emergência, amarelo=urgente, verde=baixo risco)
- Formulários integrados mostram fluxo de coleta de dados

### Reutilização de Código

- **SEMPRE** usar scripts da pasta `/scripts/` - NÃO copiar para outras pastas
- Scripts aceitam argumentos de linha de comando - NÃO hardcode caminhos
- Use wildcards e argumentos ao invés de editar scripts

### Protocolos Já Avaliados

- **DAK-32 - Quedas**: 91,1% (Categoria A)
- **DAK-39 - Dor Torácica**: 88,175% (Categoria A)

## Dependências Python

```python
# Para extração de PDFs
pdf2image       # extract_pdf_images.py
PyMuPDF (fitz)  # extract_pdf_visuals.py
PIL (Pillow)    # manipulação de imagens
pdfplumber      # analyze_pdf_tokens.py
PyPDF2          # fallback para extração de texto
tiktoken        # contagem de tokens para LLMs
```

## Configuração de MCPs (Model Context Protocol) no Claude Code

### Importante: MCPs no Claude Code vs Cursor

- **No Cursor Desktop**: MCPs configurados em `.cursor/mcp.json` funcionam automaticamente
- **No Claude Code CLI**: MCPs devem ser configurados via `claude mcp add` para funcionarem

### Como Configurar MCPs no Claude Code

```bash
# Adicionar um MCP (exemplo: Playwright)
claude mcp add playwright "npx" "@playwright/mcp@latest" "--vision"

# Listar MCPs configurados
claude mcp list

# Remover um MCP
claude mcp remove playwright

# Ver detalhes de um MCP
claude mcp get playwright
```

### MCPs Úteis para Este Projeto

```bash
# Playwright MCP - para captura de screenshots e automação web
claude mcp add playwright "npx" "@playwright/mcp@latest" "--vision"

# GitHub MCP - para interagir com repositórios
claude mcp add github "npx" "@modelcontextprotocol/server-github" -e GITHUB_TOKEN=seu_token_aqui

# Markitdown MCP - para converter PDFs e outros formatos para Markdown
claude mcp add markitdown "/caminho/para/markitdown-env/bin/markitdown-mcp"
```

### Notas Importantes sobre MCPs

- Após adicionar MCPs via `claude mcp add`, é necessário **reiniciar o Claude Code** para que as ferramentas fiquem disponíveis
- MCPs configurados apenas no Cursor (`.cursor/mcp.json`) não são visíveis no Claude Code CLI
- As ferramentas MCP seguem o padrão de nomenclatura: `mcp__<servidor>__<ferramenta>`
- No Claude Code CLI, apenas as ferramentas `mcp__ide__getDiagnostics` e `mcp__ide__executeCode` estão disponíveis por padrão

## medical-protocol-assistant

Este repositório também contém um subprojeto completo de aplicação web:

### Stack Tecnológico
- Next.js 14 com TypeScript
- Prisma ORM + PostgreSQL (Supabase)
- tRPC para APIs type-safe
- Multi-provider AI (OpenAI, Anthropic, Gemini)
- ReactFlow para fluxogramas

### Comandos do Projeto Web

```bash
cd medical-protocol-assistant

# Desenvolvimento
pnpm dev
pnpm lint
pnpm format

# Database
pnpm prisma:migrate:dev
pnpm prisma:studio

# Testes
pnpm test
pnpm test:e2e
```

### Notas Importantes

- **MVP ~70% funcional** com 30% de dados mock
- Dashboard mostra dados falsos (sempre 156 protocolos)
- Sistema de pesquisa retorna artigos fake
- **QUALIDADE SOBRE VELOCIDADE**: Nunca economizar em tokens ou tempo se comprometer qualidade
- Protocolos devem ter obrigatoriamente 13 seções completas