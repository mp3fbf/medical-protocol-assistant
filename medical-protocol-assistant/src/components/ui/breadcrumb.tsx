/**
 * Breadcrumb navigation component for improved contextual navigation
 */
"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      {/* Home Icon */}
      <Link
        href="/dashboard"
        className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.current || !item.href ? (
            <span
              className={cn(
                "font-medium",
                item.current
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400",
              )}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Breadcrumb with container for consistent styling
export const BreadcrumbContainer: React.FC<{
  items: BreadcrumbItem[];
  className?: string;
}> = ({ items, className }) => {
  return (
    <div
      className={cn(
        "border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800",
        className,
      )}
    >
      <Breadcrumb items={items} />
    </div>
  );
};
