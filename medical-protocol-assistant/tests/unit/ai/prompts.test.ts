/**
 * Unit Tests for AI Prompt Generation Functions.
 */
import { describe, it, expect } from "vitest";
import {
  PROTOCOL_GENERATION_SYSTEM_PROMPT,
  createFullProtocolUserPrompt,
  createSingleSectionUserPrompt,
} from "@/lib/ai/prompts/protocol-generation";
import {
  FLOWCHART_GENERATION_SYSTEM_PROMPT,
  createFlowchartGenerationUserPrompt,
} from "@/lib/ai/prompts/flowchart";
import {
  EXTRACT_MEDICAL_INFO_SYSTEM_PROMPT,
  createExtractionUserPrompt,
} from "@/lib/ai/prompts/research";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import {
  mockMedicalCondition,
  mockResearchData,
  mockFullProtocolContent,
  mockRelevantTextSectionsForFlowchart,
} from "../../fixtures/protocols"; // Using the new fixture

describe("AI Prompt Generation Tests", () => {
  describe("Protocol Generation Prompts", () => {
    it("PROTOCOL_GENERATION_SYSTEM_PROMPT should be a non-empty string", () => {
      expect(PROTOCOL_GENERATION_SYSTEM_PROMPT).toBeTypeOf("string");
      expect(PROTOCOL_GENERATION_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it("createFullProtocolUserPrompt should include medical condition and research summary", () => {
      const prompt = createFullProtocolUserPrompt(
        mockMedicalCondition,
        mockResearchData,
        SECTION_DEFINITIONS,
      );
      expect(prompt).toContain(mockMedicalCondition);
      expect(prompt).toContain(
        mockResearchData.findings[0].extractedText.substring(0, 50),
      ); // Check for part of a finding
      expect(prompt).toContain(SECTION_DEFINITIONS[0].titlePT); // Check for a section title
      expect(prompt).toContain(SECTION_DEFINITIONS[0].contentSchemaDescription);
    });

    it("createSingleSectionUserPrompt should include condition, section details, and context", () => {
      const sectionDef = SECTION_DEFINITIONS[0]; // Section 1
      const previousSections = {
        "0": { sectionNumber: 0, title: "Contexto", content: "info prévia" },
      } as any; // Mock previous section
      const prompt = createSingleSectionUserPrompt(
        mockMedicalCondition,
        sectionDef,
        mockResearchData.findings,
        previousSections,
        "Instrução específica aqui.",
      );
      expect(prompt).toContain(mockMedicalCondition);
      expect(prompt).toContain(sectionDef.titlePT);
      expect(prompt).toContain(sectionDef.description);
      expect(prompt).toContain("info prévia");
      expect(prompt).toContain("Instrução específica aqui.");
    });
  });

  describe("Flowchart Generation Prompts", () => {
    it("FLOWCHART_GENERATION_SYSTEM_PROMPT should be a non-empty string", () => {
      expect(FLOWCHART_GENERATION_SYSTEM_PROMPT).toBeTypeOf("string");
      expect(FLOWCHART_GENERATION_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it("createFlowchartGenerationUserPrompt should include condition and relevant sections", () => {
      const prompt = createFlowchartGenerationUserPrompt(
        mockMedicalCondition,
        mockRelevantTextSectionsForFlowchart,
      );
      expect(prompt).toContain(mockMedicalCondition);
      const section5Content = mockRelevantTextSectionsForFlowchart["5"]
        .content as string;
      expect(prompt).toContain(section5Content.substring(0, 20)); // Check for part of section 5 content
    });
  });

  describe("Research Extraction Prompts", () => {
    it("EXTRACT_MEDICAL_INFO_SYSTEM_PROMPT should be a non-empty string", () => {
      expect(EXTRACT_MEDICAL_INFO_SYSTEM_PROMPT).toBeTypeOf("string");
      expect(EXTRACT_MEDICAL_INFO_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it("createExtractionUserPrompt should include article text and source ID", () => {
      const articleText = "HbA1c > 6.5% for diabetes diagnosis.";
      const articleSourceId = "pubmed-xyz";
      const prompt = createExtractionUserPrompt(articleText, articleSourceId);
      expect(prompt).toContain(articleText);
      expect(prompt).toContain(articleSourceId);
      expect(prompt).toContain("diagnostic_criteria"); // Check for one of the types to extract
    });
  });
});
