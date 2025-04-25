# Prompt Refinado para Criação de Protocolos Médicos Algoritmizáveis

## Objetivo Principal
Transformar documentos médicos em protocolos estruturados e algoritmizáveis para implementação digital em sistemas de apoio à decisão clínica, garantindo que cada elemento do protocolo tenha impacto direto na tomada de decisão clínica. **O protocolo resultante deve ser integralmente em português do Brasil.**

## Princípios Fundamentais para Estruturação

1. **Eficiência Algorítmica**: Incluir apenas perguntas que efetivamente alterem condutas ou classifiquem pacientes
2. **Objetividade**: Usar critérios mensuráveis e limiares precisos para todas as decisões
3. **Modularidade**: Organizar o protocolo em blocos funcionais independentes e claramente sequenciados
4. **Breakpoints Estratégicos**: Definir pontos específicos para reavaliação médica e mudança de fluxo
5. **Condicionais Explícitas**: Estruturar todas as decisões com sintaxe algorítmica

## Estrutura Modular Obrigatória

### 1. Metadados do Protocolo
- Título específico e conciso
- Objetivo claro (ex: diagnóstico, tratamento, monitoramento)
- População-alvo precisa (ex: adultos, ≥18 anos com suspeita de X)
- Escopo de aplicação (ex: pronto-atendimento, ambulatório)
- CIDs principais e secundários relevantes
- Níveis de evidência (quando aplicável)

### 2. Módulo de Triagem/Classificação Inicial
- **Finalidade**: Determinar urgência e via de acesso ao protocolo
- **Incluir obrigatoriamente**:
  * Critérios de inclusão e exclusão objetivos
  * Sinais vitais com limiares específicos (valores numéricos exatos)
  * Sinais de alarme claramente definidos
  * Critérios para categorização de risco

### 3. Módulo de Avaliação Diagnóstica
- **Finalidade**: Caracterizar a condição e direcionar a terapêutica
- **Incluir obrigatoriamente**:
  * Apenas perguntas diagnósticas impactantes para decisão
  * Dados objetivos para confirmar/excluir a condição
  * Exames complementares essenciais com valores de referência
  * Critérios diagnósticos explícitos (ex: escore de pontuação, algoritmo dicotômico)

### 4. Módulo Terapêutico
- **Finalidade**: Definir tratamento específico e individualizado
- **Incluir obrigatoriamente**:
  * Condutas totalmente detalhadas (medicação, dose, via, frequência, duração)
  * Condicionais explícitas para cada conduta
  * Ajustes específicos para populações especiais (ex: idosos, DRC, DM)
  * Intervenções não-farmacológicas

### 5. Módulo de Seguimento e Avaliação de Resposta
- **Finalidade**: Monitorar eficácia e segurança
- **Incluir obrigatoriamente**:
  * Critérios objetivos de resposta/falha terapêutica
  * Prazos específicos para reavaliação
  * Critérios para alta vs. internação
  * Critérios para mudança de terapêutica

## Regras para Perguntas Algoritmicamente Eficientes

### Regra #1: Impacto Decisório Obrigatório
**Cada pergunta deve satisfazer pelo menos UM dos seguintes critérios:**
- Levar diretamente a uma ramificação exclusiva no fluxo de decisão
- Determinar a elegibilidade para uma intervenção específica
- Contribuir para um escore/classificação que afete conduta
- Afetar dosagem, via ou frequência de medicamento
- Determinar necessidade de internação vs. manejo ambulatorial
- Identificar critério de exclusão ou contraindicação absoluta

**Exemplo inadequado:**
```
P7: Assinale as comorbidades presentes:
[ ] Hipertensão arterial  (não altera conduta)
[ ] Dislipidemia          (não altera conduta)
[ ] Tabagismo ativo       (não altera conduta)
```

**Exemplo adequado:**
```
P7: Assinale comorbidades que afetam o manejo:
[ ] Doença renal crônica (TFG <30 mL/min) → Ajuste medicação conforme P15
[ ] Insuficiência cardíaca (classe III/IV) → Monitoramento conforme P16
[ ] Hepatopatia (Child B/C) → Contraindicação para medicamento X
```

### Regra #2: Estrutura Categórica
- Usar perguntas categóricas (opções fechadas) sempre que possível
- Evitar campos abertos exceto para valores numéricos específicos
- Quando necessário campo livre, especificar formato esperado (ex: "Inserir peso em kg: ___")

### Regra #3: Agrupamento Lógico
- Agrupar perguntas em conjuntos funcionais de no máximo 5-7 itens
- Posicionar perguntas relacionadas a uma decisão específica próximas entre si
- Estruturar cada grupo para coletar dados necessários para um único ponto de decisão

## Breakpoints Estratégicos (Pontos de Reavaliação Médica)

### Definição Formal
Breakpoints são paradas estruturadas no algoritmo que representam momentos onde o médico precisa reavaliar o paciente antes de prosseguir, tipicamente:
- Após solicitação e obtenção de resultados de exames
- Após administração de medicamentos para verificar resposta clínica
- Após períodos definidos de observação para verificar evolução

### Requisitos para Breakpoints
**Cada breakpoint deve explicitamente definir:**
1. **Evento desencadeador** (ex: "Após resultado do D-dímero")
2. **Parâmetros a serem reavaliados pelo médico** (ex: "Verificar valor do D-dímero" ou "Avaliar resposta à medicação analgésica")
3. **Critérios objetivos para decisão subsequente** (ex: "Se D-dímero ≤ 500 ng/mL → Alta; Se D-dímero > 500 ng/mL → Ultrassom")
4. **Ações específicas para cada resultado possível da reavaliação**

### Posicionamento Estratégico de Breakpoints
**Inserir breakpoints obrigatoriamente após:**
- Solicitação e obtenção de resultados de exames críticos
- Primeira dose de medicamentos com resposta esperada avaliável (ex: analgésicos, anti-hipertensivos)
- Períodos definidos de observação clínica (ex: 1h, 2h, 6h)
- Intervenções terapêuticas que requeiram verificação de resposta
- Qualquer ponto onde o médico precise reavaliar o paciente para determinar o próximo passo

### Exemplo de Estrutura para Breakpoint
```
BREAKPOINT X: [Nome descritivo] - [Momento da reavaliação médica]

1. Parâmetros a serem reavaliados pelo médico:
   • [Parâmetro 1] - Valores esperados/referência
   • [Parâmetro 2] - Valores esperados/referência
   • [Parâmetro 3] - Valores esperados/referência

2. Critérios de decisão médica após reavaliação:
   [ ] Resultado A → [Conduta específica]
   [ ] Resultado B → [Conduta específica]
   [ ] Resultado C → [Conduta específica]
```

## Estruturação de Condicionais

### Sintaxe Padrão para Condicionais
```
Condicional: [ ] Opção X em P1 [E/OU] [ ] Opção Y em P2 [E/OU] [ ] Valor Z em P3 [>/</>=/<=] [valor]
```

### Exemplos de Condicionais Simples
```
Condicional: [ ] Escore de Wells ≥ 2 em P5
```

### Exemplos de Condicionais Complexas
```
Condicional: 
([ ] TVP proximal em P12 [OU] [ ] TVP extensa em P12)
[E]
([ ] ClCr < 30 mL/min em P7 [OU] [ ] Peso < 50 kg em P3)
```

## Gestão de Encaminhamentos

### 1. Avaliação Especializada Durante o Atendimento
**Estrutura obrigatória:**
```
Avaliação especializada durante atendimento:

1. Critérios para acionar [especialidade]:
   [ ] Critério objetivo 1
   [ ] Critério objetivo 2
   [ ] Critério objetivo 3

2. Modalidade de avaliação:
   [ ] Presencial
   [ ] Telemedicina
   [ ] Discussão telefônica
   [ ] Hospital Virtual

3. Urgência:
   [ ] Imediata (em até 30 minutos)
   [ ] Prioritária (em até 2 horas)
   [ ] Não urgente (durante o turno)
```

### 2. Encaminhamento Ambulatorial
**Estrutura obrigatória:**
```
Encaminhamento ambulatorial:

1. Critérios de elegibilidade para [especialidade]:
   [ ] Critério objetivo 1
   [ ] Critério objetivo 2
   [ ] Critério objetivo 3

2. Critérios de NÃO elegibilidade:
   [ ] Critério objetivo 1
   [ ] Critério objetivo 2

3. Nível de prioridade:
   [ ] Alta: [critérios objetivos específicos]
   [ ] Média: [critérios objetivos específicos]
   [ ] Baixa: [critérios objetivos específicos]

4. Informações obrigatórias no encaminhamento:
   [ ] Item 1
   [ ] Item 2
   [ ] Item 3
```

## Instruções para Análise do Documento Original

### 1. Análise Estrutural
- Identificar o objetivo e escopo do protocolo
- Mapear pontos de decisão principais
- Identificar critérios diagnósticos objetivos
- Listar intervenções e terapêuticas mencionadas
- Extrair critérios de alta, internação e encaminhamento

### 2. Reorganização Modular
- Agrupar elementos relacionados em módulos funcionais
- Separar claramente avaliação inicial, diagnóstico, tratamento e seguimento
- Identificar lacunas nos critérios objetivos

### 3. Validação de Conformidade
- Cada pergunta leva a uma decisão ou ação específica?
- Todos os critérios são objetivos e mensuráveis?
- Os breakpoints estão adequadamente definidos como momentos de reavaliação médica?
- As condicionais estão estruturadas em formato algoritmizável?
- Os encaminhamentos possuem critérios específicos?

## Formato do Protocolo Resultante

O protocolo final deve conter:

### 1. Metadados e Escopo
- Título, objetivo, população-alvo
- CIDs principais e secundários relevantes
- Definição clara do contexto de aplicação

### 2. Módulos Funcionais
- Cada módulo com propósito específico
- Perguntas impactantes e estruturadas
- Critérios objetivos e mensuráveis

### 3. Condicionais Explícitas
- Todas as decisões com sintaxe algorítmica padronizada
- Conexões claras entre perguntas e condutas
- Caminhos decisórios completos

### 4. Breakpoints Estratégicos
- Pontos de reavaliação médica bem definidos
- Critérios objetivos para decisões após reavaliação
- Ações específicas para cada resultado possível

### 5. Condutas Detalhadas
- Medicações com especificações completas
- Intervenções não-farmacológicas detalhadas
- Critérios de alta/internação objetivos
- Encaminhamentos estruturados

## Verificação Final de Qualidade

Antes de finalizar o protocolo, verificar:

1. **Relevância decisória**: Cada pergunta afeta diretamente uma conduta?
2. **Objetividade**: Todos os critérios são mensuráveis?
3. **Completude**: Todos os caminhos possíveis estão definidos?
4. **Modularidade**: O protocolo está organizado em blocos lógicos?
5. **Breakpoints**: Os pontos de reavaliação médica estão adequadamente definidos?
6. **Condicionais**: As decisões seguem sintaxe algorítmica padronizada?
7. **Encaminhamentos**: Os critérios de referência são objetivos e específicos?
8. **Idioma**: Todo o conteúdo está em português do Brasil?

Este prompt refinado deve guiar a criação de protocolos médicos que sejam verdadeiramente algoritmizáveis, eficientes e prontos para implementação digital, garantindo que cada elemento tenha impacto direto na tomada de decisão clínica.