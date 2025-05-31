/**
 * Dashboard Page - ULTRA DESIGN
 *
 * This is the main page users see after logging in.
 * It displays summaries, quick actions, and key statistics with premium UI.
 */
"use client";

import React, { useState, useEffect } from "react";
import { UltraGradientButton, UltraButton } from "@/components/ui/ultra-button";
import { UltraGlassCard, UltraFeaturedCard } from "@/components/ui/ultra-card";
import {
  UltraStats,
  UltraActivityChart,
  UltraRecentActivity,
} from "@/components/dashboard/ultra-stats";
import {
  FileText,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Book,
  Layout,
  Brain,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);

    // Keyboard shortcut for new protocol
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if N is pressed without any modifier keys
      if (e.key === "n" || e.key === "N") {
        // Don't trigger if user is typing in an input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        router.push("/protocols/new");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router]);

  const {
    data: _stats,
    isLoading: _statsLoading,
    error: statsError,
  } = trpc.protocol.getStats.useQuery();
  const {
    data: _recentActivity,
    isLoading: _activityLoading,
    error: activityError,
  } = trpc.protocol.getRecentActivity.useQuery();

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
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/20" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Crect width='60' height='60' fill='none' stroke='%236366f1' stroke-width='0.5' opacity='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
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
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary-500" />
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  Bem-vindo de volta!
                </span>
              </div>
              <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-gray-300">
                Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Acompanhe o progresso e gerencie protocolos médicos
              </p>
            </div>
            <div className="flex gap-3">
              <UltraGradientButton
                size="lg"
                icon={<PlusCircle className="h-5 w-5" />}
                onClick={() => router.push("/protocols/new")}
                title="Pressione N para criar novo protocolo"
              >
                Novo Protocolo
                <kbd className="ml-2 hidden rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs text-white/90 sm:inline">
                  N
                </kbd>
              </UltraGradientButton>
              <UltraButton
                variant="secondary"
                size="lg"
                icon={<FileText className="h-5 w-5" />}
                onClick={() => router.push("/protocols")}
              >
                Ver Todos
              </UltraButton>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div
          className={`transition-all delay-200 duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <UltraStats className="mb-8" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Activity Chart & Recent Activity */}
          <div className="space-y-6 lg:col-span-2">
            <div
              className={`delay-400 transition-all duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <UltraActivityChart />
            </div>

            <div
              className={`transition-all delay-500 duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <UltraRecentActivity />
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className={`delay-600 space-y-6 transition-all duration-1000 ${isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <UltraFeaturedCard className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-3">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">IA Assistente</h3>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Crie protocolos médicos com inteligência artificial avançada
              </p>
              <UltraGradientButton
                size="sm"
                className="w-full"
                icon={<Zap className="h-4 w-4" />}
                onClick={() => router.push("/protocols/new")}
              >
                Gerar com IA
              </UltraGradientButton>
            </UltraFeaturedCard>

            <UltraGlassCard className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Progresso</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Taxa de Conclusão
                    </span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000"
                      style={{ width: isPageLoaded ? "78%" : "0%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Protocolos Validados
                    </span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all delay-200 duration-1000"
                      style={{ width: isPageLoaded ? "92%" : "0%" }}
                    />
                  </div>
                </div>
              </div>
            </UltraGlassCard>

            {/* Resources */}
            <UltraGlassCard className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Recursos Rápidos</h3>
              <div className="space-y-3">
                <button className="group flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Book className="h-5 w-5 text-gray-400 transition-colors group-hover:text-primary-500" />
                    <span className="text-sm font-medium">Documentação</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="group flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Layout className="h-5 w-5 text-gray-400 transition-colors group-hover:text-primary-500" />
                    <span className="text-sm font-medium">Templates</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </UltraGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
