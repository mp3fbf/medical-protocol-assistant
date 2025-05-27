/**
 * Test Fixtures for Protocols and AI interactions.
 * Provides mock data for testing AI prompt generation, AI content generation,
 * and validation logic.
 */
import type {
  AIResearchData,
  AIResearchFinding,
  AIGenerationContext,
} from "@/lib/ai/types";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";

export const mockMedicalCondition = "Testitis Aguda";

export const mockResearchFindings: AIResearchFinding[] = [
  {
    id: "finding-001",
    source: "PubMed-12345",
    findingType: "diagnostic_criteria",
    extractedText: "Febre alta (>38.5°C) é um critério major para Testitis.",
    summary: "Febre alta é critério diagnóstico.",
    objectiveCriteria: {
      name: "Febre Alta",
      threshold: ">38.5°C",
      unit: "°C",
    },
    metadata: { url: "http://pubmed.example.com/12345" },
  },
  {
    id: "finding-002",
    source: "SciELO-67890",
    findingType: "treatment_protocol",
    extractedText:
      "Tratamento inclui Testamycin 500mg IV a cada 12 horas por 7 dias.",
    summary: "Testamycin é usado no tratamento.",
    objectiveCriteria: {
      medication: "Testamycin",
      dose: "500mg",
      route: "IV",
      frequency: "a cada 12 horas",
      duration: "7 dias",
    },
    metadata: { url: "http://scielo.example.com/67890" },
  },
  {
    id: "finding-003",
    source: "Guideline-ABC",
    findingType: "geriatric_consideration",
    extractedText: "Em idosos, reduzir dose de Testamycin para 250mg.",
    summary: "Ajuste de dose em idosos para Testamycin.",
    objectiveCriteria: {
      condition: "Idosos (>65 anos)",
      adjustment: "Reduzir dose de Testamycin para 250mg",
    },
    metadata: { document: "Diretriz Nacional de Testites" },
  },
];

export const mockResearchData: AIResearchData = {
  query: mockMedicalCondition,
  findings: mockResearchFindings,
  summary: "Pesquisa inicial sobre Testitis Aguda.",
  timestamp: new Date().toISOString(),
};

export const mockAIGenerationContext: AIGenerationContext = {
  medicalCondition: mockMedicalCondition,
  targetAudience: "Médicos de Pronto Atendimento",
  researchData: mockResearchData,
};

export const mockSection1Content: ProtocolSectionData["content"] = {
  codigoProtocolo: "TEST-001",
  tituloCompleto: `Protocolo de Atendimento à ${mockMedicalCondition}`,
  versao: "1.0",
  origemOrganizacao: "Hospital Teste",
  dataElaboracao: "2024-01-01",
  dataUltimaRevisao: "2024-01-01",
  dataProximaRevisao: "2026-01-01",
  ambitoAplicacao: "Pronto Atendimento Adulto",
};

export const mockSingleSectionData: ProtocolSectionData = {
  sectionNumber: 1,
  title: "Identificação do Protocolo",
  content: mockSection1Content,
};

export const mockFullProtocolContent: ProtocolFullContent = {};
SECTION_DEFINITIONS.forEach((def) => {
  mockFullProtocolContent[def.sectionNumber.toString()] = {
    sectionNumber: def.sectionNumber,
    title: def.titlePT,
    content:
      def.sectionNumber === 1
        ? mockSection1Content
        : (def.example ?? `Conteúdo de exemplo para ${def.titlePT}.`),
  };
});

export const mockFlowchartData: FlowchartDefinition = {
  nodes: [
    {
      id: "node-1",
      type: "start",
      position: { x: 50, y: 50 },
      data: { type: "start", title: "Início do Protocolo" },
    },
    {
      id: "node-2",
      type: "decision",
      position: { x: 50, y: 150 },
      data: {
        type: "decision",
        title: "Sintomas Graves?",
        criteria: "Presença de febre alta ou instabilidade",
      },
    },
    {
      id: "node-3",
      type: "action",
      position: { x: -50, y: 250 },
      data: { type: "action", title: "Observar", actions: ["Monitorar SV"] },
    },
    {
      id: "node-4",
      type: "medication",
      position: { x: 150, y: 250 },
      data: {
        type: "medication",
        title: "Administrar Testamycin",
        medications: [
          {
            name: "Testamycin",
            dose: "500mg",
            route: "IV",
            frequency: "q12h",
          },
        ],
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2", type: "default" },
    {
      id: "e2-3",
      source: "node-2",
      target: "node-3",
      type: "default",
      label: "Não",
    },
    {
      id: "e2-4",
      source: "node-2",
      target: "node-4",
      type: "default",
      label: "Sim",
    },
  ],
};

export const mockRelevantTextSectionsForFlowchart: Pick<
  ProtocolFullContent,
  string
> = {
  "5": {
    sectionNumber: 5,
    title: "Avaliação Inicial",
    content: "Se paciente instável, iniciar X. Se estável, observar.",
  },
  "7": {
    sectionNumber: 7,
    title: "Tratamento",
    content: {
      tratamentoPacientesInstaveis: {
        medicamentos: [
          {
            name: "Testamycin",
            dose: "500mg",
            route: "IV",
            frequency: "q12h",
          },
        ],
      },
    },
  },
};
