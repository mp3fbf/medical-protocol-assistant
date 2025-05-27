import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { generateFlowchartFromProtocolContent } from "./generator";
import * as aiClient from "@/lib/ai/client";
import { OpenAIError } from "@/lib/ai/errors";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import type {
  FlowchartDefinition,
  CustomFlowNode,
  CustomFlowEdge,
} from "@/types/flowchart";
import { GeneratedFlowchartSchema } from "@/lib/validators/flowchart"; // For mocking valid AI output

// Mock the OpenAI client's createChatCompletion function
vi.mock("@/lib/ai/client", async () => {
  const actual = await vi.importActual<typeof aiClient>("@/lib/ai/client");
  return {
    ...actual,
    createChatCompletion: vi.fn(),
  };
});

const mockCreateChatCompletion = aiClient.createChatCompletion as Mock;

// Helper to create a mock AI response for flowchart generation
const mockAiFlowchartResponse = (
  flowchartData: Partial<FlowchartDefinition>,
) => ({
  choices: [{ message: { content: JSON.stringify(flowchartData) } }],
});

const sampleProtocolContent: ProtocolFullContent = {
  "7": {
    sectionNumber: 7,
    title: "Tratamento",
    content: "Se A, então B. Se não A, então C.",
  },
  // Add other sections if needed by RELEVANT_SECTIONS_FOR_FLOWCHART
};
const sampleProtocolCondition = "Test Condition";
const sampleProtocolId = "test-proto-id";

describe("Flowchart Generation", () => {
  beforeEach(() => {
    mockCreateChatCompletion.mockReset();
  });

  describe("generateFlowchartFromProtocolContent", () => {
    const validAiOutput: FlowchartDefinition = {
      nodes: [
        {
          id: "node-1",
          type: "start",
          data: { type: "start", title: "Início" },
          position: { x: 0, y: 0 }, // Position will be ignored and reset
        },
        {
          id: "node-2",
          type: "decision",
          data: {
            type: "decision",
            title: "Condição A?",
            criteria: "A é verdadeiro",
          },
          position: { x: 0, y: 0 },
        },
      ] as CustomFlowNode[], // Cast for type safety in test
      edges: [
        { id: "edge-1-2", source: "node-1", target: "node-2" },
      ] as CustomFlowEdge[],
    };

    it("should generate a flowchart from protocol content and validate its structure", async () => {
      mockCreateChatCompletion.mockResolvedValue(
        mockAiFlowchartResponse(validAiOutput),
      );

      const result = await generateFlowchartFromProtocolContent(
        sampleProtocolId,
        sampleProtocolContent,
        sampleProtocolCondition,
      );

      expect(mockCreateChatCompletion).toHaveBeenCalledOnce();
      // Check if the result matches the validated structure (IDs might be regenerated)
      expect(result.nodes).toHaveLength(validAiOutput.nodes.length);
      expect(result.edges).toHaveLength(validAiOutput.edges.length);

      result.nodes.forEach((node) => {
        expect(node.id).toBeDefined();
        expect(node.position).toEqual({ x: 0, y: 0 }); // Initial position before layout
        const originalNode = validAiOutput.nodes.find(
          (n) => n.data.title === node.data.title,
        ); // simple match for test
        expect(node.type).toBe(originalNode?.type);
        expect(node.data.title).toBe(originalNode?.data.title);
      });
    });

    it("should throw SyntaxError if AI returns malformed JSON", async () => {
      mockCreateChatCompletion.mockResolvedValue({
        choices: [{ message: { content: "this is not json" } }],
      });

      await expect(
        generateFlowchartFromProtocolContent(
          sampleProtocolId,
          sampleProtocolContent,
          sampleProtocolCondition,
        ),
      ).rejects.toThrow(SyntaxError);
    });

    it("should throw OpenAIError if AI output fails Zod validation", async () => {
      const invalidAiOutput = { nodes: [{ id: "1" }], edges: "not an array" }; // Invalid structure
      mockCreateChatCompletion.mockResolvedValue(
        mockAiFlowchartResponse(invalidAiOutput as any),
      );

      await expect(
        generateFlowchartFromProtocolContent(
          sampleProtocolId,
          sampleProtocolContent,
          sampleProtocolCondition,
        ),
      ).rejects.toThrow(OpenAIError);
      await expect(
        generateFlowchartFromProtocolContent(
          sampleProtocolId,
          sampleProtocolContent,
          sampleProtocolCondition,
        ),
      ).rejects.toThrow(/AI-generated flowchart has invalid structure/);
    });

    it("should return an empty flowchart if no relevant sections are found", async () => {
      const emptyContent: ProtocolFullContent = {}; // No relevant sections
      const result = await generateFlowchartFromProtocolContent(
        sampleProtocolId,
        emptyContent,
        sampleProtocolCondition,
      );
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(mockCreateChatCompletion).not.toHaveBeenCalled();
    });

    it("should ensure unique IDs for nodes and edges even if AI omits them", async () => {
      const aiOutputWithMissingIds: any = {
        nodes: [
          { type: "start", data: { type: "start", title: "Início" } }, // Missing ID
          {
            id: "node-abc",
            type: "decision",
            data: { type: "decision", title: "Decision 1", criteria: "X > 10" },
          },
        ],
        edges: [
          { source: "node-abc", target: "node-def" }, // Missing ID, and assumes node-abc and node-def exist
        ],
      };
      // Ensure node-def exists for the edge to be valid according to GeneratedFlowchartSchema
      aiOutputWithMissingIds.nodes.push({
        id: "node-def",
        type: "end",
        data: { type: "end", title: "Fim" },
      });

      mockCreateChatCompletion.mockResolvedValue(
        mockAiFlowchartResponse(aiOutputWithMissingIds),
      );

      const result = await generateFlowchartFromProtocolContent(
        sampleProtocolId,
        sampleProtocolContent,
        sampleProtocolCondition,
      );

      expect(result.nodes[0].id).toMatch(/^node-/); // Check if UUID-like ID was generated
      expect(result.nodes[1].id).toBe("node-abc");
      expect(result.edges[0].id).toMatch(/^edge-/);
    });
  });
});
