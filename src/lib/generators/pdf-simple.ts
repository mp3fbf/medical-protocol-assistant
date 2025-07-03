/**
 * Simple PDF Document Generation for Medical Protocols using @react-pdf/renderer.
 */
import * as React from "react";
import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ProtocolFullContent } from "@/types/protocol";

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
});

export async function generateSimpleProtocolPdf(
  protocolData: ProtocolFullContent,
  protocolMainTitle?: string,
): Promise<Buffer> {
  try {
    console.log("Starting simple PDF generation...");

    const SimpleDocument = () =>
      React.createElement(
        Document,
        {},
        React.createElement(
          Page,
          { size: "A4", style: styles.page },
          React.createElement(
            Text,
            { style: styles.title },
            protocolMainTitle || "Protocolo Médico",
          ),
          ...Object.values(protocolData || {}).map((section) =>
            React.createElement(
              View,
              {
                key: `section-${section.sectionNumber}`,
                style: styles.section,
              },
              React.createElement(
                Text,
                { style: styles.sectionTitle },
                section.title,
              ),
              React.createElement(
                Text,
                { style: styles.content },
                typeof section.content === "string"
                  ? section.content
                  : JSON.stringify(section.content, null, 2),
              ),
            ),
          ),
        ),
      );

    const element = SimpleDocument();
    console.log("Created simple document element");

    const pdfStream = await renderToBuffer(element);
    console.log("PDF generated successfully");
    return pdfStream;
  } catch (error) {
    console.error("Failed to generate simple PDF:", error);
    throw error;
  }
}
