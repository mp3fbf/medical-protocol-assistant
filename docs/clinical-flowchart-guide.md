# Guia de Fluxogramas Clínicos

## Visão Geral

O sistema agora suporta geração de fluxogramas em dois formatos:

1. **Formato Padrão (Standard)**: Fluxograma simplificado com tipos básicos de nós
2. **Formato Clínico (Clinical)**: Fluxograma rico com questionários, condutas detalhadas e lógica condicional

## Formato Clínico

### Estrutura de Dados

O formato clínico oferece três tipos principais de nós:

#### 1. Nós Custom (Questionários)

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

#### 2. Nós Summary (Triagem/Resumo)

```typescript
{
  type: "summary",
  data: {
    label: "Classificação de Risco",
    descricao: "Paciente classificado como ALTA PRIORIDADE"
  }
}
```

#### 3. Nós Conduct (Condutas Médicas)

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

| Aspecto         | Formato Padrão  | Formato Clínico            |
| --------------- | --------------- | -------------------------- |
| Tipos de nós    | 6 tipos básicos | 3 tipos ricos              |
| Questionários   | Não suporta     | Múltiplas perguntas por nó |
| Medicamentos    | Lista simples   | Posologia completa em HTML |
| Condicionais    | Não suporta     | Expressões complexas       |
| Orientações     | Texto simples   | HTML formatado             |
| Tamanho do JSON | Menor           | Maior (3-5x)               |
| Complexidade IA | Baixa           | Alta                       |

## Limitações

- Conversão de clínico → padrão perde detalhes (questionários viram decisões simples)
- Conversão de padrão → clínico gera estruturas mínimas
- Formato clínico requer mais tokens da IA (usar modelo O3)
- Visualização atual converte para formato padrão (perda visual de detalhes)

## Roadmap Futuro

1. **Visualização nativa**: Componentes específicos para formato clínico
2. **Editor visual**: Criar/editar questionários e condutas visualmente
3. **Validação avançada**: Validar expressões condicionais
4. **Simulação**: Executar fluxograma com dados de teste
5. **Exportação BPMN**: Converter para padrão BPMN 2.0
