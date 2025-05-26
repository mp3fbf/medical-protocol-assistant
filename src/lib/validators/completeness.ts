/**
 * Completeness Validation Rules for Medical Protocols.
 *
 * These validators check if all required parts of the protocol are filled in,
 * avoiding empty sections or missing critical information.
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
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific"; // To get section titles

const REQUIRED_SECTION_COUNT = 13;

/**
 * Rule: Checks if all 13 sections have some form of content.
 * Content is considered missing if it's null, undefined, an empty string,
 * or an empty object/array.
 */
const checkAllSectionsHaveContent: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  for (let i = 1; i <= REQUIRED_SECTION_COUNT; i++) {
    const sectionKey = i.toString();
    const section = protocolContent[sectionKey];
    let isContentMissing = true;

    if (section && section.content !== null && section.content !== undefined) {
      if (typeof section.content === "string") {
        isContentMissing = section.content.trim() === "";
      } else if (typeof section.content === "object") {
        // For objects or arrays, check if they are empty
        isContentMissing = Object.keys(section.content).length === 0;
      } else {
        // Other types are considered as having content unless specifically handled
        isContentMissing = false;
      }
    }

    if (isContentMissing) {
      const sectionTitlePT =
        SECTION_DEFINITIONS.find((sd) => sd.sectionNumber === i)?.titlePT ||
        `Seção ${i}`;
      issues.push({
        ruleId: "COMPLETENESS_001",
        sectionNumber: i,
        message: `O conteúdo da Seção ${i} (${sectionTitlePT}) está ausente ou vazio. Todas as seções devem ser preenchidas.`,
        severity: "error",
        category: "COMPLETENESS",
      });
    }
  }
  return issues;
};

/**
 * Rule: Checks for presence of required fields within Section 1 (Identificação do Protocolo).
 */
const checkRequiredFieldsInSection1: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const section1 = protocolContent["1"];
  const section1Def = SECTION_DEFINITIONS.find((sd) => sd.sectionNumber === 1);

  if (
    section1 &&
    typeof section1.content === "object" &&
    section1.content !== null &&
    section1Def
  ) {
    const content = section1.content as Record<string, any>;
    const requiredFields: string[] = [
      "codigoProtocolo",
      "tituloCompleto",
      "versao",
      "origemOrganizacao",
      "dataElaboracao",
      "dataUltimaRevisao",
      "dataProximaRevisao",
      "ambitoAplicacao",
    ];

    for (const field of requiredFields) {
      if (
        !content[field] ||
        (typeof content[field] === "string" &&
          (content[field] as string).trim() === "")
      ) {
        issues.push({
          ruleId: "COMPLETENESS_002",
          sectionNumber: 1,
          field: field,
          message: `O campo obrigatório '${field}' está ausente ou vazio na Seção 1 (Identificação do Protocolo).`,
          severity: "error",
          category: "COMPLETENESS",
        });
      }
    }
  } else if (section1) {
    // If section 1 content is not an object, it's a structural issue handled elsewhere,
    // but we can flag that fields are missing due to wrong format.
    issues.push({
      ruleId: "COMPLETENESS_002_FORMAT",
      sectionNumber: 1,
      message:
        "O conteúdo da Seção 1 não está no formato de objeto esperado, impedindo a verificação de campos obrigatórios.",
      severity: "error",
      category: "COMPLETENESS",
    });
  }
  // If section1 itself is missing, STRUCTURAL_001 handles it.
  return issues;
};

// Add more completeness checks, e.g., ensuring objective criteria are defined,
// medication dosages are specific, etc.

export const COMPLETENESS_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "COMPLETENESS_SECTIONS_CONTENT",
    description: "Ensures all 13 sections have non-empty content.",
    severity: "error",
    category: "COMPLETENESS",
    check: checkAllSectionsHaveContent,
  },
  {
    id: "COMPLETENESS_SECTION1_REQUIRED_FIELDS",
    description:
      "Ensures all required metadata fields in Section 1 are present and non-empty.",
    severity: "error",
    category: "COMPLETENESS",
    check: checkRequiredFieldsInSection1,
  },
];

/**
 * Validates the completeness of the protocol content.
 * @param protocolContent The full content of the protocol.
 * @returns An array of validation issues.
 */
export const validateCompleteness: ValidatorFunction = (
  protocolContent,
  _protocolFlowchart, // Flowchart not used for these completeness checks
): ValidationIssue[] => {
  let allIssues: ValidationIssue[] = [];
  for (const rule of COMPLETENESS_VALIDATION_RULES) {
    const result = rule.check(protocolContent);
    // Since our completeness rules are synchronous, we can safely cast
    allIssues = allIssues.concat(result as ValidationIssue[]);
  }
  return allIssues;
};
