/**
 * Protocol List Page
 * Displays a list of all available medical protocols using cards.
 */
"use client";
import React, { useState } from "react";
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
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { trpc } from "@/lib/api/client";
import { ProtocolStatus } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/use-debounce";

const statusOptions = [
  { value: undefined, label: "Todos os Status" },
  { value: ProtocolStatus.DRAFT, label: "Rascunho" },
  { value: ProtocolStatus.REVIEW, label: "Em Revisão" },
  { value: ProtocolStatus.APPROVED, label: "Aprovado" },
];

const sortOptions = [
  { value: "updatedAt", label: "Data de Atualização" },
  { value: "createdAt", label: "Data de Criação" },
  { value: "title", label: "Título" },
];

// Note: metadata export removed since this is now a client component

export default function ProtocolsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProtocolStatus | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">(
    "updatedAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, isError, error } = trpc.protocol.list.useQuery({
    page: 1,
    limit: 20,
    status: statusFilter,
    search: debouncedSearchTerm,
    sortBy,
    sortOrder,
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

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar por título, condição ou código..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter
                  ? statusOptions.find((s) => s.value === statusFilter)?.label
                  : "Filtrar"}
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Status do Protocolo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value || "all"}
                  onClick={() => setStatusFilter(option.value)}
                  className={
                    statusFilter === option.value
                      ? "bg-gray-100 dark:bg-gray-800"
                      : ""
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <ListOrdered className="mr-2 h-4 w-4" />
                Ordenar
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={
                    sortBy === option.value
                      ? "bg-gray-100 dark:bg-gray-800"
                      : ""
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Direção</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setSortOrder("desc")}
                className={
                  sortOrder === "desc" ? "bg-gray-100 dark:bg-gray-800" : ""
                }
              >
                {sortBy === "title" ? "Z → A" : "Mais recente primeiro"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOrder("asc")}
                className={
                  sortOrder === "asc" ? "bg-gray-100 dark:bg-gray-800" : ""
                }
              >
                {sortBy === "title" ? "A → Z" : "Mais antigo primeiro"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {searchTerm || statusFilter
              ? "Tente ajustar seus filtros de busca."
              : "Comece criando um novo protocolo."}
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
