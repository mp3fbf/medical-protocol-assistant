/**
 * Custom hook to manage the state of the protocol editor.
 * This includes the current protocol data, selected section, loading/error states, etc.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { trpc } from "@/lib/api/client"; // For actual data fetching
import { type TRPCClientErrorLike } from "@trpc/client";
import { type inferProcedureOutput } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";

// Define a type alias for the procedure output for cleaner usage
type ProtocolGetByIdOutput = inferProcedureOutput<
  AppRouter["protocol"]["getById"]
>;

const generateMockProtocolData = (
  protocolIdTitlePart: string,
): ProtocolFullContent => {
  const content: ProtocolFullContent = {};
  SECTION_DEFINITIONS.forEach((def) => {
    content[def.sectionNumber.toString()] = {
      sectionNumber: def.sectionNumber,
      title: def.titlePT,
      content:
        typeof def.example === "string"
          ? `${def.example} (Exemplo para ${protocolIdTitlePart})`
          : (def.example ?? `Conteúdo de exemplo para ${def.titlePT}.`),
    };
  });
  return content;
};

const initialEmptyFlowchart: FlowchartDefinition = {
  nodes: [],
  edges: [],
};

interface ProtocolEditorState {
  protocolId: string | null;
  protocolTitle: string;
  protocolData: ProtocolFullContent | null;
  flowchartData: FlowchartDefinition | null;
  currentSectionNumber: number;
  isLoading: boolean;
  error: string | null;
  validationIssues: import("@/types/validation").ValidationIssue[];
}

// Basic CUID check (starts with 'c', typically 25 chars long)
const isValidCuid = (id: string): boolean =>
  id.startsWith("c") && id.length >= 24 && id.length <= 30;

export function useProtocolEditorState(initialProtocolId?: string) {
  const [state, setState] = useState<ProtocolEditorState>({
    protocolId: initialProtocolId || null,
    protocolTitle: "Carregando...",
    protocolData: null,
    flowchartData: null,
    currentSectionNumber: 1,
    isLoading: true,
    error: null,
    validationIssues: [],
  });

  const utils = trpc.useUtils();
  const protocolQuery = trpc.protocol.getById.useQuery(
    { protocolId: initialProtocolId as string }, // Cast: enabled will control if it runs
    {
      enabled:
        !!initialProtocolId &&
        initialProtocolId !== "new" &&
        isValidCuid(initialProtocolId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  // useEffect to handle query success
  useEffect(() => {
    if (protocolQuery.isSuccess && protocolQuery.data) {
      const data = protocolQuery.data;
      const protocolContent =
        (data.ProtocolVersion?.[0]
          ?.content as unknown as ProtocolFullContent) ||
        generateMockProtocolData(data.title);
      setState((s) => ({
        ...s,
        protocolId: data.id,
        protocolTitle: data.title,
        protocolData: protocolContent,
        flowchartData:
          (data.ProtocolVersion?.[0]
            ?.flowchart as unknown as FlowchartDefinition) ||
          initialEmptyFlowchart,
        isLoading: false,
        error: null,
      }));
    }
  }, [protocolQuery.isSuccess, protocolQuery.data]); // Dependencies

  // useEffect to handle query error
  useEffect(() => {
    if (protocolQuery.isError && protocolQuery.error) {
      const err = protocolQuery.error;
      console.error(
        "[useProtocolEditorState] trpc.protocol.getById onError (useEffect): ",
        err,
      );
      setState((s) => ({
        ...s,
        error: `Falha ao carregar protocolo: ${err.message}`,
        isLoading: false,
        protocolTitle: "Erro ao Carregar",
        protocolData: null, // Clear data on error
        flowchartData: null,
      }));
    }
  }, [protocolQuery.isError, protocolQuery.error]); // Dependencies

  const fetchProtocolData = useCallback(
    async (id: string) => {
      console.log(
        "[useProtocolEditorState] fetchProtocolData called with id:",
        id,
      );
      if (id && id !== "new" && isValidCuid(id)) {
        setState((s) => ({
          ...s,
          isLoading: true,
          error: null,
          protocolId: id,
        }));
        try {
          await utils.protocol.getById.invalidate({ protocolId: id }); // Invalidate to force refetch
          const data = await utils.protocol.getById.fetch({ protocolId: id });
          if (data) {
            console.log("[useProtocolEditorState] Manual fetch success:", data);
            setState((s) => ({
              ...s,
              protocolId: data.id,
              protocolTitle: data.title,
              protocolData:
                (data.ProtocolVersion?.[0]
                  ?.content as unknown as ProtocolFullContent) ||
                generateMockProtocolData(data.title),
              flowchartData:
                (data.ProtocolVersion?.[0]
                  ?.flowchart as unknown as FlowchartDefinition) ||
                initialEmptyFlowchart,
              isLoading: false,
              error: null,
            }));
          } else {
            throw new Error("Protocolo não encontrado após fetch manual.");
          }
        } catch (err) {
          console.error("[useProtocolEditorState] Manual fetch error:", err);
          setState((s) => ({
            ...s,
            error: `Falha ao recarregar: ${(err as Error).message}`,
            isLoading: false,
          }));
        }
      } else {
        console.warn(
          "[useProtocolEditorState] fetchProtocolData: Invalid ID, not fetching:",
          id,
        );
        // Handle new or invalid ID case - setup for a new protocol
        setState((s) => ({
          ...s,
          isLoading: false,
          protocolId: "new", // Explicitly set to "new" or a new CUID if generating client-side
          protocolTitle: "Novo Protocolo (Não Salvo)",
          protocolData: generateMockProtocolData("Novo Protocolo"), // Initialize with empty/default structure
          flowchartData: initialEmptyFlowchart,
          currentSectionNumber: 1,
          error: null,
        }));
      }
    },
    [utils.protocol.getById],
  );

  useEffect(() => {
    console.log(
      "[useProtocolEditorState] useEffect triggered. initialProtocolId:",
      initialProtocolId,
    );
    if (
      initialProtocolId &&
      initialProtocolId !== "new" &&
      isValidCuid(initialProtocolId)
    ) {
      // Data fetching is handled by useQuery, isLoading will be true initially
      setState((s) => ({
        ...s,
        isLoading: protocolQuery.isLoading,
        error: protocolQuery.error?.message || null,
      }));
    } else if (
      initialProtocolId === "new" ||
      !isValidCuid(initialProtocolId || "")
    ) {
      // Setup for a new protocol if ID is "new" or invalid
      console.log(
        "[useProtocolEditorState] Setting up for a new protocol or invalid ID.",
      );
      setState((s) => ({
        ...s,
        isLoading: false,
        protocolId: "new",
        protocolTitle: "Novo Protocolo",
        protocolData: generateMockProtocolData("Novo Protocolo"),
        flowchartData: initialEmptyFlowchart,
        currentSectionNumber: 1,
        error: null,
      }));
    } else if (!initialProtocolId && !protocolQuery.isLoading) {
      // Fallback if no ID and not already loading (e.g., direct navigation to /protocols/ without ID)
      // This case should ideally not happen if routing is correct for new vs edit
      console.warn(
        "[useProtocolEditorState] No initialProtocolId and not loading, setting to new protocol state.",
      );
      setState((s) => ({
        ...s,
        isLoading: false,
        protocolId: "new",
        protocolTitle: "Novo Protocolo (ID Ausente)",
        protocolData: generateMockProtocolData("Novo Protocolo (ID Ausente)"),
        flowchartData: initialEmptyFlowchart,
        error: null,
      }));
    }
  }, [initialProtocolId, protocolQuery.isLoading, protocolQuery.error]);

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
            // Ensure existing section data is spread if it exists, or create new
            ...(s.protocolData[key] || {
              sectionNumber,
              title:
                SECTION_DEFINITIONS.find(
                  (sd) => sd.sectionNumber === sectionNumber,
                )?.titlePT || `Seção ${sectionNumber}`,
            }),
            content: newContent,
          },
        },
      };
    });
  };

  const saveProtocol = async () => {
    if (
      !state.protocolData ||
      !state.protocolId ||
      state.protocolId === "new"
    ) {
      console.error(
        "[useProtocolEditorState] Cannot save: protocol data or ID is missing/invalid.",
      );
      // TODO: Implement actual save logic (e.g., tRPC mutation for update)
      // This would likely be create if ID is "new", or update if ID is a CUID.
      alert(
        "Funcionalidade de salvar ainda não implementada completamente ou ID de protocolo inválido.",
      );
      return;
    }
    console.log(
      "[useProtocolEditorState] Simulating save for protocol:",
      state.protocolId,
      state.protocolData,
    );
    // Example: await trpc.protocol.update.mutateAsync({ protocolId: state.protocolId, content: state.protocolData, flowchart: state.flowchartData });
    alert(`Protocolo ${state.protocolTitle} salvo (simulação).`);
  };

  return {
    ...state,
    selectSection,
    fetchProtocolData,
    updateSectionContent,
    saveProtocol,
  };
}
