"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  Activity,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { trpc } from "@/lib/api/client";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber" | "purple";
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  loading = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    // Animate number counting
    if (typeof value === "number" && !loading) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const colorClasses = {
    blue: {
      bg: "bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-blue-600",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500 to-emerald-600",
    },
    amber: {
      bg: "bg-amber-500/10",
      icon: "text-amber-600 dark:text-amber-400",
      gradient: "from-amber-500 to-amber-600",
    },
    purple: {
      bg: "bg-purple-500/10",
      icon: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500 to-purple-600",
    },
  };

  const colors = colorClasses[color];

  return (
    <UltraGlassCard
      className={cn(
        "p-6 transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </h3>
            {change !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  change >= 0 ? "text-emerald-600" : "text-red-600",
                )}
              >
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent",
              colors.gradient,
            )}
          >
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            ) : typeof value === "number" ? (
              displayValue.toLocaleString()
            ) : (
              value
            )}
          </div>
        </div>

        <div className={cn("rounded-xl p-3", colors.bg)}>
          <div className={colors.icon}>{icon}</div>
        </div>
      </div>

      {/* Mini chart preview */}
      <div className="relative mt-4 h-12 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient
              id={`gradient-${color}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                className={`text-${color}-500`}
                stopColor="currentColor"
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                className={`text-${color}-500`}
                stopColor="currentColor"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <path
            d={`M 0,40 Q 20,30 40,35 T 80,25 T 120,30 T 160,20 T 200,25 L 200,48 L 0,48 Z`}
            fill={`url(#gradient-${color})`}
            className="animate-[pulse_3s_ease-in-out_infinite]"
          />
          <path
            d={`M 0,40 Q 20,30 40,35 T 80,25 T 120,30 T 160,20 T 200,25`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-${color}-500`}
          />
        </svg>
      </div>
    </UltraGlassCard>
  );
};

interface UltraStatsProps {
  className?: string;
}

export const UltraStats: React.FC<UltraStatsProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);

  // Fetch real stats from database
  const { data: statsData } = trpc.protocol.getStats.useQuery(undefined, {
    refetchInterval: 60000, // Refresh every minute
  });

  // Calculate real stats
  const stats = [
    {
      title: "Total de Protocolos",
      value: statsData?.totalProtocols ?? 0,
      change: 12, // TODO: Calculate real change
      icon: <FileText className="h-5 w-5" />,
      color: "blue" as const,
    },
    {
      title: "Protocolos Aprovados",
      value: statsData?.approvedProtocols ?? 0,
      change: 8, // TODO: Calculate real change
      icon: <CheckCircle className="h-5 w-5" />,
      color: "emerald" as const,
    },
    {
      title: "Em Revisão",
      value: statsData?.reviewProtocols ?? 0,
      change: -5, // TODO: Calculate real change
      icon: <Clock className="h-5 w-5" />,
      color: "amber" as const,
    },
    {
      title: "Rascunhos",
      value: statsData?.draftProtocols ?? 0,
      change: 15, // TODO: Calculate real change
      icon: <Activity className="h-5 w-5" />,
      color: "purple" as const,
    },
  ];

  useEffect(() => {
    // Set loading to false when data is available
    if (statsData) {
      setLoading(false);
    }
  }, [statsData]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat, index) => (
        <div key={stat.title} style={{ animationDelay: `${index * 100}ms` }}>
          <StatCard {...stat} loading={loading} />
        </div>
      ))}
    </div>
  );
};

// Activity Chart Component
export const UltraActivityChart: React.FC<{ className?: string }> = ({
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Fetch weekly activity from database
  const { data: weeklyData } = trpc.protocol.getWeeklyActivity.useQuery(
    undefined,
    {
      refetchInterval: 300000, // Refresh every 5 minutes
    },
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const days = weeklyData?.labels ?? [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
  ];
  const data = weeklyData?.data ?? [0, 0, 0, 0, 0, 0, 0];
  const counts = weeklyData?.counts ?? [0, 0, 0, 0, 0, 0, 0];

  return (
    <UltraGlassCard
      className={cn(
        "p-6 transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Atividade Semanal</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Últimos 7 dias de atividade
          </p>
        </div>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex h-48 items-end justify-between gap-2">
        {data.map((value, index) => (
          <div
            key={index}
            className="group flex flex-1 flex-col items-center gap-2"
            title={`${counts[index]} ${counts[index] === 1 ? "protocolo" : "protocolos"}`}
          >
            <div className="relative h-full w-full">
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                {counts[index]}{" "}
                {counts[index] === 1 ? "protocolo" : "protocolos"}
              </div>
              <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
                <div
                  className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 transition-all duration-1000"
                  style={{
                    height: isVisible ? `${value}%` : "0%",
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="absolute inset-0 animate-[shimmer_3s_infinite] bg-white/20" />
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {days[index]}
            </span>
          </div>
        ))}
      </div>
    </UltraGlassCard>
  );
};

// Recent Activity Component
export const UltraRecentActivity: React.FC<{ className?: string }> = ({
  className,
}) => {
  // Fetch recent activity from database
  const { data: recentProtocols } = trpc.protocol.getRecentActivity.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  );

  // Helper function to format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Há ${hours} ${hours === 1 ? "hora" : "horas"}`;
    }
    const days = Math.floor(diffInMinutes / 1440);
    return `Há ${days} ${days === 1 ? "dia" : "dias"}`;
  };

  // Map protocol data to activity format
  const activities =
    recentProtocols?.slice(0, 3).map((protocol) => ({
      icon: <FileText className="h-4 w-4" />,
      title: "Protocolo atualizado",
      description: protocol.title,
      time: getRelativeTime(new Date(protocol.updatedAt)),
      color:
        protocol.status === "APPROVED"
          ? "emerald"
          : protocol.status === "REVIEW"
            ? "amber"
            : "blue",
    })) ?? [];

  return (
    <UltraGlassCard className={cn("p-6", className)}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Atividade Recente</h3>
        <Link
          href="/protocols"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Ver todas
        </Link>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Nenhuma atividade recente
          </p>
        ) : (
          recentProtocols?.slice(0, 3).map((protocol) => (
            <Link
              key={protocol.id}
              href={`/protocols/${protocol.id}`}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div
                className={cn(
                  "rounded-lg p-2",
                  protocol.status === "APPROVED" &&
                    "bg-emerald-500/10 text-emerald-600",
                  protocol.status === "REVIEW" &&
                    "bg-amber-500/10 text-amber-600",
                  protocol.status === "DRAFT" && "bg-blue-500/10 text-blue-600",
                  protocol.status === "ARCHIVED" &&
                    "bg-gray-500/10 text-gray-600",
                )}
              >
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {protocol.status === "DRAFT"
                    ? "Rascunho atualizado"
                    : protocol.status === "REVIEW"
                      ? "Em revisão"
                      : protocol.status === "APPROVED"
                        ? "Protocolo aprovado"
                        : "Protocolo arquivado"}
                </p>
                <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                  {protocol.title}
                </p>
              </div>
              <span className="whitespace-nowrap text-xs text-gray-500">
                {getRelativeTime(new Date(protocol.updatedAt))}
              </span>
            </Link>
          ))
        )}
      </div>
    </UltraGlassCard>
  );
};
