/**
 * Component to display a list of protocol sections for navigation.
 */
"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific"; // Standard section titles
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming shadcn/ui scroll-area

interface SectionNavigationListProps {
  currentSectionNumber: number;
  onSelectSection: (sectionNumber: number) => void;
  className?: string;
}

export const SectionNavigationList: React.FC<SectionNavigationListProps> = ({
  currentSectionNumber,
  onSelectSection,
  className,
}) => {
  return (
    <nav className={cn("section-navigation-list h-full w-full", className)}>
      <ScrollArea className="h-full pr-2">
        <div className="space-y-1">
          {SECTION_DEFINITIONS.length === 0 && (
            <div className="p-2 text-sm text-red-500">
              ERROR: No section definitions loaded
            </div>
          )}
          {SECTION_DEFINITIONS.map((sectionDef) => (
            <button
              key={sectionDef.sectionNumber}
              onClick={() => onSelectSection(sectionDef.sectionNumber)}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                currentSectionNumber === sectionDef.sectionNumber
                  ? "bg-primary-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
              )}
            >
              <span className="mr-2 w-5 text-right">
                {sectionDef.sectionNumber}.
              </span>
              <span className="flex-1 truncate">{sectionDef.titlePT}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </nav>
  );
};
