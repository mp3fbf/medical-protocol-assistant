/**
 * PDF Document Generation for Medical Protocols using @react-pdf/renderer.
 */
import * as React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ProtocolFullContent } from "@/types/protocol";
import { ProtocolPdfDocument } from "./pdf-components/protocol-pdf-document"; // Main React component for PDF

/**
 * Generates a PDF document buffer from protocol content.
 * This function renders a React component to a PDF stream/buffer on the server.
 *
 * @param protocolData - The full structured content of the protocol.
 * @param protocolMainTitle - The main title to be displayed on the PDF document.
 * @returns A Promise resolving to a Buffer containing the PDF file.
 * @throws {Error} If PDF generation fails.
 */
export async function generateProtocolPdf(
  protocolData: ProtocolFullContent,
  protocolMainTitle?: string,
): Promise<Buffer> {
  try {
    // Debug logging
    console.log("Starting PDF generation with data:", {
      hasProtocolData: !!protocolData,
      sectionsCount: Object.keys(protocolData || {}).length,
      title: protocolMainTitle,
    });

    // The ProtocolPdfDocument component encapsulates the PDF structure and styling.
    const element = React.createElement(ProtocolPdfDocument, {
      protocol: protocolData,
      protocolTitle: protocolMainTitle,
    });

    console.log("Created React element:", element);

    const pdfStream = await renderToBuffer(element as any);
    return pdfStream;
  } catch (error) {
    console.error("Failed to generate PDF - Full error:", error);
    console.error("Error stack:", (error as Error).stack);
    throw new Error(`PDF generation failed: ${(error as Error).message}`);
  }
}

// Example usage (for testing or direct use):
// import fs from 'fs';
// async function main() {
//   const sampleProtocol: ProtocolFullContent = {
//     "1": { sectionNumber: 1, title: "Identificação", content: "Conteúdo da Seção 1..." },
//     // ... add all 13 sections
//   };
//   try {
//     const buffer = await generateProtocolPdf(sampleProtocol, "Exemplo de Protocolo Médico");
//     fs.writeFileSync("GeneratedProtocol.pdf", buffer);
//     console.log("Document generated: GeneratedProtocol.pdf");
//   } catch (e) {
//     console.error("Error in PDF generation example:", e);
//   }
// }
// // main();
