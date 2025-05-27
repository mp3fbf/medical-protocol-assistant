/**
 * ABNT Template Configuration and Styling for DOCX Generation.
 *
 * This file defines constants for style IDs expected in the ABNT Word template
 * and includes helper functions or constants for applying these styles.
 */

import { BorderStyle, WidthType } from "docx";

// These are placeholder style IDs. The actual IDs must match those
// defined in the `public/templates/protocol-template.docx` file.
// To find these IDs in Word:
// 1. Open your template .docx file.
// 2. Developer Tab -> XML Mapping Pane.
// 3. In the dropdown, choose "http://schemas.openxmlformats.org/wordprocessingml/2006/main".
// 4. Expand "styles" -> "style". Look for the w:styleId attribute for your defined styles.
// Common default styles might be "Normal", "Heading1", "ListParagraph".
export const ABNT_STYLE_IDS = {
  // Paragraph Styles
  NORMAL: "NormalWeb", // Often 'Normal' or 'NormalWeb'. Check your template.
  HEADING_1: "Heading1", // Style for "Título 1" (e.g., 1. SEÇÃO PRINCIPAL)
  HEADING_2: "Heading2", // Style for "Título 2" (e.g., 1.1. Subseção)
  HEADING_3: "Heading3", // Style for "Título 3" (e.g., 1.1.1. Sub-subseção)
  LIST_BULLET: "ListBullet", // Style for bulleted lists (e.g., based on "ListParagraph")
  LIST_NUMBER: "ListNumber", // Style for numbered lists (e.g., based on "ListParagraph")
  CITATION_LONG: "CitationRecuada", // Custom style for long direct quotes (recuadas >3 linhas)
  FOOTNOTE_TEXT: "FootnoteText", // Style for footnote text
  TABLE_CAPTION: "TableCaption", // Style for table captions (e.g., "Tabela 1 - ...")
  FIGURE_CAPTION: "FigureCaption", // Style for figure captions (e.g., "Figura 1 - ...")
  REFERENCE_LIST: "ReferenceItem", // Custom style for items in bibliography

  // Character Styles (can be applied to TextRuns)
  STRONG: "Strong", // For bold text
  EMPHASIS: "Emphasis", // For italic text
  FOOTNOTE_REFERENCE: "FootnoteReference", // For the superscript number in the text
};

// ABNT NBR 14724 page margins:
// Top: 3cm, Left: 3cm, Bottom: 2cm, Right: 2cm
// 1 cm = 567 twips (approx, Word uses a slightly more precise value like 566.929)
// Using a more common rounded value for docx library, or ensure exact match from Word's internal units if critical.
const CM_TO_TWIPS = (cm: number) => Math.round(cm * 567);

export const ABNT_PAGE_MARGINS = {
  top: CM_TO_TWIPS(3),
  left: CM_TO_TWIPS(3),
  bottom: CM_TO_TWIPS(2),
  right: CM_TO_TWIPS(2),
  header: CM_TO_TWIPS(1.25), // Default header distance from edge
  footer: CM_TO_TWIPS(1.25), // Default footer distance from edge
  gutter: 0,
};

// ABNT NBR 14724 font settings:
// Times New Roman or Arial, size 12 for body text.
// Size 10 for citations >3 lines, footnotes, table/figure captions.
export const ABNT_FONT_SETTINGS = {
  body: {
    font: "Arial", // Or "Times New Roman"
    size: 24, // 12pt (docx points are half-points)
  },
  heading1: {
    font: "Arial",
    size: 28, // 14pt, bold (example, adjust to match template)
    bold: true,
  },
  heading2: {
    font: "Arial",
    size: 24, // 12pt, bold (example)
    bold: true,
  },
  smallText: {
    // For footnotes, long citations, captions
    font: "Arial",
    size: 20, // 10pt
  },
};

// ABNT Table Properties (basic example)
export const ABNT_TABLE_PROPERTIES = {
  borders: {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  },
  width: {
    size: 100,
    type: WidthType.PERCENTAGE,
  },
  // ABNT typically recommends no internal vertical lines, and limited horizontal lines.
  // This would require more complex border configuration per row/cell.
};
