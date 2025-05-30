/**
 * Custom hook to manage the state of the protocol editor.
 * This includes the current protocol data, selected section, loading/error states, etc.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { trpc } from "@/lib/api/client"; // For actual data fetching
import { useProtocolEditorValidation } from "./use-protocol-validation";

const generateMockProtocolData = (
  _protocolIdTitlePart: string,
): ProtocolFullContent => {
  const content: ProtocolFullContent = {};
  SECTION_DEFINITIONS.forEach((def) => {
    content[def.sectionNumber.toString()] = {
      sectionNumber: def.sectionNumber,
      title: def.titlePT,
      content: def.example ?? `Conteúdo de exemplo para ${def.titlePT}.`,
    };
  });
  console.log("[generateMockProtocolData] Generated protocol data:", content);
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
  currentVersionId: string | null;
  isLoading: boolean;
  error: string | null;
  validationIssues: import("@/types/validation").ValidationIssue[];
  protocolStatus?: import("@prisma/client").ProtocolStatus;
  protocolCreatorId?: string;
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
    currentVersionId: null,
    isLoading: true,
    error: null,
    validationIssues: [],
  });

  // Initialize validation hook with auto-validation support
  const validation = useProtocolEditorValidation();
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  console.log(
    "[useProtocolEditorState] validation hook initialized:",
    validation,
  );

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
      // Ensure protocol content from DB has proper structure with sectionNumber
      const rawContent = data.ProtocolVersion?.[0]
        ?.content as unknown as ProtocolFullContent;
      const protocolContent = rawContent
        ? Object.entries(rawContent).reduce((acc, [key, section]) => {
            acc[key] = {
              ...section,
              sectionNumber: parseInt(key, 10), // Ensure sectionNumber exists
            };
            return acc;
          }, {} as ProtocolFullContent)
        : generateMockProtocolData(data.title);
      setState((s) => ({
        ...s,
        protocolId: data.id,
        protocolTitle: data.title,
        protocolData: protocolContent,
        flowchartData:
          (data.ProtocolVersion?.[0]
            ?.flowchart as unknown as FlowchartDefinition) ||
          initialEmptyFlowchart,
        currentVersionId: data.ProtocolVersion?.[0]?.id || null,
        isLoading: false,
        error: null,
        protocolStatus: data.status,
        protocolCreatorId: data.createdById,
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
          // CRITICAL FIX: Do NOT manually fetch and overwrite - this causes section bleeding
          // Instead, just invalidate cache and let the useQuery handle the refresh
          console.log(
            "[useProtocolEditorState] Invalidating cache for protocolId:",
            id,
          );
          await utils.protocol.getById.invalidate({ protocolId: id });

          // Set loading state and let useQuery handle the data fetching
          setState((s) => ({
            ...s,
            protocolId: id,
            isLoading: false, // useQuery will handle loading state
            error: null,
          }));

          console.log(
            "[useProtocolEditorState] Cache invalidated, useQuery will handle refresh without overwriting local edits",
          );
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

  // Cleanup validation timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

  // Debounced validation trigger
  const triggerValidation = useCallback(() => {
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    if (validation.autoValidate && state.protocolData && !state.isLoading) {
      validationTimerRef.current = setTimeout(() => {
        console.log(
          "[useProtocolEditorState] Auto-validation triggered after debounce",
        );
        validation.validateIfNeeded(
          state.protocolData!,
          state.flowchartData || undefined,
        );
      }, 2000); // 2 second debounce
    }
  }, [validation, state.protocolData, state.flowchartData, state.isLoading]);

  const selectSection = (sectionNumber: number) => {
    if (sectionNumber >= 1 && sectionNumber <= SECTION_DEFINITIONS.length) {
      setState((s) => ({ ...s, currentSectionNumber: sectionNumber }));
    }
  };

  const updateSectionContent = (
    sectionNumber: number,
    newContent: ProtocolSectionData["content"],
  ) => {
    console.log(
      "[useProtocolEditorState] ========== UPDATE SECTION CONTENT DEBUG ==========",
    );
    console.log("[useProtocolEditorState] Section number:", sectionNumber);
    console.log("[useProtocolEditorState] New content:", newContent);

    // Validate inputs to prevent crashes
    if (
      typeof sectionNumber !== "number" ||
      sectionNumber < 1 ||
      sectionNumber > 13
    ) {
      console.error(
        "[useProtocolEditorState] Invalid sectionNumber:",
        sectionNumber,
      );
      return;
    }

    if (newContent === undefined) {
      console.error("[useProtocolEditorState] newContent is undefined");
      return;
    }

    setState((s) => {
      if (!s.protocolData) {
        console.warn(
          "[useProtocolEditorState] protocolData is null, cannot update section",
        );
        return s;
      }

      const key = sectionNumber.toString();
      const existingSection = s.protocolData[key];

      console.log(
        "[useProtocolEditorState] Existing section data:",
        existingSection,
      );
      console.log(
        "[useProtocolEditorState] Current protocol data keys:",
        Object.keys(s.protocolData),
      );

      // CRITICAL FIX: Create a completely new protocolData object to prevent reference sharing
      // This ensures section isolation and prevents bleeding between sections
      const newProtocolData = { ...s.protocolData };
      newProtocolData[key] = {
        // Ensure existing section data is spread if it exists, or create new
        ...(existingSection || {
          sectionNumber,
          title:
            SECTION_DEFINITIONS.find((sd) => sd.sectionNumber === sectionNumber)
              ?.titlePT || `Seção ${sectionNumber}`,
        }),
        content: newContent,
      };

      const newState = {
        ...s,
        protocolData: newProtocolData,
      };

      console.log(
        "[useProtocolEditorState] Updated section data:",
        newState.protocolData[key],
      );
      console.log(
        "[useProtocolEditorState] ONLY section",
        sectionNumber,
        "should be affected",
      );
      console.log(
        "[useProtocolEditorState] ========== UPDATE SECTION CONTENT DEBUG END ==========",
      );

      return newState;
    });

    // Trigger auto-validation after content update
    triggerValidation();
  };

  const updateProtocolMutation = trpc.protocol.update.useMutation({
    onSuccess: async (newVersion) => {
      console.log(
        "[useProtocolEditorState] Protocol updated successfully",
        newVersion,
      );

      // CRITICAL FIX: DO NOT refresh from database after save to prevent overwriting local edits
      console.log(
        "[useProtocolEditorState] NOT refreshing from database to preserve local section edits",
      );

      // Just clear the error state since save was successful
      setState((s) => ({
        ...s,
        error: null,
      }));

      console.log(
        "[useProtocolEditorState] Save completed without overwriting local state",
      );
    },
    onError: (error) => {
      console.error("[useProtocolEditorState] Error updating protocol:", error);
      setState((s) => ({ ...s, error: `Erro ao salvar: ${error.message}` }));
    },
  });

  const saveProtocol = async (): Promise<boolean> => {
    console.log(
      "[useProtocolEditorState] ========== SAVE PROTOCOL DEBUG ==========",
    );
    console.log("[useProtocolEditorState] Protocol ID:", state.protocolId);
    console.log("[useProtocolEditorState] Protocol Data:", state.protocolData);
    console.log(
      "[useProtocolEditorState] Protocol Title:",
      state.protocolTitle,
    );

    if (
      !state.protocolData ||
      !state.protocolId ||
      state.protocolId === "new"
    ) {
      console.error(
        "[useProtocolEditorState] Cannot save: protocol data or ID is missing/invalid.",
      );
      setState((s) => ({
        ...s,
        error: "Não é possível salvar: dados do protocolo ou ID inválidos.",
      }));
      return false;
    }

    try {
      console.log("[useProtocolEditorState] Attempting to save to database...");
      console.log(
        "[useProtocolEditorState] Mutation pending:",
        updateProtocolMutation.isPending,
      );

      const newVersion = await updateProtocolMutation.mutateAsync({
        protocolId: state.protocolId,
        content: state.protocolData,
        flowchart: (state.flowchartData || { nodes: [], edges: [] }) as any,
        changelogNotes: "Atualização via editor",
      });

      console.log(
        `[useProtocolEditorState] Protocol ${state.protocolTitle} saved successfully`,
        newVersion,
      );
      console.log(
        "[useProtocolEditorState] ========== SAVE PROTOCOL DEBUG END ==========",
      );

      // Update the local state to reflect the saved data
      // This ensures the saved content becomes the new "base" state
      setState((s) => ({
        ...s,
        currentVersionId: newVersion.id,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error("[useProtocolEditorState] Save error:", error);
      console.log(
        "[useProtocolEditorState] ========== SAVE PROTOCOL DEBUG END (ERROR) ==========",
      );
      // Error is handled by the mutation's onError callback
      return false;
    }
  };

  console.log("[useProtocolEditorState] Current validation state:", {
    issues: validation.issues,
    isLoading: validation.isLoading,
    lastValidated: validation.lastValidated,
  });

  return {
    ...state,
    validationIssues: validation.issues,
    selectSection,
    fetchProtocolData,
    updateSectionContent,
    saveProtocol,
    isSaving: updateProtocolMutation.isPending,
    // Validation controls
    validation: {
      issues: validation.issues,
      summary: validation.summary,
      isValid: validation.isValid,
      isLoading: validation.isLoading,
      error: validation.error,
      lastValidated: validation.lastValidated,
      autoValidate: validation.autoValidate,
      toggleAutoValidate: validation.toggleAutoValidate,
      validate: () => {
        console.log("[useProtocolEditorState] Validate button clicked");
        console.log(
          "[useProtocolEditorState] Current protocolData:",
          state.protocolData,
        );
        console.log(
          "[useProtocolEditorState] Current flowchartData:",
          state.flowchartData,
        );
        if (state.protocolData) {
          validation.validate(
            state.protocolData,
            state.flowchartData || undefined,
          );
        } else {
          console.warn(
            "[useProtocolEditorState] No protocolData available for validation",
          );
        }
      },
    },
  };
}
