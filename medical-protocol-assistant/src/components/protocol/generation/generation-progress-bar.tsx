/**
 * Enhanced progress bar component for protocol generation
 * Shows real-time progress with section completion tracking
 */
import React from "react";
import { cn } from "@/lib/utils";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  RefreshCw,
  PlayCircle,
} from "lucide-react";
import { UltraButton } from "@/components/ui/ultra-button";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import type { GenerationProgress } from "@/hooks/use-protocol-generation-progress";

interface GenerationProgressBarProps {
  progress: GenerationProgress;
  onRetry?: () => void;
  onContinue?: () => void;
  className?: string;
}

export const GenerationProgressBar: React.FC<GenerationProgressBarProps> = ({
  progress,
  onRetry,
  onContinue,
  className,
}) => {
  const progressPercentage =
    (progress.completedSections.length / progress.totalSections) * 100;

  // Format time remaining
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s restantes`;
    }
    return `${remainingSeconds}s restantes`;
  };

  // Get status classes based on progress status
  const getStatusClasses = () => {
    switch (progress.status) {
      case "researching":
        return {
          card: "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-900/20",
          icon: "text-blue-600",
          iconBg: "bg-blue-600/30",
          title: "text-blue-900 dark:text-blue-100",
          text: "text-blue-700 dark:text-blue-300",
          progressBar: "bg-gradient-to-r from-blue-500 to-blue-600",
          sectionComplete: "bg-blue-500",
          sectionCurrent: "bg-blue-300 text-blue-900",
        };
      case "generating":
        return {
          card: "border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-900/20",
          icon: "text-indigo-600",
          iconBg: "bg-indigo-600/30",
          title: "text-indigo-900 dark:text-indigo-100",
          text: "text-indigo-700 dark:text-indigo-300",
          progressBar: "bg-gradient-to-r from-indigo-500 to-indigo-600",
          sectionComplete: "bg-indigo-500",
          sectionCurrent: "bg-indigo-300 text-indigo-900",
        };
      case "error":
        return {
          card: "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-900/20",
          icon: "text-red-600",
          iconBg: "bg-red-600/30",
          title: "text-red-900 dark:text-red-100",
          text: "text-red-700 dark:text-red-300",
          progressBar: "bg-gradient-to-r from-red-500 to-red-600",
          sectionComplete: "bg-red-500",
          sectionCurrent: "bg-red-300 text-red-900",
        };
      case "success":
        return {
          card: "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-900/20",
          icon: "text-emerald-600",
          iconBg: "bg-emerald-600/30",
          title: "text-emerald-900 dark:text-emerald-100",
          text: "text-emerald-700 dark:text-emerald-300",
          progressBar: "bg-gradient-to-r from-emerald-500 to-emerald-600",
          sectionComplete: "bg-emerald-500",
          sectionCurrent: "bg-emerald-300 text-emerald-900",
        };
      default:
        return {
          card: "border-gray-200 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-900/20",
          icon: "text-gray-600",
          iconBg: "bg-gray-600/30",
          title: "text-gray-900 dark:text-gray-100",
          text: "text-gray-700 dark:text-gray-300",
          progressBar: "bg-gradient-to-r from-gray-500 to-gray-600",
          sectionComplete: "bg-gray-500",
          sectionCurrent: "bg-gray-300 text-gray-900",
        };
    }
  };

  const statusClasses = getStatusClasses();

  return (
    <UltraGlassCard
      className={cn(
        "p-6 transition-all duration-500",
        statusClasses.card,
        className,
      )}
    >
      <div className="space-y-4">
        {/* Header with status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {progress.status === "error" ? (
                <AlertCircle className={cn("h-8 w-8", statusClasses.icon)} />
              ) : progress.status === "success" ? (
                <CheckCircle className={cn("h-8 w-8", statusClasses.icon)} />
              ) : (
                <>
                  <Loader2
                    className={cn("h-8 w-8 animate-spin", statusClasses.icon)}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 animate-pulse blur-xl",
                      statusClasses.iconBg,
                    )}
                  />
                </>
              )}
            </div>
            <div className="flex-1">
              <p className={cn("text-lg font-semibold", statusClasses.title)}>
                {progress.status === "researching" &&
                  "Pesquisando Literatura Médica"}
                {progress.status === "generating" && "Gerando Protocolo com IA"}
                {progress.status === "error" && "Erro na Geração"}
                {progress.status === "success" &&
                  "Protocolo Gerado com Sucesso!"}
              </p>
              <p className={cn("mt-1 text-sm", statusClasses.text)}>
                {progress.message}
              </p>
            </div>
          </div>

          {/* Time remaining */}
          {progress.estimatedTimeRemaining &&
            progress.status === "generating" && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>
                  {formatTimeRemaining(progress.estimatedTimeRemaining)}
                </span>
              </div>
            )}
        </div>

        {/* Progress bar with sections */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              Progresso: {progress.completedSections.length} de{" "}
              {progress.totalSections} seções
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Visual progress bar */}
          <div className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                statusClasses.progressBar,
              )}
              style={{ width: `${progressPercentage}%` }}
            >
              {progress.status === "generating" && (
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
            </div>
          </div>

          {/* Section indicators */}
          <div className="grid-cols-13 grid gap-1">
            {Array.from({ length: 13 }, (_, i) => i + 1).map((section) => {
              const isCompleted = progress.completedSections.includes(section);
              const isCurrentGroup =
                (progress.currentGroup &&
                  progress.message.includes(`Seção ${section}`)) ||
                progress.message.includes(`seções ${section}`);

              return (
                <div
                  key={section}
                  className={cn(
                    "flex h-8 items-center justify-center rounded text-xs font-medium transition-all duration-300",
                    isCompleted
                      ? cn(statusClasses.sectionComplete, "text-white")
                      : isCurrentGroup
                        ? cn(statusClasses.sectionCurrent, "animate-pulse")
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                  )}
                  title={`Seção ${section}${isCompleted ? " - Concluída" : ""}`}
                >
                  {isCompleted ? <CheckCircle className="h-3 w-3" /> : section}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current group info */}
        {progress.currentGroup && progress.status === "generating" && (
          <div className="flex items-center space-x-2 rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              {progress.currentGroup}
            </span>
          </div>
        )}

        {/* Error details and recovery options */}
        {progress.error && (
          <div className="space-y-3">
            <div className="rounded-lg bg-red-100 p-4 dark:bg-red-900/30">
              <p className="text-sm text-red-800 dark:text-red-200">
                {progress.error.message}
              </p>
              {progress.error.sessionId && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Session ID: {progress.error.sessionId}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              {progress.error.canContinue && onContinue && (
                <UltraButton
                  variant="secondary"
                  size="sm"
                  icon={<PlayCircle className="h-4 w-4" />}
                  onClick={onContinue}
                >
                  Continuar de onde parou
                </UltraButton>
              )}
              {progress.error.canRetry && onRetry && (
                <UltraButton
                  variant="primary"
                  size="sm"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={onRetry}
                >
                  Tentar novamente
                </UltraButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Shimmer animation for loading states */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </UltraGlassCard>
  );
};
