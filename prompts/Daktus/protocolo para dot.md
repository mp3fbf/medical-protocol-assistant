# Prompt para Geração de Fluxograma DOT para Protocolos Médicos

## Objetivo do Prompt
Transformar um protocolo médico algoritmizado em um fluxograma visual completo utilizando a linguagem DOT (Graphviz), garantindo representação estrutural fidedigna de todos os caminhos decisórios, breakpoints e condutas terapêuticas.

## Requisitos para Geração do Fluxograma DOT

### 1. Configurações Gerais do Gráfico

```dot
digraph "Protocolo_[Nome_do_Protocolo]" {
    // Configurações globais
    graph [
        rankdir=TB,              // Direção do fluxo: top-bottom
        fontname="Arial",        // Fonte padrão
        fontsize=12,             // Tamanho da fonte
        splines=ortho,           // Estilo de linhas ortogonais
        nodesep=0.8,             // Separação entre nós
        ranksep=0.8,             // Separação entre níveis
        compound=true,           // Permite conexões entre subgráficos
        labelloc="t",            // Título no topo
        label="[Título completo do protocolo]"
    ];
    
    // Configuração padrão para nós
    node [
        shape=box,               // Formato padrão dos nós
        style=filled,            // Estilo preenchido
        fillcolor=lightblue,     // Cor padrão de preenchimento
        fontname="Arial",        // Fonte para textos nos nós
        fontsize=11,             // Tamanho da fonte
        margin="0.2,0.1",        // Margem interna dos nós
        height=0.6               // Altura mínima
    ];
    
    // Configuração padrão para arestas
    edge [
        fontname="Arial",        // Fonte para textos nas arestas
        fontsize=10,             // Tamanho da fonte
        minlen=1,                // Comprimento mínimo
        arrowsize=0.8            // Tamanho das setas
    ];
```

### 2. Elementos Visuais Padronizados

#### 2.1 Início e Fim do Protocolo
```dot
    // Início do protocolo
    inicio [
        label="Início: [Nome do Protocolo]\n[População-alvo]",
        shape=oval,
        fillcolor=white
    ];

    // Fim do protocolo
    fim_alta [
        label="Alta com\n[Orientações Específicas]",
        shape=oval,
        fillcolor=white
    ];
    
    fim_internacao [
        label="Internação para\n[Motivo]",
        shape=oval,
        fillcolor=lightpink
    ];
```

#### 2.2 Pontos de Decisão
```dot
    // Pontos de decisão clínica
    decisao1 [
        label="P1: [Pergunta de Decisão]\n[Critério objetivo]",
        shape=diamond,
        fillcolor=lightyellow
    ];
```

#### 2.3 Breakpoints (Pontos de Reavaliação Médica)
```dot
    // Breakpoints para reavaliação
    breakpoint1 [
        label="BREAKPOINT 1:\n[Descrição]\n[Critérios de avaliação]",
        shape=hexagon,
        fillcolor=lightpink,
        peripheries=2          // Borda dupla para maior destaque
    ];
```

#### 2.4 Classificação de Risco
```dot
    // Nós de classificação de risco
    risco_baixo [
        label="RISCO BAIXO\n[Critérios]",
        fillcolor=white
    ];
    
    risco_medio [
        label="RISCO MÉDIO\n[Critérios]",
        fillcolor=lightyellow
    ];
    
    risco_alto [
        label="RISCO ALTO\n[Critérios]",
        fillcolor=lightpink
    ];
```

#### 2.5 Condutas Terapêuticas
```dot
    // Condutas e tratamentos
    medicacao1 [
        label="MEDICAÇÃO:\n[Nome, Dose, Via, Frequência]",
        fillcolor=lightcyan
    ];
    
    exame1 [
        label="EXAME:\n[Nome, Parâmetros Relevantes]",
        fillcolor=lavender
    ];
```

#### 2.6 Subgráficos para Módulos Funcionais
```dot
    // Subgráfico para o módulo de avaliação inicial
    subgraph cluster_avaliacao_inicial {
        label="Módulo de Avaliação Inicial";
        style=filled;
        color=lightgrey;
        fontsize=14;
        
        // Nós do módulo
        ...
    }
    
    // Subgráfico para módulo terapêutico
    subgraph cluster_terapeutico {
        label="Módulo Terapêutico";
        style=filled;
        color=lightgrey;
        fontsize=14;
        
        // Nós do módulo
        ...
    }
```

### 3. Diretrizes para Conexões e Fluxos

#### 3.1 Conexões Padrão
```dot
    // Conexões simples
    decisao1 -> acao1 [label="Sim"];
    decisao1 -> acao2 [label="Não"];
    
    // Conexões com condicionais complexas
    decisao2 -> acao3 [label="Escore ≥ 2\nE\nClCr > 30 mL/min"];
```

#### 3.2 Conexões entre Módulos
```dot
    // Conexão entre módulos (subgráficos)
    modulo1_saida -> modulo2_entrada [
        ltail=cluster_modulo1,
        lhead=cluster_modulo2,
        label="Condição de transição"
    ];
```

#### 3.3 Conexões para Breakpoints
```dot
    // Conexão para breakpoint
    acao1 -> breakpoint1 [
        label="Aguardar\nresultado de exame",
        style=dashed
    ];
    
    // Conexões a partir do breakpoint
    breakpoint1 -> acao2 [label="Resultado A"];
    breakpoint1 -> acao3 [label="Resultado B"];
```

### 4. Estrutura de Representação do Protocolo

#### 4.1 Módulo de Triagem/Classificação
```dot
    subgraph cluster_triagem {
        label="Triagem e Classificação de Risco";
        // Nós de triagem
        triagem_sinais_vitais [label="Sinais Vitais\nPA, FC, FR, Temp, SpO2"];
        triagem_decisao [
            label="Critérios de Gravidade?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        // Categorias de classificação
        classe_vermelho [label="EMERGÊNCIA", fillcolor=lightpink];
        classe_amarelo [label="URGÊNCIA", fillcolor=lightyellow];
        classe_verde [label="POUCO URGENTE", fillcolor=white];
        
        // Conexões internas
        triagem_sinais_vitais -> triagem_decisao;
        triagem_decisao -> classe_vermelho [label="Critérios de\nEmergência"];
        triagem_decisao -> classe_amarelo [label="Critérios de\nUrgência"];
        triagem_decisao -> classe_verde [label="Sem Critérios\nde Urgência"];
    }
```

#### 4.2 Módulo de Avaliação Diagnóstica
```dot
    subgraph cluster_diagnostico {
        label="Avaliação Diagnóstica";
        // Nós de avaliação
        aval_criterios [label="Critérios Diagnósticos\n[Listar perguntas P1-Pn]"];
        aval_escore [label="Cálculo de Escore\n[Fórmula/Algoritmo]"];
        aval_decisao [
            label="Escore ≥ Limiar?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        
        // Conexões internas
        aval_criterios -> aval_escore;
        aval_escore -> aval_decisao;
        aval_decisao -> diagnostico_positivo [label="Sim"];
        aval_decisao -> diagnostico_negativo [label="Não"];
    }
```

#### 4.3 Módulo de Exames
```dot
    subgraph cluster_exames {
        label="Exames Complementares";
        // Solicitação de exames
        exames_solicitar [label="Solicitar:\n- Exame 1\n- Exame 2\n- Exame 3"];
        
        // Breakpoint após resultado
        exames_breakpoint [
            label="BREAKPOINT:\nReavaliação após\nresultados dos exames",
            shape=hexagon,
            fillcolor=lightpink,
            peripheries=2
        ];
        
        // Decisão baseada em resultados
        exames_decisao [
            label="Resultados\nindicam condição\ngrave?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        
        // Conexões internas
        exames_solicitar -> exames_breakpoint [style=dashed];
        exames_breakpoint -> exames_decisao;
        exames_decisao -> exame_grave [label="Sim"];
        exames_decisao -> exame_leve [label="Não"];
    }
```

#### 4.4 Módulo Terapêutico
```dot
    subgraph cluster_terapeutico {
        label="Tratamento e Intervenções";
        // Nós de tratamento
        trat_medicacoes [
            label="Medicações:\n- Med 1: dose, via, freq\n- Med 2: dose, via, freq",
            fillcolor=lightcyan
        ];
        
        trat_nao_farm [
            label="Medidas Não-Farmacológicas:\n- Medida 1\n- Medida 2",
            fillcolor=lightcyan
        ];
        
        // Breakpoint de reavaliação
        trat_breakpoint [
            label="BREAKPOINT:\nReavaliação após\nadministração inicial",
            shape=hexagon,
            fillcolor=lightpink,
            peripheries=2
        ];
        
        // Decisão baseada em resposta
        trat_decisao [
            label="Resposta\nadequada?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        
        // Conexões internas
        trat_medicacoes -> trat_breakpoint [style=dashed];
        trat_nao_farm -> trat_breakpoint [style=dashed];
        trat_breakpoint -> trat_decisao;
        trat_decisao -> trat_resposta [label="Sim"];
        trat_decisao -> trat_falha [label="Não"];
    }
```

#### 4.5 Módulo de Seguimento/Alta
```dot
    subgraph cluster_seguimento {
        label="Seguimento e Alta";
        // Critérios de alta
        seg_criterios_alta [
            label="Critérios para Alta:\n- Critério 1\n- Critério 2\n- Critério 3"
        ];
        
        // Decisão de alta vs. internação
        seg_decisao [
            label="Critérios\natendidos?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        
        // Alta com orientações
        seg_alta [
            label="ALTA COM:\n- Prescrição\n- Orientações\n- Retorno",
            shape=oval,
            fillcolor=white
        ];
        
        // Internação
        seg_internacao [
            label="INTERNAÇÃO:\n- Motivo\n- Cuidados",
            shape=oval,
            fillcolor=lightpink
        ];
        
        // Encaminhamentos
        seg_encaminhamentos [
            label="ENCAMINHAMENTOS:\n- Especialidade 1: Prioridade\n- Especialidade 2: Prioridade",
            fillcolor=lavender
        ];
        
        // Conexões internas
        seg_criterios_alta -> seg_decisao;
        seg_decisao -> seg_alta [label="Sim"];
        seg_decisao -> seg_internacao [label="Não"];
        seg_alta -> seg_encaminhamentos;
    }
```

#### 4.6 Legendas e Informações Auxiliares
```dot
    // Subgráfico de legenda
    subgraph cluster_legenda {
        label="Legenda";
        style=filled;
        color=lightgrey;
        fontsize=12;
        
        leg_inicio [label="Início/Fim", shape=oval, fillcolor=white];
        leg_decisao [label="Decisão", shape=diamond, fillcolor=lightyellow];
        leg_breakpoint [label="Breakpoint", shape=hexagon, fillcolor=lightpink, peripheries=2];
        leg_medicamento [label="Medicação", fillcolor=lightcyan];
        leg_exame [label="Exame", fillcolor=lavender];
        leg_internacao [label="Internação", fillcolor=lightpink];
        
        {rank=same; leg_inicio; leg_decisao; leg_breakpoint; leg_medicamento; leg_exame; leg_internacao;}
    }
```

### 5. Fluxo Completo de Conectividade

```dot
    // Fluxo principal
    inicio -> cluster_triagem;
    
    // Conectando triagem ao diagnóstico
    classe_vermelho -> terapia_emergencia;
    classe_amarelo -> cluster_diagnostico;
    classe_verde -> cluster_diagnostico;
    
    // Conectando diagnóstico aos exames
    diagnostico_positivo -> cluster_exames;
    diagnostico_negativo -> alt_diagnostico;
    
    // Conectando exames ao tratamento
    exame_grave -> trat_grave;
    exame_leve -> trat_leve;
    
    // Finalizando no módulo de seguimento
    trat_grave -> cluster_seguimento;
    trat_leve -> cluster_seguimento;
    
    // Desfechos finais
    seg_alta -> fim_alta;
    seg_internacao -> fim_internacao;
}
```

## Instruções Específicas para Protocolos Médicos Complexos

### 1. Representação do Escore de Wells ou Similar
```dot
    // Nó de cálculo do escore
    escore_wells [
        label="ESCORE DE WELLS:\n- Câncer ativo (+1)\n- Paralisia/imobilização (+1)\n- Acamado >3 dias (+1)\n- Dor em trajeto venoso (+1)\n- Edema unilateral (+1)\n- Aumento panturrilha >3cm (+1)\n- Edema com cacifo (+1)\n- Veias colaterais (+1)\n- TVP prévia (+1)\n- Diagnóstico alternativo (-2)",
        shape=record,
        fillcolor="#E0FFFF"
    ];
    
    // Decisão baseada no escore
    decisao_wells [
        label="Escore ≥ 2?",
        shape=diamond,
        fillcolor=lightyellow
    ];
    
    // Conexões
    escore_wells -> decisao_wells;
    decisao_wells -> ultrassom_imediato [label="Sim"];
    decisao_wells -> d_dimero [label="Não"];
```

### 2. Representação de Breakpoints Complexos
```dot
    // Breakpoint de avaliação do D-dímero
    breakpoint_ddimero [
        label="BREAKPOINT: Resultado D-dímero\n\nParâmetros a avaliar:\n- Valor do D-dímero (ng/mL)\n- Cut-off: 500 ou idade × 10 (se >50 anos)\n\nCritérios de decisão:",
        shape=hexagon,
        fillcolor=lightpink,
        peripheries=2
    ];
    
    // Decisão pós-breakpoint
    decisao_ddimero [
        label="D-dímero\npositivo?",
        shape=diamond,
        fillcolor=lightyellow
    ];
    
    // Conexões
    breakpoint_ddimero -> decisao_ddimero;
    decisao_ddimero -> ultrassom [label="Sim"];
    decisao_ddimero -> excluir_tvp [label="Não"];
```

### 3. Representação de Ajustes para Populações Especiais
```dot
    // Subgráfico para ajustes populacionais
    subgraph cluster_populacoes_especiais {
        label="Ajustes para Populações Especiais";
        style=filled;
        color=lightgrey;
        fontsize=14;
        
        // Decisão sobre população especial
        pop_decisao [
            label="População\nespecial?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        
        // Diferentes populações
        pop_renal [label="DRC\nClCr < 30 mL/min", fillcolor="#FFF0F5"];
        pop_idosos [label="Idosos\n> 75 anos", fillcolor="#FFF0F5"];
        pop_cancer [label="Câncer Ativo", fillcolor="#FFF0F5"];
        
        // Ajustes para cada população
        ajuste_renal [
            label="AJUSTES PARA DRC:\n- Enoxaparina: 1 mg/kg 1x/dia\n- Evitar rivaroxabana\n- Monitorar função renal",
            fillcolor=lightcyan
        ];
        
        ajuste_idosos [
            label="AJUSTES PARA IDOSOS:\n- Varfarina: iniciar 2-3 mg/dia\n- Monitorar sangramento\n- D-dímero: cut-off = idade × 10 ng/mL",
            fillcolor=lightcyan
        ];
        
        ajuste_cancer [
            label="AJUSTES PARA CÂNCER:\n- Preferir HBPM por 6 meses\n- Considerar risco de sangramento\n- Acompanhamento mais frequente",
            fillcolor=lightcyan
        ];
        
        // Conexões internas
        pop_decisao -> pop_renal [label="DRC"];
        pop_decisao -> pop_idosos [label="Idoso"];
        pop_decisao -> pop_cancer [label="Câncer"];
        pop_decisao -> pop_normal [label="Sem\najustes"];
        
        pop_renal -> ajuste_renal;
        pop_idosos -> ajuste_idosos;
        pop_cancer -> ajuste_cancer;
    }
```

### 4. Representação de Critérios Diagnósticos Estruturados
```dot
    // Subgráfico para critérios diagnósticos
    subgraph cluster_criterios {
        label="Critérios Diagnósticos";
        style=filled;
        color=lightgrey;
        fontsize=14;
        
        criterios_titulo [
            label="DIAGNÓSTICO DE [CONDIÇÃO]",
            fillcolor="#E6E6FA"
        ];
        
        criterios_a [
            label="Critérios Grupo A (necessários ≥ 2):\n- Critério A1\n- Critério A2\n- Critério A3\n- Critério A4",
            fillcolor="#E6E6FA"
        ];
        
        criterios_b [
            label="Critérios Grupo B (necessário ≥ 1):\n- Critério B1\n- Critério B2",
            fillcolor="#E6E6FA"
        ];
        
        criterios_decisao [
            label="≥2 de A\nE\n≥1 de B?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        
        criterios_positivo [
            label="DIAGNÓSTICO CONFIRMADO",
            fillcolor="#E6E6FA"
        ];
        
        criterios_negativo [
            label="DIAGNÓSTICO EXCLUÍDO",
            fillcolor="#E6E6FA"
        ];
        
        // Conexões
        criterios_titulo -> criterios_a;
        criterios_a -> criterios_b;
        criterios_b -> criterios_decisao;
        criterios_decisao -> criterios_positivo [label="Sim"];
        criterios_decisao -> criterios_negativo [label="Não"];
    }
```

### 5. Representação de Tratamentos Escalonados
```dot
    // Subgráfico para tratamento escalonado
    subgraph cluster_tratamento_escalonado {
        label="Tratamento Escalonado";
        style=filled;
        color=lightgrey;
        fontsize=14;
        
        trat_primeira_linha [
            label="PRIMEIRA LINHA:\n- Medicamento A: dose, via, freq",
            fillcolor=lightcyan
        ];
        
        trat_breakpoint1 [
            label="BREAKPOINT: Reavaliação\napós 1ª linha",
            shape=hexagon,
            fillcolor=lightpink,
            peripheries=2
        ];
        
        trat_decisao1 [
            label="Resposta\nadequada?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        
        trat_segunda_linha [
            label="SEGUNDA LINHA:\n- Medicamento B: dose, via, freq",
            fillcolor=lightcyan
        ];
        
        trat_breakpoint2 [
            label="BREAKPOINT: Reavaliação\napós 2ª linha",
            shape=hexagon,
            fillcolor=lightpink,
            peripheries=2
        ];
        
        trat_decisao2 [
            label="Resposta\nadequada?",
            shape=diamond,
            fillcolor=lightyellow
        ];
        
        trat_terceira_linha [
            label="TERCEIRA LINHA:\n- Medicamento C: dose, via, freq",
            fillcolor=lightcyan
        ];
        
        // Conexões
        trat_primeira_linha -> trat_breakpoint1 [style=dashed];
        trat_breakpoint1 -> trat_decisao1;
        trat_decisao1 -> trat_melhora [label="Sim"];
        trat_decisao1 -> trat_segunda_linha [label="Não"];
        
        trat_segunda_linha -> trat_breakpoint2 [style=dashed];
        trat_breakpoint2 -> trat_decisao2;
        trat_decisao2 -> trat_melhora [label="Sim"];
        trat_decisao2 -> trat_terceira_linha [label="Não"];
    }
```

### 6. Completude da Representação

Certifique-se de representar todos os seguintes elementos:

1. **Todas as perguntas do protocolo (P1-Pn) e seus possíveis resultados**
2. **Todos os escores ou algoritmos de classificação com suas fórmulas ou componentes**
3. **Todos os breakpoints do protocolo completos com parâmetros e critérios de decisão**
4. **Todos os tratamentos e intervenções detalhados**
5. **Todos os critérios de alta/internação/encaminhamento**
6. **Todas as conexões entre decisões e ações**
7. **Todas as condicionais completas e detalhadas**

## Verificação de Qualidade do DOT

Antes de finalizar o DOT, realize as seguintes verificações:

1. **Completude**: Todas as etapas do protocolo estão representadas?
2. **Conectividade**: Todos os nós estão conectados adequadamente sem pontas soltas?
3. **Clareza**: As condicionais nas conexões estão claras e objetivas?
4. **Breakpoints**: Todos os breakpoints têm critérios de decisão bem definidos?
5. **Organização**: Os subgráficos estão organizados de forma lógica e sequencial?
6. **Legibilidade**: Os rótulos são concisos mas informativos?
7. **Consistência Visual**: A padronização de cores e formas é consistente?

## Observações Finais

- O arquivo DOT deve ser completo e diretamente utilizável em ferramentas como Graphviz
- Evite abreviações não padronizadas
- Mantenha uma organização visual hierárquica clara
- Todas as informações textuais devem estar em português do Brasil
- Garantir que o fluxograma seja fiel à estrutura lógica do protocolo original
- Para protocolos muito extensos, considere dividir em múltiplos arquivos DOT por módulo

Este prompt guiará a criação de um fluxograma DOT completo, detalhado e estruturado para representação visual de protocolos médicos algoritmizados, permitindo visualização e validação precisas de todos os fluxos decisórios clínicos.