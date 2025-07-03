/**
 * DOCX Document Generation for Medical Protocols
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  // BorderStyle as _BorderStyle, // Marked as unused
  AlignmentType,
  VerticalAlign,
  // PageBreak as _PageBreak, // Marked as unused
  // Header as _Header, // Marked as unused
  // Footer as _Footer, // Marked as unused
  // PageNumber as _PageNumber, // Marked as unused
  SectionType,
} from "docx";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import {
  ABNT_STYLE_IDS,
  ABNT_PAGE_MARGINS,
  ABNT_FONT_SETTINGS,
} from "./templates";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";

const createStyledParagraph = (
  text: string,
  styleId?: string,
  isBold?: boolean,
  isItalic?: boolean,
): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: ABNT_FONT_SETTINGS.body.font,
        size: ABNT_FONT_SETTINGS.body.size,
        bold: isBold,
        italics: isItalic,
      }),
    ],
    style: styleId || ABNT_STYLE_IDS.NORMAL,
    spacing: { after: 120 },
    indent:
      styleId === ABNT_STYLE_IDS.NORMAL ? { firstLine: "1.25cm" } : undefined,
  });
};

const createSectionTitleParagraph = (
  title: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel],
): Paragraph => {
  let styleId: string;
  let fontSize: number = ABNT_FONT_SETTINGS.body.size;

  switch (level) {
    case HeadingLevel.HEADING_1:
      styleId = ABNT_STYLE_IDS.HEADING_1;
      fontSize = ABNT_FONT_SETTINGS.heading1.size || 28;
      break;
    case HeadingLevel.HEADING_2:
      styleId = ABNT_STYLE_IDS.HEADING_2;
      fontSize = ABNT_FONT_SETTINGS.heading2.size || 24;
      break;
    case HeadingLevel.HEADING_3:
      styleId = ABNT_STYLE_IDS.HEADING_3;
      fontSize = ABNT_FONT_SETTINGS.body.size;
      break;
    default:
      styleId = ABNT_STYLE_IDS.NORMAL;
  }

  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: fontSize,
        font: ABNT_FONT_SETTINGS.body.font,
      }),
    ],
    style: styleId,
    spacing: { before: 240, after: 120 },
  });
};

const renderFichaTecnica = (
  sectionData?: ProtocolSectionData,
): (Paragraph | Table)[] => {
  const elements: (Paragraph | Table)[] = [];
  if (
    !sectionData ||
    typeof sectionData.content !== "object" ||
    sectionData.content === null
  ) {
    elements.push(createStyledParagraph("Ficha técnica não disponível."));
    return elements;
  }

  const content = sectionData.content as any;

  const createResponsibilityTable = (
    title: string,
    items: {
      nome?: string;
      conselhoDeClasse?: string;
      especialidade?: string;
      cargo?: string;
    }[],
  ): Table | null => {
    if (!Array.isArray(items) || items.length === 0) return null;

    const headerCells = [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Nome", bold: true })],
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Conselho de Classe / Especialidade / Cargo",
                bold: true,
              }),
            ],
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Assinatura", bold: true })],
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
      }),
    ];
    const headerRow = new TableRow({
      children: headerCells,
      tableHeader: true,
    });

    const dataRows = items.map((item) => {
      return new TableRow({
        children: [
          new TableCell({ children: [createStyledParagraph(item.nome || "")] }),
          new TableCell({
            children: [
              createStyledParagraph(
                item.conselhoDeClasse || item.especialidade || item.cargo || "",
              ),
            ],
          }),
          new TableCell({ children: [createStyledParagraph("")] }),
        ],
      });
    });

    elements.push(createStyledParagraph(title, ABNT_STYLE_IDS.HEADING_3, true));
    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {},
    });
  };

  const elaboradoresTable = createResponsibilityTable(
    "Elaboração:",
    content.autores || content.elaboradores,
  );
  if (elaboradoresTable) elements.push(elaboradoresTable, new Paragraph(""));

  const revisoresTable = createResponsibilityTable(
    "Revisão:",
    content.revisores,
  );
  if (revisoresTable) elements.push(revisoresTable, new Paragraph(""));

  const aprovadoresTable = createResponsibilityTable(
    "Aprovação:",
    content.aprovadores,
  );
  if (aprovadoresTable) elements.push(aprovadoresTable, new Paragraph(""));

  return elements;
};

const renderGenericContent = (content: any, path: string = ""): Paragraph[] => {
  const paragraphs: Paragraph[] = [];
  if (typeof content === "string") {
    paragraphs.push(createStyledParagraph(content));
  } else if (Array.isArray(content)) {
    content.forEach((item, index) => {
      if (typeof item === "string") {
        paragraphs.push(
          new Paragraph({
            text: `- ${item}`,
            style: ABNT_STYLE_IDS.LIST_BULLET,
            indent: { left: "0.75cm", hanging: "0.25cm" },
          }),
        );
      } else if (typeof item === "object" && item !== null) {
        paragraphs.push(
          createStyledParagraph(`Item ${index + 1}:`, undefined, true),
        );
        paragraphs.push(...renderGenericContent(item, `${path}[${index}]`));
      } else {
        paragraphs.push(createStyledParagraph(String(item)));
      }
    });
  } else if (typeof content === "object" && content !== null) {
    for (const [key, value] of Object.entries(content)) {
      const displayKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      paragraphs.push(createStyledParagraph(`${displayKey}:`, undefined, true));
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        paragraphs.push(
          createStyledParagraph(
            String(value),
            undefined,
            false,
            typeof value === "string" && value.startsWith("http"),
          ),
        );
      } else {
        paragraphs.push(...renderGenericContent(value, `${path}.${key}`));
      }
    }
  } else if (content !== null && content !== undefined) {
    paragraphs.push(createStyledParagraph(String(content)));
  }
  return paragraphs;
};

export async function generateProtocolDocx(
  protocolData: ProtocolFullContent,
): Promise<Buffer> {
  const documentSections: (Paragraph | Table)[] = [];

  const mainTitle =
    (protocolData["1"]?.content as any)?.tituloCompleto || "Protocolo Médico";
  documentSections.push(
    new Paragraph({
      text: mainTitle,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
    }),
  );

  for (let i = 1; i <= 13; i++) {
    const sectionKey = i.toString();
    const sectionDef = SECTION_DEFINITIONS.find((s) => s.sectionNumber === i);
    const sectionContent = protocolData[sectionKey];

    const title = sectionContent?.title || sectionDef?.titlePT || `Seção ${i}`;
    const numberedTitle = `${i}. ${title}`;

    documentSections.push(
      createSectionTitleParagraph(numberedTitle, HeadingLevel.HEADING_1),
    );

    if (
      !sectionContent ||
      sectionContent.content === null ||
      sectionContent.content === undefined
    ) {
      documentSections.push(createStyledParagraph("Conteúdo não disponível."));
    } else if (i === 2) {
      documentSections.push(...renderFichaTecnica(sectionContent));
    } else if (i === 12) {
      documentSections.push(
        createStyledParagraph(
          "O fluxograma correspondente a este protocolo está disponível em anexo ou em sistema específico.",
        ),
      );
    } else if (i === 13 && Array.isArray(sectionContent.content)) {
      (sectionContent.content as string[]).forEach((ref) => {
        documentSections.push(
          createStyledParagraph(ref, ABNT_STYLE_IDS.REFERENCE_LIST),
        );
      });
    } else if (
      i === 1 &&
      typeof sectionContent.content === "object" &&
      sectionContent.content !== null
    ) {
      const idContent = sectionContent.content as any;
      const fieldsToDisplay = [
        { label: "Código do Protocolo", key: "codigoProtocolo" },
        { label: "Título Completo", key: "tituloCompleto" },
        { label: "Versão", key: "versao" },
        { label: "Origem/Organização", key: "origemOrganizacao" },
        { label: "Data de Elaboração", key: "dataElaboracao" },
        { label: "Data da Última Revisão", key: "dataUltimaRevisao" },
        { label: "Data da Próxima Revisão", key: "dataProximaRevisao" },
        { label: "Âmbito de Aplicação", key: "ambitoAplicacao" },
      ];
      fieldsToDisplay.forEach((field) => {
        if (idContent[field.key]) {
          documentSections.push(
            createStyledParagraph(`${field.label}: ${idContent[field.key]}`),
          );
        }
      });
      if (idContent.historicoAlteracoes)
        documentSections.push(
          createStyledParagraph(
            `Histórico de Alterações: ${JSON.stringify(idContent.historicoAlteracoes)}`,
          ),
        );
      if (idContent.CIDs)
        documentSections.push(
          createStyledParagraph(
            `CIDs Relacionados: ${idContent.CIDs.join(", ")}`,
          ),
        );
    } else {
      documentSections.push(...renderGenericContent(sectionContent.content));
    }
    documentSections.push(new Paragraph(""));
  }

  const doc = new Document({
    creator: "Medical Protocol Assistant",
    title: mainTitle,
    description: `Protocolo Médico para ${(protocolData["1"]?.content as any)?.condition || "Condição não especificada"}`,
    numbering: {
      config: [
        {
          reference: "default-bullet-list",
          levels: [
            {
              level: 0,
              format: "bullet",
              text: "•",
              style: {
                paragraph: { indent: { left: "0.75cm", hanging: "0.25cm" } },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        heading1: {
          run: {
            font: ABNT_FONT_SETTINGS.heading1.font,
            size: ABNT_FONT_SETTINGS.heading1.size,
            bold: true,
          },
          paragraph: { spacing: { before: 360, after: 120 } },
        },
        heading2: {
          run: {
            font: ABNT_FONT_SETTINGS.heading2.font,
            size: ABNT_FONT_SETTINGS.heading2.size,
            bold: true,
          },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        heading3: {
          run: {
            font: ABNT_FONT_SETTINGS.body.font,
            size: ABNT_FONT_SETTINGS.body.size,
            bold: true,
          },
          paragraph: { spacing: { before: 200, after: 100 } },
        },
      },
      paragraphStyles: [
        {
          id: ABNT_STYLE_IDS.NORMAL,
          name: "Normal Web",
          run: ABNT_FONT_SETTINGS.body,
          paragraph: {
            indent: { firstLine: "1.25cm" },
            spacing: { line: 360, after: 120 },
          },
        },
        {
          id: ABNT_STYLE_IDS.HEADING_1,
          name: "Heading 1",
          basedOn: ABNT_STYLE_IDS.NORMAL,
          next: ABNT_STYLE_IDS.NORMAL,
          quickFormat: true,
          run: { size: 32, bold: true },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: ABNT_STYLE_IDS.HEADING_2,
          name: "Heading 2",
          basedOn: ABNT_STYLE_IDS.NORMAL,
          next: ABNT_STYLE_IDS.NORMAL,
          quickFormat: true,
          run: { size: 28, bold: true },
          paragraph: { spacing: { before: 180, after: 120 } },
        },
        {
          id: ABNT_STYLE_IDS.HEADING_3,
          name: "Heading 3",
          basedOn: ABNT_STYLE_IDS.NORMAL,
          next: ABNT_STYLE_IDS.NORMAL,
          quickFormat: true,
          run: { size: 24, bold: true },
          paragraph: { spacing: { before: 180, after: 120 } },
        },
        {
          id: ABNT_STYLE_IDS.LIST_BULLET,
          name: "List Bullet",
          basedOn: ABNT_STYLE_IDS.NORMAL,
          quickFormat: true,
          paragraph: {
            numbering: { reference: "default-bullet-list", level: 0 },
          },
        },
        {
          id: ABNT_STYLE_IDS.REFERENCE_LIST,
          name: "Reference Item",
          basedOn: ABNT_STYLE_IDS.NORMAL,
          run: { size: 20 },
          paragraph: { indent: { hanging: "0.5cm" }, spacing: { after: 60 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { margin: ABNT_PAGE_MARGINS },
          type: SectionType.CONTINUOUS,
        },
        children: documentSections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
