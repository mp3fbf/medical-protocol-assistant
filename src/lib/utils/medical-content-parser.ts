/**
 * Advanced medical content parser for protocol sections
 * Handles complex medical text formatting with proper hierarchy
 */

interface ParsedSection {
  type:
    | "main-header"
    | "sub-header"
    | "definition"
    | "definition-content"
    | "numbered-item"
    | "lettered-item"
    | "bullet-item"
    | "paragraph"
    | "key-point"
    | "criteria"
    | "classification";
  content: string;
  level?: number;
  metadata?: {
    term?: string;
    abbreviation?: string;
    isImportant?: boolean;
  };
}

export function parseMedicalProtocolContent(rawText: string): string {
  if (!rawText) return "";

  // First, normalize the text
  let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // Smart line break insertion based on medical content patterns
  text = insertSmartLineBreaks(text);

  // Parse into structured sections
  const parsedSections = parseIntoSections(text);

  // Convert to HTML with proper formatting
  return sectionsToHtml(parsedSections);
}

function insertSmartLineBreaks(text: string): string {
  // Pattern 1: Section headers (3.1, 3.2, etc.)
  text = text.replace(/(\d+\.\d+\s+[A-ZÀ-Ú])/g, "\n\n$1");

  // Pattern 2: Medical definitions with parentheses
  text = text.replace(
    /((?:Trombose|Embolia|Síndrome|Doença|Diagnóstico|Tratamento)[^(]+\([A-Z]+\))/g,
    "\n\n$1",
  );

  // Pattern 3: Key phrases that start new sections
  const keyPhrases = [
    "Critérios diagnósticos",
    "Diferenciação essencial",
    "Classificação",
    "Sinônimos",
    "Definição",
    "Epidemiologia",
    "Fatores de risco",
    "Manifestações clínicas",
    "Exames complementares",
    "Tratamento",
    "Prognóstico",
    "Complicações",
  ];

  keyPhrases.forEach((phrase) => {
    const regex = new RegExp(`(${phrase}[^:]*:)`, "gi");
    text = text.replace(regex, "\n\n$1");
  });

  // Pattern 4: Numbered items (1., 2., etc.) - but not decimals
  text = text.replace(/([.!?])\s+(\d+\.\s*[A-ZÀ-Ú])/g, "$1\n\n$2");
  text = text.replace(/^\s*(\d+\.\s*[A-ZÀ-Ú])/gm, "\n$1");

  // Pattern 5: Lettered sub-items
  text = text.replace(/([.!?])\s+([a-z]\)\s*[A-ZÀ-Ú])/g, "$1\n$2");

  // Pattern 6: Bullet points
  text = text.replace(/([-•]\s*[A-ZÀ-Ú])/g, "\n$1");

  // Clean up excessive line breaks
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

function parseIntoSections(text: string): ParsedSection[] {
  const lines = text.split("\n").filter((line) => line.trim());
  const sections: ParsedSection[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Pattern: Main section header (3.1, 3.2, etc.)
    if (/^\d+\.\d+\s+/.test(line)) {
      const match = line.match(/^(\d+\.\d+)\s+(.+)$/);
      if (match) {
        sections.push({
          type: "main-header",
          content: `${match[1]} ${match[2]}`,
        });
      }
      continue;
    }

    // Pattern: Medical definition with abbreviation
    const defMatch = line.match(/^(.+?)\s*\(([A-Z]+)\)\s*(?:=|:|$)(.*)/);
    if (defMatch) {
      sections.push({
        type: "definition",
        content: defMatch[1],
        metadata: {
          abbreviation: defMatch[2],
          isImportant: true,
        },
      });

      if (defMatch[3]) {
        sections.push({
          type: "definition-content",
          content: defMatch[3].trim(),
        });
      }
      continue;
    }

    // Pattern: Key sections (ends with colon)
    if (line.endsWith(":") && /^[A-ZÀ-Ú]/.test(line)) {
      const isKeySection = [
        "Critérios diagnósticos",
        "Diferenciação essencial",
        "Classificação",
        "Sinônimos",
      ].some((key) => line.toLowerCase().includes(key.toLowerCase()));

      if (isKeySection) {
        sections.push({
          type: "key-point",
          content: line,
        });
        continue;
      }
    }

    // Pattern: Numbered items (1., 2., etc.)
    if (/^\d+\.\s+/.test(line)) {
      sections.push({
        type: "numbered-item",
        content: line,
        level: 1,
      });
      continue;
    }

    // Pattern: Lettered sub-items (a), b), etc.)
    if (/^[a-z]\)\s*/.test(line)) {
      sections.push({
        type: "lettered-item",
        content: line,
        level: 2,
      });
      continue;
    }

    // Pattern: Bullet points
    if (/^[•\-]\s*/.test(line)) {
      sections.push({
        type: "bullet-item",
        content: line.replace(/^[•\-]\s*/, ""),
        level: 2,
      });
      continue;
    }

    // Default: Regular paragraph
    sections.push({
      type: "paragraph",
      content: line,
    });
  }

  return sections;
}

function sectionsToHtml(sections: ParsedSection[]): string {
  let html = "";
  let inList = false;
  let listType: "numbered" | "lettered" | "bullet" | null = null;

  sections.forEach((section, index) => {
    // Close any open lists if we're not in a list item
    if (
      inList &&
      !["numbered-item", "lettered-item", "bullet-item"].includes(section.type)
    ) {
      html += closeList(listType);
      inList = false;
      listType = null;
    }

    switch (section.type) {
      case "main-header":
        html += `<h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-6 pb-2 border-b-2 border-primary-500">${formatMedicalTerms(section.content)}</h3>\n`;
        break;

      case "sub-header":
        html += `<h4 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-4">${formatMedicalTerms(section.content)}</h4>\n`;
        break;

      case "definition":
        const abbr = section.metadata?.abbreviation
          ? ` (${section.metadata.abbreviation})`
          : "";
        html += `<div class="my-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-600">
          <h5 class="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">${section.content}${abbr}</h5>`;
        break;

      case "definition-content":
        html += `<p class="text-gray-700 dark:text-gray-300 leading-relaxed">${formatMedicalTerms(section.content)}</p>
        </div>\n`;
        break;

      case "key-point":
        html += `<div class="mt-6 mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
          <h5 class="text-lg font-semibold text-amber-900 dark:text-amber-100">${section.content}</h5>
        </div>\n`;
        break;

      case "numbered-item":
        if (!inList || listType !== "numbered") {
          if (inList) html += closeList(listType);
          html += '<ol class="list-decimal list-inside space-y-3 ml-4 my-4">\n';
          inList = true;
          listType = "numbered";
        }
        html += `<li class="text-gray-700 dark:text-gray-300 leading-relaxed">
          <span class="font-medium">${formatMedicalTerms(section.content.replace(/^\d+\.\s*/, ""))}</span>
        </li>\n`;
        break;

      case "lettered-item":
        if (!inList || listType !== "lettered") {
          if (inList) html += closeList(listType);
          html += '<div class="ml-8 space-y-2 my-3">\n';
          inList = true;
          listType = "lettered";
        }
        const letter = section.content.match(/^([a-z])\)/)?.[1] || "";
        const content = section.content.replace(/^[a-z]\)\s*/, "");
        html += `<div class="flex gap-3">
          <span class="font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0">${letter})</span>
          <span class="text-gray-700 dark:text-gray-300">${formatMedicalTerms(content)}</span>
        </div>\n`;
        break;

      case "bullet-item":
        if (!inList || listType !== "bullet") {
          if (inList) html += closeList(listType);
          html += '<ul class="list-disc list-inside space-y-2 ml-8 my-4">\n';
          inList = true;
          listType = "bullet";
        }
        html += `<li class="text-gray-700 dark:text-gray-300">${formatMedicalTerms(section.content)}</li>\n`;
        break;

      case "paragraph":
        html += `<p class="my-4 text-gray-700 dark:text-gray-300 leading-relaxed">${formatMedicalTerms(section.content)}</p>\n`;
        break;
    }
  });

  // Close any remaining open lists
  if (inList) {
    html += closeList(listType);
  }

  return html;
}

function closeList(
  listType: "numbered" | "lettered" | "bullet" | null,
): string {
  switch (listType) {
    case "numbered":
      return "</ol>\n";
    case "lettered":
      return "</div>\n";
    case "bullet":
      return "</ul>\n";
    default:
      return "";
  }
}

function formatMedicalTerms(text: string): string {
  // Important medical terms to highlight
  const importantTerms = [
    "TVP",
    "TEV",
    "EP",
    "Trombose Venosa Profunda",
    "Embolia Pulmonar",
    "Tromboembolismo Venoso",
    "Doppler",
    "ultrassom",
    "TC/RM",
    "PICC",
    "ISS",
    "RR",
    "HR",
    "ICC",
    "Guideline ISTH",
    "Escala de Wells",
    "D-dímero",
    "anticoagulação",
    "heparina",
    "warfarina",
    "rivaroxabana",
    "fibrinólise",
    "Virchow",
    "fibrina",
    "eritrócitos",
    "trombo",
  ];

  let formatted = text;

  // Highlight medical terms
  importantTerms.forEach((term) => {
    const regex = new RegExp(`\\b(${term})\\b`, "gi");
    formatted = formatted.replace(
      regex,
      '<strong class="font-semibold text-primary-700 dark:text-primary-300">$1</strong>',
    );
  });

  // Format measurements and values
  formatted = formatted.replace(
    /(\d+(?:[.,]\d+)?)\s*(mm|cm|mg|ml|UI|h|dias?|semanas?|meses?|anos?)/gi,
    '<span class="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded">$1$2</span>',
  );

  // Format risk ratios and statistics
  formatted = formatted.replace(
    /\b(RR|HR|OR|IC)\s*[:=]?\s*(\d+[.,]\d+)/gi,
    '<span class="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm font-mono font-bold">$1 $2</span>',
  );

  // Format percentages
  formatted = formatted.replace(
    /(\d+(?:[.,]\d+)?)\s*%/g,
    '<span class="font-semibold text-indigo-600 dark:text-indigo-400">$1%</span>',
  );

  // Italicize Latin terms
  const latinTerms = ["et al", "in vitro", "in vivo", "vs"];
  latinTerms.forEach((term) => {
    const regex = new RegExp(`\\b(${term})\\b`, "gi");
    formatted = formatted.replace(
      regex,
      '<em class="text-gray-600 dark:text-gray-400">$1</em>',
    );
  });

  return formatted;
}
