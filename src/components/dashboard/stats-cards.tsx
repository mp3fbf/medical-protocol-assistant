/**
 * StatsCards component
 * Displays a grid of cards, each showing a statistic.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardItem {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  bgColorClass?: string; 
  textColorClass?: string; 
  iconColorClass?: string; 
}

interface StatsCardsProps {
  stats: StatCardItem[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Nenhuma estatística disponível.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.id}
          className={cn(
            "overflow-hidden shadow-lg transition-all hover:shadow-xl",
            stat.bgColorClass || "bg-white dark:bg-gray-800",
          )}
          data-testid={`stat-card-${stat.id}`}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2",
              stat.textColorClass || "text-gray-700 dark:text-gray-200",
            )}
          >
            <CardTitle 
              className="text-sm font-medium"
              data-testid={`stat-card-title-${stat.id}`} // Added data-testid
            >
              {stat.title}
            </CardTitle>
            <stat.icon
              className={cn(
                "h-5 w-5 text-muted-foreground",
                stat.iconColorClass || "dark:text-primary-400 text-primary-500",
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                stat.textColorClass || "text-gray-900 dark:text-gray-50",
              )}
              data-testid={`stat-card-value-${stat.id}`}
            >
              {stat.value}
            </div>
            {stat.description && (
              <p
                className={cn(
                  "pt-1 text-xs text-muted-foreground",
                  stat.textColorClass
                    ? `${stat.textColorClass} opacity-75`
                    : "text-gray-500 dark:text-gray-400",
                )}
                data-testid={`stat-card-desc-${stat.id}`}
              >
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};