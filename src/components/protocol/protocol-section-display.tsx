/**
 * Component to display a single protocol section's content.
 * Handles basic rendering of string, array, or object content.
 */
import React from "react";
import type { ProtocolSectionData } from "@/types/protocol";

interface ProtocolSectionDisplayProps {
  section: ProtocolSectionData;
}

// Helper to render complex content (arrays/objects) in a readable way
const renderComplexContent = (
  content: Record<string, any> | any[],
  depth = 0,
): JSX.Element => {
  const _indent = "  ".repeat(depth); // _indent marked as unused

  if (Array.isArray(content)) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {content.map((item, index) => (
          <li key={index}>
            {typeof item === "object" && item !== null ? (
              renderComplexContent(item, depth + 1)
            ) : (
              <span className="text-sm">{String(item)}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  // For objects
  return (
    <div className="space-y-1">
      {Object.entries(content).map(([key, value]) => (
        <div key={key} className="text-sm">
          <strong className="font-medium capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}:
          </strong>{" "}
          {typeof value === "object" && value !== null ? (
            <div className="pl-4">{renderComplexContent(value, depth + 1)}</div>
          ) : (
            String(value)
          )}
        </div>
      ))}
    </div>
  );
};

export const ProtocolSectionDisplay: React.FC<ProtocolSectionDisplayProps> = ({
  section,
}) => {
  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-primary-700 dark:text-primary-400">
        {section.sectionNumber}. {section.title}
      </h2>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {typeof section.content === "string" ? (
          <p>{section.content}</p>
        ) : typeof section.content === "object" && section.content !== null ? (
          renderComplexContent(section.content)
        ) : (
          <p className="italic text-gray-500">
            Conteúdo não disponível ou formato inválido.
          </p>
        )}
      </div>
    </div>
  );
};
