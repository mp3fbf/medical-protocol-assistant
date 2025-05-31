"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { UltraGlassCard } from "@/components/ui/ultra-card";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";

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

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Total de Protocolos",
      value: 156,
      change: 12,
      icon: <FileText className="h-5 w-5" />,
      color: "blue" as const,
    },
    {
      title: "Protocolos Publicados",
      value: 89,
      change: 8,
      icon: <Activity className="h-5 w-5" />,
      color: "emerald" as const,
    },
    {
      title: "Em Desenvolvimento",
      value: 42,
      change: -5,
      icon: <Clock className="h-5 w-5" />,
      color: "amber" as const,
    },
    {
      title: "Colaboradores Ativos",
      value: 28,
      change: 15,
      icon: <Users className="h-5 w-5" />,
      color: "purple" as const,
    },
  ];

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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const data = [45, 52, 38, 65, 48, 72, 58];

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
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
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
  const activities = [
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Novo protocolo criado",
      description: "Protocolo de Atendimento COVID-19",
      time: "Há 2 min",
      color: "blue",
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "Colaborador adicionado",
      description: "Dr. João Silva entrou na equipe",
      time: "Há 15 min",
      color: "purple",
    },
    {
      icon: <Activity className="h-4 w-4" />,
      title: "Protocolo publicado",
      description: "TVP Mini agora está disponível",
      time: "Há 1 hora",
      color: "emerald",
    },
  ];

  return (
    <UltraGlassCard className={cn("p-6", className)}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Atividade Recente</h3>
        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
          Ver todas
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div
              className={cn(
                "rounded-lg p-2",
                activity.color === "blue" && "bg-blue-500/10 text-blue-600",
                activity.color === "purple" &&
                  "bg-purple-500/10 text-purple-600",
                activity.color === "emerald" &&
                  "bg-emerald-500/10 text-emerald-600",
              )}
            >
              {activity.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title}
              </p>
              <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                {activity.description}
              </p>
            </div>
            <span className="whitespace-nowrap text-xs text-gray-500">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </UltraGlassCard>
  );
};
