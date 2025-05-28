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
  FlowchartData, // Import FlowchartData
} from "@/types/protocol";
import type {
  ValidationIssue,
  ValidatorFunction,
  ValidationRuleDefinition,
} from "@/types/validation";
import type { GeneratedMedication } from "../validators/generated-content";

interface MedicationDBEntry {
  nome_medicamento: string;
  dosagem_padrao?: string;
  via_padrao?: string;
  frequencia_padrao?: string;
  observacoes_padrao?: string;
}

let medicationDB: MedicationDBEntry[] | null = null;

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
    medicationDB = parseResult.data.map((med) => ({
      ...med,
      nome_medicamento: med.nome_medicamento.toLowerCase().trim(),
    }));
    return medicationDB;
  } catch (error) {
    console.error("Error loading medication database:", error);
    medicationDB = [];
    return [];
  }
}

async function getMedicationFromDB(
  name: string,
): Promise<MedicationDBEntry | undefined> {
  const db = await loadMedicationDatabase();
  return db.find((med) => med.nome_medicamento === name.toLowerCase().trim());
}

function extractMedicationsFromProtocol(
  protocolContent: ProtocolFullContent,
): { medication: GeneratedMedication; sectionNumber: number }[] {
  const foundMedications: {
    medication: GeneratedMedication;
    sectionNumber: number;
  }[] = [];
  const section7 = protocolContent["7"];

  if (section7 && typeof section7.content === "object" && section7.content) {
    const content = section7.content as any;
    if (
      content.tratamentoPacientesInstaveis &&
      Array.isArray(content.tratamentoPacientesInstaveis.medicamentos)
    ) {
      content.tratamentoPacientesInstaveis.medicamentos.forEach(
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
  return foundMedications;
}

const checkMedicationExistence: ValidatorFunction = async (
  protocolContent,
): Promise<ValidationIssue[]> => {
  const issues: ValidationIssue[] = [];
  const medicationsInProtocol = extractMedicationsFromProtocol(protocolContent);

  if (
    medicationsInProtocol.length === 0 &&
    Object.keys(protocolContent["7"]?.content || {}).length > 0
  ) {
    // Section 7 has content, but no parseable medication arrays were found.
  }

  for (const { medication, sectionNumber } of medicationsInProtocol) {
    const dbEntry = await getMedicationFromDB(medication.name);
    if (!dbEntry) {
      issues.push({
        ruleId: "MEDICATION_001",
        sectionNumber,
        field: `medicamentos (nome: ${medication.name})`,
        message: `Medicamento "${medication.name}" listado na Seção ${sectionNumber} não foi encontrado na base de dados de referência (medications.csv).`,
        severity: "warning",
        category: "MEDICATION",
        details: { medicationName: medication.name },
      });
    }
  }
  return issues;
};

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
  }
  return issues;
};

export const MEDICATION_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "MED_EXISTENCE",
    description:
      "Checks if medications listed in the protocol exist in the reference CSV.",
    severity: "warning",
    category: "MEDICATION",
    check: checkMedicationExistence,
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

export const validateMedications = async (
  protocolContent: ProtocolFullContent,
  _protocolFlowchart?: FlowchartData, // Correctly typed
): Promise<ValidationIssue[]> => {
  let allIssues: ValidationIssue[] = [];
  for (const rule of MEDICATION_VALIDATION_RULES) {
    const result = rule.check(protocolContent, _protocolFlowchart); // Pass flowchart
    const issues = result instanceof Promise ? await result : result;
    allIssues = allIssues.concat(issues);
  }
  return allIssues;
};
