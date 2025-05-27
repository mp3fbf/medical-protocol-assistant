/**
 * Main layout component for the protocol editor interface.
 * Arranges section navigation, text editor pane, flowchart pane, and validation report.
 */
"use client";
import React from "react";
import { SectionNavigationList } from "./section-navigation-list";
import { TextEditorPane } from "./text-editor-pane";
import { FlowchartPane } from "./flowchart-pane";
import { ValidationReportDisplay } from "./validation-report-display";
import type {
  ProtocolSectionData,
  ProtocolFullContent,
} from "@/types/protocol";
import type { FlowchartDefinition } from "@/types/flowchart";

// TODO: Replace 'any' with actual ValidationIssue type from '@/types/validation'
type ValidationIssuePlaceholder = any;

interface ProtocolEditorLayoutProps {
  protocolTitle: string;
  protocolData: ProtocolFullContent | null;
  flowchartData: FlowchartDefinition | null;
  currentSectionNumber: number;
  validationIssues: ValidationIssuePlaceholder[];
  isLoading: boolean;
  onSelectSection: (sectionNumber: number) => void;
  onUpdateSectionContent: (
    sectionNumber: number,
    newContent: ProtocolSectionData["content"],
  ) => void;
  onSaveChanges: () => void; // Placeholder for save action
}

export const ProtocolEditorLayout: React.FC<ProtocolEditorLayoutProps> = ({
  protocolTitle,
  protocolData,
  flowchartData,
  currentSectionNumber,
  validationIssues,
  isLoading,
  onSelectSection,
  onUpdateSectionContent,
  onSaveChanges,
}) => {
  const currentSection = protocolData
    ? protocolData[currentSectionNumber.toString()]
    : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header for Protocol Title and Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="truncate text-xl font-semibold text-gray-800 dark:text-gray-100">
          {isLoading ? "Carregando Protocolo..." : protocolTitle}
        </h2>
        <button
          onClick={onSaveChanges}
          className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          disabled={isLoading} // Disable save while loading
        >
          Salvar Alterações (Mock)
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="grid flex-1 grid-cols-[280px_1fr_1fr] overflow-hidden">
        {/* Column 1: Section Navigation & Validation Report */}
        <div className="flex flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex-1 p-2">
            <SectionNavigationList
              currentSectionNumber={currentSectionNumber}
              onSelectSection={onSelectSection}
            />
          </div>
          <div className="h-1/3 min-h-[150px]">
            {" "}
            {/* Validation report takes bottom part */}
            <ValidationReportDisplay
              issues={validationIssues}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Column 2: Text Editor Pane */}
        <div className="flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700">
          <TextEditorPane
            currentSection={currentSection}
            onUpdateSectionContent={onUpdateSectionContent}
            isLoading={isLoading}
          />
        </div>

        {/* Column 3: Flowchart Pane */}
        <div className="flex flex-col overflow-hidden">
          <FlowchartPane
            flowchartData={flowchartData}
            isLoading={isLoading}
            protocolTitle={protocolTitle}
          />
        </div>
      </div>
    </div>
  );
};
