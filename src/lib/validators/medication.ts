/**
 * Medication Validation Rules.
 *
 * These validators check medication details, such as existence in a
 * reference database (CSV), correct formatting of dose, route, frequency, etc.
 */
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import type {
  ValidationIssue,
  ValidatorFunction,
  ValidationRuleDefinition,
} from "@/types/validation";
import type { GeneratedMedication } from "../validators/generated-content"; // Using the AI generated type for extraction

interface MedicationDBEntry {
  nome_medicamento: string;
  dosagem_padrao?: string;
  via_padrao?: string;
  frequencia_padrao?: string;
  observacoes_padrao?: string;
}

let medicationDB: MedicationDBEntry[] | null = null;

/**
 * Loads and parses the medication CSV database.
 * Caches the result in memory for subsequent calls.
 */
async function loadMedicationDatabase(): Promise<MedicationDBEntry[]> {
  if (medicationDB) {
    return medicationDB;
  }

  try {
    const csvFilePath = path.join(
      process.cwd(),
      "public",
      "data",
      "medications.csv",
    );
    const fileContent = fs.readFileSync(csvFilePath, "utf8");
    const parseResult = Papa.parse<MedicationDBEntry>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error("Errors parsing medications.csv:", parseResult.errors);
      throw new Error("Failed to parse medication database CSV.");
    }
    // Normalize names for easier comparison, e.g., lowercase
    medicationDB = parseResult.data.map((med) => ({
      ...med,
      nome_medicamento: med.nome_medicamento.toLowerCase().trim(),
    }));
    return medicationDB;
  } catch (error) {
    console.error("Error loading medication database:", error);
    medicationDB = []; // Ensure it's an empty array on error to prevent repeated load attempts
    return [];
  }
}

/**
 * Retrieves a medication by name from the loaded database.
 * Comparison is case-insensitive.
 */
async function getMedicationFromDB(
  name: string,
): Promise<MedicationDBEntry | undefined> {
  const db = await loadMedicationDatabase();
  return db.find((med) => med.nome_medicamento === name.toLowerCase().trim());
}

/**
 * Extracts medication objects from protocol content, typically Section 7.
 */
function extractMedicationsFromProtocol(
  protocolContent: ProtocolFullContent,
): { medication: GeneratedMedication; sectionNumber: number }[] {
  const foundMedications: {
    medication: GeneratedMedication;
    sectionNumber: number;
  }[] = [];
  const section7 = protocolContent["7"];

  if (section7 && typeof section7.content === "object" && section7.content) {
    const content = section7.content as any; // Cast to any for dynamic access
    if (
      content.tratamentoPacientesInstaveis &&
      Array.isArray(content.tratamentoPacientesInstaveis.medicamentos)
    ) {
      content.tratamentoPacientesInstaveis.medicamentos.forEach(
        (med: unknown) => {
          // Assuming med matches GeneratedMedication structure after AI generation
          if (typeof med === "object" && med !== null && "name" in med) {
            foundMedications.push({
              medication: med as GeneratedMedication,
              sectionNumber: 7,
            });
          }
        },
      );
    }
    if (
      content.tratamentoPacientesEstaveis &&
      Array.isArray(content.tratamentoPacientesEstaveis.medicamentosConsiderar)
    ) {
      content.tratamentoPacientesEstaveis.medicamentosConsiderar.forEach(
        (med: unknown) => {
          if (typeof med === "object" && med !== null && "name" in med) {
            foundMedications.push({
              medication: med as GeneratedMedication,
              sectionNumber: 7,
            });
          }
        },
      );
    }
  }
  // Add extraction from other sections if medications can appear elsewhere
  return foundMedications;
}

/**
 * Rule: Checks if medications listed in the protocol exist in the reference CSV.
 */
const checkMedicationExistence: ValidatorFunction = async (
  protocolContent,
): Promise<ValidationIssue[]> => {
  const issues: ValidationIssue[] = [];
  const medicationsInProtocol = extractMedicationsFromProtocol(protocolContent);

  if (
    medicationsInProtocol.length === 0 &&
    Object.keys(protocolContent["7"]?.content || {}).length > 0
  ) {
    // This means section 7 has content, but no parseable medication arrays were found.
    // This could be a structural issue of section 7's content itself.
    // For now, we'll assume if extractMedications returns empty, there are no meds to check here.
  }

  for (const { medication, sectionNumber } of medicationsInProtocol) {
    const dbEntry = await getMedicationFromDB(medication.name);
    if (!dbEntry) {
      issues.push({
        ruleId: "MEDICATION_001",
        sectionNumber,
        field: `medicamentos (nome: ${medication.name})`,
        message: `Medicamento "${medication.name}" listado na Seção ${sectionNumber} não foi encontrado na base de dados de referência (medications.csv).`,
        severity: "warning", // Or "error" depending on strictness
        category: "MEDICATION",
        details: { medicationName: medication.name },
      });
    }
  }
  return issues;
};

/**
 * Rule: Checks if medication details (dose, route, frequency) in the protocol have the correct basic format.
 */
const checkMedicationDetailsFormat: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const medicationsInProtocol = extractMedicationsFromProtocol(protocolContent);

  for (const { medication, sectionNumber } of medicationsInProtocol) {
    if (!medication.dose || medication.dose.trim() === "") {
      issues.push({
        ruleId: "MEDICATION_002",
        sectionNumber,
        field: `medicamentos (${medication.name} - dose)`,
        message: `Dose não especificada para o medicamento "${medication.name}" na Seção ${sectionNumber}.`,
        severity: "error",
        category: "MEDICATION",
        details: { medicationName: medication.name },
      });
    }
    if (!medication.route || medication.route.trim() === "") {
      issues.push({
        ruleId: "MEDICATION_003",
        sectionNumber,
        field: `medicamentos (${medication.name} - via)`,
        message: `Via de administração não especificada para o medicamento "${medication.name}" na Seção ${sectionNumber}.`,
        severity: "error",
        category: "MEDICATION",
        details: { medicationName: medication.name },
      });
    }
    if (!medication.frequency || medication.frequency.trim() === "") {
      issues.push({
        ruleId: "MEDICATION_004",
        sectionNumber,
        field: `medicamentos (${medication.name} - frequência)`,
        message: `Frequência não especificada para o medicamento "${medication.name}" na Seção ${sectionNumber}.`,
        severity: "error",
        category: "MEDICATION",
        details: { medicationName: medication.name },
      });
    }
    // Duration is optional per GeneratedMedicationSchema if it can be "Não especificado"
  }
  return issues;
};

export const MEDICATION_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "MED_EXISTENCE",
    description:
      "Checks if medications listed in the protocol exist in the reference CSV.",
    severity: "warning", // Can be 'error' if strictness is high
    category: "MEDICATION",
    check: checkMedicationExistence, // This needs to be async now
  },
  {
    id: "MED_DETAILS_FORMAT",
    description:
      "Checks if medication dose, route, and frequency are specified.",
    severity: "error",
    category: "MEDICATION",
    check: checkMedicationDetailsFormat,
  },
];

/**
 * Validates medication-related aspects of the protocol content.
 * Note: This function becomes async due to `checkMedicationExistence`.
 * @param protocolContent The full content of the protocol.
 * @returns A promise resolving to an array of validation issues.
 */
export const validateMedications = async (
  protocolContent: ProtocolFullContent,
  _protocolFlowchart?: any, // Flowchart not used for these medication checks yet
): Promise<ValidationIssue[]> => {
  let allIssues: ValidationIssue[] = [];
  for (const rule of MEDICATION_VALIDATION_RULES) {
    const result = rule.check(protocolContent);
    // Handle both sync and async validators
    const issues = result instanceof Promise ? await result : result;
    allIssues = allIssues.concat(issues);
  }
  return allIssues;
};
