/**
 * Medical Content Validation Rules
 *
 * Validates medical-specific aspects of protocol content including:
 * - Dosage information accuracy
 * - Drug interaction warnings
 * - Medical terminology consistency
 * - Evidence-based content requirements
 */
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
import type {
  ValidationIssue,
  ValidatorFunction,
  ValidationRuleDefinition,
} from "@/types/validation";

// Medical dosage patterns for validation
const DOSAGE_PATTERNS = {
  // mg/kg, mcg/kg, units/kg
  weightBased: /(\d+(?:\.\d+)?)\s*(mg|mcg|g|units?)\/kg/gi,
  // mg/day, mg BID, mg TID
  frequency:
    /(\d+(?:\.\d+)?)\s*(mg|mcg|g|units?)\s*(\/day|daily|BID|TID|QID|Q\d+h)/gi,
  // 10-20 mg, 0.5-1.0 mg/kg
  ranges:
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(mg|mcg|g|units?)(?:\/kg)?/gi,
};

// Critical medical terms that should have proper context
const CRITICAL_TERMS = [
  "contraindicação",
  "contraindicado",
  "alergia",
  "anafilaxia",
  "emergência",
  "urgência",
  "dose letal",
  "overdose",
  "intoxicação",
  "reação adversa",
  "efeito colateral",
];

/**
 * Validates medication dosages for safety and accuracy
 */
const checkMedicationDosages: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Check sections that typically contain medication information
  const medicationSections = [6, 7, 8, 9]; // Procedimentos, Medicações, Dosagem, Monitorização

  for (const sectionNum of medicationSections) {
    const section = protocolContent[sectionNum.toString()];
    if (!section?.content) continue;

    const content =
      typeof section.content === "string"
        ? section.content
        : JSON.stringify(section.content);

    // Check for dosage information
    const dosageMatches =
      content.match(DOSAGE_PATTERNS.weightBased) ||
      content.match(DOSAGE_PATTERNS.frequency) ||
      content.match(DOSAGE_PATTERNS.ranges);

    if (dosageMatches) {
      // Check for missing age/weight considerations
      const hasAgeConsideration =
        /\b(idade|anos?|criança|adulto|idoso|pediátrico|geriátrico)\b/i.test(
          content,
        );
      const hasWeightConsideration = /\b(peso|kg|quilos?)\b/i.test(content);

      if (!hasAgeConsideration && !hasWeightConsideration) {
        issues.push({
          ruleId: "MEDICAL_001",
          sectionNumber: sectionNum,
          message: `Seção ${sectionNum} contém dosagens mas não especifica considerações de idade ou peso.`,
          severity: "warning",
          category: "MEDICATION",
          suggestion:
            "Adicione considerações específicas para diferentes faixas etárias e pesos.",
        });
      }

      // Check for contraindication mentions
      const hasContraindications = CRITICAL_TERMS.some((term) =>
        content.toLowerCase().includes(term),
      );

      if (!hasContraindications) {
        issues.push({
          ruleId: "MEDICAL_002",
          sectionNumber: sectionNum,
          message: `Seção ${sectionNum} menciona medicações mas não inclui contraindicações ou precauções.`,
          severity: "warning",
          category: "MEDICATION",
          suggestion:
            "Inclua informações sobre contraindicações, alergias e precauções importantes.",
        });
      }
    }
  }

  return issues;
};

/**
 * Validates that critical procedures have proper safety checks
 */
const checkProcedureSafety: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  const procedureSection = protocolContent["6"]; // Procedimentos
  if (!procedureSection?.content) return issues;

  const content =
    typeof procedureSection.content === "string"
      ? procedureSection.content
      : JSON.stringify(procedureSection.content);

  // Check for invasive procedures
  const invasiveProcedures = [
    "intubação",
    "punção",
    "inserção",
    "cateter",
    "agulha",
    "cirúrgico",
    "incisão",
    "biópsia",
    "drenagem",
  ];

  const hasInvasiveProcedure = invasiveProcedures.some((proc) =>
    content.toLowerCase().includes(proc),
  );

  if (hasInvasiveProcedure) {
    // Check for sterile technique mention
    const hasSterileTechnique =
      /\b(estéril|esterilização|assepsia|antissepsia|luvas estéreis)\b/i.test(
        content,
      );

    if (!hasSterileTechnique) {
      issues.push({
        ruleId: "MEDICAL_003",
        sectionNumber: 6,
        message:
          "Procedimento invasivo identificado sem menção de técnica estéril ou medidas de assepsia.",
        severity: "error",
        category: "MEDICATION",
        suggestion:
          "Inclua informações sobre técnica estéril, preparo do local e medidas de controle de infecção.",
      });
    }

    // Check for informed consent mention
    const hasConsentMention =
      /\b(consentimento|autorização|explicar|orientar)\b/i.test(content);

    if (!hasConsentMention) {
      issues.push({
        ruleId: "MEDICAL_004",
        sectionNumber: 6,
        message:
          "Procedimento invasivo sem menção de consentimento informado ou orientação ao paciente.",
        severity: "warning",
        category: "CONTENT_SPECIFIC",
        suggestion:
          "Inclua orientações sobre consentimento informado e comunicação com o paciente.",
      });
    }
  }

  return issues;
};

/**
 * Validates monitoring and follow-up requirements
 */
const checkMonitoringRequirements: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  const monitoringSection = protocolContent["9"]; // Monitorização
  if (!monitoringSection?.content) {
    issues.push({
      ruleId: "MEDICAL_005",
      sectionNumber: 9,
      message:
        "Seção de Monitorização está vazia. Todo protocolo médico deve incluir diretrizes de monitoramento.",
      severity: "error",
      category: "COMPLETENESS",
      suggestion:
        "Adicione sinais vitais, exames laboratoriais e parâmetros de acompanhamento específicos.",
    });
    return issues;
  }

  const content =
    typeof monitoringSection.content === "string"
      ? monitoringSection.content
      : JSON.stringify(monitoringSection.content);

  // Check for vital signs monitoring
  const vitalSigns = [
    "pressão arterial",
    "pa",
    "fc",
    "frequência cardíaca",
    "spo2",
    "saturação",
    "temperatura",
  ];
  const hasVitalSigns = vitalSigns.some((sign) =>
    content.toLowerCase().includes(sign),
  );

  if (!hasVitalSigns) {
    issues.push({
      ruleId: "MEDICAL_006",
      sectionNumber: 9,
      message: "Seção de Monitorização não menciona sinais vitais básicos.",
      severity: "warning",
      category: "COMPLETENESS",
      suggestion:
        "Inclua monitoramento de sinais vitais (PA, FC, SpO2, Temperatura).",
    });
  }

  // Check for time intervals
  const hasTimeIntervals =
    /\b(\d+\s*(min|hora|h|dia|semana)|\da\d|cada|intervalo)\b/i.test(content);

  if (!hasTimeIntervals) {
    issues.push({
      ruleId: "MEDICAL_007",
      sectionNumber: 9,
      message:
        "Seção de Monitorização não especifica intervalos de tempo para avaliações.",
      severity: "warning",
      category: "COMPLETENESS",
      suggestion:
        "Defina intervalos específicos para reavaliação (ex: a cada 15 min, de 6/6h).",
    });
  }

  return issues;
};

/**
 * Validates evidence-based references and guidelines
 */
const checkEvidenceBase: ValidatorFunction = (
  protocolContent,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  const referenceSection = protocolContent["13"]; // Bibliografia
  if (!referenceSection?.content) {
    issues.push({
      ruleId: "MEDICAL_008",
      sectionNumber: 13,
      message:
        "Bibliografia ausente. Protocolos médicos devem ser baseados em evidências científicas.",
      severity: "error",
      category: "CONTENT_SPECIFIC",
      suggestion:
        "Inclua referências de diretrizes nacionais/internacionais, estudos clínicos e literatura científica.",
    });
    return issues;
  }

  const content =
    typeof referenceSection.content === "string"
      ? referenceSection.content
      : JSON.stringify(referenceSection.content);

  // Check for quality references
  const qualityReferences = [
    "sociedade brasileira",
    "ministério da saúde",
    "anvisa",
    "cfm",
    "american heart association",
    "aha",
    "european society",
    "cochrane",
    "pubmed",
    "nejm",
    "jama",
    "bmj",
  ];

  const hasQualityReferences = qualityReferences.some((ref) =>
    content.toLowerCase().includes(ref),
  );

  if (!hasQualityReferences) {
    issues.push({
      ruleId: "MEDICAL_009",
      sectionNumber: 13,
      message:
        "Bibliografia não inclui referências de organizações médicas reconhecidas.",
      severity: "warning",
      category: "CONTENT_SPECIFIC",
      suggestion:
        "Inclua referências de sociedades médicas, órgãos reguladores ou periódicos de alto impacto.",
    });
  }

  // Check for recent references
  const currentYear = new Date().getFullYear();
  const recentYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const hasRecentReferences = recentYears.some((year) =>
    content.includes(year.toString()),
  );

  if (!hasRecentReferences) {
    issues.push({
      ruleId: "MEDICAL_010",
      sectionNumber: 13,
      message: "Bibliografia não inclui referências recentes (últimos 5 anos).",
      severity: "warning",
      category: "CONTENT_SPECIFIC",
      suggestion:
        "Inclua referências atualizadas para garantir que o protocolo reflita as melhores práticas atuais.",
    });
  }

  return issues;
};

export const MEDICAL_CONTENT_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "MEDICAL_DOSAGE_SAFETY",
    description:
      "Validates medication dosages include proper safety considerations.",
    severity: "warning",
    category: "MEDICATION",
    check: checkMedicationDosages,
  },
  {
    id: "MEDICAL_PROCEDURE_SAFETY",
    description: "Ensures invasive procedures include safety protocols.",
    severity: "error",
    category: "MEDICATION",
    check: checkProcedureSafety,
  },
  {
    id: "MEDICAL_MONITORING_REQUIREMENTS",
    description: "Validates comprehensive monitoring guidelines.",
    severity: "warning",
    category: "COMPLETENESS",
    check: checkMonitoringRequirements,
  },
  {
    id: "MEDICAL_EVIDENCE_BASE",
    description: "Ensures protocol is based on current medical evidence.",
    severity: "warning",
    category: "CONTENT_SPECIFIC",
    check: checkEvidenceBase,
  },
];

/**
 * Validates medical-specific content requirements
 */
export const validateMedicalContent = async (
  protocolContent: ProtocolFullContent,
  _protocolFlowchart?: FlowchartData,
): Promise<ValidationIssue[]> => {
  let allIssues: ValidationIssue[] = [];

  for (const rule of MEDICAL_CONTENT_VALIDATION_RULES) {
    const ruleIssues = await rule.check(protocolContent, _protocolFlowchart);
    allIssues = allIssues.concat(ruleIssues);
  }

  return allIssues;
};
