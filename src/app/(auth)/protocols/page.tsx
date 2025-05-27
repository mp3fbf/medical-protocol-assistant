/**
 * Protocol List Page
 * Displays a list of all available medical protocols using cards.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ProtocolCard,
  type ProtocolCardProps,
} from "@/components/protocol/list/protocol-card";
import { PlusCircle, Filter, ListOrdered, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Lista de Protocolos | Assistente de Protocolos Médicos",
  description: "Visualize e gerencie todos os protocolos médicos.",
};

// Mock data for now, to be replaced by API call
const mockProtocols: ProtocolCardProps[] = [
  {
    id: "mock-protocol-123",
    title: "Protocolo de Atendimento à Bradicardia Sintomática no Adulto",
    condition: "Bradicardia",
    status: "DRAFT",
    updatedAt: new Date().toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    latestVersionNumber: 1,
    versionCount: 1,
  },
  {
    id: "mock-protocol-456",
    title: "Protocolo de Manejo da Infecção do Trato Urinário (ITU) Complicada",
    condition: "Infecção do Trato Urinário",
    status: "APPROVED",
    updatedAt: new Date(Date.now() - 86400000 * 5).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    latestVersionNumber: 3,
    versionCount: 3,
  },
  {
    id: "mock-protocol-789",
    title: "Protocolo de Sepse e Choque Séptico",
    condition: "Sepse",
    status: "REVIEW",
    updatedAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    latestVersionNumber: 2,
    versionCount: 2,
  },
];

export default function ProtocolsPage() {
  // TODO: Implement state and handlers for search, filter, sort
  // const [searchTerm, setSearchTerm] = useState("");
  // const [filterStatus, setFilterStatus] = useState<string | null>(null);
  // const [sortOrder, setSortOrder] = useState<string>("updatedAt:desc");

  // const filteredAndSortedProtocols = mockProtocols; // Apply filtering/sorting here

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Protocolos Médicos
        </h1>
        <Button asChild>
          <Link href="/protocols/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Protocolo
          </Link>
        </Button>
      </div>

      {/* Search and Filter Controls - Placeholder */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          type="search"
          placeholder="Buscar protocolos..."
          className="md:col-span-2"
          // value={searchTerm}
          // onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex space-x-2">
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar (Status)
          </Button>
          <Button variant="outline" className="w-full">
            <ListOrdered className="mr-2 h-4 w-4" />
            Ordenar
          </Button>
        </div>
      </div>

      {/* Protocol Cards Grid */}
      {mockProtocols.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockProtocols.map((protocol) => (
            <ProtocolCard key={protocol.id} {...protocol} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-md border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            Nenhum protocolo encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comece criando um novo protocolo.
          </p>
        </div>
      )}

      {/* Pagination Placeholder */}
      <div className="mt-8 flex justify-center">
        {/* TODO: Implement pagination if many protocols */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          (Paginação a ser implementada)
        </p>
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        Nota: A lista de protocolos e funcionalidades de busca/filtro são
        mocadas. A integração com a API (tRPC) será feita em etapas futuras.
      </p>
    </div>
  );
}
