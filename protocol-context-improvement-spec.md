# Especificação de Melhorias: Contextualização de Protocolos Médicos

## 1. Análise do Problema Atual

### 1.1 Caso de Estudo: Protocolo de Constipação V2

O protocolo "Constipação Intestinal" gerado em 18/06/2025 demonstra claramente a inadequação do sistema atual para contextos específicos:

**Dados de Criação:**
- Título: "Constipação Intestinal"
- Condição Médica: "Constipação Intestinal"
- População Alvo: "Adultos e Idosos no Pronto Atendimento"
- Modo: Geração automática com todas as fontes de pesquisa

**Problemas Identificados:**

1. **Abordagem Ambulatorial em Contexto de PA**
   - Protocolo menciona "4 semanas de medidas conservadoras" antes de medicação
   - Follow-up programado para "4-6 semanas"
   - Algoritmo escalonado com meses de tratamento
   - PA precisa decisões em minutos/horas, não semanas/meses

2. **Ausência de Triagem de Risco Imediato**
   - Não há algoritmo claro de "red flags" no início
   - Sinais de alarme dispersos ao longo do texto
   - Não prioriza identificação de risco iminente de morte ou dano permanente
   - Seção 5 mistura avaliação inicial com anamnese detalhada inadequada para PA

3. **Critérios de Alta/Internação Complexos**
   - Seção 9 é extensa e não oferece decisão "fast-track"
   - Não há checklist binário claro: "seguro liberar" vs "internar/observar"
   - Menciona "teleconsulta em 14 dias" - totalmente inadequado para PA
   - Falta foco em alta segura precoce

4. **Condutas Não Acionáveis no PA**
   - Menciona exames complexos: "manometria anorretal", "cintilografia de trânsito colônico"
   - Medicamentos especializados: prucaloprida, linaclotida, lubiprostona
   - PA precisa condutas imediatas: enema, supositório, PEG, bisacodil

### 1.2 Causa Raiz do Problema

O campo "População Alvo" está sendo tratado como instrução secundária:

```typescript
// Implementação atual - INADEQUADA
specificInstructions: generationParams.targetPopulation
  ? `População alvo: ${generationParams.targetPopulation}`
  : undefined,
```

Isso resulta em:
- IA trata como sugestão, não como contexto fundamental
- Estrutura do protocolo permanece genérica/ambulatorial
- Conteúdo não reflete urgência e limitações do PA

## 2. Princípios Fundamentais do Pronto Atendimento

### 2.1 Objetivos Primários
1. **Identificar risco iminente** de morte ou dano permanente
2. **Decidir rapidamente** entre alta segura vs internação/observação
3. **Minimizar tempo de permanência** na unidade

### 2.2 Hierarquia de Preferência de Tratamento
```
Medicação em casa > Medicação VO > Medicação IM/SC > Medicação IV bolus > Medicação IV lenta
```

### 2.3 Princípios Operacionais
- **Exames**: Apenas os disponíveis imediatamente (lab básico, RX, ECG)
- **Medicamentos**: Somente os padronizados no DEF e disponíveis no PA
- **Decisões**: Binárias e objetivas (sim/não)
- **Tempo**: Triagem < 2 min, avaliação < 10 min, decisão < 30 min

### 2.4 Foco em Alta Segura Precoce
- Sempre que possível e seguro, liberar o paciente
- Exames complexos podem ser agendados ambulatorialmente
- Tratamento definitivo pode ser continuado em casa
- Internação apenas quando absolutamente necessário

## 3. Solução Proposta: Sistema de Contextos

### 3.1 Conceito Central

Substituir o campo texto livre "População Alvo" por um sistema estruturado de **Contextos de Atendimento** que fundamentalmente altera como o protocolo é gerado.

### 3.2 Contextos Definidos

```typescript
enum ProtocolContext {
  EMERGENCY_ROOM = "emergency_room",        // Pronto Atendimento
  AMBULATORY = "ambulatory",               // Ambulatório
  ICU = "icu",                            // UTI
  WARD = "ward",                          // Enfermaria  
  TELEMEDICINE = "telemedicine",          // Telemedicina
  TRANSPORT = "transport",                // Remoção/Transporte
  HOME_CARE = "home_care",                // Atenção Domiciliar
  SURGICAL_CENTER = "surgical_center"      // Centro Cirúrgico
}
```

### 3.3 Características por Contexto

#### EMERGENCY_ROOM (Pronto Atendimento)
- **Tempo**: Decisões em minutos
- **Foco**: Triagem de risco, estabilização, decisão alta/internação
- **Recursos**: Medicamentos DEF, exames básicos
- **Output**: Protocolo "fast-track" com checklists binários

#### AMBULATORY (Ambulatório)
- **Tempo**: Acompanhamento em semanas/meses
- **Foco**: Diagnóstico detalhado, tratamento continuado
- **Recursos**: Exames especializados, medicamentos de alto custo
- **Output**: Protocolo completo com seguimento

#### ICU (UTI)
- **Tempo**: Monitorização contínua
- **Foco**: Suporte vital, prevenção de complicações
- **Recursos**: Todos disponíveis, foco em drogas vasoativas
- **Output**: Protocolo de cuidados intensivos

## 4. Implementação Técnica

### 4.1 Alterações no Modelo de Dados

```prisma
// prisma/schema.prisma
model Protocol {
  id                String          @id @default(cuid())
  title             String
  condition         String
  context           ProtocolContext // NOVO - substitui targetPopulation conceitual
  targetPopulation  String?         // Mantido para detalhes adicionais
  // ... resto dos campos
}

enum ProtocolContext {
  EMERGENCY_ROOM
  AMBULATORY
  ICU
  WARD
  TELEMEDICINE
  TRANSPORT
  HOME_CARE
  SURGICAL_CENTER
}
```

### 4.2 Novo Sistema de Prompts

```typescript
// src/lib/ai/prompts/context-specific-prompts.ts

export const CONTEXT_SYSTEM_PROMPTS = {
  [ProtocolContext.EMERGENCY_ROOM]: `
    Você é um especialista em protocolos de PRONTO ATENDIMENTO.
    
    PRIORIDADES ABSOLUTAS:
    1. Identificar risco iminente de morte ou dano permanente em < 2 minutos
    2. Decisão binária rápida: Alta segura vs Internação/Observação
    3. Minimizar tempo de permanência - preferir tratamento domiciliar
    
    ESTRUTURA OBRIGATÓRIA:
    - Triagem de risco (red flags) PRIMEIRO
    - Apenas exames disponíveis no PA (lab básico, RX, ECG, USG point-of-care)
    - Apenas medicamentos do DEF padronizados no PA
    - Hierarquia: medicação casa > VO > IM/SC > IV bolus > IV lento
    - Algoritmo de decisão RÁPIDO (máximo 5 passos)
    
    PROIBIDO:
    - Follow-up ambulatorial em semanas
    - Exames complexos (colonoscopia, manometria, cintilografia)
    - Medicamentos não padronizados (prucaloprida, linaclotida)
    - Internações desnecessárias
    - Tratamentos de longo prazo
  `,
  
  [ProtocolContext.AMBULATORY]: `
    Você é um especialista em protocolos AMBULATORIAIS.
    
    FOCO:
    - Diagnóstico detalhado e tratamento continuado
    - Acompanhamento de longo prazo
    - Prevenção de complicações
    - Educação do paciente
    
    PERMITIDO:
    - Exames especializados com agendamento
    - Medicamentos de alto custo com justificativa
    - Protocolos escalonados de semanas/meses
    - Encaminhamentos para especialistas
  `,
  
  // ... outros contextos
};
```

### 4.3 Instruções Específicas por Seção e Contexto

```typescript
// src/lib/ai/prompts/section-context-instructions.ts

export const getSectionContextInstructions = (
  context: ProtocolContext, 
  sectionNumber: number
): string | null => {
  
  if (context === ProtocolContext.EMERGENCY_ROOM) {
    switch(sectionNumber) {
      case 1: // Identificação do Protocolo
        return `
          Para PA, incluir:
          - Tempo médio de aplicação: < 30 minutos
          - Recursos necessários: apenas os disponíveis 24/7 no PA
          - Objetivo: decisão rápida e segura de destino do paciente
        `;
        
      case 5: // Avaliação Inicial
        return `
          Para PA, estruturar como:
          1. RED FLAGS (< 2 min) - sinais de risco iminente
          2. YELLOW FLAGS (< 5 min) - sinais de alerta
          3. Avaliação focada (< 10 min) - apenas o essencial
          NÃO incluir anamnese detalhada ou revisão de sistemas completa
        `;
        
      case 7: // Tratamento
        return `
          Para PA, organizar em:
          1. CONDUTAS IMEDIATAS (aplicar agora no PA):
             - Medicações IV/IM/VO disponíveis
             - Procedimentos simples (enema, cateter)
          2. PRESCRIÇÃO DE ALTA (para casa):
             - Medicações VO simples
             - Orientações claras
          3. O QUE NÃO FAZER NO PA:
             - Listar explicitamente medicamentos/exames inadequados
        `;
        
      case 9: // Critérios de Internação e Alta
        return `
          Para PA, criar DOIS CHECKLISTS BINÁRIOS:
          
          ALTA SEGURA (TODOS devem estar presentes):
          □ Critério objetivo 1
          □ Critério objetivo 2
          □ Critério objetivo 3
          
          INTERNAR/OBSERVAR (QUALQUER um presente):
          □ Red flag 1
          □ Red flag 2
          □ Falha de tratamento inicial
          
          Formato checklist, NÃO texto corrido
        `;
        
      // ... outras seções
    }
  }
  
  // ... outros contextos
  
  return null; // usa instrução padrão da seção
};
```

### 4.4 Interface de Usuário Melhorada

```tsx
// src/components/protocol/forms/create-protocol-form-ultra.tsx

interface ContextOption {
  value: ProtocolContext;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  preview: string[];
}

const CONTEXT_OPTIONS: ContextOption[] = [
  {
    value: ProtocolContext.EMERGENCY_ROOM,
    label: "Pronto Atendimento",
    description: "Decisões rápidas, foco em triagem e alta segura",
    icon: Siren,
    color: "red",
    preview: [
      "✓ Triagem de risco em < 2 minutos",
      "✓ Apenas medicamentos do PA",
      "✓ Decisão binária: alta vs internação",
      "✓ Foco em diminuir permanência"
    ]
  },
  {
    value: ProtocolContext.AMBULATORY,
    label: "Ambulatório",
    description: "Acompanhamento detalhado e tratamento continuado",
    icon: Calendar,
    color: "blue",
    preview: [
      "✓ Avaliação completa e detalhada",
      "✓ Exames especializados",
      "✓ Tratamento escalonado",
      "✓ Follow-up programado"
    ]
  },
  // ... outros contextos
];

// Componente de seleção
<div className="space-y-4">
  <label className="text-sm font-medium">
    Contexto de Atendimento <span className="text-red-500">*</span>
  </label>
  
  <RadioGroup value={context} onValueChange={setContext}>
    {CONTEXT_OPTIONS.map((option) => (
      <div 
        key={option.value}
        className="border rounded-lg p-4 cursor-pointer hover:border-primary"
      >
        <RadioGroupItem value={option.value} />
        <div className="ml-8">
          <div className="flex items-center gap-2">
            <option.icon className="h-5 w-5" />
            <span className="font-semibold">{option.label}</span>
            <Badge color={option.color}>
              {option.value.split('_').map(w => w[0]).join('')}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {option.description}
          </p>
          {selectedContext === option.value && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-xs font-medium mb-2">
                Este protocolo será gerado com:
              </p>
              <ul className="text-xs space-y-1">
                {option.preview.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    ))}
  </RadioGroup>
  
  {/* Campo adicional opcional para detalhes da população */}
  <div>
    <label className="text-sm font-medium">
      Detalhes da População <span className="text-gray-400">(Opcional)</span>
    </label>
    <input
      type="text"
      placeholder="Ex: Pacientes com comorbidades, gestantes, etc."
      value={populationDetails}
      onChange={(e) => setPopulationDetails(e.target.value)}
      className="mt-1 w-full rounded-md border"
    />
  </div>
</div>
```

### 4.5 Fluxo de Geração Modificado

```typescript
// src/lib/ai/generator.ts

export async function generateFullProtocolAI(
  input: AIFullProtocolGenerationInput & { context: ProtocolContext },
  options?: GenerationOptions
): Promise<AIFullProtocolGenerationOutput> {
  
  const { medicalCondition, researchData, context, specificInstructions } = input;
  
  // Selecionar system prompt baseado no contexto
  const systemPrompt = CONTEXT_SYSTEM_PROMPTS[context] || PROTOCOL_GENERATION_SYSTEM_PROMPT;
  
  // Criar user prompt com instruções específicas por seção
  const userPrompt = createContextAwareUserPrompt(
    medicalCondition,
    researchData,
    context,
    SECTION_DEFINITIONS,
    specificInstructions
  );
  
  // ... resto da geração
}

function createContextAwareUserPrompt(
  medicalCondition: string,
  researchData: AIResearchData,
  context: ProtocolContext,
  sectionDefinitions: StandardSectionDefinition[],
  additionalInstructions?: string
): string {
  
  const sectionInstructions = sectionDefinitions.map(sd => {
    const baseInstruction = `
      Seção ${sd.sectionNumber} - ${sd.titlePT}:
      Descrição: ${sd.description}
      Estrutura Esperada: ${sd.contentSchemaDescription}
    `;
    
    // Adicionar instruções específicas do contexto
    const contextInstruction = getSectionContextInstructions(context, sd.sectionNumber);
    
    return contextInstruction 
      ? `${baseInstruction}\n\nPARA O CONTEXTO ${context}:\n${contextInstruction}`
      : baseInstruction;
  }).join('\n---\n');
  
  return `
    Condição Médica: ${medicalCondition}
    Contexto de Atendimento: ${context}
    ${additionalInstructions ? `\nInstruções Adicionais: ${additionalInstructions}` : ''}
    
    IMPORTANTE: Este protocolo é para ${getContextDescription(context)}.
    Siga RIGOROSAMENTE as instruções específicas do contexto.
    
    Research Findings Summary:
    ${formatResearchSummary(researchData)}
    
    Instruções por Seção:
    ---
    ${sectionInstructions}
    ---
    
    Gere o protocolo completo com as 13 seções, adaptando o CONTEÚDO ao contexto especificado.
  `;
}
```

### 4.6 Validação Contextual

```typescript
// src/lib/validators/context-validators.ts

export function validateEmergencyRoomProtocol(
  content: ProtocolFullContent
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validar Seção 5 - Avaliação Inicial
  if (content[5]) {
    const section5 = content[5].content;
    if (typeof section5 === 'string') {
      // Deve começar com red flags
      if (!section5.toLowerCase().includes('red flag') || 
          section5.indexOf('red flag') > 200) {
        errors.push({
          section: 5,
          error: 'Avaliação inicial deve começar com red flags'
        });
      }
      
      // Não deve ter anamnese detalhada
      if (section5.includes('história detalhada') || 
          section5.includes('revisão de sistemas')) {
        errors.push({
          section: 5,
          error: 'PA não deve incluir anamnese detalhada'
        });
      }
    }
  }
  
  // Validar Seção 7 - Tratamento
  if (content[7]) {
    const section7 = content[7].content;
    if (typeof section7 === 'string') {
      // Verificar medicamentos proibidos no PA
      const forbiddenMeds = ['prucaloprida', 'linaclotida', 'lubiprostona'];
      forbiddenMeds.forEach(med => {
        if (section7.toLowerCase().includes(med)) {
          errors.push({
            section: 7,
            error: `Medicamento ${med} não disponível no PA`
          });
        }
      });
      
      // Deve ter condutas imediatas
      if (!section7.includes('imediata') && !section7.includes('agora')) {
        errors.push({
          section: 7,
          error: 'Tratamento PA deve especificar condutas imediatas'
        });
      }
    }
  }
  
  // Validar Seção 9 - Critérios de Alta/Internação
  if (content[9]) {
    const section9 = content[9].content;
    if (typeof section9 === 'string') {
      // Deve ter formato checklist
      if (!section9.includes('□') && !section9.includes('[ ]')) {
        errors.push({
          section: 9,
          error: 'Critérios devem estar em formato checklist'
        });
      }
      
      // Não deve mencionar follow-up distante
      if (section9.includes('semanas') || section9.includes('meses')) {
        errors.push({
          section: 9,
          error: 'PA não deve agendar follow-up em semanas/meses'
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validadores para outros contextos...
```

## 5. Exemplos Práticos de Transformação

### 5.1 Seção 5 - Avaliação Inicial

**ANTES (Genérico/Ambulatorial):**
```
5. Avaliação Inicial na Atenção Primária
5.1 Objetivos
• Confirmar CF/CIC
• Identificar sinais de alarme que indicam encaminhamento
• Estratificar risco

5.2 Anamnese Estruturada (perguntas-chave)
A. Caracterização dos sintomas
1. Quantas evacuações por semana?
2. Consistência fecal (Bristol 1-7)?
[... 20+ perguntas detalhadas ...]
```

**DEPOIS (Contexto PA):**
```
5. Avaliação Inicial no Pronto Atendimento

5.1 RED FLAGS - Avaliar IMEDIATAMENTE (< 2 minutos)
□ Distensão abdominal progressiva com timpanismo
□ Vômitos (especialmente se fecaloides)
□ Ausência de eliminação de gases > 24h
□ Dor abdominal intensa (≥ 7/10)
□ Sinais de peritonite (defesa, descompressão dolorosa)
→ Se QUALQUER positivo: Suspeitar obstrução/perfuração

5.2 YELLOW FLAGS - Avaliar em seguida (< 5 minutos)
□ Idade > 65 anos com mudança súbita do hábito
□ Sangramento retal
□ Uso de opioides
□ Febre
→ Se positivo: Maior atenção, considerar exames

5.3 Avaliação Focada (se red flags negativos)
• Última evacuação: ___ dias
• Esforço/dor para evacuar: Sim/Não
• Já tentou laxante em casa: Sim/Não - Qual? ___
• Exame: palpar abdome (fecaloma?), toque retal se indicado
```

### 5.2 Seção 7 - Tratamento

**ANTES (Genérico/Ambulatorial):**
```
7. Tratamento
7.1 Algoritmo Escalonado
Etapa 1 – Medidas não farmacológicas por ≥ 4 semanas
• Fibra alimentar 20-30g/dia
• Hidratação 1,5-2L/dia
• Exercício ≥ 150min/semana
[...]

Etapa 2 – Laxantes de primeira linha (4-6 semanas)
• PEG 17g VO 1x/dia
• Lactulose 15mL 1-3x/dia
```

**DEPOIS (Contexto PA):**
```
7. Tratamento no Pronto Atendimento

7.1 CONDUTAS IMEDIATAS NO PA
Escolher conforme disponibilidade e gravidade:

□ Fleet enema (fosfato) - Aplicar AGORA
  • Contraindicado: IRC, ICC, idoso frágil
  • Alternativa: Enema glicerinado 12%

□ PEG 17g em 250mL água VO - Administrar AGORA
  • Observar tolerância por 30 min
  • Se vômitos: considerar SNG

□ Bisacodil 10mg VO - Se tolerar VO
  • Não usar se suspeita obstrução

□ Hidratação - SF 0,9% 500mL IV se desidratado

7.2 PRESCRIÇÃO DE ALTA (para casa)
□ PEG 17g VO 1x/dia por 7 dias
□ Bisacodil 5mg VO à noite se necessário
□ Orientações dietéticas impressas
□ Retorno ao PA se: sem evacuar em 48h, dor piora, vômitos

7.3 NÃO USAR NO PA
✗ Prucaloprida, linaclotida (não disponíveis)
✗ Óleo mineral (risco aspiração)
✗ Laxantes osmóticos IV (exceto em preparo especial)
```

### 5.3 Seção 9 - Critérios de Internação e Alta

**ANTES (Genérico):**
```
9. Critérios de Internação e Alta
9.1 Indicações absolutas de internação
• Impactação fecal refratária após 2 ciclos de PEG
• Suspeita de obstrução mecânica
• Megacólon tóxico
[... 15 critérios em texto corrido ...]

9.4 Critérios de alta hospitalar
Todos os itens A-E obrigatórios:
A. Ausência de red flags
B. Evacuações ≥2 em 24h
[... texto extenso ...]
```

**DEPOIS (Contexto PA):**
```
9. Decisão de Destino no PA

9.1 ALTA SEGURA - TODOS devem estar ✓
□ Evacuou após tratamento OU sente que conseguirá em casa
□ Dor controlada (< 3/10)
□ Tolera dieta oral e medicação VO
□ Abdome flácido, sem distensão progressiva
□ Tem medicação prescrita para casa
□ Compreende sinais de retorno

→ LIBERAR com receita e orientações

9.2 INTERNAR/OBSERVAR - Se QUALQUER ✓
□ Suspeita de obstrução (distensão + vômitos + ausência gases)
□ Fecaloma não resolvido com tratamento inicial
□ Dor abdominal intensa persistente
□ Desidratação com intolerância VO
□ Idoso frágil sem cuidador
□ Falha de tratamento prévio em casa

→ INTERNAR para tratamento hospitalar

9.3 OBSERVAÇÃO 6-12h - Casos intermediários
□ Resposta parcial ao tratamento
□ Aguardando efeito de medicação
□ Dúvida diagnóstica

→ REAVALIAR em 6h
```

## 6. Plano de Implementação

### 6.1 Fase 1 - Infraestrutura (1-2 dias)
1. Atualizar modelo de dados (Prisma)
2. Criar tipos TypeScript para contextos
3. Implementar estrutura de prompts por contexto
4. Criar sistema de instruções por seção/contexto

### 6.2 Fase 2 - Interface (1 dia)
1. Modificar formulário de criação
2. Implementar seleção visual de contexto
3. Adicionar preview dinâmico
4. Ajustar validações

### 6.3 Fase 3 - Geração (2-3 dias)
1. Modificar fluxo de geração
2. Implementar seleção de prompts por contexto
3. Adaptar formatação de output
4. Integrar com sistema existente

### 6.4 Fase 4 - Validação (1 dia)
1. Criar validadores por contexto
2. Implementar testes automatizados
3. Adicionar feedback visual de validação

### 6.5 Fase 5 - Testes e Ajustes (2-3 dias)
1. Gerar protocolos de teste para cada contexto
2. Validar com casos reais
3. Ajustar prompts conforme necessário
4. Documentar mudanças

## 7. Arquivos a Modificar

### 7.1 Novos Arquivos
- `src/types/protocol-context.ts` - Tipos e enums
- `src/lib/ai/prompts/context-specific-prompts.ts` - System prompts
- `src/lib/ai/prompts/section-context-instructions.ts` - Instruções por seção
- `src/lib/validators/context-validators.ts` - Validadores
- `src/components/protocol/context-selector.tsx` - Componente de seleção

### 7.2 Arquivos Existentes a Modificar
- `prisma/schema.prisma` - Adicionar enum e campo
- `src/types/protocol.ts` - Incluir contexto
- `src/lib/ai/prompts/protocol-generation.ts` - Integrar contexto
- `src/lib/ai/generator.ts` - Usar prompts contextuais
- `src/components/protocol/forms/create-protocol-form-ultra.tsx` - Nova UI
- `src/server/api/routers/generation.ts` - Passar contexto
- `src/server/api/routers/protocol.ts` - Salvar contexto

## 8. Casos de Teste

### 8.1 Protocolo PA - Constipação
- Deve ter red flags no início
- Tratamento com fleet enema/PEG imediato
- Checklist binário alta/internação
- Sem follow-up ambulatorial

### 8.2 Protocolo Ambulatorial - Constipação
- Pode ter algoritmo escalonado de semanas
- Exames especializados permitidos
- Follow-up programado
- Educação detalhada

### 8.3 Validações Cruzadas
- PA não deve conter medicamentos ambulatoriais
- Ambulatório pode ser mais extenso
- Contextos diferentes, mesma condição = protocolos diferentes

## 9. Métricas de Sucesso

1. **Adequação Contextual**: 95% dos protocolos passam validação
2. **Satisfação do Usuário**: Protocolos úteis no contexto real
3. **Tempo de Permanência PA**: Redução mensurável com protocolos adequados
4. **Adoção**: Aumento no uso do sistema devido a relevância

## 10. Considerações Futuras

### 10.1 Expansões Possíveis
- Contextos adicionais (pediatria, obstetrícia)
- Personalização por instituição
- Templates por contexto
- IA treinada especificamente por contexto

### 10.2 Integrações
- Listas de medicamentos por unidade
- Protocolos institucionais
- Sistemas de prontuário eletrônico
- Dashboards de qualidade

## Conclusão

Esta especificação detalha uma mudança fundamental na forma como o sistema gera protocolos médicos, movendo de uma abordagem genérica para uma altamente contextualizada. O foco em Pronto Atendimento como caso de uso inicial demonstra o valor imediato: protocolos que realmente ajudam médicos a tomar decisões rápidas e seguras, reduzindo tempo de permanência e melhorando desfechos.

A implementação mantém a estrutura de 13 seções exigida pela qualidade, mas adapta radicalmente o conteúdo ao contexto de uso, resultando em protocolos verdadeiramente úteis e acionáveis.