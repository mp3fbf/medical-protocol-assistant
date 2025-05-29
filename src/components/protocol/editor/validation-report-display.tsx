/**
 * Component to display validation results/issues for the current protocol.
 */
"use client";
import React from "react";

interface ValidationIssueItem {
  ruleId: string;
  sectionNumber?: number;
  field?: string;
  message: string;
  severity: "error" | "warning";
  category?: string;
  suggestion?: string;
}

interface ValidationReportDisplayProps {
  issues: ValidationIssueItem[];
  isLoading?: boolean;
  lastValidated?: Date | null;
}

export const ValidationReportDisplay: React.FC<
  ValidationReportDisplayProps
> = ({ issues, isLoading, lastValidated }) => {
  console.log("[ValidationReportDisplay] RENDER", {
    issuesCount: issues?.length || 0,
    isLoading,
    lastValidated: !!lastValidated,
    issues: issues?.slice(0, 2),
  });

  console.log("[ValidationReportDisplay] RENDERING STATE:", {
    hasIssues: !!issues?.length,
    isLoading: !!isLoading,
    issueCount: issues?.length || 0,
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium">Validando protocolo...</span>
        </div>
      </div>
    );
  }

  const errorCount =
    issues?.filter((issue) => issue.severity === "error").length || 0;
  const warningCount =
    issues?.filter((issue) => issue.severity === "warning").length || 0;
  const categories = [
    ...new Set(issues?.map((issue) => issue.category).filter(Boolean)),
  ];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-3 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Validação
          </h3>
          {lastValidated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lastValidated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {lastValidated ? (
          issues && issues.length > 0 ? (
            <div className="mt-2">
              <div className="rounded-md bg-red-50 p-2 dark:bg-red-900/20">
                <div className="text-sm font-medium text-red-800 dark:text-red-200">
                  VALIDAÇÃO: {issues.length} PROBLEMAS ENCONTRADOS
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-800 dark:text-red-200">
                    {errorCount} Erros
                  </span>
                  <span className="rounded bg-yellow-100 px-2 py-0.5 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200">
                    {warningCount} Alertas
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    Categorias: {categories.length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 rounded-md bg-green-50 p-2 dark:bg-green-900/20">
              <div className="text-sm text-green-800 dark:text-green-200">
                ✅ Protocolo válido - Nenhum problema encontrado
              </div>
            </div>
          )
        ) : (
          <div className="mt-2 rounded-md bg-gray-50 p-2 dark:bg-gray-900/20">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Protocolo não validado ainda
            </div>
          </div>
        )}
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-3">
        {lastValidated ? (
          issues && issues.length > 0 ? (
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <div
                  key={`${issue.ruleId}-${index}`}
                  className={`rounded-md border p-3 text-sm ${
                    issue.severity === "error"
                      ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            issue.severity === "error"
                              ? "text-red-700 dark:text-red-200"
                              : "text-yellow-700 dark:text-yellow-200"
                          }`}
                        >
                          Erro {index + 1}:
                        </span>
                        {issue.category && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {issue.category}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 ${
                          issue.severity === "error"
                            ? "text-red-800 dark:text-red-200"
                            : "text-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {issue.message}
                      </p>
                      {issue.sectionNumber && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          Seção {issue.sectionNumber}
                          {issue.field && ` • Campo: ${issue.field}`}
                        </p>
                      )}
                      {issue.suggestion && (
                        <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                          💡 Sugestão: {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <div className="text-2xl">✅</div>
                <p className="mt-2 text-sm">Nenhum problema encontrado</p>
                <p className="mt-1 text-xs">O protocolo está válido</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-2xl">📋</div>
              <p className="mt-2 text-sm">
                Clique em &quot;Validar&quot; para verificar o protocolo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
