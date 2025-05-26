import { describe, it, expect } from "vitest";
import { validateCompleteness } from "./completeness";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";

// Helper to create mock protocol content
const createMockProtocolContent = (
  sections: Record<string, Partial<ProtocolSectionData>>,
  sectionCount = 13,
): ProtocolFullContent => {
  const fullContent: ProtocolFullContent = {};
  for (let i = 1; i <= sectionCount; i++) {
    const key = i.toString();
    fullContent[key] = {
      sectionNumber: i,
      title: `Título Seção ${i}`,
      content: `Conteúdo da Seção ${i}`,
      ...(sections[key] || {}),
    };
  }
  return fullContent;
};

const createMinimalValidContent = (): ProtocolFullContent => {
  const content: ProtocolFullContent = {};
  SECTION_DEFINITIONS.forEach((def) => {
    content[def.sectionNumber.toString()] = {
      sectionNumber: def.sectionNumber,
      title: def.titlePT,
      content: def.example || "Conteúdo de exemplo.", // Use example or default
    };
  });
  return content;
};

describe("validateCompleteness", () => {
  describe("checkAllSectionsHaveContent", () => {
    it("should return no issues if all sections have content", async () => {
      const validContent = createMinimalValidContent();
      const issues = await validateCompleteness(validContent);
      // Filter for COMPLETENESS_001 issues only for this specific sub-test
      const sectionContentIssues = issues.filter(
        (issue) => issue.ruleId === "COMPLETENESS_001",
      );
      expect(sectionContentIssues).toEqual([]);
    });

    it("should return an issue if a section has null content", async () => {
      const content = createMinimalValidContent();
      content["5"]!.content = null as any;
      const issues = await validateCompleteness(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "COMPLETENESS_001",
          sectionNumber: 5,
          severity: "error",
        }),
      );
    });

    it("should return an issue if a section has an empty string as content", async () => {
      const content = createMinimalValidContent();
      content["2"]!.content = "   "; // Whitespace only
      const issues = await validateCompleteness(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "COMPLETENESS_001",
          sectionNumber: 2,
          severity: "error",
        }),
      );
    });

    it("should return an issue if a section has an empty object as content", async () => {
      const content = createMinimalValidContent();
      content["1"]!.content = {}; // Assuming section 1 could be an object
      const issues = await validateCompleteness(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "COMPLETENESS_001",
          sectionNumber: 1,
          severity: "error",
        }),
      );
    });

    it("should return an issue if a section has an empty array as content", async () => {
      const content = createMinimalValidContent();
      content["8"]!.content = []; // Assuming section 8 could be an array
      const issues = await validateCompleteness(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "COMPLETENESS_001",
          sectionNumber: 8,
          severity: "error",
        }),
      );
    });
  });

  describe("checkRequiredFieldsInSection1", () => {
    it("should return no issues if Section 1 has all required fields", async () => {
      const validContent = createMinimalValidContent(); // This already has a valid section 1
      const issues = await validateCompleteness(validContent);
      const section1FieldIssues = issues.filter(
        (issue) => issue.ruleId === "COMPLETENESS_002",
      );
      expect(section1FieldIssues).toEqual([]);
    });

    it("should return an issue if a required field in Section 1 is missing", async () => {
      const content = createMinimalValidContent();
      const section1Content = content["1"]!.content as Record<string, any>;
      delete section1Content.codigoProtocolo;
      const issues = await validateCompleteness(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "COMPLETENESS_002",
          sectionNumber: 1,
          field: "codigoProtocolo",
          severity: "error",
        }),
      );
    });

    it("should return an issue if a required field in Section 1 is empty", async () => {
      const content = createMinimalValidContent();
      (content["1"]!.content as Record<string, any>).tituloCompleto = "  ";
      const issues = await validateCompleteness(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "COMPLETENESS_002",
          sectionNumber: 1,
          field: "tituloCompleto",
          severity: "error",
        }),
      );
    });

    it("should return format issue if Section 1 content is not an object", async () => {
      const content = createMinimalValidContent();
      content["1"]!.content = "Not an object";
      const issues = await validateCompleteness(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "COMPLETENESS_002_FORMAT",
          sectionNumber: 1,
          severity: "error",
        }),
      );
    });
  });
});
