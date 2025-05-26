/**
 * Structural Validation Rules for Medical Protocols.
 *
 * These validators check for the correct overall structure,
 * such as the presence of all 13 sections, correct titles, etc.
 */
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import type {
  ValidationIssue,
  ValidatorFunction,
  ValidationRuleDefinition,
} from "@/types/validation";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";

const REQUIRED_SECTION_COUNT = 13;

/**
 * Rule: Checks if all 13 sections are present and correctly numbered from 1 to 13.
 */
const checkSectionPresenceAndOrder: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const sectionNumbers = Object.keys(protocolContent)
    .map(Number)
    .filter((n) => !isNaN(n) && n >= 1 && n <= REQUIRED_SECTION_COUNT)
    .sort((a, b) => a - b);

  if (sectionNumbers.length !== REQUIRED_SECTION_COUNT) {
    issues.push({
      ruleId: "STRUCTURE_001",
      message: `O protocolo deve conter exatamente ${REQUIRED_SECTION_COUNT} seções. Encontradas: ${sectionNumbers.length}.`,
      severity: "error",
    });
  }

  const expectedNumbers = Array.from(
    { length: REQUIRED_SECTION_COUNT },
    (_, i) => i + 1,
  );
  if (
    sectionNumbers.length === REQUIRED_SECTION_COUNT &&
    !sectionNumbers.every((num, index) => num === expectedNumbers[index])
  ) {
    issues.push({
      ruleId: "STRUCTURE_002",
      message: `As seções do protocolo não estão numeradas corretamente de 1 a ${REQUIRED_SECTION_COUNT}. Seções encontradas: ${sectionNumbers.join(", ")}.`,
      severity: "error",
    });
  }

  // Check if each section object matches its key
  for (const key in protocolContent) {
    const sectionNumberFromKey = parseInt(key, 10);
    const sectionData = protocolContent[key];
    if (
      !sectionData ||
      typeof sectionData.sectionNumber !== "number" ||
      sectionData.sectionNumber !== sectionNumberFromKey
    ) {
      issues.push({
        ruleId: "STRUCTURE_003",
        message: `A seção com chave "${key}" não corresponde ao seu campo 'sectionNumber' interno ou está malformada.`,
        severity: "error",
        sectionNumber: isNaN(sectionNumberFromKey)
          ? undefined
          : sectionNumberFromKey,
      });
    }
  }

  return issues;
};

/**
 * Rule: Checks if all section titles are present and non-empty.
 */
const checkSectionTitles: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  for (let i = 1; i <= REQUIRED_SECTION_COUNT; i++) {
    const section = protocolContent[i.toString()];
    if (section) {
      if (!section.title || section.title.trim() === "") {
        issues.push({
          ruleId: "STRUCTURE_004",
          sectionNumber: i,
          field: "title",
          message: `O título da Seção ${i} (${SECTION_DEFINITIONS[i - 1]?.titlePT || "Título Desconhecido"}) está ausente ou vazio.`,
          severity: "error",
        });
      }
    }
    // Presence of section itself is checked by STRUCTURE_001/STRUCTURE_002
  }
  return issues;
};

/**
 * Rule: Checks if sections expected to have structured JSON content actually do.
 * (e.g., Section 1, 2, 12, 13 based on SECTION_DEFINITIONS examples)
 */
const checkStructuredContentFormat: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const sectionsWithExpectedObjectContent = [1, 2, 11, 12, 13]; // Based on refined SECTION_DEFINITIONS
  const sectionsWithExpectedArrayContent: number[] = [8]; // Section 8 example is an array

  for (const sectionDef of SECTION_DEFINITIONS) {
    const sectionKey = sectionDef.sectionNumber.toString();
    const sectionData = protocolContent[sectionKey];

    if (
      sectionData &&
      sectionData.content !== undefined &&
      sectionData.content !== null
    ) {
      // Check if content should be an object (and not an array)
      if (
        sectionsWithExpectedObjectContent.includes(sectionDef.sectionNumber) &&
        (typeof sectionData.content !== "object" ||
          Array.isArray(sectionData.content))
      ) {
        issues.push({
          ruleId: "STRUCTURE_005A",
          sectionNumber: sectionDef.sectionNumber,
          field: "content",
          message: `O conteúdo da Seção ${sectionDef.sectionNumber} (${sectionDef.titlePT}) deveria ser um objeto JSON estruturado, mas foi encontrado: ${typeof sectionData.content}.`,
          severity: "error",
        });
      }
      // Check if content should be an array
      else if (
        sectionsWithExpectedArrayContent.includes(sectionDef.sectionNumber) &&
        !Array.isArray(sectionData.content)
      ) {
        issues.push({
          ruleId: "STRUCTURE_005B",
          sectionNumber: sectionDef.sectionNumber,
          field: "content",
          message: `O conteúdo da Seção ${sectionDef.sectionNumber} (${sectionDef.titlePT}) deveria ser um array JSON, mas foi encontrado: ${typeof sectionData.content}.`,
          severity: "error",
        });
      }
      // Add more specific checks based on sectionDef.example type if needed
    }
  }
  return issues;
};

export const STRUCTURAL_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "STRUCTURE_SECTIONS_PRESENCE_ORDER",
    description:
      "Ensures all 13 sections are present and correctly numbered from 1 to 13.",
    severity: "error",
    category: "STRUCTURE",
    check: checkSectionPresenceAndOrder,
  },
  {
    id: "STRUCTURE_SECTION_TITLES",
    description: "Ensures all section titles are present and non-empty.",
    severity: "error",
    category: "STRUCTURE",
    check: checkSectionTitles,
  },
  {
    id: "STRUCTURE_CONTENT_FORMAT",
    description:
      "Ensures sections expected to have structured JSON content have the correct basic format (object/array).",
    severity: "error",
    category: "STRUCTURE",
    check: checkStructuredContentFormat,
  },
];

/**
 * Validates the overall structure of the protocol content.
 * @param protocolContent The full content of the protocol.
 * @returns An array of validation issues.
 */
export const validateProtocolStructure: ValidatorFunction = async (
  protocolContent,
  _protocolFlowchart, // Flowchart not used for these structural checks
): Promise<ValidationIssue[]> => {
  let allIssues: ValidationIssue[] = [];
  for (const rule of STRUCTURAL_VALIDATION_RULES) {
    const result = rule.check(protocolContent);
    const issues = result instanceof Promise ? await result : result;
    allIssues = allIssues.concat(issues);
  }
  return allIssues;
};
