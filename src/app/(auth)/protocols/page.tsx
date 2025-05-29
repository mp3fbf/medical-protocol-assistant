/**
 * Protocol List Page
 * Displays a list of all available medical protocols using cards.
 */
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ProtocolCard,
  type ProtocolCardProps,
} from "@/components/protocol/list/protocol-card";
import {
  PlusCircle,
  Filter,
  ListOrdered,
  FileText,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/api/client";

// Note: metadata export removed since this is now a client component

export default function ProtocolsPage() {
  const { data, isLoading, isError, error } = trpc.protocol.list.useQuery({
    page: 1,
    limit: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const protocols: ProtocolCardProps[] =
    data?.items?.map((protocol) => ({
      id: protocol.id,
      title: protocol.title,
      condition: protocol.condition,
      status: protocol.status,
      updatedAt: new Date(protocol.updatedAt).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      latestVersionNumber: protocol.ProtocolVersion[0]?.versionNumber,
      versionCount: protocol._count.ProtocolVersion,
    })) || [];

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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Carregando protocolos...
          </span>
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-md border-2 border-dashed border-red-300 p-12 text-center dark:border-red-700">
          <FileText className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-red-900 dark:text-red-100">
            Erro ao carregar protocolos
          </h3>
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            {error?.message || "Ocorreu um erro inesperado."}
          </p>
        </div>
      ) : protocols.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {protocols.map((protocol) => (
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
    </div>
  );
}
