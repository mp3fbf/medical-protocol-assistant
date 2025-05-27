/**
 * Custom hook to manage the state of the protocol editor.
 * This includes the current protocol data, selected section, loading/error states, etc.
 */
"use client"; // This hook will be used in client components

import { useState, useEffect, useCallback } from "react";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart"; // Assuming this type exists
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific"; // For default titles

// Mock data for demonstration purposes
const generateMockProtocolData = (protocolId: string): ProtocolFullContent => {
  const content: ProtocolFullContent = {};
  SECTION_DEFINITIONS.forEach((def) => {
    content[def.sectionNumber.toString()] = {
      sectionNumber: def.sectionNumber,
      title: def.titlePT,
      content:
        typeof def.example === "string"
          ? `${def.example} (Exemplo para ID: ${protocolId})`
          : (def.example ?? `Conteúdo de exemplo para ${def.titlePT}.`),
    };
  });
  return content;
};

const mockFlowchartData: FlowchartDefinition = {
  nodes: [
    {
      id: "1",
      type: "triage",
      position: { x: 50, y: 50 },
      data: { type: "triage", title: "Início (Mock)" },
    },
    {
      id: "2",
      type: "decision",
      position: { x: 50, y: 150 },
      data: {
        type: "decision",
        title: "Estável?",
        criteria: "Sinais vitais normais",
      },
    },
  ],
  edges: [{ id: "e1-2", source: "1", target: "2", type: "default" }],
};

interface ProtocolEditorState {
  protocolId: string | null;
  protocolTitle: string;
  protocolData: ProtocolFullContent | null;
  flowchartData: FlowchartDefinition | null;
  currentSectionNumber: number;
  isLoading: boolean;
  error: string | null;
  validationIssues: any[]; // Replace 'any' with actual ValidationIssue type
}

export function useProtocolEditorState(initialProtocolId?: string) {
  const [state, setState] = useState<ProtocolEditorState>({
    protocolId: initialProtocolId || null,
    protocolTitle: "Carregando protocolo...",
    protocolData: null,
    flowchartData: null,
    currentSectionNumber: 1,
    isLoading: true,
    error: null,
    validationIssues: [], // Placeholder for validation issues
  });

  const fetchProtocolData = useCallback(async (id: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null, protocolId: id }));
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      // In a real app, fetch data using tRPC client:
      // const data = await trpc.protocol.getById.query({ protocolId: id });
      // For now, using mock data:
      const mockData = generateMockProtocolData(id);
      const title =
        (mockData["1"]?.content as { tituloCompleto?: string })
          ?.tituloCompleto || `Protocolo ${id}`;

      setState((s) => ({
        ...s,
        protocolTitle: title,
        protocolData: mockData,
        flowchartData: mockFlowchartData, // Load mock flowchart data
        isLoading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: `Falha ao carregar protocolo: ${(err as Error).message}`,
        isLoading: false,
        protocolData: null,
        flowchartData: null,
      }));
    }
  }, []);

  useEffect(() => {
    if (initialProtocolId) {
      fetchProtocolData(initialProtocolId);
    } else {
      // Handle case where no ID is provided, e.g. new protocol creation
      // For now, set loading to false and potentially initialize empty data
      const newProtocolData = generateMockProtocolData("novo-protocolo");
      setState((s) => ({
        ...s,
        isLoading: false,
        protocolId: "novo-protocolo", // Placeholder ID
        protocolTitle: "Novo Protocolo (Não Salvo)",
        protocolData: newProtocolData,
        flowchartData: { nodes: [], edges: [] }, // Empty flowchart
        currentSectionNumber: 1,
      }));
    }
  }, [initialProtocolId, fetchProtocolData]);

  const selectSection = (sectionNumber: number) => {
    if (sectionNumber >= 1 && sectionNumber <= SECTION_DEFINITIONS.length) {
      setState((s) => ({ ...s, currentSectionNumber: sectionNumber }));
    }
  };

  const updateSectionContent = (
    sectionNumber: number,
    newContent: ProtocolSectionData["content"],
  ) => {
    setState((s) => {
      if (!s.protocolData) return s;
      const key = sectionNumber.toString();
      return {
        ...s,
        protocolData: {
          ...s.protocolData,
          [key]: {
            ...s.protocolData[key],
            content: newContent,
          },
        },
        // Mark as dirty, etc. (future enhancement)
      };
    });
  };

  // Placeholder for saving data
  const saveProtocol = async () => {
    if (!state.protocolData || !state.protocolId) return;
    console.log("Simulando salvamento do protocolo:", state.protocolData);
    // Actual save logic using tRPC mutation would go here
  };

  return {
    ...state,
    selectSection,
    fetchProtocolData, // Expose if re-fetching is needed
    updateSectionContent, // Example mutator
    saveProtocol, // Example save action
  };
}
