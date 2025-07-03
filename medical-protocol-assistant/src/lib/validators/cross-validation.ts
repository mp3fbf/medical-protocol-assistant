/**
 * Cross-Validation Rules: Text vs. Flowchart.
 *
 * These validators ensure consistency between the textual content of the protocol
 * and its visual flowchart representation.
 */
import type { ProtocolFullContent, FlowchartData } from "@/types/protocol";
import type {
  ValidationIssue,
  ValidatorFunction,
  ValidationRuleDefinition,
} from "@/types/validation";
import type {
  CustomFlowNode,
  DecisionNodeData,
  MedicationNodeData,
  FlowchartMedication,
} from "@/types/flowchart";

interface TextualDecision {
  text: string;
  sectionNumber: number;
  keywords: string[]; // Normalized keywords for matching
}

interface TextualMedication {
  name: string; // Normalized name
  originalName: string;
  sectionNumber: number;
}

const COMMON_MEDICAL_ABBREVIATIONS_AND_SYMBOLS = [
  "pas",
  "pad",
  "pa",
  "fc",
  "fr",
  "sao2",
  "sato2",
  "o2",
  "co2",
  "ph",
  "hco3",
  "hb",
  "ht",
  "plt",
  "leuco",
  "glasgow",
  "gcs",
  "temp",
  "glicemia",
  "mgdl",
  "mmol",
  "mmoll",
  "ui",
  "mcg",
  "mg",
  "ml",
  "kg",
  "min",
  "hr",
  "iv",
  "vo",
  "im",
  "sc",
  "<",
  ">",
  "<=",
  ">=",
  "mmhg",
  "bpm",
  "spo2",
];

function normalizeTextForKeywordExtraction(text: string): string {
  return text
    .toLowerCase()
    .replace(/[#,:;“”"“()\/%\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getKeywordsFromText(text: string): string[] {
  const normalized = normalizeTextForKeywordExtraction(text);
  return normalized
    .split(/\s+/)
    .map((kw) => kw.replace(/\.$/, ""))
    .filter(
      (kw) =>
        kw.length > 1 ||
        COMMON_MEDICAL_ABBREVIATIONS_AND_SYMBOLS.includes(kw) ||
        !isNaN(parseFloat(kw)),
    );
}

function extractDecisionsFromText(
  protocolContent: ProtocolFullContent,
): TextualDecision[] {
  const decisions: TextualDecision[] = [];
  const relevantSectionKeys = ["4", "5", "6", "7", "9"];

  for (const sectionKey of relevantSectionKeys) {
    const section = protocolContent[sectionKey];
    if (!section) continue;

    const processContent = (content: any, currentSectionNumber: number) => {
      if (typeof content === "string") {
        const text = content;
        // Regex: Looks for trigger words, then captures everything non-greedily ([\s\S]+?)
        // until it hits a positive lookahead for:
        // 1. A period followed by space(s) and an uppercase letter (strong sentence end).
        // 2. A semicolon followed by optional space(s) and a non-space character.
        // 3. Consequence keywords like "então", "then", "resulta em".
        // 4. End of the string.
        const matches = text.matchAll(
          /(?:se|if|caso|quando|critério\s*:\s*|avaliar\s*se)\s*([\s\S]+?)(?=(?:\.\s+[A-ZÀ-ÖØ-Þ])|;\s*\S|(?:\s+ou\s+)?\s*(?:então|then|resulta em)|$)/gim,
        );
        for (const match of matches) {
          let decisionText = match[0].trim();
          let conditionPart = match[1].trim();

          conditionPart = conditionPart
            .replace(/\s*(?:então|then|resulta em)\s*.*?$/i, "")
            .trim();
          decisionText = decisionText
            .replace(/\s*(?:então|then|resulta em)\s*.*?$/i, "")
            .trim();

          if (conditionPart.length > 3) {
            decisions.push({
              text: decisionText,
              sectionNumber: currentSectionNumber,
              keywords: getKeywordsFromText(conditionPart),
            });
          }
        }
      } else if (Array.isArray(content)) {
        content.forEach((item) => {
          if (typeof item === "string")
            processContent(item, currentSectionNumber);
          else if (typeof item === "object" && item !== null) {
            Object.values(item).forEach((value) =>
              processContent(value, currentSectionNumber),
            );
          }
        });
      } else if (typeof content === "object" && content !== null) {
        if (currentSectionNumber === 4) {
          const incl = (content as any).inclusao;
          const excl = (content as any).exclusao;
          if (Array.isArray(incl))
            incl.forEach((item) =>
              processContent(
                `Critério de inclusão: ${item}`,
                currentSectionNumber,
              ),
            );
          if (Array.isArray(excl))
            excl.forEach((item) =>
              processContent(
                `Critério de exclusão: ${item}`,
                currentSectionNumber,
              ),
            );
        } else if (
          currentSectionNumber === 5 &&
          Array.isArray((content as any).criteriosRiscoGravidade)
        ) {
          (content as any).criteriosRiscoGravidade.forEach((crit: any) => {
            if (crit.criterio) {
              const decisionText =
                `${crit.criterio}: ${crit.descricao || ""} ${crit.limiarNumericoOuEstado || ""}`.trim();
              decisions.push({
                text: decisionText,
                sectionNumber: currentSectionNumber,
                keywords: getKeywordsFromText(decisionText),
              });
            }
          });
        } else if (currentSectionNumber === 9) {
          const intern = (content as any).criteriosInternacao;
          const alta = (content as any).criteriosAltaHospitalarPA;
          if (Array.isArray(intern))
            intern.forEach((item) =>
              processContent(
                `Critério de internação: ${item}`,
                currentSectionNumber,
              ),
            );
          if (Array.isArray(alta))
            alta.forEach((item) =>
              processContent(`Critério de alta: ${item}`, currentSectionNumber),
            );
        } else {
          Object.values(content).forEach((value) =>
            processContent(value, currentSectionNumber),
          );
        }
      }
    };
    processContent(section.content, section.sectionNumber);
  }
  return decisions;
}

function extractMedicationsFromText(
  protocolContent: ProtocolFullContent,
): TextualMedication[] {
  const medications: TextualMedication[] = [];
  const section7 = protocolContent["7"];

  if (section7 && typeof section7.content === "object" && section7.content) {
    const content = section7.content as any;
    const processMedsArray = (medArray: any[]) => {
      if (Array.isArray(medArray)) {
        medArray.forEach((med: any) => {
          if (med && typeof med.name === "string" && med.name.trim() !== "") {
            medications.push({
              name: med.name.toLowerCase().trim(),
              originalName: med.name,
              sectionNumber: 7,
            });
          }
        });
      }
    };
    processMedsArray(content.tratamentoPacientesInstaveis?.medicamentos);
    processMedsArray(
      content.tratamentoPacientesEstaveis?.medicamentosConsiderar,
    );
  }
  return medications;
}

function significantKeywordOverlap(
  textKeywords: string[],
  flowchartCriteriaKeywords: string[],
  threshold = 0.5,
): boolean {
  if (textKeywords.length === 0 || flowchartCriteriaKeywords.length === 0)
    return false;

  const uniqueTextKeywords = [...new Set(textKeywords)];
  const uniqueFlowchartKeywords = [...new Set(flowchartCriteriaKeywords)];

  const matchCount = uniqueTextKeywords.filter((kw) =>
    uniqueFlowchartKeywords.includes(kw),
  ).length;

  if (matchCount === 0) return false;

  const minLength = Math.min(
    uniqueTextKeywords.length,
    uniqueFlowchartKeywords.length,
  );
  if (minLength === 0) return false;

  return matchCount / minLength >= threshold;
}

const checkTextElementsInFlowchart: ValidatorFunction = (
  protocolContent,
  protocolFlowchart,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!protocolFlowchart) return issues;

  const textualDecisions = extractDecisionsFromText(protocolContent);
  const textualMedications = extractMedicationsFromText(protocolContent);

  const flowchartDecisionNodes = protocolFlowchart.nodes.filter(
    (n): n is CustomFlowNode & { data: DecisionNodeData } =>
      n.type === "decision",
  );
  const flowchartMedicationNodes = protocolFlowchart.nodes.filter(
    (n): n is CustomFlowNode & { data: MedicationNodeData } =>
      n.type === "medication",
  );

  textualDecisions.forEach((tDecision) => {
    const foundInFlowchart = flowchartDecisionNodes.some((fNode) => {
      const fNodeKeywords = getKeywordsFromText(fNode.data.criteria || "");
      return significantKeywordOverlap(tDecision.keywords, fNodeKeywords);
    });
    if (!foundInFlowchart && tDecision.keywords.length > 0) {
      issues.push({
        ruleId: "CROSS_TEXT_DECISION_MISSING_IN_FLOWCHART",
        sectionNumber: tDecision.sectionNumber,
        message: `Decisão textual "${tDecision.text.substring(0, 70)}..." (Seção ${tDecision.sectionNumber}) não parece ter um nó de decisão correspondente claro no fluxograma. Palavras-chave extraídas do texto: [${tDecision.keywords.join(", ")}]`,
        severity: "warning",
        category: "FLOWCHART_CONSISTENCY",
        details: {
          textualDecision: tDecision.text,
          keywords: tDecision.keywords,
        },
      });
    }
  });

  textualMedications.forEach((tMed) => {
    const foundInFlowchart = flowchartMedicationNodes.some((fNode) =>
      fNode.data.medications?.some(
        (fMed: FlowchartMedication) =>
          fMed.name.toLowerCase().trim() === tMed.name,
      ),
    );
    if (!foundInFlowchart) {
      issues.push({
        ruleId: "CROSS_TEXT_MED_MISSING_IN_FLOWCHART",
        sectionNumber: tMed.sectionNumber,
        message: `Medicamento "${tMed.originalName}" (Seção ${tMed.sectionNumber}) não encontrado em nós de medicação do fluxograma.`,
        severity: "warning",
        category: "FLOWCHART_CONSISTENCY",
        details: { medicationName: tMed.originalName },
      });
    }
  });

  return issues;
};

const checkFlowchartElementsInText: ValidatorFunction = (
  protocolContent,
  protocolFlowchart,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!protocolFlowchart) return issues;

  const textualDecisions = extractDecisionsFromText(protocolContent);
  const textualMedications = extractMedicationsFromText(protocolContent);

  protocolFlowchart.nodes
    .filter(
      (n): n is CustomFlowNode & { data: DecisionNodeData } =>
        n.type === "decision",
    )
    .forEach((fNode) => {
      const fNodeKeywords = getKeywordsFromText(fNode.data.criteria || "");

      const foundInText = textualDecisions.some((tDecision) =>
        significantKeywordOverlap(fNodeKeywords, tDecision.keywords),
      );
      if (!foundInText && fNodeKeywords.length > 0) {
        issues.push({
          ruleId: "CROSS_FLOWCHART_DECISION_MISSING_IN_TEXT",
          message: `O critério de decisão do fluxograma "${fNode.data.criteria}" (Nó: ${fNode.data.title}) não parece ter uma menção correspondente clara no texto do protocolo. Palavras-chave do nó: [${fNodeKeywords.join(", ")}]`,
          severity: "warning",
          category: "FLOWCHART_CONSISTENCY",
          details: {
            nodeId: fNode.id,
            nodeTitle: fNode.data.title,
            criteria: fNode.data.criteria,
            flowchartKeywords: fNodeKeywords,
          },
        });
      }
    });

  protocolFlowchart.nodes
    .filter(
      (n): n is CustomFlowNode & { data: MedicationNodeData } =>
        n.type === "medication",
    )
    .forEach((fNode) => {
      fNode.data.medications?.forEach((fMed: FlowchartMedication) => {
        const normalizedFMedName = fMed.name.toLowerCase().trim();
        const foundInText = textualMedications.some(
          (tMed) => tMed.name === normalizedFMedName,
        );
        if (!foundInText) {
          issues.push({
            ruleId: "CROSS_FLOWCHART_MED_MISSING_IN_TEXT",
            message: `Medicamento "${fMed.name}" (Nó de fluxograma: ${fNode.data.title}) não parece ter uma menção correspondente clara no texto do protocolo (Seção 7).`,
            severity: "warning",
            category: "FLOWCHART_CONSISTENCY",
            details: {
              nodeId: fNode.id,
              nodeTitle: fNode.data.title,
              medicationName: fMed.name,
            },
          });
        }
      });
    });
  return issues;
};

export const CROSS_VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    id: "CROSS_TEXT_ELEMENTS_IN_FLOWCHART",
    description:
      "Ensures decisions and medications from the protocol text are represented in the flowchart.",
    severity: "warning",
    category: "FLOWCHART_CONSISTENCY",
    check: checkTextElementsInFlowchart,
  },
  {
    id: "CROSS_FLOWCHART_ELEMENTS_IN_TEXT",
    description:
      "Ensures decision nodes and medication nodes in the flowchart are reflected in the protocol text.",
    severity: "warning",
    category: "FLOWCHART_CONSISTENCY",
    check: checkFlowchartElementsInText,
  },
];

export const validateCrossConsistency = async (
  protocolContent: ProtocolFullContent,
  protocolFlowchart?: FlowchartData,
): Promise<ValidationIssue[]> => {
  if (!protocolFlowchart) {
    return [
      {
        ruleId: "CROSS_FLOWCHART_MISSING",
        message: "Fluxograma não fornecido para validação cruzada.",
        severity: "warning",
        category: "FLOWCHART_CONSISTENCY",
      },
    ];
  }

  let allIssues: ValidationIssue[] = [];
  for (const rule of CROSS_VALIDATION_RULES) {
    const ruleIssuesResult = await rule.check(
      protocolContent,
      protocolFlowchart,
    );
    allIssues = allIssues.concat(ruleIssuesResult);
  }
  return allIssues;
};
