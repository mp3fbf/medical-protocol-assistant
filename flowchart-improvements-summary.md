# Correção de Geração de Fluxogramas com Decision Nodes

## Problema Identificado

Decision nodes não estavam conectando corretamente devido à falta de `sourceHandle` nas edges geradas pela IA.

## Soluções Implementadas

### 1. **Prompt de IA Aprimorado** (`src/lib/ai/prompts/flowchart.ts`)

- Adicionado ênfase **CRITICAL** e **WARNING** sobre a necessidade de incluir `sourceHandle` em edges de decision nodes
- Incluídos exemplos de edges corretas e incorretas para maior clareza
- Reforçado que omitir `sourceHandle` causará falha no funcionamento do fluxograma

### 2. **Validação e Correção Automática** (`src/lib/flowchart/smart-generator.ts` e `generator.ts`)

- Adicionada verificação pós-geração para detectar edges de decision nodes sem `sourceHandle`
- Implementada correção automática que adiciona `sourceHandle: 'yes'` como fallback
- Logs de aviso quando correções são aplicadas para facilitar debugging

### 3. **Schema de Validação** (`src/lib/validators/flowchart.ts`)

- O schema já estava correto, incluindo `sourceHandle` e `targetHandle` como campos opcionais

## Estrutura Esperada

### Decision Node:

```json
{
  "id": "decision-1",
  "type": "decision",
  "data": {
    "type": "decision",
    "title": "Paciente estável?",
    "criteria": "Verificar sinais vitais",
    "outputs": [
      { "id": "yes", "label": "Sim", "position": "bottom-left" },
      { "id": "no", "label": "Não", "position": "bottom-right" }
    ]
  }
}
```

### Edges de Decision Node (CORRETO):

```json
{
  "id": "edge-2",
  "source": "decision-1",
  "target": "action-1",
  "sourceHandle": "yes", // CRÍTICO: Este campo é obrigatório
  "label": "Sim"
}
```

## Impacto

- Fluxogramas agora serão gerados com conexões corretas de decision nodes
- Fallback automático garante que mesmo se a IA falhar, o fluxograma ainda funcionará
- Logs de aviso ajudam a identificar quando a IA não está seguindo as instruções corretamente

## Próximos Passos

1. Monitorar logs para verificar se a IA está gerando `sourceHandle` corretamente
2. Se necessário, ajustar ainda mais o prompt ou considerar fine-tuning do modelo
3. Testar com diferentes tipos de protocolos médicos para garantir robustez
