/**
 * Component to display validation results/issues for the current protocol.
 */
"use client";
import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// TODO: Replace 'any' with the actual 'ValidationIssue' type from '@/types/validation'
interface ValidationIssueItem {
  ruleId: string;
  sectionNumber?: number;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

interface ValidationReportDisplayProps {
  issues: ValidationIssueItem[]; // Use ValidationIssue[] from types/validation later
  isLoading?: boolean;
}

export const ValidationReportDisplay: React.FC<
  ValidationReportDisplayProps
> = ({ issues, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 text-sm text-gray-500">Verificando validações...</div>
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return (
    <div className="dark:bg-gray-850 h-full border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700">
      <h3 className="text-md mb-3 font-semibold text-gray-700 dark:text-gray-200">
        Relatório de Validação
      </h3>
      {issues.length === 0 ? (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="mr-2 h-5 w-5" />
          Nenhum problema de validação encontrado.
        </div>
      ) : (
        <ScrollArea className="h-[calc(100%-4rem)]">
          {" "}
          {/* Adjust height as needed */}
          <div className="space-y-3">
            {errors.length > 0 && (
              <div>
                <h4 className="mb-1 flex items-center text-sm font-medium text-red-600 dark:text-red-400">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Erros ({errors.length}):
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-xs text-red-700 dark:text-red-300">
                  {errors.map((issue, index) => (
                    <li key={`error-${index}`}>
                      {issue.sectionNumber && `S${issue.sectionNumber}: `}
                      {issue.message} (Regra: {issue.ruleId})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {warnings.length > 0 && (
              <div>
                <h4 className="mb-1 flex items-center text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Alertas ({warnings.length}):
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-xs text-yellow-700 dark:text-yellow-300">
                  {warnings.map((issue, index) => (
                    <li key={`warning-${index}`}>
                      {issue.sectionNumber && `S${issue.sectionNumber}: `}
                      {issue.message} (Regra: {issue.ruleId})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
