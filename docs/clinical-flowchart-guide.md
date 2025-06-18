# Guia de Fluxogramas Clínicos

## Visão Geral

O sistema suporta geração de fluxogramas em dois formatos:

1. **Formato Clínico (Clinical) - PADRÃO**: Fluxograma rico compatível com Daktus/Prevent Senior, com questionários, condutas detalhadas e lógica condicional
2. **Formato Padrão (Standard) - SECUNDÁRIO**: Fluxograma simplificado com tipos básicos de nós (pode ser descontinuado no futuro)

## Formato Clínico (PADRÃO)

### Estrutura de Dados

O formato clínico oferece três tipos principais de nós:

#### 1. Nós Custom (Coleta/Questionários)

**Terminologia**: No código usa-se "custom", mas o termo médico correto é "coleta" (nós de coleta de dados)

```typescript
{
  type: "custom",
  data: {
    label: "Avaliação Inicial",
    questions: [
      {
        titulo: "Paciente apresenta dor torácica?",
        select: "F", // F = Single choice
        options: [
          { label: "Sim", id: "opt1" },
          { label: "Não", id: "opt2" }
        ]
      }
    ]
  }
}
```

#### 2. Nós Summary (Resumo/Triagem)

**Terminologia**: "summary" no código = "resumo" em terminologia médica

```typescript
{
  type: "summary",
  data: {
    label: "Classificação de Risco",
    descricao: "Paciente classificado como ALTA PRIORIDADE"
  }
}
```

#### 3. Nós Conduct (Conduta Médica)

**Terminologia**: "conduct" no código = "conduta" em terminologia médica

```typescript
{
  type: "conduct",
  data: {
    label: "Tratamento Inicial",
    condutaDataNode: {
      medicamento: [
        {
          nome: "Ácido Acetilsalicílico",
          posologia: "<p>300mg VO dose única</p>",
          via: "VO"
        }
      ],
      exame: [
        {
          nome: "ECG 12 derivações",
          indicacao: "Avaliar isquemia miocárdica"
        }
      ],
      orientacao: [
        {
          conteudo: "<p>Manter paciente em repouso</p>"
        }
      ]
    }
  }
}
```

### Lógica Condicional

O formato clínico suporta condições complexas:

- **Condições de nó**: `condicao: "idade >= 65 && Q1 == 'sim'"`
- **Regras de edge**: `data.rule: "PAS < 90 || FC > 120"`

### Como Usar

#### 1. Gerar Fluxograma Clínico via API

```typescript
// Via tRPC
const result = await trpc.flowchart.generate.mutate({
  protocolId: "cuid123",
  condition: "Dor Torácica Aguda",
  content: protocolContent,
  options: {
    mode: "clinical", // ou format: "clinical"
    includeLayout: true,
  },
});

// Ou usar a rota específica
const clinicalResult = await trpc.flowchart.generateClinical.mutate({
  protocolId: "cuid123",
  condition: "Dor Torácica Aguda",
  content: protocolContent,
  includeLayout: true,
});
```

#### 2. Visualizar Fluxograma Clínico

```tsx
import { ClinicalFlowchartViewer } from "@/components/protocol/flowchart/clinical-flowchart-viewer";

function MyComponent() {
  const clinicalFlowchart = // ... fetch flowchart

  return (
    <ClinicalFlowchartViewer
      flowchart={clinicalFlowchart}
      editable={false}
      className="h-[600px]"
    />
  );
}
```

#### 3. Converter Entre Formatos

```typescript
import {
  clinicalToStandard,
  standardToClinical,
} from "@/lib/utils/flowchart-converter";

// Converter clínico para padrão (para visualização)
const standardFlowchart = clinicalToStandard(clinicalFlowchart);

// Converter padrão para clínico (conversão com perda de dados)
const clinicalFlowchart = standardToClinical(standardFlowchart);
```

### Quando Usar Formato Clínico

O formato clínico é recomendado quando o protocolo contém:

- Múltiplos questionários de avaliação
- Medicamentos com posologia detalhada
- Exames com indicações específicas
- Orientações complexas em HTML
- Lógica condicional baseada em respostas

### Exemplos de Condições

```javascript
// Condições simples
"idade >= 18";
"Q1 == 'sim'";
"SEMPRE"; // sempre visível

// Condições compostas
"idade >= 65 && Q1 == 'sim'";
"PAS < 90 || FC > 120";
"Q1 == 'sim' && (Q2 == 'grave' || Q3 == 'urgente')";

// Referências a questões
"Q1_2 == 'sim'"; // resposta 'sim' à questão Q1_2
"Q3_opcao1 == true"; // opção 1 da questão Q3 marcada
```

### Integração com Editor

O editor de protocolos pode gerar automaticamente fluxogramas clínicos quando detecta:

- Protocolos com diagnósticos complexos (>1000 caracteres)
- Múltiplos medicamentos (>3 menções)
- Procedimentos detalhados (>1500 caracteres)

### Exportação

Fluxogramas clínicos podem ser exportados com metadados:

```typescript
import { createFlowchartExport } from "@/lib/utils/flowchart-converter";

const exportData = createFlowchartExport(clinicalFlowchart, "clinical", {
  id: protocol.id,
  title: protocol.title,
});

// Salvar como JSON
const jsonString = JSON.stringify(exportData, null, 2);
```

## Diferenças Entre Formatos

| Aspecto         | Formato Clínico (PADRÃO)                | Formato Padrão (Secundário) |
| --------------- | --------------------------------------- | --------------------------- |
| Tipos de nós    | 3 tipos ricos (coleta, resumo, conduta) | 6 tipos básicos             |
| Questionários   | Múltiplas perguntas por nó              | Não suporta                 |
| Medicamentos    | Posologia completa em HTML              | Lista simples               |
| Condicionais    | Expressões complexas                    | Não suporta                 |
| Orientações     | HTML formatado                          | Texto simples               |
| Tamanho do JSON | Maior (mais detalhado)                  | Menor                       |
| Compatibilidade | Daktus/Prevent Senior                   | ReactFlow genérico          |

## Conversores Entre Formatos

O sistema possui conversores implementados em `/src/lib/utils/flowchart-converter.ts`, mas ainda não estão expostos na interface do usuário.

### Limitações das Conversões

- **Clínico → Padrão**: Perde detalhes (coleta vira decision, resumo vira triage, conduta vira action)
- **Padrão → Clínico**: Gera estruturas mínimas sem riqueza de conteúdo
- **Formato clínico é preferido**: Maior fidelidade às necessidades médicas
- **Visualização**: Atualmente usa componentes ReactFlow que entendem ambos os formatos

## Roadmap Futuro

1. **Interface de conversão**: Expor conversores na UI para import/export
2. **Visualização nativa aprimorada**: Componentes específicos para nós de coleta/resumo/conduta
3. **Editor visual avançado**: Criar/editar questionários e condutas com formulários dedicados
4. **Deprecação do formato padrão**: Migrar completamente para formato clínico
5. **Integração Daktus**: Exportação direta para sistema Prevent Senior
