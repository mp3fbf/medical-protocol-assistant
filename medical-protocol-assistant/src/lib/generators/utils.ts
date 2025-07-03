/**
 * Shared utility functions for document generation.
 */

/**
 * Sanitizes a string to be used as a filename.
 * Replaces spaces with underscores and removes characters that are generally
 * problematic in filenames across different operating systems.
 * Supports Unicode letters and numbers, and attempts to preserve file extensions.
 * Hyphens within the name part are preserved unless mixed with underscores.
 * Dots within the name part are converted to underscores.
 *
 * @param name - The original string to sanitize.
 * @returns A sanitized string suitable for use as a filename (without extension).
 */
export function sanitizeFilename(name: string): string {
  if (!name || name.trim() === "") {
    return "untitled_protocol";
  }

  // 1. Normalize Unicode, remove diacritics
  let sanitized = name
    .normalize("NFD") // Decompose accented characters (e.g., "ö" -> "o" + "¨")
    .replace(/[\u0300-\u036f]/g, ""); // Remove diacritical marks (e.g., the "¨")

  // 2. Separate extension(s) - more robustly
  let namePart = sanitized;
  let extensionPart = "";

  const knownDoubleExt = [
    ".tar.gz",
    ".tar.bz2",
    ".tar.xz",
    ".com.br",
    ".co.uk",
  ]; // Add more as needed
  let matchedDoubleExt = false;
  for (const dext of knownDoubleExt) {
    if (sanitized.toLowerCase().endsWith(dext)) {
      const idx = sanitized.toLowerCase().lastIndexOf(dext);
      namePart = sanitized.substring(0, idx);
      extensionPart = sanitized.substring(idx);
      matchedDoubleExt = true;
      break;
    }
  }

  if (!matchedDoubleExt) {
    // If no known double extension, check for single
    const lastDotIndex = namePart.lastIndexOf("."); // Check on the potentially already shortened namePart
    // Consider a dot an extension separator if it's not first char & there's 1-4 chars after it (common extension lengths)
    // and it's not like "v1.2"
    if (
      lastDotIndex > 0 &&
      namePart.length - 1 - lastDotIndex <= 4 &&
      namePart.length - 1 - lastDotIndex > 0 &&
      !/^\d+$/.test(namePart.substring(lastDotIndex + 1)) // Avoid treating ".2" in "v1.2" as extension
    ) {
      extensionPart = namePart.substring(lastDotIndex) + extensionPart; // Get extension before shortening namePart
      namePart = namePart.substring(0, lastDotIndex);
    }
  }

  // 3. Process namePart:
  //    - First, handle direct underscore-hyphen connections that exist in the original input
  //      These should be converted to single underscores
  namePart = namePart.replace(/_-_/g, "_");
  namePart = namePart.replace(/-_-/g, "_");
  namePart = namePart.replace(/_-/g, "_");
  namePart = namePart.replace(/-_/g, "_");

  //    - Convert characters that are not Unicode letters, numbers, or hyphens to a single space.
  //      Dots within the name part will become spaces here.
  namePart = namePart.replace(/[^\p{L}\p{N}-]+/gu, " ");
  namePart = namePart.trim(); // Trim spaces from namePart

  //    - Replace sequences of spaces with a single underscore.
  namePart = namePart.replace(/\s+/g, "_");

  //    - Consolidate multiple hyphens to a single hyphen.
  namePart = namePart.replace(/-+/g, "-");
  //    - Consolidate multiple underscores to a single underscore.
  namePart = namePart.replace(/_+/g, "_");

  //    - Handle the specific pattern -_- which comes from -.- after dot conversion
  //      This is different from _-_ which might come from spaces around hyphens
  namePart = namePart.replace(/-_-/g, "_");

  // 4. Remove leading/trailing hyphens or underscores from namePart
  namePart = namePart.replace(/^[-_]+|[-_]+$/g, "");

  // 5. Recombine. If namePart became empty, but there's an extension, use "file" as name.
  if (!namePart && extensionPart) {
    namePart = "file";
  }
  sanitized = namePart + extensionPart;

  // 6. Truncate
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    let currentExt = ""; // Recalculate extension on the current `sanitized` form
    for (const dext of knownDoubleExt) {
      // Check for double extensions first
      if (sanitized.toLowerCase().endsWith(dext)) {
        currentExt = dext;
        break;
      }
    }
    if (!currentExt) {
      // If no double extension, check for single
      const lastDotIdxFinal = sanitized.lastIndexOf(".");
      if (
        lastDotIdxFinal > 0 &&
        sanitized.length - 1 - lastDotIdxFinal <= 4 &&
        sanitized.length - 1 - lastDotIdxFinal > 0 &&
        !/^\d+$/.test(sanitized.substring(lastDotIdxFinal + 1)) // Avoid ".2" as extension
      ) {
        currentExt = sanitized.substring(lastDotIdxFinal);
      }
    }

    let nameOnlyToTruncate = currentExt
      ? sanitized.substring(0, sanitized.length - currentExt.length)
      : sanitized;

    const availableLengthForName = maxLength - currentExt.length;
    if (nameOnlyToTruncate.length > availableLengthForName) {
      nameOnlyToTruncate = nameOnlyToTruncate.substring(
        0,
        Math.max(0, availableLengthForName),
      );
    }
    nameOnlyToTruncate = nameOnlyToTruncate.replace(/[-_]+$/g, ""); // Clean trailing from truncated name
    sanitized = nameOnlyToTruncate + currentExt;
  }

  // 7. Final fallback and lowercase
  if (
    !sanitized ||
    sanitized === "." ||
    sanitized === "-" ||
    sanitized === "_"
  ) {
    return "untitled_protocol";
  }
  return sanitized.toLowerCase();
}
