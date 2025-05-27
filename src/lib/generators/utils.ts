/**
 * Shared utility functions for document generation.
 */

/**
 * Sanitizes a string to be used as a filename.
 * Replaces spaces with underscores and removes characters that are generally
 * problematic in filenames across different operating systems.
 *
 * @param name - The original string to sanitize.
 * @returns A sanitized string suitable for use as a filename (without extension).
 */
export function sanitizeFilename(name: string): string {
  if (!name) {
    return "untitled_protocol";
  }
  // Remove or replace invalid characters
  let sanitized = name
    .replace(/[^\w\s.-]/gi, "") // Remove non-word chars, except spaces, dots, hyphens
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^[._-]+|[._-]+$/g, ""); // Trim leading/trailing underscores, dots, hyphens

  // Limit length (optional, but good practice)
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  // Ensure it's not empty after sanitization
  if (!sanitized) {
    return "protocol_document";
  }
  return sanitized.toLowerCase();
}
