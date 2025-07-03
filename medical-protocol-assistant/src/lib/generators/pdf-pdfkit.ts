/**
 * PDF Document Generation using PDFKit
 */
import PDFDocument from "pdfkit";
import type { ProtocolFullContent } from "@/types/protocol";

export async function generatePDFKitProtocolPdf(
  protocolData: ProtocolFullContent,
  protocolMainTitle?: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting PDFKit PDF generation...");

      // Create a new PDF document - sem especificar fontes customizadas
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72,
        },
        autoFirstPage: true,
      });

      // Buffer to store PDF data
      const chunks: Buffer[] = [];

      // Collect PDF data
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log("PDFKit PDF generated successfully");
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Add title
      doc
        .fontSize(20)
        .text(protocolMainTitle || "Protocolo Médico", { align: "center" });

      doc.moveDown(2);

      // Add all sections
      Object.values(protocolData || {}).forEach((section) => {
        // Section title
        doc.fontSize(14).text(section.title);

        doc.moveDown(0.5);

        // Section content
        doc.fontSize(12);

        if (typeof section.content === "string") {
          if (section.content) {
            doc.text(section.content, { align: "justify" });
          } else {
            doc.text("[Conteúdo vazio]", { align: "justify" });
          }
        } else if (section.content && typeof section.content === "object") {
          // Format object content nicely
          const formatObject = (obj: any, indent = 0): string => {
            let result = "";
            const indentStr = "  ".repeat(indent);

            if (Array.isArray(obj)) {
              obj.forEach((item, index) => {
                if (typeof item === "string") {
                  result += `${indentStr}• ${item}\n`;
                } else if (typeof item === "object") {
                  result += `${indentStr}${index + 1}. ${formatObject(item, indent + 1)}`;
                }
              });
            } else {
              Object.entries(obj).forEach(([key, value]) => {
                const formattedKey = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim();

                if (
                  typeof value === "string" ||
                  typeof value === "number" ||
                  typeof value === "boolean"
                ) {
                  result += `${indentStr}${formattedKey}: ${value}\n`;
                } else if (Array.isArray(value)) {
                  result += `${indentStr}${formattedKey}:\n${formatObject(value, indent + 1)}`;
                } else if (typeof value === "object" && value !== null) {
                  result += `${indentStr}${formattedKey}:\n${formatObject(value, indent + 1)}`;
                }
              });
            }

            return result;
          };

          const formattedContent = formatObject(section.content);
          doc.text(formattedContent, { align: "left" });
        }

        doc.moveDown(1.5);

        // Add page break if needed (simple check)
        if (doc.y > 700) {
          doc.addPage();
        }
      });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error("Failed to generate PDFKit PDF:", error);
      reject(error);
    }
  });
}
