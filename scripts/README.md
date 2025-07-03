# Scripts Reutilizáveis para Análise de Protocolos

Esta pasta contém scripts Python genéricos para análise e processamento de protocolos médicos.

## Scripts Disponíveis

### extract_pdf_images.py

Extrai todas as páginas de PDFs como imagens de alta resolução para análise visual.

**Instalação de dependências:**
```bash
pip install pdf2image pillow

# No macOS também é necessário:
brew install poppler

# No Ubuntu/Debian:
sudo apt-get install poppler-utils

# No Windows:
# Baixar de https://github.com/oschwartz10612/poppler-windows
```

**Uso básico:**
```bash
# Extrair um único PDF
python scripts/extract_pdf_images.py protocolo.pdf

# Extrair múltiplos PDFs
python scripts/extract_pdf_images.py arquivo1.pdf arquivo2.pdf

# Extrair todos os PDFs de uma pasta
python scripts/extract_pdf_images.py "DAK-10 - Delirium/*.pdf"

# Especificar resolução customizada (padrão: 300 DPI)
python scripts/extract_pdf_images.py --dpi 400 protocolo.pdf

# Especificar pasta de saída
python scripts/extract_pdf_images.py --output ./imagens protocolo.pdf
```

**Recursos:**
- Extração em alta resolução (300 DPI padrão)
- Detecção automática de fluxogramas (cria versão com zoom 2x)
- Organização automática em subpastas
- Suporte a wildcards para processar múltiplos arquivos

### analyze_pdf_tokens.py

*(A ser migrado)*

Analisa a contagem de tokens em PDFs para estimar custos de processamento com LLMs.

### analyze_flowcharts.py

*(A ser migrado)*

Processa e analisa fluxogramas extraídos de protocolos.

## Fluxo de Trabalho Recomendado

1. **Extrair imagens do protocolo:**
   ```bash
   cd /Users/robertocunha/Documents/protocolos
   python scripts/extract_pdf_images.py "DAK-XX - Nome/*.pdf"
   ```

2. **Analisar visualmente as imagens:**
   - Abrir pasta `DAK-XX - Nome/pdf_images/`
   - Identificar fluxogramas, tabelas, formulários
   - Anotar uso de cores e símbolos

3. **Aplicar metodologia de avaliação:**
   - Usar template em `/prompts/Avaliação de Protocolo/Avaliação de Protocolo v8.md`
   - Preencher as 9 dimensões de avaliação
   - Gerar relatório `Avaliacao-Protocolo-DAKXX.md`

## Convenções

- Todos os scripts aceitam argumentos de linha de comando
- Use `--help` para ver opções disponíveis
- Saída padrão é sempre em subpastas organizadas
- Scripts são independentes e reutilizáveis