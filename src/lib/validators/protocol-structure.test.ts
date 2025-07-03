import { describe, it, expect } from "vitest";
import { validateProtocolStructure } from "./protocol-structure";
import type {
  ProtocolFullContent,
  // ProtocolSectionData, // Marked as unused
} from "@/types/protocol";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import type { ValidationIssue } from "@/types/validation";

// Helper to create mock protocol content
// const _createMockProtocolContent = ( // Marked as unused
//   sections: Record<string, Partial<ProtocolSectionData>>,
// ): ProtocolFullContent => {
//   const fullContent: ProtocolFullContent = {};
//   for (let i = 1; i <= 13; i++) {
//     const key = i.toString();
//     fullContent[key] = {
//       sectionNumber: i,
//       title: `Título Seção ${i}`,
//       content: `Conteúdo da Seção ${i}`,
//       ...sections[key],
//     };
//   }
//   return fullContent;
// };

const createMinimalValidContent = (): ProtocolFullContent => {
  const content: ProtocolFullContent = {};
  SECTION_DEFINITIONS.forEach((def) => {
    content[def.sectionNumber.toString()] = {
      sectionNumber: def.sectionNumber,
      title: def.titlePT,
      content: def.example ?? "Conteúdo de exemplo.",
    };
  });
  return content;
};

describe("validateProtocolStructure", () => {
  it("should return no issues for a structurally valid protocol", async () => {
    const validContent = createMinimalValidContent();
    const issues = await validateProtocolStructure(validContent);
    expect(issues).toEqual([]);
  });

  it("should detect if not all 13 sections are present", async () => {
    const partialContent: Partial<ProtocolFullContent> =
      createMinimalValidContent();
    delete partialContent["13"];
    const issues = await validateProtocolStructure(
      partialContent as ProtocolFullContent,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_001",
        message:
          "O protocolo deve conter exatamente 13 seções válidas (numeradas de 1 a 13). Encontradas: 12 seções válidas.",
        severity: "error",
      }),
    );
  });

  it("should detect if sections are incorrectly numbered or keys don't match sectionNumber", async () => {
    const misnumberedContent: ProtocolFullContent = {
      ...createMinimalValidContent(),
    };
    delete misnumberedContent["1"];
    misnumberedContent["14"] = {
      sectionNumber: 14,
      title: "Título Seção 14",
      content: "...",
    };

    const issuesMisnumbered =
      await validateProtocolStructure(misnumberedContent);
    expect(issuesMisnumbered).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_001",
        severity: "error",
      }),
    );
    expect(issuesMisnumbered).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_003",
        message: `A seção com chave "14" é inválida: ou a chave está fora do intervalo esperado (1-13), ou seu 'sectionNumber' interno (14) não corresponde à chave, ou a seção está malformada. Título esperado (se a chave fosse válida): Título Desconhecido / Chave Inválida.`,
        severity: "error",
        sectionNumber: 14,
      }),
    );

    const contentWithMismatchKey = createMinimalValidContent();
    contentWithMismatchKey["1"] = {
      sectionNumber: 2,
      title: "Título Seção 1",
      content: "Conteúdo",
    };
    const issuesMismatch = await validateProtocolStructure(
      contentWithMismatchKey,
    );
    expect(issuesMismatch).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_003",
        sectionNumber: 1,
        message: `A seção com chave "1" é inválida: ou a chave está fora do intervalo esperado (1-13), ou seu 'sectionNumber' interno (2) não corresponde à chave, ou a seção está malformada. Título esperado (se a chave fosse válida): ${SECTION_DEFINITIONS[0].titlePT}.`,
        severity: "error",
      }),
    );
  });

  it("should detect missing or empty section titles", async () => {
    const contentWithMissingTitle = createMinimalValidContent();
    contentWithMissingTitle["3"]!.title = "";
    const issues = await validateProtocolStructure(contentWithMissingTitle);
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

  it("should detect incorrect content format for structured sections (e.g., Section 1 not an object)", async () => {
    const contentWithInvalidFormat = createMinimalValidContent();
    contentWithInvalidFormat["1"]!.content =
      "Isto não é um objeto JSON como esperado para a Seção 1.";
    const issues = await validateProtocolStructure(contentWithInvalidFormat);
    expect(issues).toContainEqual(
      expect.objectContaining({
        ruleId: "STRUCTURE_CONTENT_EXPECTED_OBJECT",
        sectionNumber: 1,
        field: "content",
        message: `O conteúdo da Seção 1 (Identificação do Protocolo) deveria ser um objeto JSON estruturado, mas foi encontrado: string.`,
        severity: "error",
      }),
    );
  });

  it("should detect incorrect content format for sections expecting an array (e.g., Section 8)", async () => {
    const contentWithInvalidFormat = createMinimalValidContent();
    const section8Def = SECTION_DEFINITIONS.find((s) => s.sectionNumber === 8);
    if (section8Def && Array.isArray(section8Def.example)) {
      contentWithInvalidFormat["8"]!.content =
        "Isto não é um array como esperado para a Seção 8.";
      const issues = await validateProtocolStructure(contentWithInvalidFormat);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "STRUCTURE_CONTENT_EXPECTED_ARRAY",
          sectionNumber: 8,
          field: "content",
          message: `O conteúdo da Seção 8 (${section8Def.titlePT}) deveria ser um array JSON, mas foi encontrado: string.`,
          severity: "error",
        }),
      );
    } else {
      console.warn(
        "Skipping STRUCTURE_CONTENT_EXPECTED_ARRAY test for Section 8 as its example type is not an array in SECTION_DEFINITIONS.",
      );
      expect(true).toBe(true);
    }
  });

  it("should pass if structured sections have correct basic format (object/array based on SECTION_DEFINITIONS)", async () => {
    const validContent = createMinimalValidContent();
    const issues = await validateProtocolStructure(validContent);
    const formatIssues = issues.filter(
      (issue: ValidationIssue) =>
        issue.ruleId === "STRUCTURE_CONTENT_EXPECTED_OBJECT" ||
        issue.ruleId === "STRUCTURE_CONTENT_EXPECTED_ARRAY",
    );
    expect(
      formatIssues,
      `Found format issues: ${JSON.stringify(formatIssues, null, 2)}`,
    ).toEqual([]);
  });
});
