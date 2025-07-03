import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { generateFullProtocolAI, generateProtocolSectionAI } from "./generator";
import * as aiClient from "./client";
import { OpenAIError } from "./errors";
import type {
  AIFullProtocolGenerationInput,
  AIProtocolSectionInput,
} from "@/types/ai-generation";
import type { AIResearchData, AIResearchFinding } from "./types";
import { SECTION_DEFINITIONS } from "./prompts/section-specific";
import {
  GeneratedFullProtocolSchema,
  GeneratedSingleSectionSchema,
} from "../validators/generated-content";
import type { ProtocolSectionData } from "@/types/protocol";

// Mock the OpenAI client's createChatCompletion function
vi.mock("./client", async () => {
  const actual = await vi.importActual<typeof aiClient>("./client");
  return {
    ...actual,
    createChatCompletion: vi.fn(),
  };
});

const mockCreateChatCompletion = aiClient.createChatCompletion as Mock;

// Helper to create a mock AI response
const mockAiResponse = (content: any) => ({
  choices: [{ message: { content: JSON.stringify(content) } }],
});

const sampleResearchFindings: AIResearchFinding[] = [
  {
    id: "finding1",
    source: "pubmed-test",
    findingType: "diagnostic_criteria",
    extractedText: "Criterion A is presence of X.",
    objectiveCriteria: { criterion: "A", detail: "Presence of X" },
  },
];

const sampleResearchData: AIResearchData = {
  query: "Test Condition",
  findings: sampleResearchFindings,
  timestamp: new Date().toISOString(),
};

describe("AI Protocol Generation", () => {
  beforeEach(() => {
    mockCreateChatCompletion.mockReset();
  });

  describe("generateFullProtocolAI", () => {
    const validInput: AIFullProtocolGenerationInput = {
      medicalCondition: "Testitis",
      researchData: sampleResearchData,
    };

    it("should generate a full protocol and validate its structure", async () => {
      const mockProtocolContent: Record<string, ProtocolSectionData> = {};
      SECTION_DEFINITIONS.forEach((sd) => {
        mockProtocolContent[sd.sectionNumber.toString()] = {
          sectionNumber: sd.sectionNumber,
          title: sd.titlePT,
          content: sd.example ?? `Conteúdo para ${sd.titlePT}`, // Use example if available
        };
      });

      mockCreateChatCompletion.mockResolvedValue(
        mockAiResponse(mockProtocolContent),
      );

      const result = await generateFullProtocolAI(validInput);

      expect(mockCreateChatCompletion).toHaveBeenCalledOnce();
      // Validate against the schema
      const parseResult = GeneratedFullProtocolSchema.safeParse(
        result.protocolContent,
      );
      expect(
        parseResult.success,
        parseResult.success
          ? ""
          : JSON.stringify(parseResult.error.errors, null, 2),
      ).toBe(true);
      if (parseResult.success) {
        expect(result.protocolContent).toEqual(mockProtocolContent);
      }
    });

    it("should throw SyntaxError if AI returns malformed JSON", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        choices: [{ message: { content: "this is not json" } }],
      });
      // Using try-catch because the error is thrown by JSON.parse, not directly by our code as OpenAIError
      try {
        await generateFullProtocolAI(validInput);
      } catch (e) {
        expect(e).toBeInstanceOf(SyntaxError);
      }
    });

    it("should throw OpenAIError if AI output fails Zod validation (e.g. missing sections)", async () => {
      const incompleteProtocol = {
        "1": { sectionNumber: 1, title: "Seção 1", content: "Content 1" },
        // Missing other sections
      };
      mockCreateChatCompletion.mockResolvedValue(
        mockAiResponse(incompleteProtocol),
      );
      await expect(generateFullProtocolAI(validInput)).rejects.toThrow(
        OpenAIError,
      );
      await expect(generateFullProtocolAI(validInput)).rejects.toThrow(
        /O protocolo deve conter exatamente 13 seções/,
      );
    });
  });

  describe("generateProtocolSectionAI", () => {
    const validSectionInput: AIProtocolSectionInput = {
      protocolId: "test-proto-id",
      medicalCondition: "Testitis",
      sectionNumber: 1,
      researchFindings: sampleResearchFindings,
      previousSectionsContent: {},
    };

    it("should generate a single section and validate its structure", async () => {
      const sectionDef = SECTION_DEFINITIONS.find(
        (sd) => sd.sectionNumber === 1,
      )!;
      const mockSectionContent: ProtocolSectionData = {
        sectionNumber: 1,
        title: sectionDef.titlePT,
        content: sectionDef.example ?? `Conteúdo para ${sectionDef.titlePT}`,
      };
      mockCreateChatCompletion.mockResolvedValue(
        mockAiResponse(mockSectionContent),
      );

      const result = await generateProtocolSectionAI(validSectionInput);
      const parseResult = GeneratedSingleSectionSchema.safeParse(result);
      expect(
        parseResult.success,
        parseResult.success
          ? ""
          : JSON.stringify(parseResult.error.errors, null, 2),
      ).toBe(true);

      expect(mockCreateChatCompletion).toHaveBeenCalledOnce();
      if (parseResult.success) {
        expect(result.sectionNumber).toBe(1);
        expect(result.title).toBe(sectionDef.titlePT);
        expect(result.content).toEqual(mockSectionContent.content);
      }
    });

    it("should throw error for invalid section number", async () => {
      const invalidInput = { ...validSectionInput, sectionNumber: 99 };
      await expect(generateProtocolSectionAI(invalidInput)).rejects.toThrow(
        /Invalid section number: 99/,
      );
    });

    it("should throw OpenAIError if AI returns content for a different section number", async () => {
      const mockWrongSectionContent = {
        sectionNumber: 2, // AI returns section 2 when 1 was requested
        title: "Wrong Section Title",
        content: "Content for wrong section",
      };
      mockCreateChatCompletion.mockResolvedValue(
        mockAiResponse(mockWrongSectionContent),
      );

      await expect(
        generateProtocolSectionAI(validSectionInput),
      ).rejects.toThrow(OpenAIError);
      await expect(
        generateProtocolSectionAI(validSectionInput),
      ).rejects.toThrow(
        /AI returned content for section 2 but section 1 was requested/,
      );
    });

    it("should throw OpenAIError if AI returns malformed JSON for single section", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        choices: [{ message: { content: "this is not json" } }],
      });
      try {
        await generateProtocolSectionAI(validSectionInput);
      } catch (e) {
        expect(e).toBeInstanceOf(SyntaxError);
      }
    });

    it("should throw OpenAIError if AI-generated single section fails Zod validation", async () => {
      const malformedSection = {
        // sectionNumber is missing
        title: "Test Title",
        content: "Test content",
      };
      mockCreateChatCompletion.mockResolvedValue(
        mockAiResponse(malformedSection),
      );
      await expect(
        generateProtocolSectionAI(validSectionInput),
      ).rejects.toThrow(OpenAIError);
      await expect(
        generateProtocolSectionAI(validSectionInput),
      ).rejects.toThrow(/AI-generated section 1 has invalid structure/);
    });
  });
});
