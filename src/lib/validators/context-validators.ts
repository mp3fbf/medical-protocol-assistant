/**
 * Context-Specific Protocol Validators
 * 
 * Validates protocol content based on the care context to ensure
 * protocols are appropriate for their intended use
 */

import { ProtocolContext } from "@/types/database";
import type { ProtocolFullContent } from "@/types/protocol";

export interface ValidationError {
  section: number;
  field?: string;
  error: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Main validation function that routes to context-specific validators
 */
export function validateProtocolByContext(
  content: ProtocolFullContent,
  context: ProtocolContext
): ValidationResult {
  switch (context) {
    case ProtocolContext.EMERGENCY_ROOM:
      return validateEmergencyRoomProtocol(content);
    case ProtocolContext.AMBULATORY:
      return validateAmbulatoryProtocol(content);
    case ProtocolContext.ICU:
      return validateICUProtocol(content);
    default:
      // For other contexts, just do basic validation
      return basicProtocolValidation(content);
  }
}

/**
 * Validate Emergency Room protocols
 */
export function validateEmergencyRoomProtocol(
  content: ProtocolFullContent
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Section 5 - Initial Assessment must start with red flags
  const section5 = content["5"];
  if (section5?.content) {
    const contentStr = typeof section5.content === "string" 
      ? section5.content.toLowerCase() 
      : JSON.stringify(section5.content).toLowerCase();

    // Must have red flags
    if (!contentStr.includes("red flag") && !contentStr.includes("sinais de alarme")) {
      errors.push({
        section: 5,
        error: "Avaliação inicial deve começar com red flags/sinais de alarme para PA",
        severity: "error"
      });
    }

    // Should not have detailed anamnesis
    if (contentStr.includes("história detalhada") || 
        contentStr.includes("revisão de sistemas") ||
        contentStr.includes("anamnese completa")) {
      warnings.push({
        section: 5,
        error: "PA não deve incluir anamnese detalhada - foco em avaliação rápida",
        severity: "warning"
      });
    }
  }

  // Section 6 - Exams must be PA-appropriate
  const section6 = content["6"];
  if (section6?.content) {
    const contentStr = typeof section6.content === "string" 
      ? section6.content.toLowerCase() 
      : JSON.stringify(section6.content).toLowerCase();

    const forbiddenExams = [
      "colonoscopia", "endoscopia", "manometria", "cintilografia",
      "ressonância", "tomografia computadorizada", "angiografia",
      "ecocardiograma transesofágico", "holter", "mapa"
    ];

    forbiddenExams.forEach(exam => {
      if (contentStr.includes(exam)) {
        errors.push({
          section: 6,
          error: `Exame "${exam}" não disponível no PA - apenas exames básicos`,
          severity: "error"
        });
      }
    });
  }

  // Section 7 - Treatment must be immediate and PA-appropriate
  const section7 = content["7"];
  if (section7?.content) {
    const contentStr = typeof section7.content === "string" 
      ? section7.content.toLowerCase() 
      : JSON.stringify(section7.content).toLowerCase();

    // Must have immediate conducts
    if (!contentStr.includes("imediata") && 
        !contentStr.includes("agora") && 
        !contentStr.includes("aplicar já")) {
      errors.push({
        section: 7,
        error: "Tratamento PA deve especificar condutas IMEDIATAS",
        severity: "error"
      });
    }

    // Check for inappropriate medications
    const forbiddenMeds = [
      "prucaloprida", "linaclotida", "lubiprostona", "naloxegol",
      "infliximabe", "adalimumabe", "etanercepte", "rituximabe"
    ];

    forbiddenMeds.forEach(med => {
      if (contentStr.includes(med)) {
        errors.push({
          section: 7,
          error: `Medicamento "${med}" não disponível no PA`,
          severity: "error"
        });
      }
    });

    // Should prioritize discharge medications
    if (!contentStr.includes("prescrição de alta") && 
        !contentStr.includes("para casa") &&
        !contentStr.includes("uso domiciliar")) {
      warnings.push({
        section: 7,
        error: "Deve incluir prescrição de alta para tratamento domiciliar",
        severity: "warning"
      });
    }
  }

  // Section 9 - Admission/Discharge criteria must be checklist format
  const section9 = content["9"];
  if (section9?.content) {
    const contentStr = typeof section9.content === "string" 
      ? section9.content.toLowerCase() 
      : JSON.stringify(section9.content).toLowerCase();

    // Must have checklist format
    if (!contentStr.includes("□") && 
        !contentStr.includes("[ ]") && 
        !contentStr.includes("checklist")) {
      errors.push({
        section: 9,
        error: "Critérios de alta/internação devem estar em formato checklist para PA",
        severity: "error"
      });
    }

    // Should not mention long-term follow-up
    if (contentStr.includes("semanas") || 
        contentStr.includes("meses") ||
        contentStr.includes("consulta de rotina")) {
      errors.push({
        section: 9,
        error: "PA não deve agendar follow-up de longo prazo",
        severity: "error"
      });
    }

    // Must have both discharge and admission criteria
    if (!contentStr.includes("alta segura") && !contentStr.includes("liberar")) {
      errors.push({
        section: 9,
        error: "Deve incluir critérios claros de ALTA SEGURA",
        severity: "error"
      });
    }

    if (!contentStr.includes("internar") && !contentStr.includes("internação")) {
      errors.push({
        section: 9,
        error: "Deve incluir critérios claros de INTERNAÇÃO",
        severity: "error"
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate Ambulatory protocols
 */
export function validateAmbulatoryProtocol(
  content: ProtocolFullContent
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Section 5 - Should have comprehensive assessment
  const section5 = content["5"];
  if (section5?.content) {
    const contentStr = typeof section5.content === "string" 
      ? section5.content.toLowerCase() 
      : JSON.stringify(section5.content).toLowerCase();

    if (!contentStr.includes("anamnese") && 
        !contentStr.includes("história") &&
        !contentStr.includes("avaliação completa")) {
      warnings.push({
        section: 5,
        error: "Ambulatório deve incluir avaliação completa e detalhada",
        severity: "warning"
      });
    }
  }

  // Section 7 - Should have stepped approach
  const section7 = content["7"];
  if (section7?.content) {
    const contentStr = typeof section7.content === "string" 
      ? section7.content.toLowerCase() 
      : JSON.stringify(section7.content).toLowerCase();

    if (!contentStr.includes("primeira linha") && 
        !contentStr.includes("segunda linha") &&
        !contentStr.includes("escalonado")) {
      warnings.push({
        section: 7,
        error: "Tratamento ambulatorial deve ter abordagem escalonada",
        severity: "warning"
      });
    }
  }

  // Section 8 - Should have follow-up schedule
  const section8 = content["8"];
  if (section8?.content) {
    const contentStr = typeof section8.content === "string" 
      ? section8.content.toLowerCase() 
      : JSON.stringify(section8.content).toLowerCase();

    if (!contentStr.includes("retorno") && 
        !contentStr.includes("seguimento") &&
        !contentStr.includes("acompanhamento")) {
      errors.push({
        section: 8,
        error: "Protocolo ambulatorial deve incluir cronograma de seguimento",
        severity: "error"
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate ICU protocols
 */
export function validateICUProtocol(
  content: ProtocolFullContent
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Section 5 - Must include hemodynamic assessment
  const section5 = content["5"];
  if (section5?.content) {
    const contentStr = typeof section5.content === "string" 
      ? section5.content.toLowerCase() 
      : JSON.stringify(section5.content).toLowerCase();

    const requiredAssessments = ["hemodinâmica", "respiratória", "neurológica"];
    requiredAssessments.forEach(assessment => {
      if (!contentStr.includes(assessment)) {
        errors.push({
          section: 5,
          error: `UTI deve incluir avaliação ${assessment}`,
          severity: "error"
        });
      }
    });
  }

  // Section 7 - Must include life support measures
  const section7 = content["7"];
  if (section7?.content) {
    const contentStr = typeof section7.content === "string" 
      ? section7.content.toLowerCase() 
      : JSON.stringify(section7.content).toLowerCase();

    if (!contentStr.includes("suporte") && 
        !contentStr.includes("vasopressor") &&
        !contentStr.includes("ventilação")) {
      errors.push({
        section: 7,
        error: "Protocolo de UTI deve incluir medidas de suporte vital",
        severity: "error"
      });
    }

    // Must include prophylaxis
    if (!contentStr.includes("profilaxia") && 
        !contentStr.includes("prevenção")) {
      warnings.push({
        section: 7,
        error: "Deve incluir profilaxias obrigatórias (TVP, úlcera de estresse, etc)",
        severity: "warning"
      });
    }
  }

  // Section 8 - Must include continuous monitoring
  const section8 = content["8"];
  if (section8?.content) {
    const contentStr = typeof section8.content === "string" 
      ? section8.content.toLowerCase() 
      : JSON.stringify(section8.content).toLowerCase();

    if (!contentStr.includes("monitorização contínua") && 
        !contentStr.includes("24 horas") &&
        !contentStr.includes("multiparamétrica")) {
      errors.push({
        section: 8,
        error: "UTI requer descrição de monitorização contínua",
        severity: "error"
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Basic validation for other contexts
 */
function basicProtocolValidation(
  content: ProtocolFullContent
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check that all required sections exist
  const requiredSections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  
  requiredSections.forEach(sectionNum => {
    const section = content[sectionNum.toString()];
    if (!section || !section.content) {
      errors.push({
        section: sectionNum,
        error: `Seção ${sectionNum} está vazia ou ausente`,
        severity: "error"
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get validation summary message
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.valid) {
    return result.warnings.length > 0
      ? `Protocolo válido com ${result.warnings.length} avisos`
      : "Protocolo válido e adequado ao contexto";
  }

  return `Protocolo inválido: ${result.errors.length} erros encontrados`;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string[] {
  const messages: string[] = [];

  result.errors.forEach(error => {
    messages.push(`❌ Seção ${error.section}: ${error.error}`);
  });

  result.warnings.forEach(warning => {
    messages.push(`⚠️ Seção ${warning.section}: ${warning.error}`);
  });

  return messages;
}