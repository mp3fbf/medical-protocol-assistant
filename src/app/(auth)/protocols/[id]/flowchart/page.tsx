"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/api/client";
import { FlowchartPane } from "@/components/protocol/editor/flowchart-pane";
import {
  ArrowLeft,
  Download,
  Maximize2,
  RefreshCw,
  Sparkles,
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
      gcTime: 0,
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

    // Add confirmation for regeneration if flowchart already exists
    if (flowchartData) {
      const confirmed = window.confirm(
        "Isso irá substituir o fluxograma existente. Deseja continuar?",
      );
      if (!confirmed) return;
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
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Voltar para Protocolos
            </button>
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
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Voltar para Protocolos
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const latestVersion = protocol?.ProtocolVersion?.[0];
  const flowchartData = latestVersion?.flowchart as FlowchartDefinition | null;

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Professional header with improved contrast */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - navigation and title */}
            <div className="flex items-center gap-6">
              <Link href={`/protocols/${protocolId}`}>
                <button className="group flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Voltar ao Editor
                </button>
              </Link>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Fluxograma: {protocol.title}
                  </h1>
                </div>

                {flowchartData && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>{flowchartData.nodes.length} nós</span>
                    </div>
                    <span>•</span>
                    <span>
                      Atualizado{" "}
                      {new Date(latestVersion.createdAt).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side actions - professional design */}
            <div className="flex items-center gap-3">
              {!flowchartData ? (
                <button
                  onClick={handleGenerateFlowchart}
                  disabled={flowchartMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {flowchartMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {flowchartMutation.isPending
                    ? "Gerando com IA..."
                    : "Gerar Fluxograma"}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateFlowchart}
                    disabled={flowchartMutation.isPending}
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Esta ação irá substituir o fluxograma existente"
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        flowchartMutation.isPending && "animate-spin",
                      )}
                    />
                    Regenerar
                  </button>

                  <button
                    onClick={handleExportSVG}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <Maximize2 className="h-4 w-4" />
                    {isFullscreen ? "Sair" : "Tela Cheia"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - clean and professional */}
      <div className="flex-1 p-6">
        <div className="relative h-full min-h-[700px]">
          {flowchartData ? (
            <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
              <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <Layers className="h-12 w-12 text-gray-400" />
                </div>

                <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                  Fluxograma não Gerado
                </h2>
                <p className="mb-8 text-gray-600 dark:text-gray-300">
                  Gere automaticamente um fluxograma visual baseado no conteúdo
                  do protocolo médico usando inteligência artificial.
                </p>

                <button
                  onClick={handleGenerateFlowchart}
                  disabled={flowchartMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {flowchartMutation.isPending ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Gerando com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Gerar Fluxograma Agora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
