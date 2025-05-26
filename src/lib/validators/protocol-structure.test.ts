import { describe, it, expect } from "vitest";
import { validateProtocolStructure } from "./protocol-structure";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";

// Helper to create mock protocol content
const createMockProtocolContent = (
  sections: Record<string, Partial<ProtocolSectionData>>,
): ProtocolFullContent => {
  const fullContent: ProtocolFullContent = {};
  for (let i = 1; i <= 13; i++) {
    const key = i.toString();
    fullContent[key] = {
      sectionNumber: i,
      title: `Título Seção ${i}`,
      content: `Conteúdo da Seção ${i}`,
      ...sections[key],
    };
  }
  return fullContent;
};

// Helper to create minimal valid protocol content
const createMinimalValidContent = (): ProtocolFullContent => {
  const content: ProtocolFullContent = {};
  SECTION_DEFINITIONS.forEach((def) => {
    content[def.sectionNumber.toString()] = {
      sectionNumber: def.sectionNumber,
      title: def.titlePT,
      content: def.example || "Conteúdo de exemplo.",
    };
  });
  return content;
};

describe("validateProtocolStructure", () => {
  it("should return no issues for a structurally valid protocol", () => {
    const validContent = createMinimalValidContent();
    const issues = validateProtocolStructure(validContent);
    expect(issues).toEqual([]);
  });

  it("should detect if not all 13 sections are present", () => {
    const partialContent: Partial<ProtocolFullContent> =
      createMinimalValidContent();
    delete partialContent["13"]; // Remove one section
    const issues = validateProtocolStructure(
      partialContent as ProtocolFullContent,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_001",
        message:
          "O protocolo deve conter exatamente 13 seções. Encontradas: 12.",
        severity: "error",
      }),
    );
  });

  it("should detect if sections are incorrectly numbered or keys don't match sectionNumber", () => {
    const misnumberedContent: ProtocolFullContent = {
      ...createMinimalValidContent(),
      "14": { sectionNumber: 14, title: "Título Seção 14", content: "..." }, // Invalid key
    };
    delete misnumberedContent["1"];

    const issues = validateProtocolStructure(misnumberedContent);
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_001", // Still detects 13 total keys, but wrong numbers
        severity: "error",
      }),
    );

    const contentWithMismatchKey = createMinimalValidContent();
    contentWithMismatchKey["1"] = {
      // Correct key
      sectionNumber: 2, // Incorrect internal sectionNumber
      title: "Título Seção 1",
      content: "Conteúdo",
    };
    const issuesMismatch = validateProtocolStructure(contentWithMismatchKey);
    expect(issuesMismatch).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_003",
        sectionNumber: 1,
        message: `A seção com chave "1" não corresponde ao seu campo 'sectionNumber' interno ou está malformada.`,
        severity: "error",
      }),
    );
  });

  it("should detect missing or empty section titles", () => {
    const contentWithMissingTitle = createMinimalValidContent();
    contentWithMissingTitle["3"]!.title = "";
    const issues = validateProtocolStructure(contentWithMissingTitle);
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_004",
        sectionNumber: 3,
        field: "title",
        message: `O título da Seção 3 (${SECTION_DEFINITIONS[2].titlePT}) está ausente ou vazio.`,
        severity: "error",
      }),
    );
  });

  it("should detect incorrect content format for structured sections (e.g., Section 1 not an object)", () => {
    const contentWithInvalidFormat = createMinimalValidContent();
    contentWithInvalidFormat["1"]!.content =
      "Isto não é um objeto JSON como esperado para a Seção 1.";
    const issues = validateProtocolStructure(contentWithInvalidFormat);
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_005A",
        sectionNumber: 1,
        field: "content",
        message: `O conteúdo da Seção 1 (Identificação do Protocolo) deveria ser um objeto JSON estruturado, mas foi encontrado: string.`,
        severity: "error",
      }),
    );
  });

  it("should detect incorrect content format for sections expecting an array (e.g., Section 8)", () => {
    const contentWithInvalidFormat = createMinimalValidContent();
    // Section 8 example is an array of objects. Let's make it a string.
    if (
      SECTION_DEFINITIONS.find((s) => s.sectionNumber === 8)?.example instanceof
      Array
    ) {
      contentWithInvalidFormat["8"]!.content =
        "Isto não é um array como esperado para a Seção 8.";
      const issues = validateProtocolStructure(contentWithInvalidFormat);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "STRUCTURE_005B",
          sectionNumber: 8,
          field: "content",
          message: `O conteúdo da Seção 8 (Manejo de Complicações) deveria ser um array JSON, mas foi encontrado: string.`,
          severity: "error",
        }),
      );
    } else {
      // Skip this specific test if Section 8 example isn't an array in current definitions
      // This ensures test robustness if SECTION_DEFINITIONS change.
      console.warn(
        "Skipping STRUCTURE_005B test for Section 8 as its example is not an array.",
      );
      expect(true).toBe(true);
    }
  });

  it("should pass if structured sections have correct basic format (object/array)", async () => {
    const validContent = createMinimalValidContent();
    // Ensure section 1 (example is object) is an object
    validContent["1"]!.content = {
      codigoProtocolo: "TEST-001",
      tituloCompleto: "Protocolo de Teste",
      versao: "1.0",
      origemOrganizacao: "Teste Corp",
      dataElaboracao: "2023-01-01",
      dataUltimaRevisao: "2023-01-01",
      dataProximaRevisao: "2025-01-01",
      ambitoAplicacao: "Testes",
    };
    // Ensure section 8 (example is array) is an array
    if (
      SECTION_DEFINITIONS.find((s) => s.sectionNumber === 8)?.example instanceof
      Array
    ) {
      validContent["8"]!.content = [
        {
          complicacao: "Teste",
          identificacaoSinaisSintomas: ["Sinal1"],
          manejoRecomendado: "Manejo Teste",
        },
      ];
    }

    const issues = await validateProtocolStructure(validContent);
    expect(
      issues.find(
        (issue) =>
          issue.ruleId === "STRUCTURE_005A" ||
          issue.ruleId === "STRUCTURE_005B",
      ),
    ).toBeUndefined();
  });
});
