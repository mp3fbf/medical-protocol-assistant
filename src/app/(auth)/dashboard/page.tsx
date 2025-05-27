/**
 * Dashboard Page
 *
 * This is the main page users see after logging in.
 * It displays summaries, quick actions, and key statistics.
 */
import type { Metadata } from "next";
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
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Assistente de Protocolos Médicos",
  description: "Visão geral e acesso rápido às funcionalidades.",
};

export default function DashboardPage() {
  // Mock data for demonstration
  const mockStats: StatCardItem[] = [
    {
      id: "total-protocols",
      title: "Total de Protocolos",
      value: 25, // Example value
      icon: FileText,
      description: "Número total de protocolos no sistema.",
      bgColorClass: "bg-blue-50 dark:bg-blue-900/30",
      textColorClass: "text-blue-700 dark:text-blue-300",
      iconColorClass: "text-blue-500 dark:text-blue-400",
    },
    {
      id: "draft-protocols",
      title: "Protocolos em Rascunho",
      value: 8, // Example value
      icon: Edit3,
      description: "Aguardando finalização.",
      bgColorClass: "bg-yellow-50 dark:bg-yellow-900/30",
      textColorClass: "text-yellow-700 dark:text-yellow-400",
      iconColorClass: "text-yellow-500 dark:text-yellow-400",
    },
    {
      id: "review-protocols",
      title: "Protocolos em Revisão",
      value: 3, // Example value
      icon: AlertTriangle,
      description: "Aguardando aprovação.",
      bgColorClass: "bg-orange-50 dark:bg-orange-900/30",
      textColorClass: "text-orange-700 dark:text-orange-400",
      iconColorClass: "text-orange-500 dark:text-orange-400",
    },
    {
      id: "approved-protocols",
      title: "Protocolos Aprovados",
      value: 14, // Example value
      icon: CheckCircle,
      description: "Prontos para uso.",
      bgColorClass: "bg-green-50 dark:bg-green-900/30",
      textColorClass: "text-green-700 dark:text-green-300",
      iconColorClass: "text-green-500 dark:text-green-400",
    },
  ];

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

      <StatsCards stats={mockStats} />

      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Atividade Recente
        </h2>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            (Placeholder para lista de protocolos editados recentemente ou
            outras atividades relevantes...)
          </p>
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
