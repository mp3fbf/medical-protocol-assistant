/**
 * Stylesheet for react-pdf components, aiming for ABNT compliance.
 */
import { StyleSheet, Font } from "@react-pdf/renderer";

// ABNT NBR 14724 recommends Times New Roman or Arial.
// For react-pdf, fonts must be registered.
// Arial is often a safe default if specific font files aren't embedded.
// Ensure that if you use "Times New Roman", you register the font file.
// Example (font files would need to be in your project, e.g., in /public/fonts):
/*
Font.register({
  family: "Times New Roman",
  fonts: [
    { src: "/path/to/times.ttf" }, // regular
    { src: "/path/to/timesbd.ttf", fontWeight: "bold" },
    { src: "/path/to/timesi.ttf", fontStyle: "italic" },
    { src: "/path/to/timesbi.ttf", fontWeight: "bold", fontStyle: "italic" },
  ],
});
*/

// For simplicity, we'll default to a common sans-serif font like Helvetica/Arial which react-pdf often handles.
const ABNT_FONT_FAMILY = "Helvetica"; // Or "Times New Roman" if registered

// ABNT Page Margins (in points, 1 inch = 72 points, 1 cm = 72 / 2.54 points)
const CM_TO_PT = (cm: number) => (cm / 2.54) * 72;

export const abntStyles = StyleSheet.create({
  page: {
    paddingTop: CM_TO_PT(3),
    paddingLeft: CM_TO_PT(3),
    paddingBottom: CM_TO_PT(2),
    paddingRight: CM_TO_PT(2),
    fontFamily: ABNT_FONT_FAMILY,
    fontSize: 12, // ABNT Body text size 12pt
    lineHeight: 1.5, // ABNT line spacing 1.5
  },
  documentTitle: {
    fontSize: 16, // Example, adjust as needed
    textAlign: "center",
    marginBottom: CM_TO_PT(2), // Space after title
    fontFamily: ABNT_FONT_FAMILY,
    fontWeight: "bold",
  },
  sectionTitleH1: {
    fontSize: 12, // ABNT: Sections start with 12pt, bold, all caps for primary
    fontFamily: ABNT_FONT_FAMILY,
    fontWeight: "bold",
    marginTop: CM_TO_PT(1), // Space before section title
    marginBottom: CM_TO_PT(0.5), // Space after section title
    // textTransform: "uppercase", // react-pdf doesn't support text-transform directly
  },
  sectionTitleH2: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    fontWeight: "bold",
    marginTop: CM_TO_PT(0.8),
    marginBottom: CM_TO_PT(0.4),
  },
  sectionTitleH3: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    // ABNT: tertiary sections might be italic or just normal with number
    fontStyle: "italic",
    marginTop: CM_TO_PT(0.6),
    marginBottom: CM_TO_PT(0.3),
  },
  paragraph: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    textAlign: "justify",
    textIndent: CM_TO_PT(1.25), // ABNT first line indent for paragraphs
    marginBottom: CM_TO_PT(0.2), // Small space between paragraphs or adjust line height
  },
  listItem: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    textAlign: "justify",
    marginLeft: CM_TO_PT(0.75), // Indent for list items
    marginBottom: CM_TO_PT(0.1),
  },
  table: {
    display: "flex" as any, // Required for react-pdf table
    flexDirection: "column" as any,
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: CM_TO_PT(0.5),
  },
  tableRow: {
    display: "flex" as any,
    flexDirection: "row" as any,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
  },
  tableColHeader: {
    width: "33%", // Example for 3 columns
    borderStyle: "solid",
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
    padding: 5,
    fontWeight: "bold",
  },
  tableCol: {
    width: "33%", // Example for 3 columns
    borderStyle: "solid",
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    padding: 5,
  },
  tableCell: {
    fontSize: 10, // ABNT smaller font for table content
    margin: 5,
  },
  referenceItem: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    textAlign: "justify",
    // ABNT references: single spaced within, double between. Complex to achieve perfectly.
    // Often left aligned, hanging indent.
    marginBottom: CM_TO_PT(0.2),
    // marginLeft for hanging indent needs careful handling or custom component
  },
  boldText: {
    fontWeight: "bold",
  },
  italicText: {
    fontStyle: "italic",
  },
  // Add more styles as needed for specific ABNT elements:
  // - Long citations (recuo de 4cm)
  // - Footnotes
  // - Figure/Table captions
});

// Helper for registering fonts - ensure you have the font files
export const registerABNTFonts = () => {
  // Example:
  // Font.register({ family: 'Arial', src: '/path/to/arial.ttf' });
  // Font.register({ family: 'Times New Roman', src: '/path/to/times.ttf' });
  // If not registering, react-pdf will use its defaults (Helvetica, Courier, Times-Roman)
  console.log(
    "Font registration placeholder. Ensure fonts are correctly registered for ABNT compliance if using specific ones.",
  );
};
