/**
 * Structural Validation Rules for Medical Protocols.
 *
 * These validators check for the correct overall structure,
 * such as the presence of all 13 sections, correct titles, etc.
 */
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
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
  const sectionKeys = Object.keys(protocolContent);

  const validSectionNumbers = sectionKeys
    .map(Number)
    .filter((n) => !isNaN(n) && n >= 1 && n <= REQUIRED_SECTION_COUNT)
    .sort((a, b) => a - b);

  if (validSectionNumbers.length !== REQUIRED_SECTION_COUNT) {
    issues.push({
      ruleId: "STRUCTURE_001",
      message: `O protocolo deve conter exatamente ${REQUIRED_SECTION_COUNT} seções válidas (numeradas de 1 a ${REQUIRED_SECTION_COUNT}). Encontradas: ${validSectionNumbers.length} seções válidas.`,
      severity: "error",
      category: "STRUCTURE",
    });
  }

  const expectedNumbers = Array.from(
    { length: REQUIRED_SECTION_COUNT },
    (_, i) => i + 1,
  );
  if (
    validSectionNumbers.length === REQUIRED_SECTION_COUNT &&
    !validSectionNumbers.every((num, index) => num === expectedNumbers[index])
  ) {
    issues.push({
      ruleId: "STRUCTURE_002",
      message: `As seções válidas do protocolo não estão perfeitamente numeradas de 1 a ${REQUIRED_SECTION_COUNT} em sequência. Seções válidas encontradas: ${validSectionNumbers.join(", ")}.`,
      severity: "error",
      category: "STRUCTURE",
    });
  }

  // Check each key for its own validity and consistency
  for (const key of sectionKeys) {
    const sectionNumberFromKey = parseInt(key, 10);
    const sectionData = protocolContent[key];
    let sectionDef = null; // Initialize sectionDef

    // Debug logging
    console.log(`[STRUCTURE_003] Checking section ${key}:`, {
      sectionData: sectionData,
      sectionDataType: typeof sectionData,
      sectionNumber: sectionData?.sectionNumber,
      sectionNumberType: typeof sectionData?.sectionNumber,
      allKeysInSectionData: sectionData ? Object.keys(sectionData) : [],
    });

    const isKeyNumeric = !isNaN(sectionNumberFromKey);
    // A key is valid if it's a number AND within the 1-13 range
    const isKeyInValidNumericRange =
      isKeyNumeric &&
      sectionNumberFromKey >= 1 &&
      sectionNumberFromKey <= REQUIRED_SECTION_COUNT;

    if (isKeyInValidNumericRange) {
      sectionDef = SECTION_DEFINITIONS.find(
        (sd) => sd.sectionNumber === sectionNumberFromKey,
      );
    }

    // Get sectionNumber from data, handling potential JSON serialization reordering
    const actualSectionNumber = sectionData?.sectionNumber;
    const hasSectionNumber = typeof actualSectionNumber === "number";
    const sectionNumberMatches =
      hasSectionNumber && actualSectionNumber === sectionNumberFromKey;

    // For valid keys (1-13), we can be more lenient - if the key is valid and data exists,
    // we can assume it's valid even if sectionNumber field is missing (due to serialization issues)
    const isStructurallyValid =
      isKeyInValidNumericRange &&
      sectionData &&
      sectionData.title &&
      sectionData.content !== undefined;

    // Condition for STRUCTURE_003:
    // 1. The key itself is not a number representing a valid section (1-13).
    // OR 2. The sectionData is missing.
    // OR 3. For valid keys, missing essential fields (title, content)
    // Note: We're being more lenient about sectionNumber field due to JSON serialization issues
    if (
      !isKeyInValidNumericRange || // Catches keys like "14", "abc", "0"
      !sectionData ||
      !isStructurallyValid ||
      (hasSectionNumber && !sectionNumberMatches) // Only check sectionNumber if it exists
    ) {
      console.log(`[STRUCTURE_003] VALIDATION FAILED for section ${key}:`, {
        isKeyInValidNumericRange,
        sectionDataExists: !!sectionData,
        isStructurallyValid,
        hasSectionNumber,
        sectionNumberMatches,
        actualSectionNumber,
        expectedSectionNumber: sectionNumberFromKey,
        hasTitle: !!sectionData?.title,
        hasContent: sectionData?.content !== undefined,
      });

      issues.push({
        ruleId: "STRUCTURE_003",
        message: `A seção com chave "${key}" é inválida: ou a chave está fora do intervalo esperado (1-${REQUIRED_SECTION_COUNT}), ou seu 'sectionNumber' interno (${sectionData?.sectionNumber ?? "N/A"}) não corresponde à chave, ou a seção está malformada. Título esperado (se a chave fosse válida): ${sectionDef?.titlePT || "Título Desconhecido / Chave Inválida"}.`,
        severity: "error",
        category: "STRUCTURE",
        sectionNumber: isKeyNumeric ? sectionNumberFromKey : undefined, // Report sectionNumberFromKey if key is numeric, even if out of range
        details: {
          keyChecked: key,
          parsedSectionNumberFromKey: sectionNumberFromKey,
          isKeyNumeric: isKeyNumeric,
          isKeyInValidNumericRange: isKeyInValidNumericRange,
          internalSectionNumber: sectionData?.sectionNumber,
          sectionDataExists: !!sectionData,
        },
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
          category: "STRUCTURE",
        });
      }
    }
  }
  return issues;
};

/**
 * Rule: Checks if sections expected to have structured JSON content actually do,
 * based on the type of their 'example' in SECTION_DEFINITIONS.
 */
const checkStructuredContentFormat: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  for (const sectionDef of SECTION_DEFINITIONS) {
    const sectionKey = sectionDef.sectionNumber.toString();
    const sectionData = protocolContent[sectionKey];

    if (
      sectionData &&
      sectionData.content !== undefined &&
      sectionData.content !== null
    ) {
      const exampleType = typeof sectionDef.example;
      const contentType = typeof sectionData.content;

      if (Array.isArray(sectionDef.example)) {
        if (!Array.isArray(sectionData.content)) {
          issues.push({
            ruleId: "STRUCTURE_CONTENT_EXPECTED_ARRAY",
            sectionNumber: sectionDef.sectionNumber,
            field: "content",
            message: `O conteúdo da Seção ${sectionDef.sectionNumber} (${sectionDef.titlePT}) deveria ser um array JSON, mas foi encontrado: ${contentType}.`,
            severity: "error",
            category: "STRUCTURE",
          });
        }
      } else if (exampleType === "object" && sectionDef.example !== null) {
        if (contentType !== "object" || Array.isArray(sectionData.content)) {
          issues.push({
            ruleId: "STRUCTURE_CONTENT_EXPECTED_OBJECT",
            sectionNumber: sectionDef.sectionNumber,
            field: "content",
            message: `O conteúdo da Seção ${sectionDef.sectionNumber} (${sectionDef.titlePT}) deveria ser um objeto JSON estruturado, mas foi encontrado: ${Array.isArray(sectionData.content) ? "array" : contentType}.`,
            severity: "error",
            category: "STRUCTURE",
          });
        }
      }
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
      "Ensures sections expected to have structured JSON content have the correct basic format (object/array) based on SECTION_DEFINITIONS examples.",
    severity: "error",
    category: "STRUCTURE",
    check: checkStructuredContentFormat,
  },
];

/**
 * Validates the overall structure of the protocol content.
 * This function is now async to accommodate potentially async rules,
 * even though current structural rules are synchronous.
 * @param protocolContent The full content of the protocol.
 * @returns An array of validation issues.
 */
export const validateProtocolStructure = async (
  protocolContent: ProtocolFullContent,
  _protocolFlowchart?: FlowchartData,
): Promise<ValidationIssue[]> => {
  let allIssues: ValidationIssue[] = [];
  for (const rule of STRUCTURAL_VALIDATION_RULES) {
    // Await rule.check in case any rule becomes async in the future or if ValidatorFunction type implies it
    // For strictly synchronous rules, `await` on a non-Promise value is a no-op.
    const ruleIssuesResult = await rule.check(
      protocolContent,
      _protocolFlowchart,
    );
    allIssues = allIssues.concat(ruleIssuesResult);
  }
  return allIssues;
};
