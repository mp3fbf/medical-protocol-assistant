/**
 * Component to display the generation status of a protocol
 * Shows appropriate UI for protocols with pending, in-progress, or failed generation
 */
"use client";

import React from "react";
// Use string literals instead of Prisma enum in client components
type GenerationStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import { UltraGradientButton, UltraButton } from "@/components/ui/ultra-button";
import { UltraBadge } from "@/components/ui/ultra-badge";
import {
  AlertTriangle,
  Loader2,
  Play,
  RefreshCw,
  CheckCircle,
  Brain,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationStatusDisplayProps {
  generationStatus: GenerationStatus;
  protocolId: string;
  protocolTitle: string;
  onStartGeneration?: () => void;
  onResumeGeneration?: () => void;
  isGenerating?: boolean;
  className?: string;
}

const statusConfig = {
  ["NOT_STARTED"]: {
    icon: FileText,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    title: "Protocolo Criado - Aguardando Geração",
    description:
      "Este protocolo foi criado mas ainda não teve seu conteúdo gerado pela IA.",
    badge: { status: "info" as const, text: "Não Iniciado" },
  },
  ["IN_PROGRESS"]: {
    icon: Loader2,
    color: "text-primary-600 dark:text-primary-400",
    bgColor: "bg-primary-100 dark:bg-primary-900/20",
    title: "Geração em Andamento",
    description:
      "A IA está gerando o conteúdo do protocolo. Isso pode levar alguns minutos.",
    badge: { status: "info" as const, text: "Em Progresso" },
  },
  ["COMPLETED"]: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    title: "Geração Concluída",
    description: "O conteúdo do protocolo foi gerado com sucesso.",
    badge: { status: "success" as const, text: "Concluído" },
  },
  ["FAILED"]: {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    title: "Falha na Geração",
    description:
      "Ocorreu um erro durante a geração do protocolo. Você pode tentar novamente.",
    badge: { status: "error" as const, text: "Falhou" },
  },
};

export const GenerationStatusDisplay: React.FC<
  GenerationStatusDisplayProps
> = ({
  generationStatus,
  protocolId,
  protocolTitle,
  onStartGeneration,
  onResumeGeneration,
  isGenerating = false,
  className,
}) => {
  const config = statusConfig[generationStatus];
  const Icon = config.icon;

  // Don't show for completed protocols
  if (generationStatus === "COMPLETED") {
    return null;
  }

  return (
    <UltraGlassCard
      className={cn(
        "relative overflow-hidden",
        generationStatus === "IN_PROGRESS" && "animate-pulse",
        className,
      )}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative p-8">
        <div className="flex items-start gap-6">
          {/* Icon */}
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-xl",
              config.bgColor,
            )}
          >
            <Icon
              className={cn(
                "h-8 w-8",
                config.color,
                generationStatus === "IN_PROGRESS" && "animate-spin",
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold">{config.title}</h2>
                <UltraBadge status={config.badge.status} size="sm">
                  {config.badge.text}
                </UltraBadge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {config.description}
              </p>
            </div>

            {/* Protocol info */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Protocolo:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {protocolTitle}
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                ID: {protocolId}
              </p>
            </div>

            {/* Action buttons */}
            {generationStatus === "NOT_STARTED" && (
              <div className="flex gap-3">
                <UltraGradientButton
                  size="lg"
                  icon={<Brain className="h-5 w-5" />}
                  onClick={onStartGeneration}
                  disabled={isGenerating}
                >
                  Iniciar Geração com IA
                </UltraGradientButton>
              </div>
            )}

            {generationStatus === "IN_PROGRESS" && (
              <div className="flex gap-3">
                <UltraButton
                  variant="secondary"
                  size="lg"
                  disabled
                  icon={<Loader2 className="h-5 w-5 animate-spin" />}
                >
                  Gerando Conteúdo...
                </UltraButton>
              </div>
            )}

            {generationStatus === "FAILED" && (
              <div className="flex gap-3">
                <UltraGradientButton
                  size="lg"
                  icon={<RefreshCw className="h-5 w-5" />}
                  onClick={onResumeGeneration || onStartGeneration}
                  disabled={isGenerating}
                >
                  Tentar Novamente
                </UltraGradientButton>
              </div>
            )}
          </div>
        </div>

        {/* Progress indicator for in-progress state */}
        {generationStatus === "IN_PROGRESS" && (
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Progresso da Geração
              </span>
              <span className="text-primary-600 dark:text-primary-400">
                Processando...
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-300"
                style={{
                  width: "100%",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </UltraGlassCard>
  );
};
