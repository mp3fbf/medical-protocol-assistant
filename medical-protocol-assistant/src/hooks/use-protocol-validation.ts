/**
 * Hook for protocol validation functionality
 */
import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/api/client";
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";

import type { ValidationIssue } from "@/types/validation";

interface ValidationSummary {
  totalIssues: number;
  errors: number;
  warnings: number;
}

interface UseProtocolValidationReturn {
  validate: (
    content: ProtocolFullContent,
    flowchart?: FlowchartData,
  ) => Promise<void>;
  issues: ValidationIssue[];
  summary: ValidationSummary;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  lastValidated: Date | null;
}

export function useProtocolValidation(): UseProtocolValidationReturn {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [summary, setSummary] = useState<ValidationSummary>({
    totalIssues: 0,
    errors: 0,
    warnings: 0,
  });
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);

  const validateContentMutation = trpc.validation.validateContent.useMutation({
    onSuccess: (data) => {
      console.log(
        "[useProtocolValidation] Validation completed successfully:",
        data,
      );
      if (data.success) {
        // Use a setTimeout to ensure state updates are not immediately overwritten
        setTimeout(() => {
          setIssues(data.issues || []);
          setSummary(
            data.summary || { totalIssues: 0, errors: 0, warnings: 0 },
          );
          setIsValid(data.isValid || false);
          setError(null);
          setLastValidated(new Date());
          setIsLoading(false);
          console.log("[useProtocolValidation] Issues set:", data.issues);
          console.log("[useProtocolValidation] Summary set:", data.summary);
        }, 0);
      } else {
        setError(data.error || "Erro na validação");
        setIssues([]);
        setSummary({ totalIssues: 0, errors: 0, warnings: 0 });
        setIsValid(false);
        setLastValidated(new Date());
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("[useProtocolValidation] Validation error:", error);
      setError(error.message);
      setIssues([]);
      setSummary({ totalIssues: 0, errors: 0, warnings: 0 });
      setIsValid(false);
      setLastValidated(new Date());
      setIsLoading(false);
    },
  });

  const validate = useCallback(
    async (content: ProtocolFullContent, flowchart?: FlowchartData) => {
      console.log("[useProtocolValidation] Starting validation...");
      console.log("[useProtocolValidation] Content:", content);
      console.log("[useProtocolValidation] Flowchart:", flowchart);

      setIsLoading(true);
      setError(null);

      try {
        await validateContentMutation.mutateAsync({
          content,
          flowchart: flowchart
            ? {
                nodes:
                  flowchart.nodes?.map((node) => ({
                    id: node.id,
                    type: node.type,
                    position: node.position,
                    data: node.data,
                  })) || [],
                edges:
                  flowchart.edges?.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label:
                      typeof edge.label === "string" ? edge.label : undefined,
                  })) || [],
              }
            : undefined,
          validationTypes: [
            "structure",
            "completeness",
            "medical",
            "medication",
          ],
        });
        console.log("[useProtocolValidation] Validation mutation completed");
      } catch (err) {
        // Error handling is done in the mutation callbacks
        console.error(
          "[useProtocolValidation] Validation error in try/catch:",
          err,
        );
      }
    },
    [validateContentMutation],
  );

  return {
    validate,
    issues,
    summary,
    isValid,
    isLoading,
    error,
    lastValidated,
  };
}

/**
 * Hook for real-time validation with debouncing
 */
export function useRealTimeValidation(
  content: ProtocolFullContent,
  flowchart?: FlowchartData,
  debounceMs: number = 2000, // 2 seconds
): UseProtocolValidationReturn {
  const validation = useProtocolValidation();
  const [debouncedContent, setDebouncedContent] = useState(content);
  const [debouncedFlowchart, setDebouncedFlowchart] = useState(flowchart);

  // Debounce content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
      setDebouncedFlowchart(flowchart);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [content, flowchart, debounceMs]);

  // Run validation when debounced content changes
  useEffect(() => {
    if (debouncedContent) {
      validation.validate(debouncedContent, debouncedFlowchart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, debouncedFlowchart]);

  return validation;
}

/**
 * Hook for validation state management in the protocol editor
 */
export function useProtocolEditorValidation() {
  const validation = useProtocolValidation();
  const [autoValidate, setAutoValidate] = useState<boolean>(true);

  const toggleAutoValidate = useCallback(() => {
    setAutoValidate((prev) => !prev);
  }, []);

  const validateIfNeeded = useCallback(
    (content: ProtocolFullContent, flowchart?: FlowchartData) => {
      if (autoValidate) {
        validation.validate(content, flowchart);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autoValidate],
  );

  return {
    ...validation,
    autoValidate,
    toggleAutoValidate,
    validateIfNeeded,
  };
}
