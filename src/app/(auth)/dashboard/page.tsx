/**
 * Dashboard Page
 *
 * This is the main page users see after logging in.
 * It will display summaries, quick actions, etc.
 */
import type { Metadata } from "next";
import { ProtocolSectionDisplay } from "@/components/protocol/protocol-section-display"; // Example component
import { MedicationTableDisplay } from "@/components/protocol/medication-table-display"; // Example component

export const metadata: Metadata = {
  title: "Dashboard | Assistente de Protocolos Médicos",
  description: "Visão geral e acesso rápido às funcionalidades.",
};

export default function DashboardPage() {
  // Example data for demonstration
  const exampleSection = {
    sectionNumber: 1,
    title: "Exemplo de Seção no Dashboard",
    content:
      "Este é um exemplo de como o ProtocolSectionDisplay pode ser usado para mostrar o conteúdo de uma seção do protocolo. Mais detalhes seriam carregados dinamicamente.",
  };

  const exampleMedications = [
    {
      name: "Paracetamol",
      dose: "750mg",
      route: "Oral",
      frequency: "6/6h",
      duration: "Se necessário",
      notes: "Monitorar função hepática em uso prolongado.",
    },
    {
      name: "Amoxicilina",
      dose: "500mg",
      route: "Oral",
      frequency: "8/8h",
      duration: "7 dias",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Dashboard Principal
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Bem-vindo ao Assistente de Desenvolvimento de Protocolos Médicos.
      </p>

      {/* Example usage of custom components */}
      <div className="mt-8">
        <ProtocolSectionDisplay section={exampleSection} />
        <MedicationTableDisplay
          medications={exampleMedications}
          title="Tabela de Medicamentos Exemplo"
        />
      </div>

      {/* Placeholder for future dashboard content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-medium">Protocolos Recentes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lista de protocolos editados recentemente... (placeholder)
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-medium">Tarefas Pendentes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Protocolos aguardando revisão... (placeholder)
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-medium">Criar Novo Protocolo</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Link para iniciar a criação... (placeholder)
          </p>
        </div>
      </div>
    </div>
  );
}
