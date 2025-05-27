/**
 * Stylesheet for react-pdf components, aiming for ABNT compliance.
 * Includes font registration for server-side rendering, converting buffers to Data URIs.
 */
import { StyleSheet, Font } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";

// Define the font family name that will be used in styles
const ABNT_FONT_FAMILY = "Times New Roman";

// Function to register fonts. This should be called once.
// It reads font files directly from the filesystem for server-side rendering
// and converts them to Data URIs.
let fontsRegistered = false;
export const registerABNTFonts = () => {
  if (fontsRegistered) {
    return;
  }
  try {
    const projectRoot = process.cwd();
    const fontPath = (fileName: string) =>
      path.join(projectRoot, "src", "assets", "fonts", fileName);

    // Use string literals for fontWeight and fontStyle, and any for the options and return type initially
    const createFontSource = (
      filePath: string,
      options?: { fontWeight?: string; fontStyle?: string },
    ): any | null => {
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const base64 = buffer.toString("base64");
        // For TTF fonts, the mime type is 'font/truetype' or 'application/font-sfnt' or 'application/x-font-ttf'
        // 'font/truetype' is widely accepted.
        const src = `data:font/truetype;charset=utf-8;base64,${base64}`;
        return { src, ...options };
      }
      console.warn(`Font file not found at: ${filePath}.`);
      return null;
    };

    // Using filenames as provided in the user's screenshot
    const sources = [
      createFontSource(fontPath("Times New Roman.ttf")),
      createFontSource(fontPath("Times New Roman - Bold.ttf"), {
        fontWeight: "bold",
      }),
      createFontSource(fontPath("Times New Roman - Italic.ttf"), {
        fontStyle: "italic",
      }),
      createFontSource(fontPath("Times New Roman - Bold Italic.ttf"), {
        fontWeight: "bold",
        fontStyle: "italic",
      }),
    ].filter((source) => source !== null) as any[]; // Cast to any[] for now

    if (sources.length > 0) {
      Font.register({
        family: ABNT_FONT_FAMILY,
        fonts: sources,
      });
      console.log(
        `Successfully registered ${ABNT_FONT_FAMILY} font family with ${sources.length} variants for react-pdf using Data URIs.`,
      );
    } else if (sources.length === 0 && process.env.NODE_ENV !== "test") {
      // Only throw if no fonts registered and not in test mode
      throw new Error(
        `No Times New Roman font files found matching expected names in src/assets/fonts/. PDF generation will likely fail or use incorrect fonts.`,
      );
    }
    fontsRegistered = true;
  } catch (error) {
    console.error(
      `Error registering ${ABNT_FONT_FAMILY} fonts for react-pdf:`,
      error,
    );
    fontsRegistered = true; // Mark as attempted
  }
};

// ABNT Page Margins (in points, 1 inch = 72 points, 1 cm = 72 / 2.54 points)
const CM_TO_PT = (cm: number) => (cm / 2.54) * 72;

export const abntStyles = StyleSheet.create({
  page: {
    paddingTop: CM_TO_PT(3),
    paddingLeft: CM_TO_PT(3),
    paddingBottom: CM_TO_PT(2),
    paddingRight: CM_TO_PT(2),
    fontFamily: ABNT_FONT_FAMILY, // Use the registered Times New Roman
    fontSize: 12, // ABNT Body text size 12pt
    lineHeight: 1.5, // ABNT line spacing 1.5
  },
  documentTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: CM_TO_PT(2),
    fontFamily: ABNT_FONT_FAMILY,
    fontWeight: "bold",
  },
  sectionTitleH1: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    fontWeight: "bold",
    marginTop: CM_TO_PT(1),
    marginBottom: CM_TO_PT(0.5),
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
    fontStyle: "italic",
    marginTop: CM_TO_PT(0.6),
    marginBottom: CM_TO_PT(0.3),
  },
  paragraph: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    textAlign: "justify",
    textIndent: CM_TO_PT(1.25),
    marginBottom: CM_TO_PT(0.2),
  },
  listItem: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    textAlign: "justify",
    marginLeft: CM_TO_PT(0.75),
    marginBottom: CM_TO_PT(0.1),
  },
  table: {
    display: "flex" as any,
    flexDirection: "column" as any,
    width: "auto",
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
    flexGrow: 1,
    borderStyle: "solid",
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
    padding: 3,
    fontWeight: "bold",
    fontSize: 10,
    fontFamily: ABNT_FONT_FAMILY,
  },
  tableCol: {
    flexGrow: 1,
    borderStyle: "solid",
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    padding: 3,
    fontSize: 10,
    fontFamily: ABNT_FONT_FAMILY,
  },
  referenceItem: {
    fontSize: 12,
    fontFamily: ABNT_FONT_FAMILY,
    textAlign: "justify",
    marginBottom: CM_TO_PT(0.2),
  },
  boldText: {
    fontFamily: ABNT_FONT_FAMILY,
    fontWeight: "bold",
  },
  italicText: {
    fontFamily: ABNT_FONT_FAMILY,
    fontStyle: "italic",
  },
});
