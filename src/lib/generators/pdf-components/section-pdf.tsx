/**
 * React component for rendering a single protocol section in a PDF document
 * using @react-pdf/renderer.
 */
import * as React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ProtocolSectionData } from "@/types/protocol";
import { abntStyles } from "./abnt-pdf-styles"; // Styles from your ABNT stylesheet

interface SectionPdfProps {
  section: ProtocolSectionData;
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 10, // Space after each section block
  },
  contentItem: {
    // Generic styling for items if content is an object or array
    marginLeft: 10,
    marginBottom: 2,
  },
  boldKey: {
    fontWeight: "bold",
  },
});

const renderContent = (content: any, depth = 0): JSX.Element[] => {
  const elements: JSX.Element[] = [];
  const indent = depth * 10; // Simple indentation for nested objects

  if (typeof content === "string") {
    elements.push(
      <Text
        key={`text-${Math.random()}`}
        style={[abntStyles.paragraph, { marginLeft: indent }]}
      >
        {content}
      </Text>,
    );
  } else if (Array.isArray(content)) {
    content.forEach((item, index) => {
      if (typeof item === "string") {
        elements.push(
          <Text
            key={`item-${index}`}
            style={[abntStyles.listItem, { marginLeft: indent + 10 }]}
          >
            • {item}
          </Text>,
        );
      } else if (typeof item === "object" && item !== null) {
        elements.push(
          <View
            key={`item-obj-${index}`}
            style={[styles.contentItem, { marginLeft: indent + 10 }]}
          >
            <Text style={abntStyles.paragraph}>Item {index + 1}:</Text>
            {renderContent(item, depth + 1)}
          </View>,
        );
      } else {
        elements.push(
          <Text
            key={`item-unknown-${index}`}
            style={[abntStyles.listItem, { marginLeft: indent + 10 }]}
          >
            • {String(item)}
          </Text>,
        );
      }
    });
  } else if (typeof content === "object" && content !== null) {
    Object.entries(content).forEach(([key, value]) => {
      const displayKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      elements.push(
        <View key={`obj-key-${key}`} style={{ marginLeft: indent }}>
          <Text style={abntStyles.paragraph}>
            <Text style={styles.boldKey}>{displayKey}: </Text>
            {typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
              ? String(value)
              : null}
          </Text>
          {typeof value === "object" && value !== null && (
            <View>{renderContent(value, depth + 1)}</View>
          )}
        </View>,
      );
    });
  } else if (content !== null && content !== undefined) {
    elements.push(
      <Text
        key={`other-${Math.random()}`}
        style={[abntStyles.paragraph, { marginLeft: indent }]}
      >
        {String(content)}
      </Text>,
    );
  }

  return elements;
};

export const SectionPdf: React.FC<SectionPdfProps> = ({ section }) => {
  // Validate section data
  if (!section || typeof section !== "object") {
    console.error("Invalid section data:", section);
    return null;
  }

  // Determine heading style based on section number depth (simplified)
  // A more robust solution would parse the section number string (e.g., "1.1", "1.1.1")
  const sectionTitleStyle = abntStyles.sectionTitleH1; // Default to H1 for now

  return (
    <View style={styles.sectionContainer} wrap={false}>
      <Text style={sectionTitleStyle}>
        {`${section.sectionNumber}. ${section.title.toLocaleUpperCase("pt-BR")}`}
      </Text>
      {renderContent(section.content)}
    </View>
  );
};
