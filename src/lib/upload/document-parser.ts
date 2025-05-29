/**
 * Document Parser for Medical Materials
 * Supports PDF, DOCX, and TXT files
 */
import mammoth from "mammoth";
import { fileTypeFromBuffer } from "file-type";

export interface ParsedDocument {
  content: string;
  metadata: {
    fileType: string;
    fileName: string;
    fileSize: number;
    pageCount?: number;
    extractedAt: Date;
  };
  sections?: {
    title: string;
    content: string;
    page?: number;
  }[];
}

export interface DocumentParserOptions {
  maxFileSize?: number; // in bytes, default 10MB
  extractSections?: boolean; // attempt to extract sections
  cleanText?: boolean; // clean up extracted text
}

const DEFAULT_OPTIONS: DocumentParserOptions = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  extractSections: true,
  cleanText: true,
};

export class DocumentParser {
  private options: DocumentParserOptions;

  constructor(options: DocumentParserOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async parseFile(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    // Check file size
    if (this.options.maxFileSize && buffer.length > this.options.maxFileSize) {
      throw new Error(
        `File too large: ${buffer.length} bytes (max: ${this.options.maxFileSize} bytes)`,
      );
    }

    // Detect file type
    const fileType = await fileTypeFromBuffer(buffer);
    const detectedType =
      fileType?.mime || this.getFileTypeFromExtension(fileName);

    console.log(
      `[DocumentParser] Parsing file: ${fileName}, type: ${detectedType}`,
    );

    let content: string;
    let pageCount: number | undefined;

    switch (detectedType) {
      case "application/pdf":
        const pdfResult = await this.parsePDF(buffer);
        content = pdfResult.content;
        pageCount = pdfResult.pageCount;
        break;

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        content = await this.parseDOCX(buffer);
        break;

      case "text/plain":
        content = await this.parseTXT(buffer);
        break;

      default:
        throw new Error(`Unsupported file type: ${detectedType}`);
    }

    // Clean text if requested
    if (this.options.cleanText) {
      content = this.cleanText(content);
    }

    // Extract sections if requested
    let sections: ParsedDocument["sections"];
    if (this.options.extractSections) {
      sections = this.extractSections(content);
    }

    return {
      content,
      metadata: {
        fileType: detectedType,
        fileName,
        fileSize: buffer.length,
        pageCount,
        extractedAt: new Date(),
      },
      sections,
    };
  }

  private async parsePDF(
    buffer: Buffer,
  ): Promise<{ content: string; pageCount: number }> {
    try {
      // Dynamic import to avoid build issues
      const pdf = (await import("pdf-parse")).default;
      const data = await pdf(buffer);
      return {
        content: data.text,
        pageCount: data.numpages,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async parseDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(
        `Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async parseTXT(buffer: Buffer): Promise<string> {
    try {
      return buffer.toString("utf-8");
    } catch (error) {
      throw new Error(
        `Failed to parse TXT: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private getFileTypeFromExtension(fileName: string): string {
    const extension = fileName.toLowerCase().split(".").pop();
    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "txt":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  }

  private cleanText(text: string): string {
    return (
      text
        // Remove excessive whitespace
        .replace(/\s+/g, " ")
        // Remove page breaks and form feeds
        .replace(/[\f\v]/g, "")
        // Remove multiple consecutive newlines
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        // Trim whitespace
        .trim()
    );
  }

  private extractSections(content: string): ParsedDocument["sections"] {
    const sections: { title: string; content: string }[] = [];

    // Common medical document section patterns (for future use)
    const _sectionPatterns = [
      // Numbered sections
      /^(\d+\.?\s+[A-ZÁÊÉÍÓÚÂÔÎÔÛ][A-Za-záêéíóúâôîôû\s]+?)$/gm,
      // Headers in CAPS
      /^([A-ZÁÊÉÍÓÚÂÔÎÔÛ\s]{3,})$/gm,
      // Headers with dashes or underlines
      /^([-=]{3,})\s*$/gm,
    ];

    // Try to split by common medical section headers
    const medicalSections = [
      "INTRODUÇÃO",
      "OBJETIVOS",
      "METODOLOGIA",
      "RESULTADOS",
      "DISCUSSÃO",
      "CONCLUSÃO",
      "ABSTRACT",
      "RESUMO",
      "MATERIAL E MÉTODOS",
      "REVISÃO DA LITERATURA",
      "PROTOCOLO",
      "PROCEDIMENTO",
      "INDICAÇÕES",
      "CONTRAINDICAÇÕES",
      "MEDICAÇÕES",
      "DOSAGEM",
      "MONITORIZAÇÃO",
      "COMPLICAÇÕES",
    ];

    let currentSection = { title: "Conteúdo Principal", content: "" };
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if line is a section header
      const isHeader =
        medicalSections.some((section) =>
          trimmedLine.toUpperCase().includes(section),
        ) || /^\d+\.?\s+[A-ZÁÊÉÍÓÚ]/.test(trimmedLine);

      if (isHeader && trimmedLine.length < 100) {
        // Save previous section
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        // Start new section
        currentSection = { title: trimmedLine, content: "" };
      } else {
        currentSection.content += line + "\n";
      }
    }

    // Add final section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections.length > 1 ? sections : undefined;
  }
}

export const documentParser = new DocumentParser();
