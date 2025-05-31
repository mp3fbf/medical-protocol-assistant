/**
 * Protocol List Page - ULTRA DESIGN
 * Displays a list of all available medical protocols with premium UI.
 */
"use client";
import React, { useState, useEffect } from "react";
import { UltraCard, UltraGlassCard } from "@/components/ui/ultra-card";
import { UltraGradientButton } from "@/components/ui/ultra-button";
import { UltraBadge } from "@/components/ui/ultra-badge";
import {
  PlusCircle,
  Filter,
  ListOrdered,
  FileText,
  Loader2,
  Search,
  ChevronDown,
  X,
  Eye,
  Edit,
  Download,
  MoreVertical,
  TrendingUp,
  Users,
  Calendar,
  Hash,
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
import { useRouter } from "next/navigation";

const statusOptions = [
  { value: undefined, label: "Todos os Status", color: "gray" },
  { value: ProtocolStatus.DRAFT, label: "Rascunho", color: "amber" },
  { value: ProtocolStatus.REVIEW, label: "Em Revisão", color: "blue" },
  { value: ProtocolStatus.APPROVED, label: "Aprovado", color: "emerald" },
];

const sortOptions = [
  { value: "updatedAt", label: "Data de Atualização", icon: Calendar },
  { value: "createdAt", label: "Data de Criação", icon: Calendar },
  { value: "title", label: "Título", icon: FileText },
];

export default function ProtocolsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProtocolStatus | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">(
    "updatedAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

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

  const protocols = data?.items || [];

  // Calculate stats
  const stats = {
    total: protocols.length,
    draft: protocols.filter((p) => p.status === ProtocolStatus.DRAFT).length,
    review: protocols.filter((p) => p.status === ProtocolStatus.REVIEW).length,
    approved: protocols.filter((p) => p.status === ProtocolStatus.APPROVED)
      .length,
  };

  const getStatusBadgeType = (status: ProtocolStatus) => {
    switch (status) {
      case ProtocolStatus.DRAFT:
        return "draft";
      case ProtocolStatus.REVIEW:
        return "review";
      case ProtocolStatus.APPROVED:
        return "published";
      case ProtocolStatus.ARCHIVED:
        return "archived";
      default:
        return "draft";
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%233b82f6' stop-opacity='0.05'/%3E%3Cstop offset='1' stop-color='%238b5cf6' stop-opacity='0.05'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23a)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div
          className={`transition-all duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-gray-300">
                Protocolos Médicos
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Gerencie e acompanhe todos os protocolos médicos da instituição
              </p>
            </div>
            <UltraGradientButton
              size="lg"
              icon={<PlusCircle className="h-5 w-5" />}
              onClick={() => router.push("/protocols/new")}
            >
              Novo Protocolo
            </UltraGradientButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className={`grid grid-cols-1 gap-4 transition-all delay-200 duration-1000 sm:grid-cols-2 lg:grid-cols-4 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <UltraGlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-xl bg-primary-100 p-3 dark:bg-primary-900/20">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </UltraGlassCard>

          <UltraGlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rascunhos
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.draft}</p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/20">
                <Edit className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </UltraGlassCard>

          <UltraGlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Em Revisão
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.review}</p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/20">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </UltraGlassCard>

          <UltraGlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aprovados
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/20">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </UltraGlassCard>
        </div>

        {/* Search and Filter Controls */}
        <div
          className={`delay-400 transition-all duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <UltraGlassCard className="p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="relative lg:col-span-6">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Buscar por título, condição ou código..."
                  className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-12 pr-4 backdrop-blur-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="lg:col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all hover:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                      <span className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="font-medium">
                          {statusFilter
                            ? statusOptions.find(
                                (s) => s.value === statusFilter,
                              )?.label
                            : "Todos os Status"}
                        </span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value || "all"}
                        onClick={() => setStatusFilter(option.value)}
                        className={
                          statusFilter === option.value
                            ? "bg-primary-50 dark:bg-primary-900/20"
                            : ""
                        }
                      >
                        <span className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full bg-${option.color}-500`}
                          />
                          {option.label}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="lg:col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all hover:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                      <span className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4" />
                        <span className="font-medium">
                          {sortOptions.find((s) => s.value === sortBy)?.label}
                        </span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSortBy(option.value as any)}
                          className={
                            sortBy === option.value
                              ? "bg-primary-50 dark:bg-primary-900/20"
                              : ""
                          }
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {option.label}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Direção</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setSortOrder("desc")}
                      className={
                        sortOrder === "desc"
                          ? "bg-primary-50 dark:bg-primary-900/20"
                          : ""
                      }
                    >
                      {sortBy === "title" ? "Z → A" : "Mais recente primeiro"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOrder("asc")}
                      className={
                        sortOrder === "asc"
                          ? "bg-primary-50 dark:bg-primary-900/20"
                          : ""
                      }
                    >
                      {sortBy === "title" ? "A → Z" : "Mais antigo primeiro"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </UltraGlassCard>
        </div>

        {/* Protocol Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
              <div className="absolute inset-0 animate-pulse bg-primary-500/20 blur-xl" />
            </div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Carregando protocolos...
            </p>
          </div>
        ) : isError ? (
          <UltraCard className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-red-400" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Erro ao carregar protocolos
            </h3>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error?.message || "Ocorreu um erro inesperado."}
            </p>
          </UltraCard>
        ) : protocols.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {protocols.map((protocol, index) => (
              <div
                key={protocol.id}
                className={`transition-all duration-700 ${
                  isPageLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div
                  className="h-full cursor-pointer"
                  onClick={() => router.push(`/protocols/${protocol.id}`)}
                >
                  <UltraCard gradient glow interactive className="h-full">
                    <div className="flex h-full flex-col p-6">
                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <UltraBadge
                          status={getStatusBadgeType(protocol.status)}
                          size="sm"
                        >
                          {statusOptions.find(
                            (s) => s.value === protocol.status,
                          )?.label || protocol.status}
                        </UltraBadge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-5 w-5 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/protocols/${protocol.id}`);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement download
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Baixar PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Content */}
                      <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 dark:text-white">
                        {protocol.title}
                      </h3>
                      <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-400">
                        {protocol.condition}
                      </p>

                      {/* Footer */}
                      <div className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Hash className="h-4 w-4" />v
                              {protocol.ProtocolVersion[0]?.versionNumber ||
                                "1.0"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {protocol._count.ProtocolVersion}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(protocol.updatedAt).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </UltraCard>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <UltraCard className="p-16 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Nenhum protocolo encontrado
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter
                ? "Tente ajustar seus filtros de busca."
                : "Comece criando um novo protocolo."}
            </p>
            <UltraGradientButton
              className="mt-6"
              icon={<PlusCircle className="h-5 w-5" />}
              onClick={() => router.push("/protocols/new")}
            >
              Criar Primeiro Protocolo
            </UltraGradientButton>
          </UltraCard>
        )}
      </div>
    </div>
  );
}
