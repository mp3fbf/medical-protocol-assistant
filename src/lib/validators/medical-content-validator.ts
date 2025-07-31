/**
 * Validator for medical content in clinical flowcharts
 * Ensures important medical information is not lost during generation
 */

import type { ClinicalFlowchart, ConductNodeData } from "@/types/flowchart-clinical";
import type { ExtractedMedicalContent } from "@/lib/ai/extractors/medical-content-extractor";
import { isConductNode, hasConductData } from "@/types/flowchart-clinical";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  statistics: ContentStatistics;
}

export interface ValidationError {
  nodeId?: string;
  type: "empty_conduct" | "missing_medications" | "missing_exams" | "invalid_structure";
  message: string;
  severity: "error" | "critical";
}

export interface ValidationWarning {
  nodeId?: string;
  type: "content_loss" | "incomplete_extraction" | "format_issue";
  message: string;
  expected?: number;
  found?: number;
}

export interface ContentStatistics {
  totalNodes: number;
  conductNodes: number;
  emptyConductNodes: number;
  totalMedications: number;
  totalExams: number;
  totalOrientations: number;
  medicationCoverage: number; // percentage
  examCoverage: number; // percentage
}

/**
 * Validate medical content in a clinical flowchart
 */
export function validateMedicalContent(
  flowchart: ClinicalFlowchart,
  extractedContent?: ExtractedMedicalContent
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const statistics: ContentStatistics = {
    totalNodes: flowchart.nodes.length,
    conductNodes: 0,
    emptyConductNodes: 0,
    totalMedications: 0,
    totalExams: 0,
    totalOrientations: 0,
    medicationCoverage: 0,
    examCoverage: 0
  };

  // Collect all medications and exams from flowchart
  const flowchartMedications = new Set<string>();
  const flowchartExams = new Set<string>();

  // Validate each node
  for (const node of flowchart.nodes) {
    // Skip start and end nodes
    if (node.type === "start" || node.type === "end") continue;

    // Validate conduct nodes
    if (isConductNode(node)) {
      statistics.conductNodes++;
      const validation = validateConductNode(node.data, node.id);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);

      // Count content
      if (hasConductData(node.data)) {
        const data = node.data.condutaDataNode;
        
        // Check if completely empty
        const isEmpty = 
          data.medicamento.length === 0 &&
          data.exame.length === 0 &&
          data.orientacao.length === 0 &&
          data.encaminhamento.length === 0 &&
          data.mensagem.length === 0;

        if (isEmpty) {
          statistics.emptyConductNodes++;
        }

        // Count items
        statistics.totalMedications += data.medicamento.length;
        statistics.totalExams += data.exame.length;
        statistics.totalOrientations += data.orientacao.length;

        // Collect medication and exam names
        data.medicamento.forEach(med => {
          flowchartMedications.add(med.nomeMed.toLowerCase());
        });
        data.exame.forEach(exam => {
          flowchartExams.add(exam.nome.toLowerCase());
        });
      } else {
        statistics.emptyConductNodes++;
        errors.push({
          nodeId: node.id,
          type: "empty_conduct",
          message: `Conduct node "${node.data.label}" has no condutaDataNode`,
          severity: "error"
        });
      }
    }
  }

  // Compare with extracted content if provided
  if (extractedContent) {
    // Check medication coverage
    const extractedMedNames = extractedContent.medications.map(m => m.name.toLowerCase());
    const foundMedications = extractedMedNames.filter(med => 
      Array.from(flowchartMedications).some(fm => fm.includes(med) || med.includes(fm))
    );
    statistics.medicationCoverage = extractedMedNames.length > 0 
      ? (foundMedications.length / extractedMedNames.length) * 100 
      : 100;

    if (statistics.medicationCoverage < 50) {
      warnings.push({
        type: "content_loss",
        message: `Only ${foundMedications.length} of ${extractedMedNames.length} medications from protocol were included in flowchart`,
        expected: extractedMedNames.length,
        found: foundMedications.length
      });
    }

    // Check exam coverage
    const extractedExamNames = extractedContent.exams.map(e => e.name.toLowerCase());
    const foundExams = extractedExamNames.filter(exam => 
      Array.from(flowchartExams).some(fe => fe.includes(exam) || exam.includes(fe))
    );
    statistics.examCoverage = extractedExamNames.length > 0
      ? (foundExams.length / extractedExamNames.length) * 100
      : 100;

    if (statistics.examCoverage < 50) {
      warnings.push({
        type: "content_loss",
        message: `Only ${foundExams.length} of ${extractedExamNames.length} exams from protocol were included in flowchart`,
        expected: extractedExamNames.length,
        found: foundExams.length
      });
    }
  }

  // Check for critical issues
  if (statistics.conductNodes > 0 && statistics.emptyConductNodes === statistics.conductNodes) {
    errors.push({
      type: "missing_medications",
      message: "All conduct nodes are empty - no medical content preserved",
      severity: "critical"
    });
  }

  // Determine overall validity
  const hasCriticalErrors = errors.some(e => e.severity === "critical");
  const hasHighContentLoss = statistics.medicationCoverage < 25 || statistics.examCoverage < 25;
  const isValid = !hasCriticalErrors && !hasHighContentLoss && errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    statistics
  };
}

/**
 * Validate a single conduct node
 */
function validateConductNode(
  data: ConductNodeData,
  nodeId: string
): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check if node should have medical content based on label/description
  const label = data.label?.toLowerCase() || "";
  const shouldHaveMedications = 
    label.includes("tratamento") ||
    label.includes("medicamento") ||
    label.includes("medicação") ||
    label.includes("prescrição") ||
    label.includes("terapia") ||
    label.includes("farmacológic");

  const shouldHaveExams = 
    label.includes("exame") ||
    label.includes("laboratório") ||
    label.includes("diagnóstico") ||
    label.includes("avaliação") ||
    label.includes("investigar");

  const shouldHaveOrientations =
    label.includes("orientação") ||
    label.includes("orientar") ||
    label.includes("cuidado") ||
    label.includes("recomendação");

  // Validate based on expected content
  if (hasConductData(data)) {
    const condutaData = data.condutaDataNode;

    // Check for expected medications
    if (shouldHaveMedications && condutaData.medicamento.length === 0) {
      errors.push({
        nodeId,
        type: "missing_medications",
        message: `Conduct node "${data.label}" appears to be treatment-related but has no medications`,
        severity: "error"
      });
    }

    // Check for expected exams
    if (shouldHaveExams && condutaData.exame.length === 0) {
      warnings.push({
        nodeId,
        type: "incomplete_extraction",
        message: `Conduct node "${data.label}" appears to be diagnostic but has no exams`
      });
    }

    // Check for expected orientations
    if (shouldHaveOrientations && condutaData.orientacao.length === 0) {
      warnings.push({
        nodeId,
        type: "incomplete_extraction",
        message: `Conduct node "${data.label}" appears to need orientations but has none`
      });
    }

    // Validate medication details
    for (const med of condutaData.medicamento) {
      if (!med.nomeMed || med.nomeMed.trim() === "") {
        errors.push({
          nodeId,
          type: "invalid_structure",
          message: `Medication without name in node "${data.label}"`,
          severity: "error"
        });
      }
      if (!med.posologia || med.posologia.trim() === "") {
        warnings.push({
          nodeId,
          type: "format_issue",
          message: `Medication "${med.nomeMed}" without posology details`
        });
      }
    }

    // Validate exam details
    for (const exam of condutaData.exame) {
      if (!exam.nome || exam.nome.trim() === "") {
        errors.push({
          nodeId,
          type: "invalid_structure",
          message: `Exam without name in node "${data.label}"`,
          severity: "error"
        });
      }
    }
  }

  return { errors, warnings };
}

/**
 * Generate validation report as HTML
 */
export function generateValidationReport(result: ValidationResult): string {
  let html = "<div class='validation-report'>";
  
  // Summary
  html += "<h3>Validation Summary</h3>";
  html += `<p>Status: <strong style='color: ${result.isValid ? 'green' : 'red'}'>${result.isValid ? 'VALID' : 'INVALID'}</strong></p>`;
  
  // Statistics
  html += "<h4>Content Statistics</h4>";
  html += "<ul>";
  html += `<li>Total Nodes: ${result.statistics.totalNodes}</li>`;
  html += `<li>Conduct Nodes: ${result.statistics.conductNodes}</li>`;
  html += `<li>Empty Conduct Nodes: ${result.statistics.emptyConductNodes}</li>`;
  html += `<li>Total Medications: ${result.statistics.totalMedications}</li>`;
  html += `<li>Total Exams: ${result.statistics.totalExams}</li>`;
  html += `<li>Total Orientations: ${result.statistics.totalOrientations}</li>`;
  html += `<li>Medication Coverage: ${result.statistics.medicationCoverage.toFixed(1)}%</li>`;
  html += `<li>Exam Coverage: ${result.statistics.examCoverage.toFixed(1)}%</li>`;
  html += "</ul>";
  
  // Errors
  if (result.errors.length > 0) {
    html += "<h4 style='color: red'>Errors</h4>";
    html += "<ul>";
    for (const error of result.errors) {
      html += `<li><strong>${error.type}</strong>: ${error.message}`;
      if (error.nodeId) html += ` (Node: ${error.nodeId})`;
      html += "</li>";
    }
    html += "</ul>";
  }
  
  // Warnings
  if (result.warnings.length > 0) {
    html += "<h4 style='color: orange'>Warnings</h4>";
    html += "<ul>";
    for (const warning of result.warnings) {
      html += `<li><strong>${warning.type}</strong>: ${warning.message}`;
      if (warning.nodeId) html += ` (Node: ${warning.nodeId})`;
      if (warning.expected !== undefined && warning.found !== undefined) {
        html += ` [Expected: ${warning.expected}, Found: ${warning.found}]`;
      }
      html += "</li>";
    }
    html += "</ul>";
  }
  
  html += "</div>";
  return html;
}

/**
 * Quick check if flowchart has any medical content
 */
export function hasAnyMedicalContent(flowchart: ClinicalFlowchart): boolean {
  for (const node of flowchart.nodes) {
    if (isConductNode(node) && hasConductData(node.data)) {
      const data = node.data.condutaDataNode;
      if (
        data.medicamento.length > 0 ||
        data.exame.length > 0 ||
        data.orientacao.length > 0 ||
        data.encaminhamento.length > 0 ||
        data.mensagem.length > 0
      ) {
        return true;
      }
    }
  }
  return false;
}