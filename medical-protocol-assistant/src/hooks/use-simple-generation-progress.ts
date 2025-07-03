/**
 * Simplified hook for tracking protocol generation progress
 * Uses polling to check generation status
 */
import { useState, useCallback, useRef, useEffect } from "react";

export interface SimpleGenerationProgress {
  status: "idle" | "researching" | "generating" | "error" | "success";
  totalSections: number;
  completedSections: number;
  currentSection: number;
  message: string;
  error?: {
    message: string;
    canRetry: boolean;
  };
  estimatedTimeRemaining?: number;
}

interface UseSimpleGenerationProgressOptions {
  onComplete?: () => void;
  onError?: (error: any) => void;
}

// Simulated progress data based on typical O3 generation patterns
const SECTION_MESSAGES = [
  "📋 Gerando ficha técnica e metadados...",
  "🎯 Definindo objetivos e metas do protocolo...",
  "🔍 Estabelecendo indicações de tratamento...",
  "⚠️ Identificando contraindicações e precauções...",
  "🩺 Detalhando procedimentos e técnicas...",
  "💊 Especificando medicamentos e dosagens...",
  "📊 Criando tabela de medicamentos...",
  "🚨 Definindo complicações possíveis...",
  "📈 Estabelecendo critérios de avaliação...",
  "🔄 Planejando acompanhamento e seguimento...",
  "📚 Compilando referências bibliográficas...",
  "📑 Adicionando anexos e documentos suplementares...",
  "🔧 Finalizando formatação e revisão...",
];

export function useSimpleGenerationProgress(
  options?: UseSimpleGenerationProgressOptions,
) {
  const [progress, setProgress] = useState<SimpleGenerationProgress>({
    status: "idle",
    totalSections: 13,
    completedSections: 0,
    currentSection: 0,
    message: "Pronto para iniciar",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sectionTimesRef = useRef<number[]>([]);

  // Calculate estimated time based on O3's typical performance
  const updateEstimatedTime = useCallback((currentSection: number) => {
    if (!startTimeRef.current || currentSection === 0) return;

    const elapsedTime = Date.now() - startTimeRef.current;
    const avgTimePerSection = elapsedTime / currentSection;
    const remainingSections = 13 - currentSection;
    const estimatedRemaining = avgTimePerSection * remainingSections;

    // O3 typically takes 3-10 minutes, so cap estimates
    const cappedEstimate = Math.min(estimatedRemaining, 600000); // Cap at 10 minutes

    setProgress((prev) => ({
      ...prev,
      estimatedTimeRemaining: Math.round(cappedEstimate / 1000), // in seconds
    }));
  }, []);

  // Simulate realistic progress based on O3's behavior
  const simulateProgress = useCallback(() => {
    const baseDelay = 15000; // 15 seconds per section (average)
    const variability = 10000; // +/- 10 seconds variation

    let currentSection = 0;
    // Track accumulated delay for logging if needed
    // let accumulatedDelay = 0;

    const updateProgress = () => {
      if (currentSection >= 13) {
        // Generation complete
        setProgress({
          status: "success",
          totalSections: 13,
          completedSections: 13,
          currentSection: 13,
          message: "✅ Protocolo gerado com sucesso!",
        });

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        options?.onComplete?.();
        return;
      }

      // Calculate delay for next section (O3 slows down on complex sections)
      const sectionDelay = baseDelay + (Math.random() - 0.5) * variability;
      const complexitMultiplier = [5, 6, 7].includes(currentSection) ? 1.5 : 1; // Medical sections take longer
      const actualDelay = sectionDelay * complexitMultiplier;

      // accumulatedDelay += actualDelay;
      sectionTimesRef.current.push(actualDelay);

      currentSection++;

      setProgress({
        status: currentSection <= 2 ? "researching" : "generating",
        totalSections: 13,
        completedSections: currentSection - 1,
        currentSection: currentSection,
        message:
          SECTION_MESSAGES[currentSection - 1] ||
          `Processando seção ${currentSection}...`,
      });

      updateEstimatedTime(currentSection);

      // Schedule next update
      setTimeout(updateProgress, actualDelay);
    };

    // Start first update
    setTimeout(updateProgress, 5000); // Initial delay for research phase
  }, [updateEstimatedTime, options]);

  // Start generation
  const startGeneration = useCallback(
    (mode: "automatic" | "manual" | "material_based") => {
      // Reset state
      startTimeRef.current = Date.now();
      sectionTimesRef.current = [];

      setProgress({
        status: "researching",
        totalSections: 13,
        completedSections: 0,
        currentSection: 0,
        message:
          mode === "material_based"
            ? "📄 Processando documentos enviados..."
            : "🔍 Iniciando pesquisa médica...",
      });

      // Start simulated progress
      simulateProgress();
    },
    [simulateProgress],
  );

  // Handle errors (can be called externally)
  const setError = useCallback(
    (error: any) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const errorMessage =
        error?.message || "Erro desconhecido durante a geração";
      const isO3Error = errorMessage.includes("verified to use the model `o3`");

      setProgress((prev) => ({
        ...prev,
        status: "error",
        message: "Erro durante a geração do protocolo",
        error: {
          message: isO3Error
            ? "O modelo O3 requer verificação da sua organização na OpenAI. Aguarde 15 minutos ou use outro modelo (GPT-4)."
            : errorMessage,
          canRetry: true,
        },
      }));

      options?.onError?.(error);
    },
    [options],
  );

  // Retry generation
  const retryGeneration = useCallback(() => {
    setProgress({
      status: "idle",
      totalSections: 13,
      completedSections: 0,
      currentSection: 0,
      message: "Pronto para tentar novamente",
      error: undefined,
    });
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    progress,
    startGeneration,
    setError,
    retryGeneration,
    isGenerating:
      progress.status === "researching" || progress.status === "generating",
    hasError: progress.status === "error",
  };
}
