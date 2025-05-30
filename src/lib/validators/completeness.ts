/**
 * Completeness Validation Rules for Medical Protocols.
 *
 * These validators check if all required parts of the protocol are filled in,
 * avoiding empty sections or missing critical information.
 */
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
import type {
  ValidationIssue,
  ValidatorFunction,
  ValidationRuleDefinition,
} from "@/types/validation";
import { SECTION_DEFINITIONS } from "@/lib/ai/prompts/section-specific";
import { isContentEmpty } from "./utils/content-processor"; // To get section titles

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

    // Use content processor to handle HTML and structured content
    const isContentMissing =
      !section || !section.content || isContentEmpty(section.content);

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

  if (!section1Def) {
    // This is a fallback, ideally SECTION_DEFINITIONS should always have section 1
    if (section1) {
      // Only push if section 1 content exists but its definition is missing
      issues.push({
        ruleId: "COMPLETENESS_002_DEFINITION_MISSING",
        sectionNumber: 1,
        message:
          "A definição da Seção 1 (Identificação do Protocolo) não foi encontrada. Não é possível validar campos obrigatórios.",
        severity: "error",
        category: "COMPLETENESS", // Added category
      });
    }
    return issues; // Cannot proceed without section1Def
  }

  if (
    section1 &&
    typeof section1.content === "object" &&
    section1.content !== null
  ) {
    const content = section1.content as Record<string, any>;
    // section1Def is guaranteed to be defined here.
    // We also know for section 1, example is an object.
    const exampleFields = section1Def.example as Record<string, any>;

    // Define requiredFields directly as strings, matching the known structure of Section 1's example
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
      // Check if the field, known to be a string, exists as a key in exampleFields
      // This is more of a sanity check for the definition itself, or could be removed if trusted.
      if (exampleFields && !(field in exampleFields)) {
        // This case should ideally not happen if SECTION_DEFINITIONS[0].example is correctly defined.
        // console.warn(`Field ${field} from requiredFields is not in section1Def.example for section 1.`);
        // Continue or handle as a different kind of error if necessary.
      }

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
      category: "COMPLETENESS", // Added category
    });
  }
  // If section1 itself is missing, STRUCTURAL_001 handles it.
  return issues;
};

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
 * This function is now async to accommodate potentially async rules.
 * @param protocolContent The full content of the protocol.
 * @returns An array of validation issues.
 */
export const validateCompleteness = async (
  protocolContent: ProtocolFullContent,
  _protocolFlowchart?: FlowchartData,
): Promise<ValidationIssue[]> => {
  let allIssues: ValidationIssue[] = [];
  for (const rule of COMPLETENESS_VALIDATION_RULES) {
    // Await rule.check as ValidatorFunction can now return a Promise
    const ruleIssuesResult = await rule.check(
      protocolContent,
      _protocolFlowchart,
    );
    allIssues = allIssues.concat(ruleIssuesResult);
  }
  return allIssues;
};
