/**
 * Real-time progress bar component for protocol generation
 */
import React from "react";
import { useRealGenerationProgress } from "@/hooks/use-real-generation-progress";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { UltraBadge } from "@/components/ui/ultra-badge";
import { cn } from "@/lib/utils";

interface RealProgressBarProps {
  protocolId: string | null;
  sessionId?: string | null;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

// Section names in Portuguese
const SECTION_NAMES = [
  "Identificação e Metadados",
  "Contexto Clínico",
  "Objetivos",
  "Critérios de Inclusão",
  "Critérios de Exclusão",
  "População Alvo",
  "Procedimentos",
  "Medicações",
  "Cuidados de Enfermagem",
  "Indicadores de Qualidade",
  "Monitoramento",
  "Bibliografia",
  "Anexos",
];

export function RealProgressBar({
  protocolId,
  sessionId,
  onError,
  onComplete,
}: RealProgressBarProps) {
  const progress = useRealGenerationProgress(protocolId, sessionId);

  // Call onError when error occurs
  if (progress.error && onError) {
    onError(progress.error);
  }

  // Call onComplete when generation is complete
  React.useEffect(() => {
    if (progress.percentage === 100 && !progress.error && onComplete) {
      onComplete();
    }
  }, [progress.percentage, progress.error, onComplete]);

  // Don't show if no protocol ID
  if (!protocolId) return null;

  // Format time remaining
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes} min ${remainingSeconds}s restantes`;
    }
    return `${remainingSeconds}s restantes`;
  };

  return (
    <div className="w-full space-y-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              progress.isConnected ? "bg-green-500" : "bg-red-500",
            )}
          />
          <span className="text-sm text-gray-600">
            {progress.isConnected ? "Conectado em tempo real" : "Desconectado"}
          </span>
        </div>
        {progress.estimatedTimeRemaining && (
          <span className="text-sm text-gray-600">
            {formatTimeRemaining(progress.estimatedTimeRemaining)}
          </span>
        )}
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {progress.message}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {progress.percentage}%
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
          {/* Animated stripe pattern */}
          <div
            className="bg-stripes absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,.1) 10px,
                rgba(255,255,255,.1) 20px
              )`,
              animation: "slide 1s linear infinite",
            }}
          />
        </div>
      </div>

      {/* Section Progress Indicators */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Seções do Protocolo ({progress.sectionsCompleted.length}/13)
        </p>
        <div className="grid-cols-13 grid gap-1">
          {SECTION_NAMES.map((name, index) => {
            const sectionNumber = index + 1;
            const isCompleted =
              progress.sectionsCompleted.includes(sectionNumber);
            const isActive =
              (progress.currentSection &&
                progress.message.includes(`Seções ${sectionNumber}`)) ||
              progress.message.includes(`Seção ${sectionNumber}`);

            return (
              <div
                key={sectionNumber}
                className="group relative"
                title={`${sectionNumber}. ${name}`}
              >
                <div
                  className={cn(
                    "aspect-square w-full rounded-full transition-all duration-300",
                    isCompleted
                      ? "scale-110 bg-green-500"
                      : isActive
                        ? "scale-110 animate-pulse bg-blue-500"
                        : "bg-gray-300",
                  )}
                >
                  {isCompleted && (
                    <CheckCircle className="h-full w-full p-1 text-white" />
                  )}
                  {isActive && !isCompleted && (
                    <Loader2 className="h-full w-full animate-spin p-1 text-white" />
                  )}
                </div>

                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {sectionNumber}. {name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Section Details */}
      {progress.currentSection && (
        <div className="flex items-center gap-2">
          <UltraBadge status="info">{progress.currentSection}</UltraBadge>
          <span className="text-sm text-gray-600">sendo processado...</span>
        </div>
      )}

      {/* Error Display */}
      {progress.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{progress.error}</p>
        </div>
      )}

      {/* Success Message */}
      {progress.percentage === 100 && !progress.error && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
          <p className="text-sm text-green-700">
            Protocolo gerado com sucesso! Todas as 13 seções foram criadas.
          </p>
        </div>
      )}

      {/* Style for animated stripes */}
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(20px);
          }
        }
      `}</style>
    </div>
  );
}
