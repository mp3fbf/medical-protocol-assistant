import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { generateFullProtocolAI, generateProtocolSectionAI } from "./generator";
import * as aiClient from "./client";
import { OpenAIError } from "./errors";
import type {
  AIFullProtocolGenerationInput,
  AIProtocolSectionInput,
  StandardSectionDefinition,
} from "@/types/ai-generation";
import type { AIResearchData, AIResearchFinding } from "./types";
import { SECTION_DEFINITIONS } from "./prompts/section-specific";
import { GeneratedFullProtocolSchema } from "../validators/generated-content";

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
      const mockProtocolContent: Record<string, any> = {};
      SECTION_DEFINITIONS.forEach((sd) => {
        mockProtocolContent[sd.sectionNumber.toString()] = {
          sectionNumber: sd.sectionNumber,
          title: sd.titlePT,
          content: `Conteúdo para ${sd.titlePT}`,
        };
      });

      mockCreateChatCompletion.mockResolvedValue(
        mockAiResponse(mockProtocolContent),
      );

      const result = await generateFullProtocolAI(validInput);

      expect(mockCreateChatCompletion).toHaveBeenCalledOnce();
      expect(result.protocolContent).toEqual(mockProtocolContent);
      const parseResult = GeneratedFullProtocolSchema.safeParse(
        result.protocolContent,
      );
      expect(parseResult.success).toBe(true);
    });

    it("should throw OpenAIError if AI returns malformed JSON", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        choices: [{ message: { content: "this is not json" } }],
      });
      await expect(generateFullProtocolAI(validInput)).rejects.toThrow(
        SyntaxError, // JSON.parse error
      );
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
      const mockSectionContent = {
        sectionNumber: 1,
        title: sectionDef.titlePT,
        content: sectionDef.example, // Using example content for the mock
      };
      mockCreateChatCompletion.mockResolvedValue(
        mockAiResponse(mockSectionContent),
      );

      const result = await generateProtocolSectionAI(validSectionInput);

      expect(mockCreateChatCompletion).toHaveBeenCalledOnce();
      expect(result.sectionNumber).toBe(1);
      expect(result.title).toBe(sectionDef.titlePT);
      expect(result.content).toEqual(sectionDef.example);
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
  });
});
