/**
 * Component to display a list of protocol sections for navigation - ULTRA DESIGN.
 */
"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProtocolSectionData } from "@/types/protocol";
import type { ValidationIssue } from "@/types/validation";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  FileText,
  Hash,
} from "lucide-react";

interface SectionNavigationListProps {
  sections: (ProtocolSectionData & { sectionNumber: number })[];
  currentSectionNumber: number;
  onSelectSection: (sectionNumber: number) => void;
  validationIssues?: ValidationIssue[];
  className?: string;
}

export const SectionNavigationListUltra: React.FC<
  SectionNavigationListProps
> = ({
  sections = [],
  currentSectionNumber,
  onSelectSection,
  validationIssues = [],
  className,
}) => {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Get validation issues count for each section
  const getIssueCount = (sectionNumber: number) => {
    return validationIssues
      .filter((issue) => issue.sectionNumber === sectionNumber)
      .reduce(
        (acc, issue) => {
          if (issue.severity === "error") acc.errors++;
          else if (issue.severity === "warning") acc.warnings++;
          else acc.info++;
          return acc;
        },
        { errors: 0, warnings: 0, info: 0 },
      );
  };

  // Get section definition - commented out for now
  // const getSectionDef = (sectionNumber: number) => {
  //   return SECTION_DEFINITIONS.find(def => def.sectionNumber === sectionNumber);
  // };

  return (
    <nav className={cn("section-navigation-list h-full w-full", className)}>
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <FileText className="h-4 w-4" />
          Seções do Protocolo
        </h3>
      </div>

      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="space-y-1 p-2">
          {SECTION_DEFINITIONS.map((sectionDef, index) => {
            const section = sections.find(
              (s) => s.sectionNumber === sectionDef.sectionNumber,
            );
            const issues = getIssueCount(sectionDef.sectionNumber);
            const hasContent =
              section &&
              section.content &&
              (typeof section.content === "string"
                ? section.content.trim()
                : Object.keys(section.content).length > 0);
            const isActive = currentSectionNumber === sectionDef.sectionNumber;
            const isHovered = hoveredSection === sectionDef.sectionNumber;

            return (
              <button
                key={sectionDef.sectionNumber}
                onClick={() => onSelectSection(sectionDef.sectionNumber)}
                onMouseEnter={() => setHoveredSection(sectionDef.sectionNumber)}
                onMouseLeave={() => setHoveredSection(null)}
                className={cn(
                  "relative flex w-full items-center rounded-xl px-3 py-3 text-left transition-all duration-300",
                  "group overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/25"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  !isActive && "text-gray-700 dark:text-gray-300",
                  "transform-gpu",
                  isHovered && !isActive && "scale-[1.02]",
                  "transition-all duration-300",
                  isLoaded
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0",
                )}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Background gradient on hover */}
                {!isActive && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-primary-50/0 to-primary-50/50 dark:from-primary-900/0 dark:to-primary-900/30",
                      "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    )}
                  />
                )}

                {/* Section number */}
                <span
                  className={cn(
                    "relative mr-3 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-primary-900/50 dark:group-hover:text-primary-400",
                  )}
                >
                  {sectionDef.sectionNumber}
                </span>

                {/* Section title and status */}
                <div className="relative min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-sm font-medium",
                        isActive && "text-white",
                        !isActive &&
                          isHovered &&
                          "text-gray-900 dark:text-white",
                      )}
                    >
                      {sectionDef.titlePT}
                    </span>
                  </div>

                  {/* Content indicator */}
                  <div className="mt-0.5 flex items-center gap-2">
                    {hasContent ? (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          isActive
                            ? "text-white/80"
                            : "text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Preenchido
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          isActive ? "text-white/60" : "text-gray-400",
                        )}
                      >
                        <Hash className="h-3 w-3" />
                        Vazio
                      </span>
                    )}
                  </div>
                </div>

                {/* Validation indicators */}
                <div className="relative flex items-center gap-1">
                  {issues.errors > 0 && (
                    <div
                      className={cn(
                        "flex h-6 min-w-[24px] items-center justify-center rounded-md px-1",
                        isActive
                          ? "bg-white/20"
                          : "bg-red-100 dark:bg-red-900/50",
                      )}
                    >
                      <AlertCircle
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive
                            ? "text-white"
                            : "text-red-600 dark:text-red-400",
                        )}
                      />
                      <span
                        className={cn(
                          "ml-1 text-xs font-medium",
                          isActive
                            ? "text-white"
                            : "text-red-700 dark:text-red-300",
                        )}
                      >
                        {issues.errors}
                      </span>
                    </div>
                  )}

                  {issues.warnings > 0 && (
                    <div
                      className={cn(
                        "flex h-6 min-w-[24px] items-center justify-center rounded-md px-1",
                        isActive
                          ? "bg-white/20"
                          : "bg-amber-100 dark:bg-amber-900/50",
                      )}
                    >
                      <AlertTriangle
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive
                            ? "text-white"
                            : "text-amber-600 dark:text-amber-400",
                        )}
                      />
                      <span
                        className={cn(
                          "ml-1 text-xs font-medium",
                          isActive
                            ? "text-white"
                            : "text-amber-700 dark:text-amber-300",
                        )}
                      >
                        {issues.warnings}
                      </span>
                    </div>
                  )}

                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isActive ? "text-white" : "text-gray-400",
                      (isActive || isHovered) && "translate-x-1",
                    )}
                  />
                </div>

                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-white/50" />
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </nav>
  );
};
