/**
 * PDF Document Generation using jsPDF
 */
import { jsPDF } from "jspdf";
import type { ProtocolFullContent } from "@/types/protocol";

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  // First pass: decode numeric entities
  text = text.replace(/&#(\d+);/g, (match, dec) =>
    String.fromCharCode(Number(dec)),
  );
  text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  // Second pass: decode named entities
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
  };

  Object.entries(entities).forEach(([entity, char]) => {
    text = text.replace(new RegExp(entity, "g"), char);
  });

  return text;
}

/**
 * Strip HTML tags and convert to plain text
 * Server-side compatible (no DOM)
 */
function stripHtml(html: string): string {
  if (!html) return "";

  // Decode HTML entities first in case of double escaping
  let text = decodeHtmlEntities(html);

  // Remove script and style elements
  text = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");

  // Replace headings with double line breaks for better spacing
  text = text.replace(/<h[1-6][^>]*>/gi, "\n\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");

  // Replace paragraphs and divs with double line breaks
  text = text.replace(/<p[^>]*>/gi, "\n\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<div[^>]*>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n\n");

  // Handle ordered and unordered lists
  let listCounter = 0;
  text = text.replace(/<ol[^>]*>/gi, () => {
    listCounter = 0;
    return "\n";
  });
  text = text.replace(/<ul[^>]*>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, () => {
    // Check if we're in an ordered list (simplified - assumes ol comes before li)
    if (text.lastIndexOf("<ol") > text.lastIndexOf("<ul")) {
      listCounter++;
      return `\n${listCounter}. `;
    }
    return "\n• ";
  });
  text = text.replace(/<\/li>/gi, "");
  text = text.replace(/<\/(ol|ul)>/gi, "\n");

  // Replace line breaks
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Replace other block elements
  text = text.replace(/<\/(tr|blockquote)>/gi, "\n");

  // Replace table cells with tabs
  text = text.replace(/<\/(td|th)>/gi, "\t");

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode remaining HTML entities (in case some were created during tag removal)
  text = decodeHtmlEntities(text);

  // Clean up whitespace
  text = text.replace(/\n{4,}/g, "\n\n\n"); // Maximum 3 line breaks
  text = text.replace(/\n\s*\n/g, "\n\n"); // Remove empty lines with just spaces
  text = text.replace(/\t+/g, "\t");
  text = text.trim();

  // Fix bullet point spacing
  text = text.replace(/\n•/g, "\n•"); // Ensure bullets start on new line
  text = text.replace(/([^•\d])•/g, "$1\n•"); // Add line break before bullets if missing

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

    // Professional layout variables
    let yPosition = 30;
    const leftMargin = 25;
    const rightMargin = 25;
    const pageWidth = 210 - leftMargin - rightMargin; // A4 width - margins
    const titleLineHeight = 10;
    const contentLineHeight = 6;
    const paragraphSpacing = 4;
    const sectionSpacing = 8;
    const bulletIndent = 10;
    const subBulletIndent = 20;

    // Add main title with proper formatting
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(
      protocolMainTitle || "Protocolo Médico",
      pageWidth,
    );
    titleLines.forEach((line: string) => {
      doc.text(line, 210 / 2, yPosition, { align: "center" });
      yPosition += titleLineHeight;
    });
    yPosition += sectionSpacing * 2; // Extra space after main title

    // Process each section
    Object.values(protocolData || {}).forEach((section) => {
      // Check if need new page
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 30;
      }

      // Section title with proper spacing
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const sectionTitle = `${section.sectionNumber}. ${section.title}`;
      const titleLines = doc.splitTextToSize(sectionTitle, pageWidth);
      titleLines.forEach((line: string) => {
        doc.text(line, leftMargin, yPosition);
        yPosition += titleLineHeight;
      });
      yPosition += paragraphSpacing; // Space after section title

      // Section content with improved formatting
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      let content = "";
      if (typeof section.content === "string") {
        const rawContent = section.content || "[Conteúdo vazio]";
        content = stripHtml(rawContent);
      } else if (section.content && typeof section.content === "object") {
        content = formatStructuredContent(section.content);
      } else {
        content = "[Conteúdo vazio]";
      }

      // Process content with proper paragraph handling
      const paragraphs = content.split(/\n\n+/);

      paragraphs.forEach((paragraph) => {
        if (!paragraph.trim()) return;

        // Check for bullet points
        const isBullet =
          paragraph.trim().startsWith("•") || paragraph.trim().startsWith("-");
        const isSubItem =
          paragraph.trim().startsWith("  •") ||
          paragraph.trim().startsWith("  -");

        let xPosition = leftMargin;
        if (isBullet && !isSubItem) {
          xPosition += bulletIndent;
        } else if (isSubItem) {
          xPosition += subBulletIndent;
        }

        // Split paragraph into lines
        const lines = doc.splitTextToSize(
          paragraph.trim(),
          pageWidth - (xPosition - leftMargin),
        );

        lines.forEach((line: string, index: number) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
            // Repeat section title on new page
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.text(`(continuação) ${section.title}`, leftMargin, yPosition);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            yPosition += titleLineHeight + paragraphSpacing;
          }

          // Add extra indent for continuation lines of bullets
          const lineX = index === 0 ? xPosition : xPosition + 5;
          doc.text(line, lineX, yPosition);
          yPosition += contentLineHeight;
        });

        yPosition += paragraphSpacing; // Space between paragraphs
      });

      yPosition += sectionSpacing; // Extra space between sections
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
