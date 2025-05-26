import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import { MEDICATION_VALIDATION_RULES, validateMedications } from "./medication";
import type {
  ProtocolFullContent,
  ProtocolSectionData,
} from "@/types/protocol";
import type { ValidationIssue } from "@/types/validation";
import type { GeneratedMedication } from "./generated-content";

// Mock fs.readFileSync
vi.mock("node:fs");

const mockMedicationCSVContent = `nome_medicamento,dosagem_padrao,via_padrao,frequencia_padrao,observacoes_padrao
Dipirona Sódica,500mg,Oral,a cada 6 horas,Se febre ou dor
Amoxicilina,500mg,Oral,a cada 8 horas,
Paracetamol,750mg,Oral,a cada 6 horas,Dose máxima diária: 4g`;

const createMockSection7 = (
  medsInstaveis: GeneratedMedication[] = [],
  medsEstaveis: GeneratedMedication[] = [],
): ProtocolSectionData => ({
  sectionNumber: 7,
  title: "Tratamento",
  content: {
    medidasGerais: ["Monitorização contínua."],
    tratamentoPacientesInstaveis: {
      medicamentos: medsInstaveis,
      intervencoesNaoFarmacologicas: [],
    },
    tratamentoPacientesEstaveis: {
      conduta: "Observação",
      medicamentosConsiderar: medsEstaveis,
    },
  },
});

describe("Medication Validators", () => {
  beforeEach(() => {
    // Reset medicationDB cache before each test by invalidating require cache or similar
    // For simplicity here, we'll rely on the fact that loadMedicationDatabase is re-run in each validator call
    // if medicationDB is null. We'll reset it to null.
    // This assumes medicationDB is an exported let from medication.ts or can be reset.
    // If not, tests might need to mock loadMedicationDatabase directly.
    vi.spyOn(fs, "readFileSync").mockReturnValue(mockMedicationCSVContent);
    // This is a bit of a hack to reset the internal cache in medication.ts
    // A better way would be to expose a reset function or make loadMedicationDatabase mockable.
    (validateMedications as any).__resetMedicationDBCache?.(); // Fictional reset function
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkMedicationExistence", () => {
    const rule = MEDICATION_VALIDATION_RULES.find(
      (r) => r.id === "MED_EXISTENCE",
    )!;
    const check = rule.check as (
      pc: ProtocolFullContent,
    ) => Promise<ValidationIssue[]>;

    it("should return no issues if all medications exist in DB", async () => {
      const content: ProtocolFullContent = {
        "7": createMockSection7([
          {
            name: "Dipirona Sódica",
            dose: "500mg",
            route: "Oral",
            frequency: "SN",
          },
        ]),
      } as ProtocolFullContent; // Cast for simplicity in test
      const issues = await check(content);
      expect(issues).toEqual([]);
    });

    it("should return a warning if a medication does not exist in DB (case-insensitive)", async () => {
      const content: ProtocolFullContent = {
        "7": createMockSection7([
          {
            name: "MedicamentoInexistente",
            dose: "10mg",
            route: "IV",
            frequency: "BID",
          },
          {
            name: "amoxicilina", // Should match "Amoxicilina"
            dose: "250mg",
            route: "Oral",
            frequency: "TID",
          },
        ]),
      } as ProtocolFullContent;
      const issues = await check(content);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        ruleId: "MEDICATION_001",
        sectionNumber: 7,
        field: "medicamentos (nome: MedicamentoInexistente)",
        severity: "warning",
        details: { medicationName: "MedicamentoInexistente" },
      });
    });
  });

  describe("checkMedicationDetailsFormat", () => {
    const rule = MEDICATION_VALIDATION_RULES.find(
      (r) => r.id === "MED_DETAILS_FORMAT",
    )!;

    it("should return error if dose is missing", () => {
      const content: ProtocolFullContent = {
        "7": createMockSection7([
          { name: "Dipirona Sódica", dose: "", route: "Oral", frequency: "SN" },
        ]),
      } as ProtocolFullContent;
      const issues = rule.check(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "MEDICATION_002",
          sectionNumber: 7,
          field: "medicamentos (Dipirona Sódica - dose)",
          severity: "error",
        }),
      );
    });

    it("should return error if route is missing", () => {
      const content: ProtocolFullContent = {
        "7": createMockSection7([
          {
            name: "Dipirona Sódica",
            dose: "500mg",
            route: " ",
            frequency: "SN",
          },
        ]),
      } as ProtocolFullContent;
      const issues = rule.check(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "MEDICATION_003",
          sectionNumber: 7,
          field: "medicamentos (Dipirona Sódica - via)",
          severity: "error",
        }),
      );
    });

    it("should return error if frequency is missing", () => {
      const content: ProtocolFullContent = {
        "7": createMockSection7([
          {
            name: "Dipirona Sódica",
            dose: "500mg",
            route: "Oral",
            frequency: "",
          },
        ]),
      } as ProtocolFullContent;
      const issues = rule.check(content);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "MEDICATION_004",
          sectionNumber: 7,
          field: "medicamentos (Dipirona Sódica - frequência)",
          severity: "error",
        }),
      );
    });

    it("should return no issues if all details are present", () => {
      const content: ProtocolFullContent = {
        "7": createMockSection7([
          {
            name: "Dipirona Sódica",
            dose: "500mg",
            route: "Oral",
            frequency: "SN",
            duration: "3 dias",
          },
        ]),
      } as ProtocolFullContent;
      const issues = rule.check(content);
      expect(issues).toEqual([]);
    });
  });

  describe("validateMedications (main)", () => {
    it("should aggregate issues from all medication rules", async () => {
      const content: ProtocolFullContent = {
        "7": createMockSection7([
          {
            // Exists, but missing dose
            name: "Dipirona Sódica",
            dose: "",
            route: "Oral",
            frequency: "SN",
          },
          {
            // Does not exist, all details present
            name: "DrogaXyz",
            dose: "10mg",
            route: "Sublingual",
            frequency: "BID",
          },
        ]),
      } as ProtocolFullContent;

      const issues = await validateMedications(content);
      expect(issues).toHaveLength(2);
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "MEDICATION_002", // Missing dose
          details: { medicationName: "Dipirona Sódica" },
        }),
      );
      expect(issues).toContainEqual(
        expect.objectContaining({
          ruleId: "MEDICATION_001", // Non-existent
          details: { medicationName: "DrogaXyz" },
        }),
      );
    });
  });
});
