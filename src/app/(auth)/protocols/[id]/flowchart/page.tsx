"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/api/client";
import { FlowchartPane } from "@/components/protocol/editor/flowchart-pane";
import { UltraButton } from "@/components/ui/ultra-button";
import { UltraCard } from "@/components/ui/ultra-card";
import {
  ArrowLeft,
  Download,
  Maximize2,
  RefreshCw,
  Sparkles,
  Activity,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FlowchartDefinition } from "@/types/flowchart";

export default function FlowchartPage() {
  const params = useParams();
  const _router = useRouter();
  const protocolId = typeof params?.id === "string" ? params.id : undefined;
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch protocol data
  const {
    data: protocol,
    isLoading,
    error,
    refetch,
  } = trpc.protocol.getById.useQuery(
    { protocolId: protocolId! },
    {
      enabled: !!protocolId,
      retry: false,
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0, // Don't cache
    },
  );

  const utils = trpc.useContext();

  const flowchartMutation = trpc.flowchart.generateAndSave.useMutation({
    onSuccess: async () => {
      toast.success("Fluxograma gerado com sucesso!");
      // Refetch protocol to get new flowchart
      await refetch();
      // Also invalidate cache
      utils.protocol.getById.invalidate({ protocolId: protocolId! });
    },
    onError: (error) => {
      toast.error("Erro ao gerar fluxograma: " + error.message);
    },
  });

  const handleGenerateFlowchart = () => {
    const latestVersion = protocol?.ProtocolVersion?.[0];
    if (!latestVersion?.content) {
      toast.error(
        "É necessário ter conteúdo no protocolo para gerar o fluxograma",
      );
      return;
    }

    const protocolContent = latestVersion.content as any;
    const sectionOneContent = protocolContent["1"]?.content;
    const condition =
      typeof sectionOneContent === "string"
        ? sectionOneContent
        : protocol?.title || "Protocolo";

    flowchartMutation.mutate({
      protocolId: protocolId!,
      condition,
      content: protocolContent,
      options: {
        mode: "smart",
        includeLayout: true,
        includeMedications: true,
      },
    });
  };

  const handleExportSVG = () => {
    // TODO: Implement SVG export
    toast.info("Exportação SVG em desenvolvimento");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!protocolId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            ID do protocolo inválido
          </h2>
          <Link href="/protocols">
            <UltraButton variant="primary">Voltar para Protocolos</UltraButton>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Carregando fluxograma...
          </p>
        </div>
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Protocolo não encontrado
          </h2>
          <Link href="/protocols">
            <UltraButton variant="primary">Voltar para Protocolos</UltraButton>
          </Link>
        </div>
      </div>
    );
  }

  const latestVersion = protocol?.ProtocolVersion?.[0];
  const flowchartData = latestVersion?.flowchart as
    | FlowchartDefinition
    | null
    | undefined;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0,0,0,0.02)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Ultra modern header with glassmorphism */}
      <div className="ultra-glass sticky top-0 z-50 border-b border-white/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side with enhanced design */}
            <div className="flex items-center gap-6">
              <Link href={`/protocols/${protocolId!}`}>
                <button className="group relative overflow-hidden rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-20" />
                  <div className="relative flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">
                      Voltar ao Editor
                    </span>
                  </div>
                </button>
              </Link>

              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-25 blur" />
                <div className="relative rounded-lg bg-white/80 p-3 backdrop-blur-sm dark:bg-gray-800/80">
                  <h1 className="text-xl font-bold">
                    <span className="ultra-gradient-text">Fluxograma: </span>
                    <span className="text-gray-800 dark:text-gray-100">
                      {protocol.title}
                    </span>
                  </h1>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Activity className="h-3 w-3" />
                    {flowchartData
                      ? `Atualizado em ${new Date(latestVersion.createdAt).toLocaleDateString("pt-BR")}`
                      : "Aguardando geração"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side actions with modern design */}
            <div className="flex items-center gap-3">
              {!flowchartData ? (
                <button
                  onClick={handleGenerateFlowchart}
                  disabled={flowchartMutation.isPending}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20" />
                  <div className="relative flex items-center gap-2">
                    {flowchartMutation.isPending ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                    {flowchartMutation.isPending
                      ? "Gerando com IA..."
                      : "Gerar Fluxograma"}
                  </div>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleGenerateFlowchart}
                    disabled={flowchartMutation.isPending}
                    className="group rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCw
                        className={cn(
                          "h-4 w-4",
                          flowchartMutation.isPending && "animate-spin",
                        )}
                      />
                      <span className="text-sm font-medium">Regenerar</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportSVG}
                    className="group rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                      <span className="text-sm font-medium">Exportar</span>
                    </div>
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="group rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span className="text-sm font-medium">
                        {isFullscreen ? "Sair" : "Tela Cheia"}
                      </span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Ultra design */}
      <div className="flex-1 p-6">
        <div className="relative h-full min-h-[700px]">
          {flowchartData ? (
            <div className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <FlowchartPane
                flowchartData={flowchartData as FlowchartDefinition}
                protocolId={protocolId!}
                versionId={latestVersion.id}
                protocolTitle={protocol.title}
                canEdit={true}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <UltraCard className="max-w-lg text-center" glass>
                <div className="relative">
                  {/* Animated background effect */}
                  <div className="absolute -inset-20 opacity-30">
                    <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 blur-3xl" />
                    <div className="animation-delay-2000 absolute left-1/4 top-1/4 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl" />
                    <div className="animation-delay-4000 absolute right-1/4 top-3/4 h-36 w-36 translate-x-1/2 translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-pink-400 to-indigo-400 blur-3xl" />
                  </div>

                  {/* Icon with gradient */}
                  <div className="relative mx-auto mb-8 h-32 w-32">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl" />
                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                      <Layers className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>

                  <h2 className="mb-3 text-2xl font-bold">
                    <span className="ultra-gradient-text">
                      Fluxograma Inteligente
                    </span>
                  </h2>
                  <p className="mb-8 text-gray-600 dark:text-gray-300">
                    Utilize IA avançada para gerar automaticamente um fluxograma
                    visual e interativo baseado no conteúdo do protocolo médico.
                  </p>

                  <button
                    onClick={handleGenerateFlowchart}
                    disabled={flowchartMutation.isPending}
                    className="group relative mx-auto overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20" />
                    <div className="relative flex items-center gap-3">
                      {flowchartMutation.isPending ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>Gerando com IA...</span>
                          <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-white" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          <span>Gerar Fluxograma Agora</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </UltraCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
