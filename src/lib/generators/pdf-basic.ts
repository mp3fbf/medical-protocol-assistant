/**
 * Basic PDF Document Generation using jsPDF (fallback solution)
 */
import type { ProtocolFullContent } from "@/types/protocol";

// Mock implementation that returns a simple PDF buffer
export async function generateBasicProtocolPdf(
  protocolData: ProtocolFullContent,
  protocolMainTitle?: string,
): Promise<Buffer> {
  try {
    console.log("Starting basic PDF generation (mock)...");

    // Create a simple text representation of the protocol
    let content = `${protocolMainTitle || "Protocolo Médico"}\n\n`;

    // Add all sections
    Object.values(protocolData || {}).forEach((section) => {
      content += `${section.title}\n`;
      content += `${"-".repeat(section.title.length)}\n`;

      if (typeof section.content === "string") {
        content += `${section.content}\n\n`;
      } else {
        content += `${JSON.stringify(section.content, null, 2)}\n\n`;
      }
    });

    // Create a mock PDF buffer with the content
    // In a real implementation, you would use a library like jsPDF or pdfkit
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${content.length} >>
stream
BT
/F1 12 Tf
50 750 Td
(${content.replace(/\n/g, ") Tj T* (")} ) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${300 + content.length}
%%EOF`;

    console.log("Basic PDF generated successfully");
    return Buffer.from(pdfContent, "utf-8");
  } catch (error) {
    console.error("Failed to generate basic PDF:", error);
    throw error;
  }
}
