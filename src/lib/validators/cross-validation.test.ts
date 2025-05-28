import { describe, it, expect } from "vitest";
import { validateCrossConsistency } from "@/lib/validators/cross-validation";
import type {
  ProtocolFullContent /* ProtocolSectionData as _ProtocolSectionData */,
} from "@/types/protocol"; // _ProtocolSectionData marked as unused
import type { FlowchartDefinition, CustomFlowNode } from "@/types/flowchart";
import { mockFullProtocolContent } from "../../../tests/fixtures/protocols";

// Helper to create a simplified text section
const createTextSection = (
  sectionNumber: number,
  title: string,
  text: string,
  existingContent: ProtocolFullContent = {},
): ProtocolFullContent => ({
  ...existingContent,
  [sectionNumber.toString()]: { sectionNumber, title, content: text },
});

const createMedicationSection = (
  medsInstaveis: any[] = [],
  medsEstaveis: any[] = [],
  existingContent: ProtocolFullContent = {},
): ProtocolFullContent => ({
  ...existingContent,
  "7": {
    sectionNumber: 7,
    title: "Tratamento",
    content: {
      tratamentoPacientesInstaveis: { medicamentos: medsInstaveis },
      tratamentoPacientesEstaveis: { medicamentosConsiderar: medsEstaveis },
    },
  },
});

describe("Cross-Validation (Text vs. Flowchart)", () => {
  it("should return no issues for a consistent protocol and flowchart", async () => {
    let consistentProtocol: ProtocolFullContent = {};
    consistentProtocol = createTextSection(
      5,
      "Avaliação",
      "Se paciente estável (PAS > 90mmHg), observar. Se instável (PAS <= 90mmHg), iniciar fluidos.",
      consistentProtocol,
    );
    consistentProtocol = createMedicationSection(
      [{ name: "Adrenalina", dose: "1mg", route: "IV", frequency: "STAT" }],
      [],
      consistentProtocol,
    );

    const consistentFlowchart: FlowchartDefinition = {
      nodes: [
        {
          id: "n1",
          type: "decision",
          position: { x: 0, y: 0 },
          data: {
            type: "decision",
            title: "Estado do Paciente",
            criteria:
              "Paciente estável (PAS > 90mmHg) ou instável (PAS <= 90mmHg)",
          },
        },
        {
          id: "n2",
          type: "action",
          position: { x: -100, y: 100 },
          data: { type: "action", title: "Observar" },
        },
        {
          id: "n3",
          type: "action",
          position: { x: 100, y: 100 },
          data: { type: "action", title: "Iniciar Fluidos" },
        },
        {
          id: "n4",
          type: "medication",
          position: { x: 0, y: 200 },
          data: {
            type: "medication",
            title: "Medicação de Emergência",
            medications: [
              {
                name: "Adrenalina",
                dose: "1mg",
                route: "IV",
                frequency: "STAT",
              },
            ],
          },
        },
      ] as CustomFlowNode[],
      edges: [
        {
          id: "e1-2",
          source: "n1",
          target: "n2",
          label: "Estável (PAS > 90mmHg)",
        },
        {
          id: "e1-3",
          source: "n1",
          target: "n3",
          label: "Instável (PAS <= 90mmHg)",
        },
      ],
    };

    const issues = await validateCrossConsistency(
      consistentProtocol,
      consistentFlowchart,
    );
    const criticalMissingIssues = issues.filter(
      (issue) =>
        issue.ruleId === "CROSS_TEXT_DECISION_MISSING_IN_FLOWCHART" ||
        issue.ruleId === "CROSS_FLOWCHART_DECISION_MISSING_IN_TEXT" ||
        issue.ruleId === "CROSS_TEXT_MED_MISSING_IN_FLOWCHART" ||
        issue.ruleId === "CROSS_FLOWCHART_MED_MISSING_IN_TEXT",
    );
    expect(
      criticalMissingIssues,
      `Unexpected critical issues: ${JSON.stringify(criticalMissingIssues)}`,
    ).toEqual([]);
  });

  it("should warn if textual decision is missing in flowchart", async () => {
    const protocol: ProtocolFullContent = createTextSection(
      5,
      "Avaliação",
      "Se febre alta (>38.5C), considerar antibiótico.",
    );
    const flowchart: FlowchartDefinition = { nodes: [], edges: [] };

    const issues = await validateCrossConsistency(protocol, flowchart);
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "CROSS_TEXT_DECISION_MISSING_IN_FLOWCHART",
        severity: "warning",
        sectionNumber: 5,
        details: expect.objectContaining({
          textualDecision: expect.stringMatching(
            /Se febre alta.*\(>38\.5C\).*/i,
          ),
          keywords: expect.arrayContaining(["febre", "alta", ">38.5c"]),
        }),
      }),
    );
  });

  it("should warn if textual medication is missing in flowchart", async () => {
    const protocol: ProtocolFullContent = createMedicationSection([
      { name: "Dipirona", dose: "1g", route: "IV", frequency: "SOS" },
    ]);
    const flowchart: FlowchartDefinition = {
      nodes: [
        {
          id: "m1",
          type: "medication",
          position: { x: 0, y: 0 },
          data: { type: "medication", title: "Analgesia", medications: [] },
        },
      ] as CustomFlowNode[],
      edges: [],
    };

    const issues = await validateCrossConsistency(protocol, flowchart);
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "CROSS_TEXT_MED_MISSING_IN_FLOWCHART",
        details: { medicationName: "Dipirona" },
      }),
    );
  });

  it("should warn if flowchart decision criteria is missing in text", async () => {
    const protocol: ProtocolFullContent = createTextSection(
      5,
      "Avaliação",
      "Avaliar o estado geral do paciente.",
    );
    const flowchart: FlowchartDefinition = {
      nodes: [
        {
          id: "d1",
          type: "decision",
          position: { x: 0, y: 0 },
          data: {
            type: "decision",
            title: "Risco de Choque",
            criteria: "Sinais de hipoperfusão e taquicardia",
          },
        },
      ] as CustomFlowNode[],
      edges: [],
    };

    const issues = await validateCrossConsistency(protocol, flowchart);
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "CROSS_FLOWCHART_DECISION_MISSING_IN_TEXT",
        details: expect.objectContaining({
          criteria: "Sinais de hipoperfusão e taquicardia",
        }),
      }),
    );
  });

  it("should warn if flowchart medication is missing in text", async () => {
    const protocol: ProtocolFullContent = createMedicationSection([]);
    const flowchart: FlowchartDefinition = {
      nodes: [
        {
          id: "m1",
          type: "medication",
          position: { x: 0, y: 0 },
          data: {
            type: "medication",
            title: "Antibióticos",
            medications: [
              { name: "Ceftriaxona", dose: "2g", route: "IV", frequency: "OD" },
            ],
          },
        },
      ] as CustomFlowNode[],
      edges: [],
    };
    const issues = await validateCrossConsistency(protocol, flowchart);
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "CROSS_FLOWCHART_MED_MISSING_IN_TEXT",
        details: expect.objectContaining({ medicationName: "Ceftriaxona" }),
      }),
    );
  });

  it("should return warning if flowchart is missing for cross-validation", async () => {
    const protocol = mockFullProtocolContent;
    const issues = await validateCrossConsistency(protocol, undefined);
    expect(issues).toEqual([
      expect.objectContaining({ ruleId: "CROSS_FLOWCHART_MISSING" }),
    ]);
  });

  it("should correctly identify matching textual decisions in flowchart criteria (keywords based)", async () => {
    const protocol: ProtocolFullContent = createTextSection(
      5,
      "Avaliação",
      "Critério para internação: Glasgow < 13 ou Confusão Mental significativa. Se presente, seguir via crítica.",
    );
    const flowchart: FlowchartDefinition = {
      nodes: [
        {
          id: "n1",
          type: "decision",
          position: { x: 0, y: 0 },
          data: {
            type: "decision",
            title: "Nível de Consciência",
            criteria: "Glasgow < 13 ou Confusão Mental significativa",
          },
        },
      ] as CustomFlowNode[],
      edges: [],
    };
    const issues = await validateCrossConsistency(protocol, flowchart);
    const decisionMissingIssuesRelatedToGlasgow = issues.filter(
      (i) =>
        i.ruleId === "CROSS_TEXT_DECISION_MISSING_IN_FLOWCHART" &&
        (i.details as any)?.textualDecision?.toLowerCase().includes("glasgow"),
    );
    expect(
      decisionMissingIssuesRelatedToGlasgow,
      `Unexpected issues regarding Glasgow: ${JSON.stringify(decisionMissingIssuesRelatedToGlasgow)}`,
    ).toEqual([]);
  });

  it("should correctly identify matching flowchart criteria in textual decisions (keywords based)", async () => {
    const protocol: ProtocolFullContent = createTextSection(
      5,
      "Avaliação",
      "Se o paciente apresentar SatO2 < 92%, deve-se considerar O2 suplementar.",
    );
    const flowchart: FlowchartDefinition = {
      nodes: [
        {
          id: "n1",
          type: "decision",
          position: { x: 0, y: 0 },
          data: {
            type: "decision",
            title: "Saturação de O2",
            criteria: "SatO2 < 92%",
          },
        },
      ] as CustomFlowNode[],
      edges: [],
    };
    const issues = await validateCrossConsistency(protocol, flowchart);
    const criteriaMissingIssues = issues.filter(
      (i) => i.ruleId === "CROSS_FLOWCHART_DECISION_MISSING_IN_TEXT",
    );
    expect(
      criteriaMissingIssues,
      `Unexpected issues: ${JSON.stringify(criteriaMissingIssues)}`,
    ).toEqual([]);
  });
});
