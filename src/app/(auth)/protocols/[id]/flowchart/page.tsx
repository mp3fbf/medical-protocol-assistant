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
      staleTime: 0,
      cacheTime: 0,
    },
  );

  const utils = trpc.useContext();

  const flowchartMutation = trpc.flowchart.generateAndSave.useMutation({
    onSuccess: async () => {
      toast.success("Fluxograma gerado com sucesso!");
      await refetch();
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
  const flowchartData = latestVersion?.flowchart as FlowchartDefinition | null;

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
      <div className="ultra-glass-heavy sticky top-0 z-50 border-b border-white/10">
        <div className="relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-shift" />
          
          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side with enhanced design */}
              <div className="flex items-center gap-6">
                <Link href={`/protocols/${protocolId}`}>
                  <button className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 px-4 py-2.5 backdrop-blur-md transition-all hover:from-white/20 hover:to-white/10 hover:shadow-lg hover:shadow-indigo-500/10 border border-white/10 hover:border-white/20">
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-10" />
                    <div className="relative flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4 transition-all group-hover:-translate-x-1 group-hover:text-indigo-400" />
                      <span className="text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        Voltar ao Editor
                      </span>
                    </div>
                  </button>
                </Link>

                <div className="relative group">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-lg group-hover:opacity-40 transition-opacity" />
                  <div className="relative rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 p-4 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      <Layers className="h-6 w-6 text-indigo-500" />
                      <span className="ultra-gradient-text">Fluxograma Inteligente</span>
                    </h1>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Activity className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">{protocol.title}</span>
                      </div>
                      {flowchartData && (
                        <>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1.5 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {flowchartData.nodes.length} nós
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Atualizado {new Date(latestVersion.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side actions with ultra modern design */}
              <div className="flex items-center gap-3">
                {!flowchartData ? (
                  <button
                    onClick={handleGenerateFlowchart}
                    disabled={flowchartMutation.isPending}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="relative rounded-[11px] bg-gray-900 dark:bg-gray-950 px-6 py-3 transition-all group-hover:bg-opacity-80">
                      <span className="absolute inset-0 rounded-[11px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity group-hover:opacity-20" />
                      <div className="relative flex items-center gap-2">
                        {flowchartMutation.isPending ? (
                          <RefreshCw className="h-5 w-5 animate-spin text-white" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-white group-hover:text-yellow-300 transition-colors" />
                        )}
                        <span className="font-semibold text-white">
                          {flowchartMutation.isPending
                            ? "Gerando com IA..."
                            : "Gerar Fluxograma"}
                        </span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-1">
                    <button
                      onClick={handleGenerateFlowchart}
                      disabled={flowchartMutation.isPending}
                      className="group relative rounded-xl bg-gradient-to-br from-white/10 to-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:from-white/20 hover:to-white/10 disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <RefreshCw
                          className={cn(
                            "h-4 w-4 text-indigo-400",
                            flowchartMutation.isPending && "animate-spin",
                          )}
                        />
                        <span className="text-sm font-medium">Regenerar</span>
                      </div>
                    </button>

                    <div className="h-6 w-px bg-white/10" />

                    <button
                      onClick={handleExportSVG}
                      className="group relative rounded-xl bg-gradient-to-br from-white/10 to-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:from-white/20 hover:to-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-purple-400 transition-transform group-hover:translate-y-0.5" />
                        <span className="text-sm font-medium">Exportar</span>
                      </div>
                    </button>

                    <div className="h-6 w-px bg-white/10" />

                    <button
                      onClick={toggleFullscreen}
                      className="group relative rounded-xl bg-gradient-to-br from-white/10 to-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:from-white/20 hover:to-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4 text-pink-400 transition-transform group-hover:scale-110" />
                        <span className="text-sm font-medium">
                          {isFullscreen ? "Sair" : "Tela Cheia"}
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
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
                flowchartData={flowchartData}
                protocolId={protocolId}
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