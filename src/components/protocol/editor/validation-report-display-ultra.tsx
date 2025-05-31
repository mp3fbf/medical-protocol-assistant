/**
 * Ultra Design V2 - Compact Validation Report Display
 * Maximum information density with modern UI
 */
"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationIssueItem {
  ruleId: string;
  sectionNumber?: number;
  field?: string;
  message: string;
  severity: "error" | "warning";
  category?: string;
  suggestion?: string;
}

interface ValidationReportDisplayUltraProps {
  issues: ValidationIssueItem[];
  isLoading?: boolean;
  isCompact?: boolean;
}

export const ValidationReportDisplayUltra: React.FC<
  ValidationReportDisplayUltraProps
> = ({ issues, isLoading, isCompact = false }) => {
  const [expanded, setExpanded] = useState(!isCompact);

  const errorCount = issues.filter(
    (issue) => issue.severity === "error",
  ).length;
  const warningCount = issues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  // Group issues by section
  const issuesBySection = issues.reduce(
    (acc, issue) => {
      const key = issue.sectionNumber || 0;
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    },
    {} as Record<number, ValidationIssueItem[]>,
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-primary-600 dark:text-primary-400">
        <div className="animate-spin">
          <AlertCircle className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium">Validando protocolo...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-white/95 backdrop-blur-xl dark:bg-gray-800/95",
        isCompact && "h-full max-h-32",
      )}
    >
      {/* Compact Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2",
          "border-b border-gray-200 dark:border-gray-700",
          "dark:to-gray-750 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800",
        )}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
            Relatório de Validação
          </h3>

          {/* Issue counts */}
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 dark:bg-red-900/30">
                <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-700 dark:text-red-300">
                  {errorCount}
                </span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 dark:bg-amber-900/30">
                <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {warningCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {isCompact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Compact Issues Display */}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          isCompact && !expanded && "hidden",
        )}
      >
        {isCompact && !expanded ? null : (
          <div className="space-y-2 p-3">
            {Object.entries(issuesBySection).map(
              ([sectionKey, sectionIssues]) => (
                <div key={sectionKey} className="space-y-1">
                  {sectionKey !== "0" && (
                    <div className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Seção {sectionKey}
                    </div>
                  )}
                  {sectionIssues.map((issue, idx) => (
                    <div
                      key={`${issue.ruleId}-${idx}`}
                      className={cn(
                        "flex items-start gap-2 rounded-md px-2 py-1.5 text-xs",
                        "transition-colors duration-200",
                        issue.severity === "error"
                          ? "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                          : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30",
                      )}
                    >
                      {issue.severity === "error" ? (
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-medium",
                            issue.severity === "error"
                              ? "text-red-700 dark:text-red-300"
                              : "text-amber-700 dark:text-amber-300",
                          )}
                        >
                          {issue.message}
                        </p>
                        {issue.suggestion && (
                          <p className="mt-0.5 flex items-start gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Quick Summary for Compact Mode */}
      {isCompact && !expanded && issues.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
          {errorCount > 0 && warningCount > 0
            ? `${errorCount} erros e ${warningCount} avisos encontrados`
            : errorCount > 0
              ? `${errorCount} erro${errorCount > 1 ? "s" : ""} encontrado${errorCount > 1 ? "s" : ""}`
              : `${warningCount} aviso${warningCount > 1 ? "s" : ""} encontrado${warningCount > 1 ? "s" : ""}`}
        </div>
      )}
    </div>
  );
};
