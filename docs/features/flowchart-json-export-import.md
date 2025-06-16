# Exportação e Importação de Fluxogramas em JSON

Este documento descreve a funcionalidade de exportar e importar fluxogramas em formato JSON no sistema de protocolos médicos.

## Visão Geral

O sistema suporta exportação e importação de fluxogramas em dois formatos:

1. **Formato Clínico**: Estrutura rica com questionários, condutas médicas e condições
2. **Formato Padrão**: Estrutura simplificada compatível com ReactFlow

## Como Usar

### Exportar Fluxograma

#### No Editor de Fluxograma

1. Abra o editor de fluxograma de um protocolo
2. Clique no botão **"Exportar"** na toolbar
3. O arquivo JSON será baixado automaticamente

#### Na Página de Visualização

1. Navegue para a página de fluxograma do protocolo
2. Clique no botão **"Exportar"**
3. Selecione **"Exportar como JSON"** no menu dropdown
4. O arquivo JSON será baixado automaticamente

### Importar Fluxograma

1. No editor de fluxograma, clique no botão **"Importar"** na toolbar
2. Selecione um arquivo JSON válido
3. O fluxograma será carregado e aplicado layout automaticamente

## Formato do JSON

### Estrutura com Metadados

```json
{
  "metadata": {
    "version": "1.0",
    "format": "clinical",
    "exportDate": "2025-01-16T10:00:00Z",
    "protocolId": "uuid-do-protocolo",
    "protocolTitle": "Nome do Protocolo"
  },
  "flowchart": {
    "nodes": [...],
    "edges": [...]
  }
}
```

### Formato Clínico (Completo)

O formato clínico suporta estruturas complexas incluindo:

#### Tipos de Nós

- **custom**: Nós com questionários
- **summary**: Nós de resumo
- **conduct**: Nós de conduta médica

#### Estrutura de Questionário

```json
{
  "id": "node-123",
  "type": "custom",
  "position": { "x": 100, "y": 100 },
  "data": {
    "label": "História Clínica",
    "condicao": "SEMPRE",
    "descricao": "",
    "condicional": "visivel",
    "questions": [
      {
        "id": "Q1",
        "uid": "P1",
        "titulo": "Queixa Principal",
        "select": "E", // E=Múltipla escolha, F=Escolha única, B=Texto
        "options": [
          {
            "id": "",
            "label": "Dor no peito",
            "preselected": false,
            "exclusive": false
          }
        ]
      }
    ]
  }
}
```

#### Estrutura de Conduta

```json
{
  "id": "conduct-123",
  "type": "conduct",
  "data": {
    "label": "Conduta",
    "conduta": "conclusao",
    "condutaDataNode": {
      "orientacao": [...],
      "exame": [...],
      "medicamento": [...],
      "encaminhamento": [...],
      "mensagem": [...]
    }
  }
}
```

## Conversão entre Formatos

O sistema automaticamente converte entre os formatos:

- **Importação**: Detecta o formato e converte para o formato interno
- **Exportação**: Sempre exporta no formato clínico completo
- **Visualização**: Converte formato clínico para formato padrão do ReactFlow

## Compatibilidade

O sistema é compatível com:

- JSONs exportados do sistema anterior (formato clínico)
- JSONs do formato padrão ReactFlow
- JSONs com ou sem wrapper de metadados

## Casos de Uso

1. **Backup de Fluxogramas**: Exporte para manter cópias de segurança
2. **Compartilhamento**: Compartilhe fluxogramas entre protocolos
3. **Templates**: Crie templates reutilizáveis
4. **Migração**: Importe fluxogramas de outros sistemas

## Observações Técnicas

- O layout é aplicado automaticamente após importação usando Dagre
- Conversões entre formatos podem perder informações específicas
- Validação básica é feita na importação para garantir estrutura válida
- Arquivos muito grandes podem demorar para processar
- **Arquivos com ponto e vírgula**: O sistema remove automaticamente `;` no final do arquivo JSON
- **Aspas escapadas**: O sistema suporta strings com aspas escapadas (`\"`) dentro do conteúdo HTML

## Visualização de Nós Clínicos

O sistema agora suporta visualização completa de nós clínicos com toda sua complexidade:

### Tipos de Nós Suportados

1. **Question Node (`custom`)**: Exibe questionários com múltipla escolha, escolha única ou entrada de texto
2. **Summary Node (`summary`)**: Mostra resumos de atendimento com formatação HTML
3. **Conduct Node (`conduct`)**: Apresenta condutas médicas organizadas em seções expansíveis:
   - Orientações
   - Exames
   - Medicamentos
   - Encaminhamentos
   - Mensagens

### Recursos Visuais

- **Questionários Interativos**: Checkboxes e radio buttons para visualizar opções
- **Seções Expansíveis**: Clique para expandir/colapsar conteúdo em nós de conduta
- **Indicadores Visuais**: Badges com contagem de itens em cada seção
- **Formatação Rica**: Suporte completo para HTML nas descrições
- **Condições Destacadas**: Exibição clara de condições para cada nó
