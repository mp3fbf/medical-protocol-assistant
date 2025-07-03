/**
 * Real-time progress bar for flowchart generation using SSE
 */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import {
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Search,
  GitBranch,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowchartProgressBarProps {
  protocolId: string;
  onComplete?: (flowchart: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const stepIcons = {
  1: Search, // Análise
  2: Brain, // Decisões
  3: GitBranch, // Mapeamento
  4: Zap, // Finalização
};

const stepColors = {
  1: "text-blue-600 dark:text-blue-400",
  2: "text-purple-600 dark:text-purple-400",
  3: "text-indigo-600 dark:text-indigo-400",
  4: "text-emerald-600 dark:text-emerald-400",
};

export function FlowchartProgressBar({
  protocolId,
  onComplete,
  onError,
  className,
}: FlowchartProgressBarProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(4);
  const [message, setMessage] = useState("Conectando...");
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const connectSSE = () => {
      if (!isMounted || hasCompletedRef.current) return;

      const url = `/api/flowchart/progress/${protocolId}`;
      console.log(`[FlowchartProgressBar] Connecting to SSE: ${url}`);

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("[FlowchartProgressBar] SSE connection opened");
        if (isMounted) {
          setIsConnected(true);
          setError(null);
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[FlowchartProgressBar] Received event:", data);

          if (!isMounted) return;

          if (data.type === "progress") {
            setCurrentStep(data.step || 0);
            setTotalSteps(data.totalSteps || 4);
            setMessage(data.message);
          } else if (data.type === "complete") {
            setIsComplete(true);
            setMessage("✅ Fluxograma gerado com sucesso!");
            hasCompletedRef.current = true;

            if (data.data) {
              onComplete?.(data.data);
            }

            // Close connection after completion
            setTimeout(() => {
              eventSource.close();
            }, 1000);
          } else if (data.type === "error") {
            setError(data.message);
            onError?.(data.message);
            eventSource.close();
          }
        } catch (err) {
          console.error("[FlowchartProgressBar] Error parsing SSE data:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("[FlowchartProgressBar] SSE error:", err);
        eventSource.close();

        if (isMounted && !hasCompletedRef.current) {
          setIsConnected(false);
          setError("Conexão perdida. Reconectando...");

          // Retry connection after 2 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted && !hasCompletedRef.current) {
              connectSSE();
            }
          }, 2000);
        }
      };
    };

    connectSSE();

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [protocolId, onComplete, onError]);

  const progressPercentage =
    totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const CurrentStepIcon =
    stepIcons[currentStep as keyof typeof stepIcons] || Sparkles;
  const currentStepColor =
    stepColors[currentStep as keyof typeof stepColors] || "text-gray-600";

  if (error && !isConnected) {
    return (
      <UltraGlassCard className={cn("p-6", className)}>
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-900 dark:text-red-100">
              Erro na Geração do Fluxograma
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      </UltraGlassCard>
    );
  }

  return (
    <UltraGlassCard
      className={cn(
        "p-6 transition-all duration-500",
        isComplete && "border-emerald-200 dark:border-emerald-800",
        className,
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg p-2 transition-colors duration-300",
                isComplete
                  ? "bg-emerald-100 dark:bg-emerald-900/20"
                  : "bg-primary-100 dark:bg-primary-900/20",
              )}
            >
              {isComplete ? (
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <CurrentStepIcon className={cn("h-6 w-6", currentStepColor)} />
              )}
            </div>
            <div>
              <h3 className="font-semibold">
                {isComplete ? "Fluxograma Gerado" : "Gerando Fluxograma com IA"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>
          {!isComplete && isConnected && (
            <Loader2 className="h-5 w-5 animate-spin text-primary-600 dark:text-primary-400" />
          )}
        </div>

        {/* Progress */}
        {!isComplete && (
          <>
            <Progress
              value={progressPercentage}
              className={cn("h-2", isComplete && "[&>div]:bg-emerald-500")}
            />

            {/* Step indicators */}
            <div className="flex justify-between text-xs">
              {[1, 2, 3, 4].map((step) => {
                const StepIcon = stepIcons[step as keyof typeof stepIcons];
                const stepColor = stepColors[step as keyof typeof stepColors];
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;

                return (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center gap-1 transition-all duration-300",
                      isActive && "scale-110",
                      isCompleted && "opacity-50",
                      !isActive && !isCompleted && "opacity-30",
                    )}
                  >
                    <StepIcon className={cn("h-4 w-4", stepColor)} />
                    <span
                      className={cn(
                        "hidden sm:inline",
                        isActive && "font-medium",
                      )}
                    >
                      Etapa {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Connection status */}
        {!isConnected && !error && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
            Conectando ao servidor...
          </div>
        )}
      </div>
    </UltraGlassCard>
  );
}
