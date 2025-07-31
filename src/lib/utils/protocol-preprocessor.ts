/**
 * Protocol preprocessor to structure medical content before AI generation
 * Helps preserve important medical information during flowchart generation
 */

import type { ProtocolFullContent } from "@/types/protocol";
import { extractMedicalContent, type ExtractedMedicalContent } from "@/lib/ai/extractors/medical-content-extractor";

export interface PreprocessedProtocol {
  originalContent: ProtocolFullContent;
  extractedContent: ExtractedMedicalContent;
  structuredSections: StructuredSections;
  metadata: ProtocolMetadata;
}

export interface StructuredSections {
  introduction?: string;
  indications?: string[];
  contraindications?: string[];
  initialAssessment?: AssessmentData;
  diagnosticExams?: DiagnosticExam[];
  treatments?: TreatmentPlan[];
  monitoring?: MonitoringPlan;
  outcomes?: string[];
}

export interface AssessmentData {
  clinicalHistory: string[];
  physicalExam: string[];
  vitalSigns: string[];
  riskFactors: string[];
}

export interface DiagnosticExam {
  name: string;
  indication: string;
  urgency: string;
  interpretation?: string;
}

export interface TreatmentPlan {
  condition: string;
  medications: MedicationDetail[];
  supportiveCare: string[];
  duration?: string;
}

export interface MedicationDetail {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  duration?: string;
  indication?: string;
  monitoring?: string;
}

export interface MonitoringPlan {
  parameters: string[];
  frequency: string;
  warningSignals: string[];
  followUp: string[];
}

export interface ProtocolMetadata {
  condition: string;
  specialty?: string;
  urgencyLevel?: string;
  protocolType?: string;
}

/**
 * Extract structured sections from protocol content
 */
function extractStructuredSections(content: ProtocolFullContent): StructuredSections {
  const structured: StructuredSections = {};

  // Extract from Section 3 - Indications
  if (content["3"]?.content) {
    const indicationsText = getTextContent(content["3"].content);
    structured.indications = extractListItems(indicationsText);
  }

  // Extract from Section 4 - Contraindications
  if (content["4"]?.content) {
    const contraindicationsText = getTextContent(content["4"].content);
    structured.contraindications = extractListItems(contraindicationsText);
  }

  // Extract from Section 5 - Initial Assessment
  if (content["5"]?.content) {
    const assessmentText = getTextContent(content["5"].content);
    structured.initialAssessment = extractAssessmentData(assessmentText);
  }

  // Extract from Section 6 - Diagnostic Exams
  if (content["6"]?.content) {
    const examsText = getTextContent(content["6"].content);
    structured.diagnosticExams = extractDiagnosticExams(examsText);
  }

  // Extract from Section 8 - Treatment
  if (content["8"]?.content) {
    const treatmentText = getTextContent(content["8"].content);
    structured.treatments = extractTreatmentPlans(treatmentText);
  }

  // Extract from Section 9 - Monitoring
  if (content["9"]?.content) {
    const monitoringText = getTextContent(content["9"].content);
    structured.monitoring = extractMonitoringPlan(monitoringText);
  }

  // Extract outcomes from various sections
  structured.outcomes = extractOutcomes(content);

  return structured;
}

/**
 * Get text content from section data
 */
function getTextContent(content: string | object): string {
  return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
}

/**
 * Extract list items from text
 */
function extractListItems(text: string): string[] {
  const items: string[] = [];
  
  // Match bullet points and numbered lists
  const patterns = [
    /^[-•]\s*(.+)$/gm,
    /^\d+[\.)]\s*(.+)$/gm,
    /^[a-z]\)\s*(.+)$/gm
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      items.push(match[1].trim());
    }
  }

  // Also extract from comma-separated lists
  const commaPattern = /(?:indicações?|contraindicações?):\s*([^.]+\.[^.]*)/gi;
  let commaMatch;
  while ((commaMatch = commaPattern.exec(text)) !== null) {
    const list = commaMatch[1].split(/[,;]/).map(item => item.trim()).filter(item => item.length > 0);
    items.push(...list);
  }

  return [...new Set(items)]; // Remove duplicates
}

/**
 * Extract assessment data from text
 */
function extractAssessmentData(text: string): AssessmentData {
  const data: AssessmentData = {
    clinicalHistory: [],
    physicalExam: [],
    vitalSigns: [],
    riskFactors: []
  };

  // Extract clinical history items
  const historySection = text.match(/(?:anamnese|história clínica)[:\s]*([^]+?)(?=exame físico|sinais vitais|$)/i);
  if (historySection) {
    data.clinicalHistory = extractListItems(historySection[1]);
  }

  // Extract physical exam items
  const physicalSection = text.match(/(?:exame físico)[:\s]*([^]+?)(?=sinais vitais|fatores de risco|$)/i);
  if (physicalSection) {
    data.physicalExam = extractListItems(physicalSection[1]);
  }

  // Extract vital signs
  const vitalSignsPattern = /(?:PA|FC|FR|Tax|SatO2|glicemia)[\s:]+[^,\n]+/gi;
  let vitalMatch;
  while ((vitalMatch = vitalSignsPattern.exec(text)) !== null) {
    data.vitalSigns.push(vitalMatch[0].trim());
  }

  // Extract risk factors
  const riskSection = text.match(/(?:fatores de risco)[:\s]*([^]+?)(?=\n\n|$)/i);
  if (riskSection) {
    data.riskFactors = extractListItems(riskSection[1]);
  }

  return data;
}

/**
 * Extract diagnostic exams from text
 */
function extractDiagnosticExams(text: string): DiagnosticExam[] {
  const exams: DiagnosticExam[] = [];
  
  // Common exam patterns
  const examPatterns = [
    /(?:solicitar|realizar)\s+([^,.\n]+?)(?:\s*[-–]\s*([^.\n]+))?(?:\.|$)/gi,
    /(?:exames?)[:\s]*([^.\n]+)/gi
  ];

  const foundExams = new Set<string>();

  for (const pattern of examPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const examName = match[1].trim();
      if (!foundExams.has(examName.toLowerCase()) && examName.length > 3) {
        foundExams.add(examName.toLowerCase());
        
        const exam: DiagnosticExam = {
          name: examName,
          indication: match[2]?.trim() || "",
          urgency: text.substring(match.index - 50, match.index + 50).match(/urgente|imediato|emergência/i) ? "Urgente" : "Rotina"
        };
        
        exams.push(exam);
      }
    }
  }

  return exams;
}

/**
 * Extract treatment plans from text
 */
function extractTreatmentPlans(text: string): TreatmentPlan[] {
  const plans: TreatmentPlan[] = [];
  
  // Split by treatment conditions or sections
  const sections = text.split(/(?:tratamento\s+(?:de|para)|conduta|manejo)[:\s]*/i);
  
  for (const section of sections) {
    if (section.trim().length < 20) continue;
    
    // Extract medications in this section
    const medications = extractMedicationsFromSection(section);
    
    if (medications.length > 0) {
      // Extract supportive care
      const supportiveCare = extractSupportiveCare(section);
      
      // Try to identify the condition
      const conditionMatch = section.match(/^([^:.\n]{5,50})/);
      const condition = conditionMatch ? conditionMatch[1].trim() : "Tratamento geral";
      
      plans.push({
        condition,
        medications,
        supportiveCare
      });
    }
  }

  // If no structured plans found, create a general one
  if (plans.length === 0 && text.length > 50) {
    const medications = extractMedicationsFromSection(text);
    const supportiveCare = extractSupportiveCare(text);
    
    if (medications.length > 0 || supportiveCare.length > 0) {
      plans.push({
        condition: "Protocolo de tratamento",
        medications,
        supportiveCare
      });
    }
  }

  return plans;
}

/**
 * Extract medications from a text section
 */
function extractMedicationsFromSection(text: string): MedicationDetail[] {
  const medications: MedicationDetail[] = [];
  
  // Comprehensive medication patterns
  const patterns = [
    // Pattern: Medication name followed by dose info
    /(\w+(?:\s+\w+)?)\s+(\d+\s*(?:mg|g|mcg|UI|mL)(?:\/kg)?)\s*(VO|IV|IM|SC|SL|oral|EV)\s*([^.\n]+)?/gi,
    // Pattern: Medication: name - dose
    /(?:medicamento|medicação):\s*([^-\n]+)\s*-\s*(?:dose:\s*)?([^-\n]+)/gi,
    // Pattern in lists
    /^[-•]\s*(\w+(?:\s+\w+)?)[:\s]+([^.\n]+)/gm
  ];

  const found = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      
      if (!found.has(name.toLowerCase()) && name.length > 2) {
        found.add(name.toLowerCase());
        
        const med: MedicationDetail = {
          name,
          dose: match[2]?.trim() || "",
          route: match[3]?.trim() || "VO",
          frequency: ""
        };

        // Extract frequency from remaining text
        const remainingText = match[4] || text.substring(match.index, match.index + 100);
        const freqMatch = remainingText.match(/(\d+x\/dia|\d+\/\d+h|SN|ACM|contínuo|1x ao dia)/i);
        if (freqMatch) {
          med.frequency = freqMatch[1];
        }

        // Extract duration
        const durationMatch = remainingText.match(/por\s+(\d+\s*(?:dias?|semanas?|meses?))/i);
        if (durationMatch) {
          med.duration = durationMatch[1];
        }

        medications.push(med);
      }
    }
  }

  return medications;
}

/**
 * Extract supportive care measures
 */
function extractSupportiveCare(text: string): string[] {
  const measures: string[] = [];
  
  const patterns = [
    /(?:medidas?\s+(?:gerais?|suporte|suportivas?)):\s*([^.]+)/gi,
    /(?:orientar|manter|evitar|suspender)\s+([^.]+)/gi,
    /(?:repouso|hidratação|dieta|jejum|oxigênio)\s+[^.]+/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const measure = match[0].trim();
      if (measure.length > 10 && measure.length < 200) {
        measures.push(measure);
      }
    }
  }

  return [...new Set(measures)];
}

/**
 * Extract monitoring plan from text
 */
function extractMonitoringPlan(text: string): MonitoringPlan {
  const plan: MonitoringPlan = {
    parameters: [],
    frequency: "",
    warningSignals: [],
    followUp: []
  };

  // Extract monitoring parameters
  const paramPattern = /(?:monitorar|monitorizar|acompanhar|verificar)\s+([^,.\n]+)/gi;
  let paramMatch;
  while ((paramMatch = paramPattern.exec(text)) !== null) {
    plan.parameters.push(paramMatch[1].trim());
  }

  // Extract frequency
  const freqMatch = text.match(/(?:a cada|de)\s+(\d+\s*(?:horas?|minutos?|dias?))/i);
  if (freqMatch) {
    plan.frequency = freqMatch[1];
  }

  // Extract warning signals
  const warningSection = text.match(/(?:sinais de alarme|sinais de alerta|atenção para)[:\s]*([^.]+)/i);
  if (warningSection) {
    plan.warningSignals = extractListItems(warningSection[1]);
  }

  // Extract follow-up
  const followUpPattern = /(?:retorno|reavaliação|seguimento)\s+([^.]+)/gi;
  let followMatch;
  while ((followMatch = followUpPattern.exec(text)) !== null) {
    plan.followUp.push(followMatch[1].trim());
  }

  return plan;
}

/**
 * Extract outcomes from protocol
 */
function extractOutcomes(content: ProtocolFullContent): string[] {
  const outcomes: string[] = [];
  
  // Look in multiple sections
  const sectionsToCheck = ["10", "11", "12", "13"];
  
  for (const sectionKey of sectionsToCheck) {
    if (content[sectionKey]?.content) {
      const text = getTextContent(content[sectionKey].content);
      
      // Extract outcome patterns
      const patterns = [
        /(?:alta|internação|transferência|óbito)\s+[^.]+/gi,
        /(?:critérios? de alta)[:\s]*([^.]+)/gi,
        /(?:desfecho|prognóstico)[:\s]*([^.]+)/gi
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          outcomes.push(match[0].trim());
        }
      }
    }
  }

  return [...new Set(outcomes)];
}

/**
 * Determine protocol metadata
 */
function extractMetadata(condition: string, content: ProtocolFullContent): ProtocolMetadata {
  const metadata: ProtocolMetadata = {
    condition
  };

  // Try to determine specialty from content
  const fullText = Object.values(content)
    .map(section => getTextContent(section?.content || ""))
    .join(" ");

  // Specialty detection
  if (fullText.match(/cardiolog|coronária|infarto|angina/i)) {
    metadata.specialty = "Cardiologia";
  } else if (fullText.match(/pneumo|respiratór|asma|dpoc/i)) {
    metadata.specialty = "Pneumologia";
  } else if (fullText.match(/neurolog|avc|convuls|epilepsia/i)) {
    metadata.specialty = "Neurologia";
  } else if (fullText.match(/gastro|abdominal|endoscopia/i)) {
    metadata.specialty = "Gastroenterologia";
  }

  // Urgency level
  if (fullText.match(/emergência|urgente|imediato/i)) {
    metadata.urgencyLevel = "Emergência";
  } else if (fullText.match(/urgência|prioritário/i)) {
    metadata.urgencyLevel = "Urgência";
  } else {
    metadata.urgencyLevel = "Eletivo";
  }

  // Protocol type
  if (fullText.match(/diagnóstico|investigação/i)) {
    metadata.protocolType = "Diagnóstico";
  } else if (fullText.match(/tratamento|terapêutico/i)) {
    metadata.protocolType = "Terapêutico";
  } else if (fullText.match(/monitorização|acompanhamento/i)) {
    metadata.protocolType = "Monitorização";
  }

  return metadata;
}

/**
 * Main preprocessing function
 */
export function preprocessProtocol(
  condition: string,
  content: ProtocolFullContent
): PreprocessedProtocol {
  // Extract medical content using the extractor
  const extractedContent = extractMedicalContent(content);
  
  // Extract structured sections
  const structuredSections = extractStructuredSections(content);
  
  // Extract metadata
  const metadata = extractMetadata(condition, content);

  return {
    originalContent: content,
    extractedContent,
    structuredSections,
    metadata
  };
}

/**
 * Generate enhanced prompt with preprocessed data
 */
export function generateEnhancedPrompt(preprocessed: PreprocessedProtocol): string {
  let enhancedPrompt = "\n\n--- EXTRACTED MEDICAL CONTENT ---\n";

  // Add medications
  if (preprocessed.extractedContent.medications.length > 0) {
    enhancedPrompt += "\nMEDICATIONS FOUND:\n";
    for (const med of preprocessed.extractedContent.medications) {
      enhancedPrompt += `- ${med.name}`;
      if (med.dose) enhancedPrompt += ` - Dose: ${med.dose}`;
      if (med.route) enhancedPrompt += ` - Route: ${med.route}`;
      if (med.frequency) enhancedPrompt += ` - Frequency: ${med.frequency}`;
      enhancedPrompt += "\n";
    }
  }

  // Add exams
  if (preprocessed.extractedContent.exams.length > 0) {
    enhancedPrompt += "\nEXAMS FOUND:\n";
    for (const exam of preprocessed.extractedContent.exams) {
      enhancedPrompt += `- ${exam.name}`;
      if (exam.indication) enhancedPrompt += ` - Indication: ${exam.indication}`;
      if (exam.urgency) enhancedPrompt += ` - Urgency: ${exam.urgency}`;
      enhancedPrompt += "\n";
    }
  }

  // Add treatment plans
  if (preprocessed.structuredSections.treatments?.length) {
    enhancedPrompt += "\nTREATMENT PLANS:\n";
    for (const plan of preprocessed.structuredSections.treatments) {
      enhancedPrompt += `\nCondition: ${plan.condition}\n`;
      if (plan.medications.length > 0) {
        enhancedPrompt += "Medications:\n";
        for (const med of plan.medications) {
          enhancedPrompt += `  - ${med.name} ${med.dose} ${med.route} ${med.frequency}\n`;
        }
      }
      if (plan.supportiveCare.length > 0) {
        enhancedPrompt += "Supportive Care:\n";
        for (const care of plan.supportiveCare) {
          enhancedPrompt += `  - ${care}\n`;
        }
      }
    }
  }

  enhancedPrompt += "\n--- END EXTRACTED CONTENT ---\n\n";
  enhancedPrompt += "IMPORTANT: You MUST include ALL the medications, exams, and orientations listed above in the appropriate conduct nodes.\n";

  return enhancedPrompt;
}