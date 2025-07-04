# Melhorias na Detecção de Fluxogramas Médicos

## Resumo das Implementações

### 1. Nova Abordagem de Detecção Baseada em Elementos Gráficos

Implementei um sistema mais robusto de detecção de fluxogramas médicos que vai além da simples análise de proporção de página. A nova abordagem utiliza:

#### Detecção de Formas Geométricas (OpenCV)
- **Retângulos**: Caixas de processo e ações
- **Losangos**: Pontos de decisão (sim/não)
- **Círculos/Elipses**: Início/fim ou conectores
- **Linhas**: Conectores entre elementos
- **Setas**: Direção do fluxo

#### Sistema de Pontuação
O algoritmo atribui pontos baseado nos elementos detectados:
- 30 pontos: 3+ caixas de processo
- 25 pontos: 1+ losango de decisão
- 15 pontos: 1+ círculo/elipse
- 20 pontos: 5+ linhas conectoras
- 10 pontos: 2+ setas detectadas
- 10 pontos: 5+ elementos gráficos totais

**Threshold**: Páginas com pontuação ≥ 50/100 são classificadas como fluxogramas.

### 2. Funcionalidades Implementadas

#### Função `detect_flowchart_elements()`
```python
def detect_flowchart_elements(image_array):
    """
    Detecta elementos típicos de fluxogramas médicos em uma imagem
    
    Returns:
        dict: {
            'shapes': dict com contagem de cada tipo de forma,
            'score': pontuação total (0-100),
            'reasons': lista de razões para a classificação,
            'is_flowchart': boolean indicando se é fluxograma
        }
    """
```

#### Melhorias no Feedback
O script agora fornece informações detalhadas sobre a detecção:
```
Página 3: Fluxograma detectado (pontuação: 75/100)
  Elementos encontrados: 5 caixas de processo, 2 losangos de decisão, 12 linhas conectoras
```

#### Nova Opção de Linha de Comando
```bash
# Desabilitar detecção automática (usar apenas proporção)
python scripts/extract_pdf_images.py --no-auto-detect protocolo.pdf
```

### 3. Técnicas de Detecção Utilizadas

#### Processamento de Imagem
1. Conversão para escala de cinza
2. Threshold binário para separar elementos do fundo
3. Detecção de contornos externos
4. Filtragem por área mínima (500 pixels)

#### Classificação de Formas
- **Aproximação poligonal**: Reduz pontos do contorno
- **Contagem de vértices**: Classifica baseado no número de lados
- **Análise de proporção**: Diferencia retângulos de losangos
- **Detecção de rotação**: Identifica losangos inclinados

#### Detecção de Conectores
- **Transformada de Hough**: Detecta linhas retas
- **Análise de proximidade**: Identifica possíveis pontas de seta
- **Filtragem**: Remove linhas muito curtas

### 4. Vantagens da Nova Abordagem

1. **Maior Precisão**: Detecta fluxogramas independente da proporção da página
2. **Menos Falsos Positivos**: Páginas com tabelas grandes não são mais confundidas
3. **Feedback Informativo**: Usuário entende por que a página foi classificada
4. **Flexibilidade**: Pode ser desabilitada se necessário
5. **Fallback Inteligente**: Mantém detecção por proporção como backup

### 5. Dependências Adicionais

```bash
pip install opencv-python numpy
```

Nota: As dependências existentes (pdf2image, PIL) foram mantidas.

### 6. Exemplos de Uso

```bash
# Detecção automática habilitada (padrão)
python scripts/extract_pdf_images.py "DAK-XX - Protocolo/*.pdf"

# Forçar zoom em páginas específicas + detecção automática
python scripts/extract_pdf_images.py --zoom-pages 2,4,6 protocolo.pdf

# Desabilitar detecção automática (usar apenas proporção)
python scripts/extract_pdf_images.py --no-auto-detect protocolo.pdf

# Combinar opções
python scripts/extract_pdf_images.py --dpi 400 --no-auto-detect "*.pdf"
```

### 7. Limitações e Melhorias Futuras

#### Limitações Atuais
- OCR não implementado (análise textual básica)
- Detecção de setas pode ter falsos positivos
- Não diferencia tipos específicos de fluxogramas médicos

#### Melhorias Possíveis
1. Implementar OCR para análise de palavras-chave
2. Usar machine learning para classificação mais precisa
3. Detectar cores (vermelho=urgente, amarelo=atenção)
4. Identificar tipos específicos de protocolos
5. Exportar metadados sobre elementos detectados

### 8. Impacto no Fluxo de Trabalho

A nova detecção automática:
- **Reduz trabalho manual** de identificar páginas com fluxogramas
- **Melhora qualidade** das avaliações ao garantir zoom em diagramas complexos
- **Fornece insights** sobre a estrutura visual dos protocolos
- **Mantém compatibilidade** com o fluxo existente

## Conclusão

A implementação melhora significativamente a capacidade do sistema de identificar e processar fluxogramas médicos, usando técnicas de visão computacional para uma abordagem mais robusta e confiável que a simples análise de proporção de página.