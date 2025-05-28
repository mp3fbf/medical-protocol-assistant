/**
 * Dashboard Page
 *
 * This is the main page users see after logging in.
 * It displays summaries, quick actions, and key statistics.
 */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  StatsCards,
  type StatCardItem,
} from "@/components/dashboard/stats-cards";
import {
  FileText,
  Edit3,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Clock,
} from "lucide-react";
import { trpc } from "@/lib/api/client";

export default function DashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = trpc.protocol.getStats.useQuery();
  const {
    data: recentActivity,
    isLoading: activityLoading,
    error: activityError,
  } = trpc.protocol.getRecentActivity.useQuery();

  const statsCards: StatCardItem[] = [
    {
      id: "total-protocols",
      title: "Total de Protocolos",
      value: stats?.totalProtocols ?? 0,
      icon: FileText,
      description: "Número total de protocolos no sistema.",
      bgColorClass: "bg-blue-50 dark:bg-blue-900/30",
      textColorClass: "text-blue-700 dark:text-blue-300",
      iconColorClass: "text-blue-500 dark:text-blue-400",
    },
    {
      id: "draft-protocols",
      title: "Protocolos em Rascunho",
      value: stats?.draftProtocols ?? 0,
      icon: Edit3,
      description: "Aguardando finalização.",
      bgColorClass: "bg-yellow-50 dark:bg-yellow-900/30",
      textColorClass: "text-yellow-700 dark:text-yellow-400",
      iconColorClass: "text-yellow-500 dark:text-yellow-400",
    },
    {
      id: "review-protocols",
      title: "Protocolos em Revisão",
      value: stats?.reviewProtocols ?? 0,
      icon: AlertTriangle,
      description: "Aguardando aprovação.",
      bgColorClass: "bg-orange-50 dark:bg-orange-900/30",
      textColorClass: "text-orange-700 dark:text-orange-400",
      iconColorClass: "text-orange-500 dark:text-orange-400",
    },
    {
      id: "approved-protocols",
      title: "Protocolos Aprovados",
      value: stats?.approvedProtocols ?? 0,
      icon: CheckCircle,
      description: "Prontos para uso.",
      bgColorClass: "bg-green-50 dark:bg-green-900/30",
      textColorClass: "text-green-700 dark:text-green-300",
      iconColorClass: "text-green-500 dark:text-green-400",
    },
  ];

  if (statsError || activityError) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Erro ao carregar dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            {statsError?.message ||
              activityError?.message ||
              "Erro desconhecido"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Dashboard
        </h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/protocols/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Protocolo
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/protocols">
              <FileText className="mr-2 h-4 w-4" />
              Ver Protocolos
            </Link>
          </Button>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      ) : (
        <StatsCards stats={statsCards} />
      )}

      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Atividade Recente
        </h2>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          {activityLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((protocol) => (
                <div
                  key={protocol.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-b-0 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {protocol.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {protocol.condition} • {protocol.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(protocol.updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma atividade recente encontrada.
            </p>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Recursos Rápidos
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-medium">Ajuda e Documentação</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Acesse guias e tutoriais... (placeholder)
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-medium">Templates</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Explore templates de protocolos... (placeholder)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
