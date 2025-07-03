/**
 * Simplified progress bar component for protocol generation
 * Shows realistic progress with section-by-section updates
 */
import React from "react";
import { cn } from "@/lib/utils";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { UltraButton } from "@/components/ui/ultra-button";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import type { SimpleGenerationProgress } from "@/hooks/use-simple-generation-progress";

interface SimpleProgressBarProps {
  progress: SimpleGenerationProgress;
  onRetry?: () => void;
  className?: string;
}

export const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({
  progress,
  onRetry,
  className,
}) => {
  const progressPercentage =
    (progress.completedSections / progress.totalSections) * 100;

  // Format time remaining
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `~${minutes}min ${remainingSeconds}s restantes`;
    }
    return `~${remainingSeconds}s restantes`;
  };

  // Get status classes
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
        };
      case "generating":
        return {
          card: "border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-900/20",
          icon: "text-indigo-600",
          iconBg: "bg-indigo-600/30",
          title: "text-indigo-900 dark:text-indigo-100",
          text: "text-indigo-700 dark:text-indigo-300",
          progressBar: "bg-gradient-to-r from-indigo-500 to-indigo-600",
        };
      case "error":
        return {
          card: "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-900/20",
          icon: "text-red-600",
          iconBg: "bg-red-600/30",
          title: "text-red-900 dark:text-red-100",
          text: "text-red-700 dark:text-red-300",
          progressBar: "bg-gradient-to-r from-red-500 to-red-600",
        };
      case "success":
        return {
          card: "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-900/20",
          icon: "text-emerald-600",
          iconBg: "bg-emerald-600/30",
          title: "text-emerald-900 dark:text-emerald-100",
          text: "text-emerald-700 dark:text-emerald-300",
          progressBar: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        };
      default:
        return {
          card: "border-gray-200 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-900/20",
          icon: "text-gray-600",
          iconBg: "bg-gray-600/30",
          title: "text-gray-900 dark:text-gray-100",
          text: "text-gray-700 dark:text-gray-300",
          progressBar: "bg-gradient-to-r from-gray-500 to-gray-600",
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
                {progress.status === "generating" &&
                  "Gerando Protocolo com IA (Modelo O3)"}
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
              Seção {progress.currentSection || 0} de {progress.totalSections}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Visual progress bar */}
          <div className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                statusClasses.progressBar,
              )}
              style={{ width: `${progressPercentage}%` }}
            >
              {progress.status === "generating" && (
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
            </div>
          </div>

          {/* Section dots */}
          <div className="flex items-center justify-between">
            {Array.from({ length: 13 }, (_, i) => i + 1).map((section) => {
              const isCompleted = section <= progress.completedSections;
              const isCurrent = section === progress.currentSection;

              return (
                <div
                  key={section}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-500",
                    isCompleted
                      ? "bg-indigo-500"
                      : isCurrent
                        ? "animate-pulse bg-indigo-300"
                        : "bg-gray-300 dark:bg-gray-600",
                  )}
                  title={`Seção ${section}`}
                />
              );
            })}
          </div>
        </div>

        {/* Info message for O3 */}
        {progress.status === "generating" && progress.currentSection > 3 && (
          <div className="flex items-start space-x-2 rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
            <div className="flex-1">
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                💡 O modelo O3 está analisando profundamente cada seção para
                garantir precisão médica e conformidade com diretrizes clínicas.
              </p>
            </div>
          </div>
        )}

        {/* Error details and retry */}
        {progress.error && (
          <div className="space-y-3">
            <div className="rounded-lg bg-red-100 p-4 dark:bg-red-900/30">
              <p className="text-sm text-red-800 dark:text-red-200">
                {progress.error.message}
              </p>
            </div>

            {progress.error.canRetry && onRetry && (
              <div className="flex justify-end">
                <UltraButton
                  variant="primary"
                  size="sm"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={onRetry}
                >
                  Tentar novamente
                </UltraButton>
              </div>
            )}
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
