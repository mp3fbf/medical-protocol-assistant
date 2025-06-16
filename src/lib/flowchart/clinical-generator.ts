/**
 * Clinical flowchart generator that produces rich format flowcharts
 * with questionnaires, detailed medical conducts, and complex logic.
 */
import { getAIProvider } from "@/lib/ai/providers";
import { getModelTemperature } from "@/lib/ai/config";
import {
  CLINICAL_FLOWCHART_GENERATION_SYSTEM_PROMPT,
  createClinicalFlowchartGenerationUserPrompt,
} from "@/lib/ai/prompts/flowchart-clinical";
import type { ProtocolFullContent } from "@/types/protocol";
import type { ClinicalFlowchart } from "@/types/flowchart-clinical";
import { z } from "zod";

// Helper to properly handle HTML entities
function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  // Common medical symbols that might be encoded
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ge;/g, "≥")
    .replace(/&le;/g, "≤")
    .replace(/&#8805;/g, "≥")
    .replace(/&#8804;/g, "≤")
    .replace(/&#60;/g, "<")
    .replace(/&#62;/g, ">")
    .replace(/&#x3C;/g, "<")
    .replace(/&#x3E;/g, ">");
}

// Clinical node schemas for validation
const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  preselected: z.boolean().default(false),
  exclusive: z.boolean().default(false),
});

const QuestionSchema = z.object({
  id: z.string(),
  uid: z.string(),
  titulo: z.string(),
  descricao: z.string().optional(),
  condicional: z.enum(["visivel", "oculto"]).default("visivel"),
  expressao: z.string().default("SEMPRE"),
  select: z.enum(["E", "F", "B"]), // E=checkbox, F=radio, B=text
  options: z.array(QuestionOptionSchema).default([]),
});

const SummaryDataSchema = z.object({
  titulo: z.string(),
  descricao: z.string(), // HTML formatted
  tags: z.array(z.string()).optional(),
});

const MedicationSchema = z.object({
  id: z.string(),
  nomeMed: z.string(),
  posologia: z.string(), // HTML formatted
  viaAplicacao: z.string().optional(),
});

const ExamSchema = z.object({
  id: z.string(),
  nome: z.string(),
  codigo: z.string().optional(),
  cid: z.string().optional(),
  indicacao: z.string().optional(),
});

const OrientationSchema = z.object({
  id: z.string(),
  nome: z.string(),
  conteudo: z.string(), // HTML formatted
});

const ReferralSchema = z.object({
  id: z.string(),
  nome: z.string(),
  especialidade: z.string().optional(),
  urgencia: z.string().optional(),
  motivo: z.string().optional(),
});

const MessageSchema = z.object({
  id: z.string(),
  nome: z.string(),
  conteudo: z.string(), // HTML formatted
});

const ConductDataSchema = z.object({
  medicamento: z.array(MedicationSchema).optional(),
  exame: z.array(ExamSchema).optional(),
  orientacao: z.array(OrientationSchema).optional(),
  encaminhamento: z.array(ReferralSchema).optional(),
  mensagem: z.array(MessageSchema).optional(),
});

// Define schemas without transforms for discriminated union
const StartNodeDataSchema = z.object({
  type: z.literal("start"),
  title: z.string().optional(),
  label: z.string().optional(),
});

const EndNodeDataSchema = z.object({
  type: z.literal("end"),
  title: z.string().optional(),
  label: z.string().optional(),
});

const CustomNodeDataSchema = z.object({
  type: z.literal("custom"),
  label: z.string(),
  condicional: z.enum(["visivel", "oculto"]).default("visivel"),
  condicao: z.string().default("SEMPRE"),
  questions: z.array(QuestionSchema),
  descricao: z.string().optional(), // HTML
});

const SummaryNodeDataSchema = z.object({
  type: z.literal("summary"),
  label: z.string(),
  condicional: z.enum(["visivel", "oculto"]).default("visivel"),
  condicao: z.string().default("SEMPRE"),
  summary: SummaryDataSchema,
});

const ConductNodeDataSchema = z.object({
  type: z.literal("conduct"),
  label: z.string(),
  condicional: z.enum(["visivel", "oculto"]).default("visivel"),
  condicao: z.string().default("SEMPRE"),
  conduta: z
    .enum(["tratamento", "conclusao", "encaminhamento", "retorno"])
    .optional(),
  descricao: z.string().optional(), // HTML
  condutaDataNode: ConductDataSchema.optional(),
});

const ClinicalNodeDataSchema = z.discriminatedUnion("type", [
  CustomNodeDataSchema,
  SummaryNodeDataSchema,
  ConductNodeDataSchema,
  StartNodeDataSchema,
  EndNodeDataSchema,
]);

const ClinicalNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["custom", "summary", "conduct", "start", "end"]),
  position: z
    .object({
      x: z.number().default(0),
      y: z.number().default(0),
    })
    .optional(),
  data: ClinicalNodeDataSchema,
});

const ClinicalEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
  type: z.string().default("default"),
});

const ClinicalFlowchartSchema = z.object({
  nodes: z.array(ClinicalNodeSchema),
  edges: z.array(ClinicalEdgeSchema),
});

// Alternative flexible schema for initial parsing
const FlexibleNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  data: z.any(), // Accept any data initially
});

const FlexibleFlowchartSchema = z.object({
  nodes: z.array(FlexibleNodeSchema),
  edges: z.array(ClinicalEdgeSchema),
});

export interface ClinicalFlowchartGenerationOptions {
  model?: string;
  temperature?: number;
  maxRetries?: number;
  progressCallback?: (message: string) => void;
}

/**
 * Generate a clinical format flowchart from protocol content
 */
export async function generateClinicalFlowchart(
  protocolCondition: string,
  protocolContent: ProtocolFullContent,
  options?: ClinicalFlowchartGenerationOptions,
): Promise<ClinicalFlowchart> {
  const provider = getAIProvider();
  const model = options?.model || "o3";
  const temperature = options?.temperature ?? getModelTemperature(model, 0.3);

  // Select relevant sections for flowchart generation
  // Sections 3, 5, 6, 7, 8, 9 are most relevant for clinical flowcharts
  const relevantSections = {
    "3": protocolContent["3"], // Indicações
    "5": protocolContent["5"], // Avaliação Inicial
    "6": protocolContent["6"], // Exames Complementares
    "7": protocolContent["7"], // Critérios de Inclusão
    "8": protocolContent["8"], // Tratamento
    "9": protocolContent["9"], // Monitorização
  };

  const userPrompt = createClinicalFlowchartGenerationUserPrompt(
    protocolCondition,
    relevantSections,
  );

  try {
    options?.progressCallback?.(
      "🏥 Gerando estrutura clínica do fluxograma...",
    );

    // Generate the flowchart using AI
    const completion = await provider.createCompletion(
      [
        {
          role: "system",
          content: CLINICAL_FLOWCHART_GENERATION_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      {
        model,
        temperature,
        // NO LIMITS - let O3 work freely
      },
    );

    if (!completion.content) {
      throw new Error("AI returned empty content");
    }

    // Clean response from markdown code blocks if present
    const cleanedResponse = completion.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    console.log(
      "[Clinical Generator] Raw AI response (first 500 chars):",
      cleanedResponse.substring(0, 500),
    );

    // Parse and validate the response
    const parsed = JSON.parse(cleanedResponse);

    console.log("[Clinical Generator] Parsed response structure:", {
      hasNodes: !!parsed.nodes,
      nodesCount: parsed.nodes?.length,
      hasEdges: !!parsed.edges,
      edgesCount: parsed.edges?.length,
      firstNode: parsed.nodes?.[0]
        ? {
            id: parsed.nodes[0].id,
            type: parsed.nodes[0].type,
            hasData: !!parsed.nodes[0].data,
            dataType: parsed.nodes[0].data?.type,
            dataKeys: parsed.nodes[0].data
              ? Object.keys(parsed.nodes[0].data)
              : [],
          }
        : null,
    });

    // Try to identify problematic nodes before validation
    if (parsed.nodes && Array.isArray(parsed.nodes)) {
      parsed.nodes.forEach((node: any, index: number) => {
        if (!node.data || node.data === undefined) {
          console.error(
            `[Clinical Generator] Node at index ${index} has no data:`,
            node,
          );
        }
        if (!node.type && !node.data?.type) {
          console.error(
            `[Clinical Generator] Node at index ${index} has no type:`,
            node,
          );
        }
      });
    }

    // Try to validate with recovery
    let validated: any;
    try {
      validated = ClinicalFlowchartSchema.parse(parsed);
    } catch (zodError) {
      console.error("[Clinical Generator] Zod validation failed:", zodError);

      // Attempt to fix common issues
      console.log("[Clinical Generator] Attempting to fix structure...");

      const fixed: any = {
        nodes: [],
        edges: parsed.edges || [],
      };

      // Fix nodes one by one
      if (parsed.nodes && Array.isArray(parsed.nodes)) {
        for (let i = 0; i < parsed.nodes.length; i++) {
          const node = parsed.nodes[i];
          try {
            // Ensure node has proper structure
            const fixedNode: any = {
              id: node.id || `node-${i}`,
              type: node.type || node.data?.type || "action",
              position: node.position || { x: 0, y: 0 },
            };

            // Fix data structure based on type
            if (fixedNode.type === "start" || fixedNode.type === "end") {
              fixedNode.data = {
                type: fixedNode.type,
                title:
                  node.data?.title ||
                  node.data?.label ||
                  node.label ||
                  (fixedNode.type === "start" ? "Início" : "Fim"),
                label: node.data?.label || node.label,
              };
            } else if (node.type === "custom") {
              fixedNode.data = {
                type: "custom",
                label: node.data?.label || node.label || "Questionário",
                condicional: node.data?.condicional || "visivel",
                condicao: node.data?.condicao || "SEMPRE",
                questions: node.data?.questions || [],
                descricao: node.data?.descricao,
              };
            } else if (node.type === "summary") {
              fixedNode.data = {
                type: "summary",
                label: node.data?.label || node.label || "Resumo",
                condicional: node.data?.condicional || "visivel",
                condicao: node.data?.condicao || "SEMPRE",
                summary: node.data?.summary || {
                  titulo: node.data?.label || node.label || "Resumo",
                  descricao: node.data?.descricao || "",
                },
              };
            } else if (node.type === "conduct") {
              fixedNode.data = {
                type: "conduct",
                label: node.data?.label || node.label || "Conduta",
                condicional: node.data?.condicional || "visivel",
                condicao: node.data?.condicao || "SEMPRE",
                conduta: node.data?.conduta,
                descricao: node.data?.descricao,
                condutaDataNode: node.data?.condutaDataNode,
              };
            } else {
              // Default to action node
              fixedNode.type = "action";
              fixedNode.data = {
                type: "action",
                title:
                  node.data?.title || node.data?.label || node.label || "Ação",
                description: node.data?.description || node.data?.descricao,
              };
            }

            fixed.nodes.push(fixedNode);
          } catch (nodeError) {
            console.error(
              `[Clinical Generator] Failed to fix node ${i}:`,
              nodeError,
            );
          }
        }
      }

      // Try validation again with fixed structure
      try {
        validated = ClinicalFlowchartSchema.parse(fixed);
        console.log(
          "[Clinical Generator] Successfully fixed and validated structure",
        );
      } catch (secondError) {
        console.error(
          "[Clinical Generator] Failed to fix structure:",
          secondError,
        );
        throw new Error(
          "Unable to parse AI response into valid clinical flowchart format",
        );
      }
    }

    // Process nodes: fix positions, decode HTML, and ensure start/end titles
    validated.nodes = validated.nodes.map((node: any) => {
      const baseNode = {
        ...node,
        position: node.position || { x: 0, y: 0 },
      };

      // Decode HTML entities in all text fields
      if (baseNode.data) {
        // Recursively decode HTML in data object
        const decodeDataRecursively = (obj: any): any => {
          if (typeof obj === "string") {
            return decodeHtmlEntities(obj);
          } else if (Array.isArray(obj)) {
            return obj.map(decodeDataRecursively);
          } else if (obj && typeof obj === "object") {
            const decoded: any = {};
            for (const key in obj) {
              decoded[key] = decodeDataRecursively(obj[key]);
            }
            return decoded;
          }
          return obj;
        };

        baseNode.data = decodeDataRecursively(baseNode.data);
      }

      // Ensure start/end nodes have title
      if (baseNode.type === "start" || baseNode.type === "end") {
        baseNode.data = {
          ...baseNode.data,
          title:
            baseNode.data.title ||
            baseNode.data.label ||
            (baseNode.type === "start" ? "Início" : "Fim"),
        };
      }

      return baseNode;
    });

    // Filter out ALL empty nodes - be aggressive!
    validated.nodes = validated.nodes.filter((node: any) => {
      // Always keep start and end nodes
      if (node.type === "start" || node.type === "end") {
        return true;
      }

      // For ALL other nodes, check if they have meaningful content
      if (node.data) {
        const label = (node.data.label || "").trim();
        const descricao = (node.data.descricao || "").trim();
        const titulo = (node.data.title || node.data.titulo || "").trim();

        // Check if label is empty or generic
        const hasEmptyLabel =
          !label ||
          label === "" ||
          label.toLowerCase() === "nó" ||
          label.toLowerCase() === "nodo" ||
          label.toLowerCase() === "node";

        // Check if has no description
        const hasNoDescription = !descricao || descricao === "";

        // Check if has no title
        const hasNoTitle = !titulo || titulo === "";

        // For custom nodes, check questions
        if (node.type === "custom") {
          const hasQuestions =
            node.data.questions && node.data.questions.length > 0;
          if (!hasQuestions && hasEmptyLabel && hasNoDescription) {
            console.log("Filtering out empty custom node:", node.id, label);
            return false;
          }
        }

        // For summary nodes, check summary content
        if (node.type === "summary") {
          const hasSummary =
            node.data.summary &&
            (node.data.summary.titulo || node.data.summary.descricao);
          if (!hasSummary && hasEmptyLabel && hasNoDescription) {
            console.log("Filtering out empty summary node:", node.id, label);
            return false;
          }
        }

        // For conduct nodes, check conduct content
        if (node.type === "conduct") {
          const hasConduct =
            node.data.condutaDataNode &&
            Object.keys(node.data.condutaDataNode).some((key) => {
              const arr = node.data.condutaDataNode[key];
              return Array.isArray(arr) && arr.length > 0;
            });
          if (!hasConduct && hasEmptyLabel && hasNoDescription) {
            console.log("Filtering out empty conduct node:", node.id, label);
            return false;
          }
        }

        // If it's completely empty (no label, no description, no title)
        if (hasEmptyLabel && hasNoDescription && hasNoTitle) {
          console.log(
            "Filtering out completely empty node:",
            node.id,
            node.type,
          );
          return false;
        }
      }

      return true;
    });

    // Clean up edges that point to removed nodes
    const validNodeIds = new Set(validated.nodes.map((n: any) => n.id));
    validated.edges = validated.edges.filter((edge: any) => {
      const isValid =
        validNodeIds.has(edge.source) && validNodeIds.has(edge.target);
      if (!isValid) {
        console.log(
          `Removing edge ${edge.id} because source or target was removed`,
        );
      }
      return isValid;
    });

    options?.progressCallback?.("✅ Estrutura clínica gerada com sucesso!");

    return validated as ClinicalFlowchart;
  } catch (error) {
    console.error("Error generating clinical flowchart:", error);
    throw new Error(
      `Failed to generate clinical flowchart: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Helper to extract key sections text for clinical flowchart generation
 */
export function extractClinicalFlowchartSections(
  protocolContent: ProtocolFullContent,
): string {
  const sections = [
    protocolContent["3"], // Indicações
    protocolContent["5"], // Avaliação Inicial
    protocolContent["6"], // Exames Complementares
    protocolContent["7"], // Critérios
    protocolContent["8"], // Tratamento
    protocolContent["9"], // Monitorização
  ];

  return sections
    .filter(Boolean)
    .map((section) => {
      if (typeof section.content === "string") {
        return `${section.title}:\n${section.content}`;
      }
      return `${section.title}:\n${JSON.stringify(section.content, null, 2)}`;
    })
    .join("\n\n");
}
