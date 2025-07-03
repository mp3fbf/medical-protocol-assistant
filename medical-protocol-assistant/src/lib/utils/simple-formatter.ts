/**
 * Simple, direct formatter for medical protocol content
 * This is a failsafe formatter that ensures content is properly displayed
 */

export function simpleFormatProtocolContent(text: string): string {
  if (!text || typeof text !== "string") return "";

  console.log("[SimpleFormatter] Input:", text.substring(0, 100));

  // Start with the raw text
  let formatted = text;

  // 1. First, ensure line breaks exist where they should
  // Add double line break before section numbers (3.1, 3.2, etc)
  formatted = formatted.replace(/(\d+\.\d+)/g, "\n\n$1");

  // Add line break before numbered items
  formatted = formatted.replace(/(\d+\.\s+[A-Z])/g, "\n$1");

  // Add line break before letter items
  formatted = formatted.replace(/([a-z]\)\s*[A-Z])/g, "\n$1");

  // Clean up multiple line breaks
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // 2. Now convert to HTML with proper structure
  const lines = formatted.split("\n").filter((line) => line.trim());
  let html = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Section headers (3.1, 3.2, etc)
    if (/^\d+\.\d+\s+/.test(trimmed)) {
      html += `<h3 style="font-size: 1.5rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: #1a202c;">${trimmed}</h3>`;
    }
    // Definition with = sign
    else if (
      trimmed.includes("=") &&
      trimmed.includes("(") &&
      trimmed.includes(")")
    ) {
      const parts = trimmed.split("=");
      if (parts.length === 2) {
        html += `<div style="margin: 1.5rem 0; padding: 1rem; background-color: #EBF8FF; border-left: 4px solid #3182CE; border-radius: 0.375rem;">`;
        html += `<strong style="display: block; font-size: 1.125rem; color: #2C5282; margin-bottom: 0.5rem;">${parts[0].trim()}</strong>`;
        html += `<span style="color: #2D3748;">${parts[1].trim()}</span>`;
        html += `</div>`;
      } else {
        html += `<p style="margin: 1rem 0; line-height: 1.75;">${trimmed}</p>`;
      }
    }
    // Numbered items (1., 2., etc)
    else if (/^\d+\.\s+/.test(trimmed)) {
      html += `<div style="margin: 1rem 0; padding-left: 1.5rem;">`;
      html += `<strong style="color: #4A5568;">${trimmed}</strong>`;
      html += `</div>`;
    }
    // Letter items (a), b), etc)
    else if (/^[a-z]\)\s*/.test(trimmed)) {
      html += `<div style="margin: 0.5rem 0; padding-left: 3rem; color: #4A5568;">${trimmed}</div>`;
    }
    // Bullet points
    else if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      const content = trimmed.replace(/^[•\-]\s*/, "");
      html += `<div style="margin: 0.5rem 0; padding-left: 3rem;">• ${content}</div>`;
    }
    // Key phrases
    else if (trimmed.endsWith(":") && trimmed.length < 50) {
      html += `<h4 style="font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #2D3748;">${trimmed}</h4>`;
    }
    // Regular paragraphs
    else {
      html += `<p style="margin: 0.75rem 0; line-height: 1.75; color: #4A5568;">${trimmed}</p>`;
    }
  }

  // 3. Highlight important medical terms
  const medicalTerms = [
    "TVP",
    "TEV",
    "EP",
    "Doppler",
    "TC/RM",
    "PICC",
    "ISS",
    "RR",
    "HR",
  ];
  medicalTerms.forEach((term) => {
    const regex = new RegExp(`\\b(${term})\\b`, "g");
    html = html.replace(regex, '<strong style="color: #2B6CB0;">$1</strong>');
  });

  console.log("[SimpleFormatter] Output sample:", html.substring(0, 200));

  return html;
}
