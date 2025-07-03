/**
 * Text formatter for protocol content
 * Processes plain text into properly formatted HTML for display
 */

interface FormattedSection {
  type:
    | "heading"
    | "subheading"
    | "definition"
    | "list-item"
    | "sub-item"
    | "paragraph"
    | "divider";
  content: string;
  level?: number;
  emphasis?: boolean;
}

export function parseAndFormatProtocolText(text: string): string {
  if (!text) return "";

  // First, let's fix the text formatting issues
  // The text seems to be coming without proper line breaks
  let processedText = text;

  // Add line breaks before section headers
  processedText = processedText.replace(/(\d+\.\d+\s+[A-Z])/g, "\n\n$1");

  // Add line breaks before key definitions
  processedText = processedText.replace(
    /(Trombose Venosa Profunda \(TVP\))/g,
    "\n\n$1",
  );
  processedText = processedText.replace(
    /(Tromboembolismo Venoso \(TEV\))/g,
    "\n\n$1",
  );
  processedText = processedText.replace(/(Embolia Pulmonar \(EP\))/g, "\n\n$1");

  // Add line breaks before criteria and classifications
  processedText = processedText.replace(
    /(Critérios diagnósticos contemporâneos)/g,
    "\n\n$1",
  );
  processedText = processedText.replace(
    /(Diferenciação essencial:)/g,
    "\n\n$1",
  );
  processedText = processedText.replace(/(Classificação Clínica)/g, "\n\n$1");

  // Add line breaks before numbered items
  processedText = processedText.replace(/(\d+\.\s*[A-Z])/g, "\n\n$1");

  // Add line breaks before lettered sub-items
  processedText = processedText.replace(/([a-z]\)\s*[A-Z])/g, "\n$1");

  // Add line breaks before bullet points
  processedText = processedText.replace(/(•\s*[A-Z])/g, "\n$1");

  // Split text into lines for processing
  const lines = processedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const formattedSections: FormattedSection[] = [];

  let currentList: string[] = [];
  let inSubList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    // Section headers (3.1, 3.2, etc)
    if (/^\d+\.\d+\s+/.test(line)) {
      if (currentList.length > 0) {
        formattedSections.push({
          type: "list-item",
          content: formatList(currentList),
        });
        currentList = [];
      }

      const [num, ...rest] = line.split(/\s+/);
      formattedSections.push({
        type: "heading",
        content: `${num} ${rest.join(" ")}`,
      });
      continue;
    }

    // Main definitions with inline content (e.g., "Trombose Venosa Profunda (TVP) = definição...")
    if (
      line.includes("(TVP)") ||
      line.includes("(TEV)") ||
      line.includes("(EP)")
    ) {
      const parts = line.split("=");
      if (parts.length === 2) {
        formattedSections.push({
          type: "definition",
          content: parts[0].trim(),
          emphasis: true,
        });
        formattedSections.push({
          type: "paragraph",
          content: parts[1].trim(),
        });
        continue;
      } else {
        formattedSections.push({
          type: "definition",
          content: line,
          emphasis: true,
        });
        continue;
      }
    }

    // Key sections like "Diferenciação essencial:", "Critérios diagnósticos contemporâneos"
    if (
      line.endsWith(":") &&
      (line.includes("Diferenciação essencial") ||
        line.includes("Critérios diagnósticos") ||
        line.includes("Sinônimos"))
    ) {
      formattedSections.push({
        type: "subheading",
        content: line,
      });
      continue;
    }

    // Numbered items (1., 2., 3., etc) with proper spacing
    if (/^\d+\.\s*[A-Z]/.test(line)) {
      if (currentList.length > 0) {
        formattedSections.push({
          type: "list-item",
          content: formatList(currentList),
        });
        currentList = [];
      }

      // Add divider before numbered items (except the first)
      if (
        formattedSections.length > 0 &&
        /^\d+\./.test(line) &&
        !line.startsWith("1.")
      ) {
        formattedSections.push({ type: "divider", content: "" });
      }

      // Fix spacing: "1.Topográfica" -> "1. Topográfica"
      const fixedLine = line.replace(/^(\d+)\.(\S)/, "$1. $2");
      formattedSections.push({
        type: "list-item",
        content: fixedLine,
        level: 1,
      });
      continue;
    }

    // Sub-items (a), b), c))
    if (/^[a-z]\)\s*/.test(line)) {
      const formattedSubItem = line.replace(/^([a-z])\)\s*/, "$1) ");
      currentList.push(formattedSubItem);
      inSubList = true;
      continue;
    }

    // Bullet points
    if (line.startsWith("•") || line.startsWith("-")) {
      const content = line.replace(/^[•\-]\s*/, "").trim();
      currentList.push(`• ${content}`);
      continue;
    }

    // Regular paragraphs
    if (
      currentList.length > 0 &&
      !(/^[a-z]\)/.test(line) || line.startsWith("•"))
    ) {
      formattedSections.push({
        type: "list-item",
        content: formatList(currentList),
      });
      currentList = [];
    }

    formattedSections.push({
      type: "paragraph",
      content: line,
    });
  }

  // Don't forget remaining list items
  if (currentList.length > 0) {
    formattedSections.push({
      type: "list-item",
      content: formatList(currentList),
    });
  }

  // Convert sections to HTML
  return formattedSections
    .map((section) => {
      switch (section.type) {
        case "heading":
          return `<h4 class="text-xl font-bold text-gray-800 dark:text-gray-200 mt-10 mb-6 border-l-4 border-primary-500 pl-4">${section.content}</h4>`;

        case "subheading":
          return `<h5 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">${section.content}</h5>`;

        case "definition":
          return `<div class="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <p class="font-bold text-lg text-blue-900 dark:text-blue-100">${section.content}</p>
        </div>`;

        case "list-item":
          return `<div class="my-4 ${section.level === 1 ? "font-medium" : ""}">${section.content}</div>`;

        case "divider":
          return `<div class="my-6"></div>`;

        case "paragraph":
          return `<p class="my-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">${formatMedicalTerms(section.content)}</p>`;

        default:
          return `<p class="my-4">${section.content}</p>`;
      }
    })
    .join("\n");
}

function formatList(items: string[]): string {
  if (items.length === 0) return "";

  const formatted = items
    .map((item) => {
      // Sub-items with letters
      if (/^[a-z]\)/.test(item)) {
        return `<div class="ml-8 my-2 flex gap-3">
        <span class="font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">${item.substring(0, 2)}</span>
        <span class="text-gray-700 dark:text-gray-300">${formatMedicalTerms(item.substring(3))}</span>
      </div>`;
      }
      // Bullet points
      else if (item.startsWith("•")) {
        return `<div class="ml-8 my-2 flex gap-3">
        <span class="text-gray-600 dark:text-gray-400">•</span>
        <span class="text-gray-700 dark:text-gray-300">${formatMedicalTerms(item.substring(2))}</span>
      </div>`;
      }
      // Regular items
      else {
        return `<div class="my-2">${formatMedicalTerms(item)}</div>`;
      }
    })
    .join("\n");

  return `<div class="space-y-2">${formatted}</div>`;
}

function formatMedicalTerms(text: string): string {
  // Bold important medical terms
  const terms = [
    "TVP",
    "TEV",
    "Trombose Venosa Profunda",
    "Embolia Pulmonar",
    "EP",
    "Doppler",
    "ultrassom Doppler",
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
    "Guideline ISTH 2021",
    "Escala de Wells",
    "fibrinólise",
    "RR",
    "HR",
    "Virchow",
  ];

  let formatted = text;

  // Bold medical terms
  terms.forEach((term) => {
    const regex = new RegExp(`\\b(${term})\\b`, "g");
    formatted = formatted.replace(regex, "<strong>$1</strong>");
  });

  // Format measurements
  formatted = formatted.replace(
    /(\d+(?:[.,]\d+)?)\s*(mm|cm|mg|ml|h|dias?|meses|anos)/g,
    '<span class="font-mono">$1 $2</span>',
  );

  // Format risk scores
  formatted = formatted.replace(
    /\b(RR|HR|OR)\s*(\d+[.,]\d+)/g,
    '<span class="inline-block px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-sm font-mono font-semibold">$1 $2</span>',
  );

  // Format parenthetical content (keep it subtle)
  formatted = formatted.replace(
    /\(([^)]+)\)/g,
    '<span class="text-gray-600 dark:text-gray-400">($1)</span>',
  );

  return formatted;
}

/**
 * Clean HTML from text content (removes any HTML tags)
 */
export function cleanHtmlFromText(text: string): string {
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Remove any CSS class strings that leaked through
  cleaned = cleaned.replace(
    /"[^"]*(?:text-|bg-|border-|mt-|mb-|ml-|mr-|p-|pl-|pr-)[^"]*">/g,
    "",
  );

  return cleaned.trim();
}
