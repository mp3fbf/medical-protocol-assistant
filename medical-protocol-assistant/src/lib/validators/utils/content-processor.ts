/**
 * Content processing utilities for validators
 * Handles HTML content extraction for validation
 */

import { htmlToText, isHtml } from "@/lib/utils/html-converter";

/**
 * Extract text content from a value that might be HTML, plain text, or structured data
 */
export function extractTextContent(content: any): string {
  if (!content) return "";

  // If it's a string
  if (typeof content === "string") {
    // Check if it's HTML
    if (isHtml(content)) {
      return htmlToText(content);
    }
    return content;
  }

  // If it's an object, stringify it
  if (typeof content === "object") {
    return JSON.stringify(content, null, 2);
  }

  // For other types, convert to string
  return String(content);
}

/**
 * Get the length of content, handling HTML appropriately
 */
export function getContentLength(content: any): number {
  const text = extractTextContent(content);
  return text.trim().length;
}

/**
 * Check if content is empty, handling HTML
 */
export function isContentEmpty(content: any): boolean {
  const text = extractTextContent(content);
  return text.trim().length === 0;
}

/**
 * Extract words from content for analysis
 */
export function extractWords(content: any): string[] {
  const text = extractTextContent(content);
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Search for keywords in content
 */
export function containsKeywords(content: any, keywords: string[]): boolean {
  const text = extractTextContent(content).toLowerCase();
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}
