# Prompt Aprimorado para Transformação de Protocolos Médicos em Fluxogramas DOT Algoritmizáveis

## Objetivo Principal
Transformar protocolos médicos textuais em fluxogramas decisórios totalmente algoritmizáveis usando a linguagem DOT (Graphviz), garantindo que cada decisão seja objetiva, cada conduta seja detalhada precisamente, e o fluxo siga a lógica clínica aplicável a sistemas de apoio à decisão.

## Princípios Fundamentais de Algoritmização

1. **Converter decisões clínicas em perguntas objetivamente verificáveis**
   - Transformar critérios como "Indicação de exame?" em "P14: TC/RM indicada? (Febre >39°C, Hematúria, Refratariedade terapêutica)"
   - Eliminar termos ambíguos como "significativo", "apropriado", "considerar"
   - Definir valores numéricos exatos sempre que possível (ex: "EVA ≥7/10" em vez de "dor intensa")
   - Explicitar critérios temporais (ex: "Evolução <72h", "Febre por >48h")

2. **Implementar caminhos decisórios explícitos**
   - Decisões de triagem devem sempre levar a diferentes níveis de prioridade ou condutas
   - Para decisões binárias (Sim/Não): garantir que ambas as saídas levem a nós subsequentes
   - Para decisões categóricas: garantir que cada categoria tenha saída explícita para conduta específica
   - Uma pergunta pode ter uma única saída quando esta representar uma etapa mandatória no fluxo

3. **Detalhar condutas com informações completas para implementação**
   - Medicações: especificar nome, dose, via de administração, frequência, duração e ajustes
   - Exames: especificar exatamente quais parâmetros solicitar e valores decisórios esperados
   - Critérios objetivos para mudanças de conduta (alta, internação, observação)
   - Ajustes específicos para populações especiais (renais, hepáticos, idosos, etc.)

4. **Organizar o fluxo conforme raciocínio clínico padronizado**
   - Estruturar em módulos funcionais: Triagem → Avaliação → Diagnóstico → Tratamento → Seguimento
   - Permitir navegação não-linear quando necessário (ex: tratamento de urgência antes da avaliação completa)
   - Identificar claramente pontos de entrada e saída para cada módulo funcional

5. **Aplicar estruturas decisórias avançadas**
   - Expressar condições complexas E/OU de forma explícita (ex: "Critérios para Alta Prioridade: EVA ≥7 OU Sinais de Alarme OU Imunossupressão")
   - Implementar breakpoints apenas em pontos de verdadeira pausa clínica (aguardando resultados de exames críticos, avaliação especializada)
   - Converter escalas e escores clínicos em critérios objetivos nomeados

## Configurações Técnicas do Gráfico DOT

```dot
digraph Protocolo_Nome_do_Protocolo {
    // Configurações globais
    graph [
        rankdir=LR,              // Direção do fluxo: left-right
        fontname="Arial",
        fontsize=12,
        splines=ortho,           // Linhas ortogonais para clareza visual
        nodesep=0.8,
        ranksep=1.2,             // Maior separação entre níveis
        compound=true,
        labelloc="t",
        label="Título completo do protocolo"
    ];
    
    // Configuração para nós de decisão (perguntas)
    node [
        shape=diamond,           // Losango para decisões
        style=filled,
        fillcolor=lightyellow,
        fontname="Arial",
        fontsize=11,
        margin="0.2,0.1",
        height=0.6
    ];
    
    // Configuração para nós de ação (condutas)
    node [
        shape=box,               // Retângulo para ações/condutas
        style=filled,
        fillcolor=lightblue,
        fontname="Arial",
        fontsize=11,
        margin="0.2,0.1",
        height=0.6
    ];
    
    // Configuração para arestas (conexões)
    edge [
        fontname="Arial",
        fontsize=10,
        minlen=1,
        arrowsize=0.8
    ];
```

## Padrões para Implementação dos Elementos

### 1. Perguntas e Decisões Binárias

**Formato:**
```dot
p1_decisao [
    label="P1: Pergunta objetiva?\n(Critérios específicos listados)",
    shape=diamond,
    fillcolor=lightyellow
];

conduta_sim [
    label="CONDUTA SE SIM:\nDescricão detalhada da conduta",
    fillcolor=lightblue
];

conduta_nao [
    label="CONDUTA SE NÃO:\nDescricão detalhada da conduta alternativa",
    fillcolor=lightblue
];

p1_decisao -> conduta_sim [label="Sim"];
p1_decisao -> conduta_nao [label="Não"];
```

### 2. Decisões com Múltiplas Categorias

**Formato:**
```dot
p2_categorias [
    label="P2: Categoria do paciente?\n• Critério categoria A\n• Critério categoria B\n• Critério categoria C",
    shape=diamond,
    fillcolor=lightyellow
];

conduta_a [
    label="CONDUTA CATEGORIA A:\nDescrição detalhada",
    fillcolor=lightblue
];

conduta_b [
    label="CONDUTA CATEGORIA B:\nDescrição detalhada",
    fillcolor=lightblue
];

conduta_c [
    label="CONDUTA CATEGORIA C:\nDescrição detalhada",
    fillcolor=lightblue
];

p2_categorias -> conduta_a [label="Categoria A"];
p2_categorias -> conduta_b [label="Categoria B"];
p2_categorias -> conduta_c [label="Categoria C"];
```

### 3. Condições Compostas (E/OU)

**Formato:**
```dot
decisao_condicao_composta [
    label="P3: Critérios para conduta X?\n• Critério A E Critério B OU\n• Critério C OU\n• Critério D E Critério E E Critério F",
    shape=diamond,
    fillcolor=lightyellow
];

conduta_positiva [
    label="CONDUTA X:\nDescrição detalhada",
    fillcolor=lightblue
];

conduta_alternativa [
    label="CONDUTA ALTERNATIVA:\nDescrição detalhada",
    fillcolor=lightblue
];

decisao_condicao_composta -> conduta_positiva [label="Sim"];
decisao_condicao_composta -> conduta_alternativa [label="Não"];
```

### 4. Detalhamento de Medicações

**Formato:**
```dot
terapia_medicacao [
    label="MEDICAÇÃO ESPECÍFICA:\n• Nome: Medicamento X\n• Dose: Y mg/kg\n• Via: Oral/EV/IM\n• Frequência: a cada Z horas\n• Duração: N dias\n• Diluição: W mL\n• Tempo infusão: T horas",
    fillcolor=lightblue
];

ajuste_dose [
    label="AJUSTE DE DOSE:\n• ClCr 50-80: 100% da dose\n• ClCr 30-49: 50% da dose\n• ClCr 10-29: 25% da dose\n• ClCr <10: Contraindicado",
    fillcolor=lightblue
];

decisao_medicacao -> terapia_medicacao [label="Indicado"];
decisao_funcao_renal -> ajuste_dose [label="ClCr <80"];
```

### 5. Breakpoints Essenciais

**Formato:**
```dot
breakpoint [
    label="BREAKPOINT:\nAguardar resultados\n\nCritérios específicos:\n• Resultado A pendente\n• Avaliação B necessária\n• Condição C instável",
    shape=hexagon,
    fillcolor=lightpink,
    peripheries=2
];

acoes_durante_aguardo [
    label="AÇÕES DURANTE AGUARDO:\n• Monitorar sinais vitais a cada X horas\n• Manter medicação Y\n• Reavaliação em Z horas",
    fillcolor=lightcyan
];

breakpoint -> acoes_durante_aguardo [style=dashed];
acoes_durante_aguardo -> proxima_etapa;
```

## Diretrizes para Transformação do Protocolo

1. **Identificar pontos de decisão críticos**
   - Marque no protocolo original toda pergunta/avaliação que altera a conduta
   - Converta cada ponto crítico em uma decisão objetiva com critérios explícitos
   - Numere sequencialmente as perguntas (P1, P2, P3...) para facilitar referências
   - Não crie perguntas para informações que são apenas coletadas mas não alteram condutas

2. **Especificar condições completas para cada conduta**
   - Determine exatamente quais combinações de respostas levam a cada conduta
   - Expresse condições complexas (E/OU) como critérios numerados e explícitos
   - Para escores clínicos, defina pontos de corte exatos e indicações precisas

3. **Detalhar completamente todas as ações e condutas**
   - Explicite para cada medicação: dose, via, frequência, duração, diluição, tempo de infusão
   - Inclua ajustes para situações especiais (função renal, idosos, gestantes)
   - Defina critérios exatos para alta, internação, observação e encaminhamentos

4. **Implementar rotulagem clara das conexões**
   - Toda conexão deve ter um rótulo explícito indicando o critério de transição
   - Use valores numéricos específicos em vez de termos qualitativos
   - Garanta que cada saída de um nó decisório tenha destino definido

5. **Organizar o fluxo visual com lógica clínica**
   - Garanta que o fluxo principal siga da esquerda para a direita
   - Minimize o cruzamento de linhas
   - Alinhe decisões relacionadas na mesma camada (rank) quando apropriado

## Situações Específicas Requerendo Atenção Especial

1. **Decisões Sequenciais Automáticas**
   - Quando uma pergunta leva diretamente a outra sem possibilidade de desvio, conecte-as diretamente
   - Exemplo: "Diagnóstico de Diabetes?" → "Verificar Controle Glicêmico"
   - Não crie condutas intermediárias desnecessárias

2. **Critérios Temporais e Janelas Terapêuticas**
   - Especifique exatamente os pontos de corte temporais (ex: "<72h", "3-7 dias", ">7 dias")
   - Para janelas terapêuticas, defina claramente início e fim (ex: "Trombolítico: 3-4.5h do início")
   - Indique tempo máximo para cada etapa crítica quando aplicável

3. **Populações Especiais com Ajustes**
   - Crie nós específicos de decisão para identificar cada população especial relevante
   - Implemente ajustes objetivos para cada população (ex: "Idosos: reduzir dose em 25%")
   - Conecte estas decisões ao fluxo principal em pontos estratégicos

4. **Avaliações Especializadas e Encaminhamentos**
   - Defina critérios objetivos para cada tipo de encaminhamento
   - Especifique prioridade e tipo de seguimento (ex: "Encaminhamento prioritário à Oftalmologia")
   - Indique condutas durante aguardo de avaliação especializada

5. **Exames Diagnósticos e Interpretação de Resultados**
   - Especifique quais exames solicitar em cada situação
   - Defina valores de corte para interpretação (ex: "PCR >5", "Leucócitos >12.000")
   - Indique condutas específicas para cada resultado possível

## Checklist Final de Qualidade

Antes de finalizar o fluxograma DOT, verifique se:

- [ ] Todas as decisões têm critérios objetivos e verificáveis
- [ ] Cada decisão tem saídas rotuladas para todos os desfechos possíveis
- [ ] Toda conduta medicamentosa está completamente detalhada
- [ ] Os breakpoints estão implementados apenas onde clinicamente necessários
- [ ] Não existem perguntas redundantes ou sem impacto na conduta
- [ ] Critérios compostos (E/OU) estão claramente estruturados
- [ ] Populações especiais têm ajustes específicos claramente definidos
- [ ] O fluxograma segue a estrutura lógica do raciocínio clínico
- [ ] O código DOT está sintaticamente correto e livre de erros
- [ ] O fluxograma poderia ser implementado diretamente em software sem interpretação adicional

**Lembre-se:** O objetivo final é criar um fluxograma que possa ser implementado diretamente em sistemas de apoio à decisão clínica, sem necessidade de interpretação humana adicional ou desambiguação.