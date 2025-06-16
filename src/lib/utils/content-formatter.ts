/**
 * Content formatter for medical protocols
 * Improves readability with proper formatting, spacing, and hierarchy
 */

export function formatProtocolContent(content: string): string {
  if (!content) return "";

  let formatted = content;

  // First, normalize line breaks
  formatted = formatted.replace(/\r\n/g, "\n");

  // 1. Format section headers (3.1, 3.2, etc) - must be at start of line
  formatted = formatted.replace(
    /^(\d+\.\d+)\s+(.+?)$/gm,
    '\n\n<h4 class="text-xl font-bold text-gray-800 dark:text-gray-200 mt-10 mb-6 border-l-4 border-primary-500 pl-4">$1 $2</h4>\n',
  );

  // 2. Format main concept definitions (e.g., "Trombose Venosa Profunda (TVP) = ...")
  formatted = formatted.replace(
    /^([A-Z][^=]+?)(\s*\([A-Z]+\))?\s*=\s*(.+)$/gm,
    '<div class="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500"><p class="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">$1$2</p><p class="text-gray-700 dark:text-gray-300">$3</p></div>',
  );

  // 3. Format "Diferenciação essencial:" and similar key points
  formatted = formatted.replace(
    /^(Diferenciação essencial|Critérios diagnósticos contemporâneos|Sinônimos):\s*(.+)$/gm,
    '\n<div class="mt-6 mb-4"><h5 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">$1:</h5><p class="text-gray-700 dark:text-gray-300">$2</p></div>',
  );

  // 4. Format numbered main items (e.g., "1. Topográfica:")
  formatted = formatted.replace(
    /^(\d+)\.\s+([^:]+):\s*$/gm,
    '\n<div class="mt-8 mb-4"><h5 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-baseline gap-3"><span class="text-primary-600 dark:text-primary-400">$1.</span>$2:</h5></div>',
  );

  // 5. Format sub-items with letters (a), b), c))
  formatted = formatted.replace(
    /^([a-z])\)\s+(.+?)$/gm,
    '<div class="ml-8 my-3 flex gap-3"><span class="font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0">$1)</span><span class="text-gray-700 dark:text-gray-300">$2</span></div>',
  );

  // 6. Format bullet points that start with • or -
  formatted = formatted.replace(
    /^[•\-]\s*(.+?)$/gm,
    '<li class="my-2 text-gray-700 dark:text-gray-300">$1</li>',
  );

  // Wrap consecutive <li> elements in <ul>
  formatted = formatted.replace(
    /((?:<li[^>]*>.*?<\/li>\s*)+)/g,
    '<ul class="list-disc pl-8 space-y-2 my-4">$1</ul>',
  );

  // 7. Add emphasis to medical terms and abbreviations
  const medicalTerms = [
    "TVP",
    "TEV",
    "Trombose Venosa Profunda",
    "Embolia Pulmonar",
    "EP",
    "Doppler",
    "ultrassom",
    "TC/RM",
    "PICC",
    "PICCs",
    "ICC",
    "ISS",
    "fibrina",
    "eritrócitos",
    "trombo",
    "trombosis",
    "DVT",
    "anticoagulação",
    "heparina",
    "warfarina",
    "rivaroxabana",
    "Guideline ISTH 2021",
    "Escala de Wells",
    "D-dímero",
    "fibrinólise",
    "trombofilia",
    "neoplasias",
    "Virchow",
  ];

  medicalTerms.forEach((term) => {
    const regex = new RegExp(`\\b(${term})\\b`, "g");
    formatted = formatted.replace(
      regex,
      '<strong class="font-semibold text-primary-700 dark:text-primary-300">$1</strong>',
    );
  });

  // 8. Format measurements and values
  formatted = formatted.replace(
    /(\d+(?:[.,]\d+)?)\s*(mm|cm|mg|ml|h|dias?|meses|anos)/g,
    '<span class="font-mono text-gray-800 dark:text-gray-200">$1 $2</span>',
  );

  // 9. Format risk scores (RR, HR, etc)
  formatted = formatted.replace(
    /(RR|HR)\s*(\d+[.,]\d+)/g,
    '<span class="inline-block font-mono bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded text-sm font-semibold">$1 $2</span>',
  );

  // 10. Format parenthetical content
  formatted = formatted.replace(
    /\(([^)]+)\)/g,
    '<span class="text-gray-600 dark:text-gray-400">($1)</span>',
  );

  // 11. Format sections like "3. Gravidade/evolução:"
  formatted = formatted.replace(
    /^(\d+)\.\s+([^:]+):\s+(.+)$/gm,
    '\n<div class="my-6"><h5 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-baseline gap-3"><span class="text-primary-600 dark:text-primary-400">$1.</span>$2:</h5><p class="ml-8 text-gray-700 dark:text-gray-300">$3</p></div>',
  );

  // 12. Clean up extra line breaks
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // 13. Wrap any remaining plain text in paragraphs
  formatted = formatted.replace(
    /^([^<\n].+)$/gm,
    '<p class="my-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">$1</p>',
  );

  return formatted;
}

/**
 * Enhanced content formatter specifically for section 3 type content
 */
export function formatSection3Content(content: string): string {
  if (!content) return "";

  // Apply base formatting first
  let formatted = formatProtocolContent(content);

  // Additional formatting for definition lists
  formatted = formatted.replace(
    /^(.+?):\s*(.+?)(?=\n|$)/gm,
    (match, term, definition) => {
      // Skip if already formatted
      if (match.includes("<") || match.includes(">")) return match;

      return `<div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 my-4 items-start">
        <dt class="font-semibold text-gray-700 dark:text-gray-300">${term}:</dt>
        <dd class="text-gray-600 dark:text-gray-400">${definition}</dd>
      </div>`;
    },
  );

  return formatted;
}
