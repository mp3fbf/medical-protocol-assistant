/**
 * PDF Document Generation using jsPDF
 */
import { jsPDF } from "jspdf";
import type { ProtocolFullContent } from "@/types/protocol";

/**
 * Strip HTML tags and convert to plain text
 * Server-side compatible (no DOM)
 */
function stripHtml(html: string): string {
  if (!html) return "";

  // Remove script and style elements
  let text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");

  // Replace block elements with line breaks
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Replace list items
  text = text.replace(/<li[^>]*>/gi, "• ");

  // Replace table cells with tabs
  text = text.replace(/<\/(td|th)>/gi, "\t");

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#039;/g, "'");
  text = text.replace(/&apos;/g, "'");

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/\t+/g, "\t");
  text = text.trim();

  return text;
}

/**
 * Check if content contains HTML tags
 */
function isHtml(content: string): boolean {
  if (!content || typeof content !== "string") return false;
  // More comprehensive HTML detection
  return /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/i.test(content);
}

// Translation mapping for common medical fields
const fieldTranslations: Record<string, string> = {
  // Medication fields
  name: "Nome",
  dose: "Dose",
  route: "Via",
  frequency: "Frequência",
  duration: "Duração",
  notes: "Observações",

  // Treatment fields
  medicamentos: "Medicamentos",
  tratamentoPacientesInstaveis: "Tratamento Pacientes Instáveis",
  intervencoesNaoFarmacologicas: "Intervenções Não Farmacológicas",

  // General fields
  definicao: "Definição",
  epidemiologia: "Epidemiologia",
  inclusao: "Inclusão",
  exclusao: "Exclusão",
  exameFisico: "Exame Físico",
  sinaisVitais: "Sinais Vitais",
  anamnese: "Anamnese",
  anamneseFocada: "Anamnese Focada",
  exameFisicoRelevante: "Exame Físico Relevante",

  // Add more translations as needed
};

// Format structured content for display in PDF
function formatStructuredContent(content: any): string {
  if (typeof content === "string") {
    // Always strip HTML from string content
    return stripHtml(content);
  }

  let formatted = "";

  // Handle arrays
  if (Array.isArray(content)) {
    return content
      .map((item, index) => `${index + 1}. ${formatStructuredContent(item)}`)
      .join("\n");
  }

  // Handle objects with known structures
  if (content && typeof content === "object") {
    Object.entries(content).forEach(([key, value]) => {
      // Try to find translation first
      let readableKey = fieldTranslations[key];

      if (!readableKey) {
        // If no translation, convert camelCase to readable format
        readableKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      }

      if (Array.isArray(value)) {
        formatted += `${readableKey}:\n`;
        value.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            formatted += `  • ${formatStructuredContent(item)}\n`;
          } else {
            // Strip HTML from array items too
            const displayItem =
              typeof item === "string" ? stripHtml(item) : item;
            formatted += `  • ${displayItem}\n`;
          }
        });
        formatted += "\n";
      } else if (typeof value === "object" && value !== null) {
        formatted += `${readableKey}:\n${formatStructuredContent(value)}\n\n`;
      } else if (value) {
        // Strip HTML from string values in objects too
        const displayValue =
          typeof value === "string" ? stripHtml(value) : value;
        formatted += `${readableKey}: ${displayValue}\n\n`;
      }
    });
  }

  return formatted.trim();
}

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
        const rawContent = section.content || "[Conteúdo vazio]";
        // Always strip HTML since rich text editor outputs HTML
        content = stripHtml(rawContent);
      } else if (section.content && typeof section.content === "object") {
        content = formatStructuredContent(section.content);
      } else {
        content = "[Conteúdo vazio]";
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
