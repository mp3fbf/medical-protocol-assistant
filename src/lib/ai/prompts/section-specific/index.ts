/**
 * Standard section definitions for medical protocols.
 * Used to guide AI generation for each of the 13 sections.
 */
import type { StandardSectionDefinition } from "@/types/ai-generation";

export const SECTION_DEFINITIONS: StandardSectionDefinition[] = [
  {
    sectionNumber: 1,
    titlePT: "Identificação do Protocolo",
    description:
      "Metadados do protocolo, incluindo código, título, origem, datas de elaboração, última revisão e próxima revisão programada, e âmbito de aplicação.",
    contentSchemaDescription:
      "Objeto JSON com campos: 'codigoProtocolo' (string), 'tituloCompleto' (string), 'versao' (string), 'origemOrganizacao' (string), 'dataElaboracao' (string YYYY-MM-DD), 'dataUltimaRevisao' (string YYYY-MM-DD), 'dataProximaRevisao' (string YYYY-MM-DD), 'ambitoAplicacao' (string).",
    example: {
      codigoProtocolo: "BRAD-001",
      tituloCompleto: "Protocolo de Atendimento à Bradiarritmia",
      versao: "1.0",
      origemOrganizacao: "Sancta Maggiore / Prevent Senior",
      dataElaboracao: "2024-01-15",
      dataUltimaRevisao: "2024-01-15",
      dataProximaRevisao: "2026-01-15",
      ambitoAplicacao:
        "Pronto-atendimentos da rede Sancta Maggiore/Prevent Senior.",
    },
  },
  {
    sectionNumber: 2,
    titlePT: "Ficha Técnica e Responsabilidades",
    description:
      "Lista de autores, revisores (com especialidade) e aprovadores (com cargo) do protocolo.",
    contentSchemaDescription:
      "Objeto JSON com campos: 'autores' (array de strings com nomes completos), 'revisores' (array de objetos com 'nome' (string) e 'especialidade' (string)), 'aprovadores' (array de objetos com 'nome' (string) e 'cargo' (string)).",
    example: {
      autores: ["Dr. João da Silva", "Dra. Maria Oliveira"],
      revisores: [{ nome: "Dr. Carlos Pereira", especialidade: "Cardiologia" }],
      aprovadores: [{ nome: "Dr. Ana Souza", cargo: "Diretora de Qualidade" }],
    },
  },
  {
    sectionNumber: 3,
    titlePT: "Definição, Epidemiologia e Conceitos Fundamentais",
    description:
      "Definição clara da condição médica, dados epidemiológicos relevantes (incidência, prevalência, fatores de risco) e conceitos chave para o entendimento do protocolo.",
    contentSchemaDescription:
      "Objeto JSON com campos: 'definicao' (string), 'epidemiologia' (string), 'conceitosChave' (array de strings ou objetos com 'conceito' e 'descricao').",
    example: {
      definicao:
        "A bradiarritmia é definida como uma frequência cardíaca inferior a 60 batimentos por minuto em adultos, acompanhada de sintomas ou potencial de instabilidade hemodinâmica.",
      epidemiologia:
        "A incidência de bradiarritmias sintomáticas aumenta com a idade, afetando predominantemente a população idosa. Fatores de risco incluem doença cardíaca estrutural, distúrbios eletrolíticos e uso de certos medicamentos.",
      conceitosChave: [
        {
          conceito: "Bradicardia Sinusal",
          descricao: "Ritmo sinusal com FC < 60 bpm.",
        },
        {
          conceito: "Bloqueio Atrioventricular (BAV)",
          descricao:
            "Distúrbio na condução do impulso elétrico dos átrios para os ventrículos.",
        },
      ],
    },
  },
  {
    sectionNumber: 4,
    titlePT: "Critérios de Inclusão e Exclusão",
    description:
      "Critérios objetivos para determinar quais pacientes se enquadram neste protocolo e quais devem ser excluídos ou seguir um protocolo alternativo.",
    contentSchemaDescription:
      "Objeto JSON com 'inclusao' (array de strings descrevendo critérios objetivos) e 'exclusao' (array de strings descrevendo critérios objetivos).",
    example: {
      inclusao: [
        "Pacientes adultos (>18 anos) com frequência cardíaca < 50 bpm sintomáticos (ex: síncope, pré-síncope, dispneia, dor torácica, hipotensão).",
        "ECG confirmando bradicardia sinusal, pausa sinusal, BAV de 2º grau Mobitz II, BAV de 3º grau (BAVT).",
      ],
      exclusao: [
        "Pacientes pediátricos (<18 anos).",
        "Bradicardia fisiológica em atletas assintomáticos.",
        "Bradicardia induzida por medicamentos em contexto de intoxicação aguda (protocolo específico de toxicologia deve ser seguido).",
        "Pacientes com marcapasso definitivo normofuncionante.",
      ],
    },
  },
  {
    sectionNumber: 5,
    titlePT: "Avaliação Inicial e Classificação de Risco/Gravidade",
    description:
      "Passos para a avaliação inicial do paciente, incluindo anamnese direcionada, exame físico e critérios para classificação de risco ou gravidade da condição (ex: estável vs. instável).",
    contentSchemaDescription:
      "Objeto JSON com campos: 'anamneseFocada' (array de strings com pontos chave da anamnese), 'exameFisicoRelevante' (array de strings com achados importantes), 'criteriosRiscoGravidade' (array de objetos com 'criterio' (string), 'descricao' (string), e 'limiarNumericoOuEstado' (string/number, se aplicável)).",
    example: {
      anamneseFocada: [
        "Início, duração e frequência dos sintomas (síncope, pré-síncope, tontura, dispneia, dor torácica).",
        "Presença de comorbidades (DAC, IC, HAS, DM, doença tireoidiana).",
        "Uso de medicamentos bradicardizantes (beta-bloqueadores, bloqueadores de canal de cálcio, digitálicos, amiodarona).",
        "Histórico de doença cardíaca prévia ou cirurgias cardíacas.",
      ],
      exameFisicoRelevante: [
        "Avaliação do nível de consciência (Escala de Coma de Glasgow).",
        "Sinais vitais completos: Frequência Cardíaca (FC), Pressão Arterial (PA), Frequência Respiratória (FR), Saturação de Oxigênio (SatO2), Temperatura.",
        "Avaliação da perfusão periférica (tempo de enchimento capilar, pulsos, coloração da pele).",
        "Ausculta cardíaca e pulmonar.",
        "Presença de sinais de insuficiência cardíaca (estase jugular, edema de membros inferiores, crepitações pulmonares).",
      ],
      criteriosRiscoGravidade: [
        {
          criterio: "Instabilidade Hemodinâmica",
          descricao:
            "Presença de hipotensão (PAS < 90 mmHg), sinais de choque (pele fria, úmida, alteração do nível de consciência), dor torácica isquêmica, insuficiência cardíaca aguda.",
          limiarNumericoOuEstado:
            "PAS < 90 mmHg ou presença de sinais de choque",
        },
        {
          criterio: "Sintomas Graves",
          descricao:
            "Síncope, pré-síncope recorrente, dispneia limitante, alteração aguda do estado mental atribuível à bradicardia.",
          limiarNumericoOuEstado: "Presença de sintomas graves",
        },
      ],
    },
  },
  {
    sectionNumber: 6,
    titlePT: "Diagnóstico",
    description:
      "Critérios diagnósticos detalhados, exames complementares recomendados (laboratoriais, imagem) com seus valores de referência ou achados esperados, e diagnóstico diferencial relevante.",
    contentSchemaDescription:
      "Objeto JSON com: 'confirmacaoDiagnostica' (texto narrativo sobre como confirmar), 'examesComplementares' (array de objetos com 'nomeExame' (string), 'achadosEsperadosOuValoresReferencia' (string), 'indicacaoClinica' (string)), 'diagnosticoDiferencial' (array de strings).",
    example: {
      confirmacaoDiagnostica:
        "O diagnóstico de bradiarritmia é primariamente eletrocardiográfico, correlacionado com os sintomas clínicos. A identificação do tipo específico de bradiarritmia (ex: disfunção sinusal, BAV) é crucial para o manejo.",
      examesComplementares: [
        {
          nomeExame: "Eletrocardiograma (ECG) de 12 derivações",
          achadosEsperadosOuValoresReferencia:
            "FC < 60 bpm. Identificar ritmo (sinusal, juncional, idioventricular), presença e tipo de BAV, pausas, QT.",
          indicacaoClinica: "Obrigatório em todos os pacientes com suspeita.",
        },
        {
          nomeExame: "Eletrólitos séricos (Na, K, Ca, Mg)",
          achadosEsperadosOuValoresReferencia:
            "Avaliar distúrbios eletrolíticos que podem causar ou exacerbar bradicardia (ex: hipercalemia). Valores de referência institucionais.",
          indicacaoClinica: "Rotina na avaliação inicial.",
        },
        {
          nomeExame: "Função tireoidiana (TSH, T4 livre)",
          achadosEsperadosOuValoresReferencia:
            "Avaliar hipotireoidismo como causa de bradicardia. Valores de referência institucionais.",
          indicacaoClinica: "Considerar em pacientes sem causa óbvia.",
        },
        {
          nomeExame: "Marcadores de necrose miocárdica (Troponina)",
          achadosEsperadosOuValoresReferencia:
            "Elevação sugere isquemia miocárdica associada. Valores de referência institucionais.",
          indicacaoClinica: "Se houver suspeita de síndrome coronariana aguda.",
        },
      ],
      diagnosticoDiferencial: [
        "Bradicardia fisiológica (atletas).",
        "Hipotireoidismo.",
        "Hipotermia.",
        "Efeito de medicamentos.",
        "Distúrbios eletrolíticos.",
        "Síndrome coronariana aguda.",
        "Aumento da pressão intracraniana.",
      ],
    },
  },
  {
    sectionNumber: 7,
    titlePT: "Tratamento",
    description:
      "Abordagem terapêutica completa, incluindo tratamento não medicamentoso e medicamentoso. Para medicamentos, detalhar: nome, dose, via, frequência e duração. Incluir tabelas de medicamentos se apropriado.",
    contentSchemaDescription:
      "Objeto JSON com: 'medidasGerais' (array de strings), 'tratamentoPacientesInstaveis' (objeto com 'medicamentos' (array de objetos MedicationPromptInput) e 'intervencoesNaoFarmacologicas' (array de strings)), 'tratamentoPacientesEstaveis' (objeto com 'conduta' (string) e 'medicamentosConsiderar' (array de objetos MedicationPromptInput, opcional)).",
    example: {
      medidasGerais: [
        "Monitorização cardíaca contínua (ECG, SpO2, PA não invasiva).",
        "Acesso venoso periférico calibroso.",
        "Oferta de oxigênio suplementar se SatO2 < 94% ou desconforto respiratório.",
        "Corrigir causas reversíveis (ex: suspender medicamentos bradicardizantes, corrigir distúrbios eletrolíticos).",
      ],
      tratamentoPacientesInstaveis: {
        medicamentos: [
          {
            name: "Atropina",
            dose: "1 mg",
            route: "IV em bolus",
            frequency: "Repetir a cada 3-5 minutos se necessário",
            duration: "Dose máxima total de 3 mg",
            notes:
              "Primeira linha para bradicardia sintomática. Menos eficaz em BAV de alto grau (Mobitz II, BAVT infra-hissiano).",
          },
          {
            name: "Dopamina (infusão)",
            dose: "5-20 mcg/kg/min",
            route: "IV contínua",
            frequency: "Titular conforme resposta hemodinâmica",
            duration: "Até estabilização ou terapia definitiva",
            notes:
              "Alternativa se atropina ineficaz. Titular para FC e PA adequadas.",
          },
          {
            name: "Adrenalina (infusão)",
            dose: "2-10 mcg/min",
            route: "IV contínua",
            frequency: "Titular conforme resposta hemodinâmica",
            duration: "Até estabilização ou terapia definitiva",
            notes: "Alternativa se atropina ineficaz, especialmente em choque.",
          },
        ],
        intervencoesNaoFarmacologicas: [
          "Estimulação cardíaca transcutânea (Marcapasso Transcutâneo - MPT): Indicar se atropina e drogas vasoativas ineficazes ou contraindicadas. Iniciar com frequência de 60-80 bpm e aumentar a corrente até captura ventricular. Analgesia/sedação pode ser necessária.",
          "Estimulação cardíaca transvenosa (Marcapasso Transvenoso - MPTV): Considerar se MPT ineficaz ou necessário por tempo prolongado, como ponte para marcapasso definitivo. Requer especialista.",
        ],
      },
      tratamentoPacientesEstaveis: {
        conduta:
          "Observação clínica, monitorização. Investigar e tratar causas reversíveis. Avaliar necessidade de marcapasso definitivo em conjunto com cardiologista.",
        medicamentosConsiderar: [
          {
            name: "Teofilina/Aminofilina",
            dose: "100-200mg",
            route: "Oral ou IV",
            frequency: "2-3 vezes ao dia",
            duration: "Conforme orientação do especialista",
            notes:
              "Considerar em casos selecionados de disfunção sinusal ou BAV, após avaliação especializada.",
          },
        ],
      },
    },
  },
  {
    sectionNumber: 8,
    titlePT: "Manejo de Complicações",
    description:
      "Identificação e manejo das complicações mais comuns ou graves associadas à condição ou ao tratamento proposto.",
    contentSchemaDescription:
      "Array de objetos, cada um com 'complicacao' (string), 'identificacaoSinaisSintomas' (array de strings), e 'manejoRecomendado' (texto narrativo ou array de strings detalhando as ações).",
    example: [
      {
        complicacao: "Assistolia ou Atividade Elétrica Sem Pulso (AESP)",
        identificacaoSinaisSintomas: [
          "Ausência de pulso central palpável",
          "Perda de consciência",
          "ECG mostrando linha reta (assistolia) ou atividade elétrica organizada sem pulso (AESP)",
        ],
        manejoRecomendado:
          "Iniciar RCP imediata conforme protocolo de ACLS. Administrar adrenalina 1mg IV a cada 3-5 minutos. Investigar e tratar causas reversíveis (5H e 5T).",
      },
      {
        complicacao: "Dor ou Desconforto com Marcapasso Transcutâneo",
        identificacaoSinaisSintomas: [
          "Relato de dor intensa pelo paciente",
          "Contrações musculares esqueléticas significativas",
          "Agitação",
        ],
        manejoRecomendado:
          "Administrar analgesia (ex: morfina IV) e/ou sedação leve (ex: midazolam IV em pequenas doses tituladas). Otimizar posicionamento dos eletrodos. Considerar MPTV se tolerância ao MPT for baixa.",
      },
    ],
  },
  {
    sectionNumber: 9,
    titlePT: "Critérios de Internação, Alta ou Encaminhamento",
    description:
      "Critérios objetivos para decidir pela internação hospitalar, alta do pronto-atendimento, ou encaminhamento para especialista/outra unidade.",
    contentSchemaDescription:
      "Objeto JSON com: 'criteriosInternacao' (array de strings), 'criteriosAltaHospitalarPA' (array de strings), 'criteriosEncaminhamentoEspecialista' (array de objetos com 'especialidade' (string), 'motivo' (string), 'prazoRecomendado' (string)).",
    example: {
      criteriosInternacao: [
        "Bradicardia sintomática persistente apesar do tratamento inicial.",
        "Instabilidade hemodinâmica.",
        "BAV de alto grau (Mobitz II, BAVT) ou pausas sinusais significativas, mesmo que temporariamente estáveis.",
        "Necessidade de marcapasso transvenoso ou definitivo.",
        "Isquemia miocárdica associada.",
        "Síncope de origem indeterminada com bradicardia ao ECG.",
      ],
      criteriosAltaHospitalarPA: [
        "Paciente assintomático com bradicardia leve e causa reversível identificada e tratada (ex: suspensão de medicamento).",
        "Estabilidade hemodinâmica mantida sem necessidade de intervenções farmacológicas ou elétricas.",
        "Ausência de critérios de internação.",
        "Plano de seguimento ambulatorial claro e agendado.",
      ],
      criteriosEncaminhamentoEspecialista: [
        {
          especialidade: "Cardiologista / Eletrofisiologista",
          motivo:
            "Avaliação para implante de marcapasso definitivo (ex: BAVT, BAV Mobitz II sintomático, disfunção sinusal sintomática).",
          prazoRecomendado: "Durante a internação ou ambulatorial urgente.",
        },
        {
          especialidade: "Cardiologista",
          motivo: "Seguimento de bradicardia estável ou pós-alta.",
          prazoRecomendado: "Ambulatorial em 7-14 dias.",
        },
      ],
    },
  },
  {
    sectionNumber: 10,
    titlePT: "Monitoramento e Seguimento Pós-Alta",
    description:
      "Recomendações para monitoramento do paciente durante o tratamento e após a alta, incluindo frequência de reavaliações e exames de controle.",
    contentSchemaDescription:
      "Objeto JSON com: 'monitoramentoIntraHospitalarOuPA' (array de strings, se aplicável), 'orientacoesAlta' (array de strings), 'planoSeguimentoAmbulatorial' (array de objetos com 'prazo' (string), 'acaoRecomendada' (string), 'responsavel' (string)).",
    example: {
      monitoramentoIntraHospitalarOuPA: [
        "Monitorização cardíaca contínua até estabilização.",
        "Avaliação seriada de sinais vitais e nível de consciência.",
        "Reavaliação do ECG após intervenções ou se mudança no quadro clínico.",
      ],
      orientacoesAlta: [
        "Informar sobre sinais de alerta para retorno imediato (síncope, tontura intensa, dor torácica, dispneia).",
        "Orientar sobre medicamentos prescritos (dose, horários, efeitos colaterais).",
        "Restrições de atividades, se houver.",
        "Importância da adesão ao seguimento ambulatorial.",
      ],
      planoSeguimentoAmbulatorial: [
        {
          prazo: "7-14 dias pós-alta",
          acaoRecomendada:
            "Consulta com cardiologista para reavaliação clínica e eletrocardiográfica.",
          responsavel: "Paciente/Unidade Básica de Saúde/Cardiologista.",
        },
        {
          prazo: "Conforme indicação do cardiologista",
          acaoRecomendada:
            "Realização de Holter 24h, Teste Ergométrico ou outros exames para estratificação de risco e avaliação da necessidade de marcapasso.",
          responsavel: "Cardiologista.",
        },
      ],
    },
  },
  {
    sectionNumber: 11,
    titlePT: "Considerações Especiais",
    description:
      "Adaptações do protocolo para populações específicas (ex: idosos, gestantes, pacientes pediátricos, comorbidades relevantes) ou situações particulares. Deve incluir considerações geriátricas sempre que pertinente.",
    contentSchemaDescription:
      "Objeto JSON onde cada chave é uma população/condição especial (ex: 'idosos', 'gestantes', 'insuficienciaRenal', 'atletas') e o valor é um objeto com 'descricaoGeral' (string) e 'recomendacoesEspecificas' (array de strings).",
    example: {
      idosos: {
        descricaoGeral:
          "Pacientes idosos frequentemente apresentam múltiplas comorbidades e polifarmácia, aumentando o risco de bradicardia e suas complicações. A função renal pode estar diminuída, exigindo ajuste de dose de medicamentos.",
        recomendacoesEspecificas: [
          "Avaliar cuidadosamente a lista de medicamentos em uso.",
          "Considerar doses iniciais menores de atropina (ex: 0.5 mg) e titular com cautela.",
          "Maior risco de hipotensão e efeitos colaterais de medicamentos.",
          "Limiar mais baixo para investigação de síncope.",
          "A avaliação da necessidade de marcapasso deve considerar a fragilidade e a expectativa de vida.",
        ],
      },
      gestantes: {
        descricaoGeral:
          "Bradicardia sintomática em gestantes é rara. O manejo deve considerar a segurança fetal.",
        recomendacoesEspecificas: [
          "Atropina é considerada segura na gestação se indicada.",
          "Evitar drogas com potencial teratogênico conhecido, se possível.",
          "Monitorização fetal contínua durante o tratamento de bradicardias instáveis.",
          "Consulta com obstetra e cardiologista é fundamental.",
        ],
      },
      atletas: {
        descricaoGeral:
          "Bradicardia sinusal assintomática é comum em atletas bem condicionados e geralmente não requer tratamento.",
        recomendacoesEspecificas: [
          "Investigar apenas se houver sintomas, histórico familiar de morte súbita, ou achados anormais no ECG além da bradicardia.",
          "Diferenciar de bradicardia patológica.",
        ],
      },
    },
  },
  {
    sectionNumber: 12,
    titlePT: "Indicadores de Qualidade Assistencial",
    description:
      "Indicadores para monitorar a adesão e a efetividade do protocolo (ex: tempo porta-agulha, percentual de pacientes com controle adequado da condição em X horas).",
    contentSchemaDescription:
      "Array de objetos, cada um com 'nomeIndicador' (string), 'numeradorDefinicao' (string), 'denominadorDefinicao' (string), 'metaPercentualOuValor' (string), 'fonteDadosPrimaria' (string), 'observacoesMetodologicas' (string, opcional).",
    example: [
      {
        nomeIndicador:
          "Percentual de pacientes com bradicardia sintomática instável recebendo atropina em até 5 minutos da identificação.",
        numeradorDefinicao:
          "Número de pacientes com bradicardia sintomática instável que receberam atropina IV em até 5 minutos da identificação da instabilidade.",
        denominadorDefinicao:
          "Número total de pacientes com bradicardia sintomática instável atendidos.",
        metaPercentualOuValor: "> 90%",
        fonteDadosPrimaria: "Prontuário Eletrônico (registros de horário).",
        observacoesMetodologicas:
          "Considerar início do tempo a partir do primeiro registro de PAS < 90 mmHg ou alteração de consciência atribuída à bradicardia.",
      },
      {
        nomeIndicador:
          "Tempo médio para início de marcapasso transcutâneo em pacientes com bradicardia instável refratária à atropina.",
        numeradorDefinicao:
          "Somatório dos tempos (minutos) entre a identificação da refratariedade à atropina e o início do MPT.",
        denominadorDefinicao:
          "Número de pacientes com bradicardia instável refratária à atropina que necessitaram de MPT.",
        metaPercentualOuValor: "< 15 minutos",
        fonteDadosPrimaria: "Prontuário Eletrônico.",
      },
    ],
  },
  {
    sectionNumber: 13,
    titlePT: "Referências Bibliográficas",
    description:
      "Lista das principais fontes bibliográficas utilizadas na elaboração do protocolo (diretrizes, artigos científicos). Formato ABNT NBR 6023 ou Vancouver, conforme padrão da instituição (especificar qual).",
    contentSchemaDescription:
      "Objeto com 'formatoUtilizado' (string, ex: 'ABNT NBR 6023') e 'referencias' (array de strings, cada string sendo uma referência completa e formatada).",
    example: {
      formatoUtilizado: "ABNT NBR 6023 (adaptado para exemplos concisos)",
      referencias: [
        "KUSUMOTO, F. M. et al. 2018 ACC/AHA/HRS Guideline on the Evaluation and Management of Patients With Bradycardia and Cardiac Conduction Delay. Circulation, v. 140, n. 8, p. e382-e482, 2019.",
        "TRACHY, G. L. et al. Bradycardia. In: Tintinalli's Emergency Medicine: A Comprehensive Study Guide. 9th ed. McGraw-Hill, 2020. Chapter 49.",
        "SOCIEDADE BRASILEIRA DE CARDIOLOGIA. Diretrizes Brasileiras de Bradiarritmias e Estimulação Cardíaca Artificial. Arq Bras Cardiol, v. 111, n. 4, supl. 1, p. 1-60, 2018.",
      ],
    },
  },
];
