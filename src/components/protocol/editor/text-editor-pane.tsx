/**
 * Pane for displaying and editing the textual content of a protocol section.
 */
"use client";
import React from "react";
import type { ProtocolSectionData } from "@/types/protocol";
import { ProtocolSectionDisplay } from "@/components/protocol/protocol-section-display";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming shadcn/ui

interface TextEditorPaneProps {
  currentSection: ProtocolSectionData | null | undefined;
  onUpdateSectionContent: (
    // Renamed to _onUpdateSectionContent as it's unused for now
    sectionNumber: number,
    newContent: ProtocolSectionData["content"],
  ) => void;
  isLoading?: boolean;
}

export const TextEditorPane: React.FC<TextEditorPaneProps> = ({
  currentSection,
  onUpdateSectionContent: _onUpdateSectionContent, // Marked as unused
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-gray-500">Carregando seção...</p>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-gray-500">
          Selecione uma seção para visualizar ou editar.
        </p>
      </div>
    );
  }

  const handleEditClick = () => {
    alert(
      `Funcionalidade de edição para a Seção ${currentSection.sectionNumber} (${currentSection.title}) ainda não implementada.`,
    );
    // Example of how updating might work:
    // _onUpdateSectionContent(currentSection.sectionNumber, "Novo conteúdo editado...");
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6">
          <ProtocolSectionDisplay section={currentSection} />
        </div>
      </ScrollArea>
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <Button onClick={handleEditClick} disabled>
          Editar Seção (Em breve)
        </Button>
      </div>
    </div>
  );
};
