import { describe, it, expect } from "vitest";
import { validateCrossConsistency } from "./cross-validation";
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";

// Helper to create mock protocol content
const createMockProtocolContent = (): ProtocolFullContent => {
  const content: ProtocolFullContent = {};
  for (let i = 1; i <= 13; i++) {
    content[i.toString()] = {
      sectionNumber: i,
      title: `Seção ${i}`,
      content: `Conteúdo da Seção ${i}`,
    };
  }
  // Example decision in text for Section 7 for potential cross-validation
  if (content["7"]) {
    content["7"]!.content = {
      medidasGerais: [],
      tratamentoPacientesInstaveis: {
        medicamentos: [
          {
            name: "Atropina",
            dose: "1mg",
            route: "IV",
            frequency: "Repetir",
            notes: "Se FC < 50 bpm e instável",
          },
        ],
        intervencoesNaoFarmacologicas: [],
      },
      narrativaAdicional:
        "Se paciente apresentar PAS < 90 mmHg, considerar Dopamina.",
    };
  }
  return content;
};

const createMockFlowchartData = (
  hasMatchingDecision = true,
): FlowchartData => ({
  nodes: hasMatchingDecision
    ? [
        {
          id: "node1",
          type: "decision",
          data: { criteria: "PAS < 90 mmHg" },
          position: { x: 0, y: 0 },
        },
        {
          id: "node2",
          type: "action",
          data: { title: "Considerar Dopamina" },
          position: { x: 0, y: 0 },
        },
      ]
    : [
        {
          id: "node1",
          type: "decision",
          data: { criteria: "Febre > 38°C" }, // Mismatching criteria
          position: { x: 0, y: 0 },
        },
      ],
  edges: hasMatchingDecision
    ? [{ id: "edge1", source: "node1", target: "node2", label: "Sim" }]
    : [],
});

describe("validateCrossConsistency", () => {
  it("should return no issues for a consistent protocol and flowchart (placeholder)", () => {
    const protocolContent = createMockProtocolContent();
    const flowchartData = createMockFlowchartData(true); // Consistent
    const issues = validateCrossConsistency(protocolContent, flowchartData);
    // As current implementation of cross-validation rules are placeholders,
    // we expect no issues. This test will need to be updated when rules are implemented.
    expect(issues).toEqual([]);
  });

  it("should return an empty array if flowchart data is not provided", () => {
    const protocolContent = createMockProtocolContent();
    const issues = validateCrossConsistency(protocolContent, undefined);
    expect(issues).toEqual([]);
  });

  // TODO: Add more tests once actual cross-validation rules are implemented.
  // For example:
  // it("should detect a decision point in text not present in flowchart", () => { ... });
  // it("should detect a flowchart decision node not reflected in text", () => { ... });
});
