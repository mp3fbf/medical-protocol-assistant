import { describe, it, expect, vi, beforeEach } from "vitest";
import { performMedicalResearch } from "./research";
import type {
  DeepResearchQuery,
  // RawDeepResearchArticle as _RawDeepResearchArticle, // Marked as unused
  AggregatedResearchOutput,
  ProcessedAIMedicalFinding,
} from "@/types/research"; // Import from new location
import * as aiClient from "./client";

vi.mock("./client", async (importOriginal: () => Promise<typeof aiClient>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getOpenAIClient: vi.fn(() => ({})),
    createChatCompletion: vi.fn(),
  };
});

const mockCreateChatCompletion = vi.mocked(aiClient.createChatCompletion);

const createMockChatCompletion = (content: string) => ({
  id: "chatcmpl-test",
  object: "chat.completion" as const,
  created: Date.now(),
  model: "gpt-4o",
  choices: [
    {
      message: {
        content,
        role: "assistant" as const,
        refusal: null,
      },
      finish_reason: "stop" as const,
      index: 0,
      logprobs: null,
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150,
  },
});

describe("Medical Research Integration - performMedicalResearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call DeepResearch (mock), process results with AI (mock), and return aggregated output", async () => {
    const query: DeepResearchQuery = {
      condition: "Type 2 Diabetes",
      sources: ["pubmed", "cfm"],
    };

    const mockAiResponseArticle1: ProcessedAIMedicalFinding[] = [
      {
        id: "finding-1-1",
        source: "pubmed-123",
        findingType: "diagnostic_criteria",
        extractedText: "HbA1c >= 6.5% is a diagnostic criterion.",
        objectiveCriteria: {
          criterionName: "HbA1c",
          threshold: ">= 6.5%",
          description: "Glycated hemoglobin level for diagnosis.",
        },
        metadata: { sourceUrl: "https://pubmed.example.com/123" },
      },
    ];
    const mockAiResponseArticle2: ProcessedAIMedicalFinding[] = [
      {
        id: "finding-2-1",
        source: "cfm-789",
        findingType: "treatment_protocol",
        extractedText:
          "O CFM recomenda o uso de Paracetamol 750mg a cada 6 horas.",
        objectiveCriteria: {
          medicationName: "Paracetamol",
          dosage: "750mg",
          frequency: "a cada 6 horas",
          description: "Controle sintomático.",
        },
        metadata: { sourceUrl: "https://cfm.example.com/789" },
      },
    ];

    mockCreateChatCompletion
      .mockResolvedValueOnce(
        createMockChatCompletion(JSON.stringify(mockAiResponseArticle1)),
      )
      .mockResolvedValueOnce(
        createMockChatCompletion(JSON.stringify(mockAiResponseArticle2)),
      )
      .mockResolvedValueOnce(
        createMockChatCompletion(
          JSON.stringify([
            {
              id: "finding-3-1",
              source: "scielo-456",
              findingType: "geriatric_consideration",
              extractedText: "Drug X metabolism is significantly altered...",
              objectiveCriteria: {
                aspect: "Drug X metabolism",
                description:
                  "Dose reduction to 2.5mg daily for patients >75 years.",
              },
              metadata: { sourceUrl: "https://scielo.example.com/456" },
            },
          ]),
        ),
      );

    const result: AggregatedResearchOutput =
      await performMedicalResearch(query);

    expect(mockCreateChatCompletion).toHaveBeenCalledTimes(3);
    expect(result.query).toBe("Type 2 Diabetes");
    expect(result.findings).toHaveLength(3);

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "finding-1-1",
          source: "pubmed-123",
          findingType: "diagnostic_criteria",
        }),
        expect.objectContaining({
          id: "finding-2-1",
          source: "cfm-789",
          findingType: "treatment_protocol",
        }),
        expect.objectContaining({
          id: "finding-3-1",
          source: "scielo-456",
          findingType: "geriatric_consideration",
        }),
      ]),
    );
  });

  it("should handle case when AI returns empty findings", async () => {
    const query: DeepResearchQuery = {
      condition: "Test Condition",
      sources: ["pubmed"],
    };

    mockCreateChatCompletion.mockResolvedValue(
      createMockChatCompletion(JSON.stringify([])),
    );

    const result = await performMedicalResearch(query);

    expect(mockCreateChatCompletion).toHaveBeenCalledTimes(2);
    expect(result.findings).toEqual([]);
    expect(result.query).toBe("Test Condition");
  });

  it("should handle OpenAI parsing errors gracefully", async () => {
    const query: DeepResearchQuery = {
      condition: "Test Condition with AI Error",
      sources: ["pubmed"],
    };
    mockCreateChatCompletion.mockResolvedValueOnce(
      createMockChatCompletion("this is not valid JSON"),
    );
    mockCreateChatCompletion.mockResolvedValueOnce(
      createMockChatCompletion(JSON.stringify([])),
    );

    const result = await performMedicalResearch(query);

    expect(mockCreateChatCompletion).toHaveBeenCalledTimes(2);
    expect(result.findings).toEqual([]);
  });
});
