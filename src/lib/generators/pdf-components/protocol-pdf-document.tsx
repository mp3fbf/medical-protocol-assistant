/**
 * Main React component for rendering a full medical protocol as a PDF document
 * using @react-pdf/renderer.
 */
import React from "react";
import { Page, Document, View, Text } from "@react-pdf/renderer";
import type { ProtocolFullContent } from "@/types/protocol";
import { SectionPdf } from "./section-pdf";
import { abntStyles, registerABNTFonts } from "./abnt-pdf-styles";

interface ProtocolPdfDocumentProps {
  protocol: ProtocolFullContent;
  protocolTitle?: string; // Optional overall title for the document
}

// Register ABNT fonts (e.g., Times New Roman, Arial)
// This should ideally be called once when the app/server starts,
// but for simplicity in this module structure, calling it here.
// Ensure font files are correctly pathed and accessible in your deployment.
registerABNTFonts();

export const ProtocolPdfDocument: React.FC<ProtocolPdfDocumentProps> = ({
  protocol,
  protocolTitle = "Protocolo Médico",
}) => {
  const sectionsToRender = Object.values(protocol).sort(
    (a, b) => a.sectionNumber - b.sectionNumber,
  );

  return (
    <Document title={protocolTitle} author="Medical Protocol Assistant">
      <Page size="A4" style={abntStyles.page}>
        <View>
          <Text style={abntStyles.documentTitle}>
            {protocolTitle.toLocaleUpperCase("pt-BR")}
          </Text>
          {sectionsToRender.map((section) => (
            <SectionPdf
              key={`section-${section.sectionNumber}`}
              section={section}
            />
          ))}
        </View>
        {/* Basic Page Numbering - ABNT might require more specific placement/format */}
        <Text
          style={{
            position: "absolute",
            fontSize: 10,
            bottom: CM_TO_PT(1), // Approx 1cm from bottom
            left: 0,
            right: 0,
            textAlign: "center",
            color: "grey",
          }}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed // Render on every page
        />
      </Page>
    </Document>
  );
};

// Helper for CM_TO_PT, duplicated from abnt-pdf-styles for self-containment if this file is moved.
const CM_TO_PT = (cm: number) => (cm / 2.54) * 72;
