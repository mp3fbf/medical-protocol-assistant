"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/api/client";
import { FlowchartPane } from "@/components/protocol/editor/flowchart-pane";
import { UltraButton } from "@/components/ui/ultra-button";
import { ArrowLeft, Download, Maximize2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
  } = trpc.protocol.getById.useQuery(
    { protocolId: protocolId! },
    {
      enabled: !!protocolId,
      retry: false,
    },
  );

  const flowchartMutation = trpc.flowchart.generateAndSave.useMutation({
    onSuccess: () => {
      toast.success("Fluxograma gerado com sucesso!");
      // Refetch protocol to get new flowchart
      trpc.useUtils().protocol.getById.invalidate({ protocolId: protocolId });
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

    flowchartMutation.mutate({
      protocolId: protocolId!,
      versionId: latestVersion.id,
      protocolContent: latestVersion.content,
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
  const flowchartData = latestVersion?.flowchart;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <Link href={`/protocols/${protocolId!}`}>
                <UltraButton
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft className="h-4 w-4" />}
                >
                  Voltar ao Editor
                </UltraButton>
              </Link>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />

              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Fluxograma: {protocol.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {flowchartData
                    ? "Última atualização: " +
                      new Date(latestVersion.createdAt).toLocaleDateString(
                        "pt-BR",
                      )
                    : "Nenhum fluxograma gerado"}
                </p>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {!flowchartData ? (
                <UltraButton
                  variant="primary"
                  icon={
                    <RefreshCw
                      className={
                        flowchartMutation.isPending ? "animate-spin" : ""
                      }
                    />
                  }
                  onClick={handleGenerateFlowchart}
                  disabled={flowchartMutation.isPending}
                >
                  {flowchartMutation.isPending
                    ? "Gerando..."
                    : "Gerar Fluxograma"}
                </UltraButton>
              ) : (
                <>
                  <UltraButton
                    variant="ghost"
                    size="sm"
                    icon={
                      <RefreshCw
                        className={
                          flowchartMutation.isPending ? "animate-spin" : ""
                        }
                      />
                    }
                    onClick={handleGenerateFlowchart}
                    disabled={flowchartMutation.isPending}
                  >
                    Regenerar
                  </UltraButton>

                  <UltraButton
                    variant="ghost"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                    onClick={handleExportSVG}
                  >
                    Exportar SVG
                  </UltraButton>

                  <UltraButton
                    variant="ghost"
                    size="sm"
                    icon={<Maximize2 className="h-4 w-4" />}
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? "Sair Tela Cheia" : "Tela Cheia"}
                  </UltraButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {flowchartData ? (
            <FlowchartPane
              flowchartData={flowchartData}
              protocolId={protocolId!}
              protocolTitle={protocol.title}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <Maximize2 className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  Nenhum fluxograma disponível
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Clique no botão abaixo para gerar um fluxograma baseado no
                  conteúdo do protocolo.
                </p>
                <UltraButton
                  variant="primary"
                  size="lg"
                  icon={
                    <RefreshCw
                      className={
                        flowchartMutation.isPending ? "animate-spin" : ""
                      }
                    />
                  }
                  onClick={handleGenerateFlowchart}
                  disabled={flowchartMutation.isPending}
                >
                  {flowchartMutation.isPending
                    ? "Gerando fluxograma..."
                    : "Gerar Fluxograma"}
                </UltraButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
