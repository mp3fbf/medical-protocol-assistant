/**
 * PDF Document Generation using jsPDF
 */
import { jsPDF } from "jspdf";
import type { ProtocolFullContent } from "@/types/protocol";

export async function generateJsPDFProtocolPdf(
  protocolData: ProtocolFullContent,
  protocolMainTitle?: string,
): Promise<Buffer> {
  try {
    console.log("Starting jsPDF generation...");

    // Create new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Variables for positioning
    let yPosition = 20;
    const leftMargin = 20;
    const pageWidth = 170; // A4 width - margins
    const lineHeight = 7;

    // Add title
    doc.setFontSize(16);
    doc.text(
      protocolMainTitle || "Protocolo Médico",
      pageWidth / 2 + leftMargin,
      yPosition,
      { align: "center" },
    );
    yPosition += lineHeight * 2;

    // Process each section
    Object.values(protocolData || {}).forEach((section) => {
      // Check if need new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Section title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, leftMargin, yPosition);
      yPosition += lineHeight;

      // Section content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      let content = "";
      if (typeof section.content === "string") {
        content = section.content || "[Conteúdo vazio]";
      } else if (section.content && typeof section.content === "object") {
        content = JSON.stringify(section.content, null, 2);
      }

      // Split content into lines
      const lines = doc.splitTextToSize(content, pageWidth);

      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, leftMargin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight; // Extra space between sections
    });

    // Get PDF as array buffer
    const pdfOutput = doc.output("arraybuffer");
    const buffer = Buffer.from(pdfOutput);

    console.log("jsPDF generated successfully");
    return buffer;
  } catch (error) {
    console.error("Failed to generate jsPDF:", error);
    throw error;
  }
}
