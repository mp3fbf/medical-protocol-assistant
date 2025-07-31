/**
 * Medical content extractor for protocols
 * Extracts structured medical information (medications, exams, orientations) from protocol text
 */

import type { ProtocolFullContent } from "@/types/protocol";

export interface ExtractedMedication {
  name: string;
  dose?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  observation?: string;
}

export interface ExtractedExam {
  name: string;
  code?: string;
  indication?: string;
  urgency?: string;
  preparation?: string;
}

export interface ExtractedOrientation {
  title: string;
  content: string;
  category?: string; // diet, exercise, monitoring, etc.
}

export interface ExtractedConduct {
  title: string;
  medications: ExtractedMedication[];
  exams: ExtractedExam[];
  orientations: ExtractedOrientation[];
  referrals: string[];
  messages: string[];
}

export interface ExtractedMedicalContent {
  medications: ExtractedMedication[];
  exams: ExtractedExam[];
  orientations: ExtractedOrientation[];
  conducts: ExtractedConduct[];
}

/**
 * Extract medications from protocol text
 */
function extractMedications(text: string): ExtractedMedication[] {
  const medications: ExtractedMedication[] = [];
  
  // Common medication patterns in Portuguese medical texts
  const medicationPatterns = [
    // Pattern: "Medicamento: X - Dose: Y - Via: Z"
    /(?:Medicamento|Medicação|Fármaco):\s*([^-\n]+)(?:\s*-\s*Dose:\s*([^-\n]+))?(?:\s*-\s*Via:\s*([^-\n]+))?/gi,
    // Pattern: "X [dose] [route] [frequency]"
    /(\w+(?:\s+\w+)?)\s+(\d+\s*(?:mg|g|mcg|UI|mL|L))\s+(VO|IV|IM|SC|SL|VR|Tópico|Inalatório)\s*(?:(\d+x\/dia|\d+\/\d+h|SN|ACM))?/gi,
    // Pattern in lists: "- Medicamento (dose, via)"
    /[-•]\s*(\w+(?:\s+\w+)?)\s*\(([^,)]+)(?:,\s*([^)]+))?\)/gi,
    // Pattern: medication name followed by posology
    /(\w+(?:\s+\w+)?)\s*[:-]\s*(\d+\s*(?:mg|g|mcg|UI|mL)(?:\/kg)?)\s*(?:de\s*)?(\d+\/\d+h|\d+x\/dia|1x\/dia|2x\/dia|3x\/dia|4x\/dia|SN|se necessário)/gi
  ];

  for (const pattern of medicationPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const medication: ExtractedMedication = {
        name: match[1]?.trim() || "",
      };
      
      if (match[2]) medication.dose = match[2].trim();
      if (match[3]) medication.route = match[3].trim();
      if (match[4]) medication.frequency = match[4].trim();
      
      // Avoid duplicates and empty names
      if (medication.name && !medications.some(m => m.name === medication.name)) {
        medications.push(medication);
      }
    }
  }

  // Extract from bullet lists
  const bulletPattern = /[-•]\s*([A-Z][a-záêçõ]+(?:\s+[a-záêçõ]+)?)\s*[:-]?\s*([^\n]+)/g;
  let bulletMatch;
  while ((bulletMatch = bulletPattern.exec(text)) !== null) {
    const name = bulletMatch[1].trim();
    const details = bulletMatch[2].trim();
    
    // Check if it's likely a medication
    if (details.match(/\d+\s*(?:mg|g|mcg|UI|mL)|VO|IV|IM|SC|via oral|intravenoso/i)) {
      const medication: ExtractedMedication = { name };
      
      // Extract dose
      const doseMatch = details.match(/(\d+\s*(?:mg|g|mcg|UI|mL)(?:\/kg)?)/i);
      if (doseMatch) medication.dose = doseMatch[1];
      
      // Extract route
      const routeMatch = details.match(/(VO|IV|IM|SC|SL|VR|via oral|intravenoso|intramuscular|subcutâneo|sublingual)/i);
      if (routeMatch) medication.route = routeMatch[1];
      
      // Extract frequency
      const freqMatch = details.match(/(\d+x\/dia|\d+\/\d+h|SN|ACM|se necessário|contínuo)/i);
      if (freqMatch) medication.frequency = freqMatch[1];
      
      if (!medications.some(m => m.name === medication.name)) {
        medications.push(medication);
      }
    }
  }

  return medications;
}

/**
 * Extract exams from protocol text
 */
function extractExams(text: string): ExtractedExam[] {
  const exams: ExtractedExam[] = [];
  
  // Common exam patterns
  const examPatterns = [
    // Pattern: "Exame: X - Código: Y"
    /(?:Exame|Exames):\s*([^-\n]+)(?:\s*-\s*Código:\s*([^-\n]+))?/gi,
    // Pattern in lists
    /[-•]\s*((?:Hemograma|Glicemia|Ureia|Creatinina|Eletrólitos|Gasometria|ECG|Raio-X|TC|RM|US|Ecocardiograma|Troponina|D-dímero|PCR|VHS|TGO|TGP|Bilirrubina|Amilase|Lipase|TSH|T4)[^,\n]*)/gi,
    // Pattern: "Solicitar X"
    /(?:Solicitar|Realizar|Colher)\s+((?:exames?|hemograma|glicemia|ureia|creatinina|eletrólitos|gasometria|ECG|raio-x|TC|RM|US)[^.\n]+)/gi
  ];

  const examNames = new Set<string>();
  
  for (const pattern of examPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const examName = match[1]?.trim();
      if (examName && !examNames.has(examName.toLowerCase())) {
        examNames.add(examName.toLowerCase());
        const exam: ExtractedExam = { name: examName };
        
        if (match[2]) exam.code = match[2].trim();
        
        // Check for urgency indicators
        if (text.substring(match.index - 50, match.index + 100).match(/urgente|imediato|emergência|prioridade/i)) {
          exam.urgency = "Urgente";
        }
        
        exams.push(exam);
      }
    }
  }

  return exams;
}

/**
 * Extract orientations from protocol text
 */
function extractOrientations(text: string): ExtractedOrientation[] {
  const orientations: ExtractedOrientation[] = [];
  
  // Look for orientation sections
  const orientationSections = text.split(/(?:Orientações?|Recomendações?|Cuidados?|Medidas?)[\s:]+/i);
  
  for (let i = 1; i < orientationSections.length; i++) {
    const section = orientationSections[i];
    const lines = section.split(/\n/).filter(line => line.trim());
    
    for (const line of lines) {
      if (line.match(/^[-•]\s*.+/) || line.match(/^\d+[\.)]\s*.+/)) {
        const content = line.replace(/^[-•\d\.)]\s*/, '').trim();
        
        // Categorize orientation
        let category = "geral";
        if (content.match(/diet|alimenta|nutri|comer|jejum/i)) category = "dieta";
        else if (content.match(/exerc|atividade física|caminha|repouso/i)) category = "exercício";
        else if (content.match(/monitor|observ|sinais|sintomas|retorn/i)) category = "monitorização";
        else if (content.match(/medica|dose|horário/i)) category = "medicação";
        
        orientations.push({
          title: category.charAt(0).toUpperCase() + category.slice(1),
          content,
          category
        });
      }
    }
  }

  // Also extract from common patterns
  const patterns = [
    /(?:Orientar|Recomendar|Instruir)\s+(?:o\s+)?(?:paciente\s+)?(?:a\s+)?([^.]+)\./gi,
    /(?:Manter|Evitar|Suspender|Iniciar)\s+([^.]+)\./gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const content = match[1].trim();
      if (content.length > 10 && content.length < 200) {
        orientations.push({
          title: "Orientação",
          content
        });
      }
    }
  }

  return orientations;
}

/**
 * Extract referrals from protocol text
 */
function extractReferrals(text: string): string[] {
  const referrals: string[] = [];
  const referralPatterns = [
    /(?:Encaminhar|Referenciar|Solicitar avaliação)\s+(?:para\s+)?(\w+(?:\s+\w+)?)/gi,
    /(?:Avaliação|Parecer|Interconsulta)\s+(?:com\s+)?(?:a\s+)?(\w+logia|\w+logista|\w+iatra|\w+iatria)/gi
  ];

  const found = new Set<string>();
  for (const pattern of referralPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const specialty = match[1].trim();
      if (!found.has(specialty.toLowerCase())) {
        found.add(specialty.toLowerCase());
        referrals.push(specialty);
      }
    }
  }

  return referrals;
}

/**
 * Extract conducts from specific sections
 */
function extractConducts(sections: ProtocolFullContent): ExtractedConduct[] {
  const conducts: ExtractedConduct[] = [];
  
  // Focus on treatment section (8) and monitoring section (9)
  const treatmentSection = sections["8"];
  const monitoringSection = sections["9"];
  
  if (treatmentSection?.content) {
    const treatmentText = typeof treatmentSection.content === 'string' 
      ? treatmentSection.content 
      : JSON.stringify(treatmentSection.content);
    
    conducts.push({
      title: "Tratamento Inicial",
      medications: extractMedications(treatmentText),
      exams: extractExams(treatmentText),
      orientations: extractOrientations(treatmentText),
      referrals: extractReferrals(treatmentText),
      messages: []
    });
  }
  
  if (monitoringSection?.content) {
    const monitoringText = typeof monitoringSection.content === 'string'
      ? monitoringSection.content
      : JSON.stringify(monitoringSection.content);
    
    conducts.push({
      title: "Monitorização",
      medications: extractMedications(monitoringText),
      exams: extractExams(monitoringText),
      orientations: extractOrientations(monitoringText),
      referrals: extractReferrals(monitoringText),
      messages: []
    });
  }
  
  return conducts;
}

/**
 * Main function to extract all medical content from protocol
 */
export function extractMedicalContent(protocolContent: ProtocolFullContent): ExtractedMedicalContent {
  // Combine all sections into text for general extraction
  let fullText = "";
  const allMedications: ExtractedMedication[] = [];
  const allExams: ExtractedExam[] = [];
  const allOrientations: ExtractedOrientation[] = [];
  
  // Process each section
  for (const sectionKey in protocolContent) {
    const section = protocolContent[sectionKey];
    if (section?.content) {
      const sectionText = typeof section.content === 'string' 
        ? section.content 
        : JSON.stringify(section.content);
      
      fullText += `\n\n--- ${section.title} ---\n${sectionText}`;
      
      // Extract from each section
      allMedications.push(...extractMedications(sectionText));
      allExams.push(...extractExams(sectionText));
      allOrientations.push(...extractOrientations(sectionText));
    }
  }
  
  // Extract conducts from specific sections
  const conducts = extractConducts(protocolContent);
  
  // Remove duplicates
  const uniqueMedications = Array.from(
    new Map(allMedications.map(m => [m.name.toLowerCase(), m])).values()
  );
  const uniqueExams = Array.from(
    new Map(allExams.map(e => [e.name.toLowerCase(), e])).values()
  );
  
  return {
    medications: uniqueMedications,
    exams: uniqueExams,
    orientations: allOrientations,
    conducts
  };
}

/**
 * Format extracted medication for display
 */
export function formatMedication(med: ExtractedMedication): string {
  let formatted = `<p><strong>${med.name}</strong>`;
  if (med.dose) formatted += `<br/>Dose: ${med.dose}`;
  if (med.route) formatted += `<br/>Via: ${med.route}`;
  if (med.frequency) formatted += `<br/>Frequência: ${med.frequency}`;
  if (med.duration) formatted += `<br/>Duração: ${med.duration}`;
  if (med.observation) formatted += `<br/>Observação: ${med.observation}`;
  formatted += "</p>";
  return formatted;
}

/**
 * Convert extracted content to clinical flowchart format
 */
export function toFlowchartMedication(med: ExtractedMedication, index: number) {
  return {
    id: `med-${index}`,
    nome: med.name,
    descricao: "",
    condicional: "visivel" as const,
    condicao: "",
    condicionalMedicamento: "intra-hospitalar" as const,
    quantidade: 1,
    codigo: "",
    nomeMed: med.name,
    posologia: formatMedication(med),
    mensagemMedico: "",
    via: med.route || "Oral"
  };
}

export function toFlowchartExam(exam: ExtractedExam, index: number) {
  return {
    id: `exam-${index}`,
    nome: exam.name,
    descricao: "",
    condicional: "visivel" as const,
    condicao: "",
    condicionalExame: "hospitalar" as const,
    codigo: exam.code || "",
    cid: "",
    indicacao: exam.indication || "",
    alerta: exam.urgency || "",
    material: ""
  };
}

export function toFlowchartOrientation(orientation: ExtractedOrientation, index: number) {
  return {
    id: `orient-${index}`,
    nome: orientation.title,
    descricao: "",
    condicional: "visivel" as const,
    condicao: "",
    conteudo: `<p>${orientation.content}</p>`
  };
}