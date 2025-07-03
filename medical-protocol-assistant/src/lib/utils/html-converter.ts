/**
 * Utility functions for converting between plain text and HTML
 */

/**
 * Convert plain text to basic HTML
 * Preserves line breaks and basic formatting
 */
export function textToHtml(text: string): string {
  if (!text) return "";

  // Escape HTML entities
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Convert line breaks to paragraphs
  const paragraphs = escaped
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => {
      // Convert single line breaks to <br> within paragraphs
      const withBreaks = p.replace(/\n/g, "<br>");
      return `<p>${withBreaks}</p>`;
    })
    .join("");

  return paragraphs || `<p>${escaped}</p>`;
}

/**
 * Convert HTML to plain text
 * Strips tags but preserves structure with line breaks
 */
export function htmlToText(html: string): string {
  if (!html) return "";

  // Create a temporary div to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Replace block elements with line breaks
  const blockElements = ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"];
  blockElements.forEach((tag) => {
    const elements = temp.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const text = element.textContent || "";
      const textNode = document.createTextNode(text + "\n");
      element.parentNode?.replaceChild(textNode, element);
    }
  });

  // Replace <br> with line breaks
  const brs = temp.getElementsByTagName("br");
  for (let i = brs.length - 1; i >= 0; i--) {
    const br = brs[i];
    const textNode = document.createTextNode("\n");
    br.parentNode?.replaceChild(textNode, br);
  }

  // Get text content and clean up
  let text = temp.textContent || "";

  // Remove excessive line breaks
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

/**
 * Check if a string contains HTML tags
 */
export function isHtml(str: string): boolean {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
}

/**
 * Ensure content is in HTML format
 * If it's plain text, convert it to HTML
 */
export function ensureHtml(content: string): string {
  if (!content) return "";

  // If it already contains HTML tags, return as is
  if (isHtml(content)) {
    return content;
  }

  // Otherwise, convert plain text to HTML
  return textToHtml(content);
}

/**
 * Extract plain text preview from HTML
 * Useful for displaying summaries
 */
export function getTextPreview(html: string, maxLength: number = 150): string {
  const text = htmlToText(html);
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + "...";
}
