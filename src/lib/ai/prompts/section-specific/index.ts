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
      "Objeto JSON com campos: 'codigoProtocolo', 'tituloCompleto', 'versao', 'origemOrganizacao', 'dataElaboracao', 'dataUltimaRevisao', 'dataProximaRevisao', 'ambitoAplicacao'. Datas em formato YYYY-MM-DD.",
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
      "Objeto JSON com campos: 'autores' (array de strings), 'revisores' (array de objetos com 'nome' e 'especialidade'), 'aprovadores' (array de objetos com 'nome' e 'cargo').",
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
    contentSchemaDescription: "Texto narrativo conciso e objetivo.",
    example: {
      texto:
        "A bradiarritmia é definida como uma frequência cardíaca inferior a 60 batimentos por minuto em adultos...",
    },
  },
  {
    sectionNumber: 4,
    titlePT: "Critérios de Inclusão e Exclusão",
    description:
      "Critérios objetivos para determinar quais pacientes se enquadram neste protocolo e quais devem ser excluídos ou seguir um protocolo alternativo.",
    contentSchemaDescription:
      "Objeto JSON com 'inclusao' (array de strings/objetos) e 'exclusao' (array de strings/objetos). Critérios devem ser objetivos.",
    example: {
      inclusao: [
        "Pacientes adultos (>18 anos) com frequência cardíaca < 50 bpm sintomáticos.",
        "ECG confirmando bradicardia sinusal ou bloqueio AV.",
      ],
      exclusao: [
        "Pacientes pediátricos.",
        "Bradicardia induzida por beta-bloqueadores em contexto de intoxicação.",
      ],
    },
  },
  {
    sectionNumber: 5,
    titlePT: "Avaliação Inicial e Classificação de Risco/Gravidade",
    description:
      "Passos para a avaliação inicial do paciente, incluindo anamnese direcionada, exame físico e critérios para classificação de risco ou gravidade da condição (ex: estável vs. instável).",
    contentSchemaDescription:
      "Texto narrativo e/ou listas detalhando a avaliação. Pode incluir tabelas de escores, se aplicável. Critérios de risco devem ser explícitos.",
  },
  {
    sectionNumber: 6,
    titlePT: "Diagnóstico",
    description:
      "Critérios diagnósticos detalhados, exames complementares recomendados (laboratoriais, imagem) com seus valores de referência ou achados esperados, e diagnóstico diferencial relevante.",
    contentSchemaDescription:
      "Texto narrativo e listas. Se houver critérios diagnósticos formais (ex: DSM, ACR), devem ser citados e detalhados. Exames com limiares numéricos.",
  },
  {
    sectionNumber: 7,
    titlePT: "Tratamento",
    description:
      "Abordagem terapêutica completa, incluindo tratamento não medicamentoso e medicamentoso. Para medicamentos, detalhar: nome, dose, via, frequência e duração. Incluir tabelas de medicamentos se apropriado.",
    contentSchemaDescription:
      "Texto narrativo, algoritmos de decisão simplificados (se aplicável e representável em texto), e uma lista estruturada de medicamentos (array de objetos com 'nome', 'dose', 'via', 'frequencia', 'duracao', 'observacoes').",
    example: {
      medicamentos: [
        {
          nome: "Atropina",
          dose: "0.5mg a 1mg",
          via: "IV",
          frequencia: "Repetir a cada 3-5 minutos, máximo 3mg",
          observacoes: "Para pacientes com instabilidade hemodinâmica.",
        },
      ],
    },
  },
  {
    sectionNumber: 8,
    titlePT: "Manejo de Complicações",
    description:
      "Identificação e manejo das complicações mais comuns ou graves associadas à condição ou ao tratamento proposto.",
    contentSchemaDescription:
      "Texto narrativo, listando complicações e suas respectivas abordagens de manejo.",
  },
  {
    sectionNumber: 9,
    titlePT: "Critérios de Internação, Alta ou Encaminhamento",
    description:
      "Critérios objetivos para decidir pela internação hospitalar, alta do pronto-atendimento, ou encaminhamento para especialista/outra unidade.",
    contentSchemaDescription:
      "Listas de critérios objetivos para cada desfecho (internação, alta, encaminhamento).",
  },
  {
    sectionNumber: 10,
    titlePT: "Monitoramento e Seguimento Pós-Alta",
    description:
      "Recomendações para monitoramento do paciente durante o tratamento e após a alta, incluindo frequência de reavaliações e exames de controle.",
    contentSchemaDescription: "Texto narrativo e/ou plano de seguimento.",
  },
  {
    sectionNumber: 11,
    titlePT: "Considerações Especiais",
    description:
      "Adaptações do protocolo para populações específicas (ex: idosos, gestantes, pacientes pediátricos, comorbidades relevantes) ou situações particulares. Deve incluir considerações geriátricas sempre que pertinente.",
    contentSchemaDescription:
      "Subseções para cada população especial, detalhando ajustes de dose, contraindicações específicas, ou precauções.",
  },
  {
    sectionNumber: 12,
    titlePT: "Indicadores de Qualidade Assistencial",
    description:
      "Indicadores para monitorar a adesão e a efetividade do protocolo (ex: tempo porta-agulha, percentual de pacientes com controle adequado da condição em X horas).",
    contentSchemaDescription:
      "Lista de indicadores, cada um com: 'nome', 'formulaCalculo', 'meta', 'fonteDados'.",
    example: [
      {
        nome: "Tempo porta-ECG para dor torácica",
        formulaCalculo:
          "Tempo (minutos) da chegada do paciente à realização do ECG",
        meta: "< 10 minutos",
        fonteDados: "Prontuário eletrônico",
      },
    ],
  },
  {
    sectionNumber: 13,
    titlePT: "Referências Bibliográficas",
    description:
      "Lista das principais fontes bibliográficas utilizadas na elaboração do protocolo (diretrizes, artigos científicos). Formato ABNT ou Vancouver, conforme padrão da instituição.",
    contentSchemaDescription:
      "Lista de strings, cada uma representando uma referência formatada.",
    example: [
      "SOBRENOME, N. Título do Artigo. Título do Periódico, Cidade, v. X, n. Y, p. Z-W, Mês Ano.",
      "AMERICAN HEART ASSOCIATION. Guidelines for CPR and ECC. Circulation, 2020.",
    ],
  },
];
