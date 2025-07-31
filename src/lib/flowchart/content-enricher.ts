/**
 * Content enricher for clinical flowcharts
 * Fills empty conduct nodes with extracted medical content
 */

import type { 
  ClinicalFlowchart, 
  ClinicalNode, 
  ConductNodeData,
  Medicamento,
  Exame,
  Orientacao
} from "@/types/flowchart-clinical";
import type { ExtractedMedicalContent, ExtractedConduct } from "@/lib/ai/extractors/medical-content-extractor";
import { 
  toFlowchartMedication, 
  toFlowchartExam, 
  toFlowchartOrientation 
} from "@/lib/ai/extractors/medical-content-extractor";
import { isConductNode, hasConductData } from "@/types/flowchart-clinical";

export interface EnrichmentResult {
  enrichedFlowchart: ClinicalFlowchart;
  modifications: EnrichmentModification[];
  statistics: EnrichmentStatistics;
}

export interface EnrichmentModification {
  nodeId: string;
  nodeLabel: string;
  type: "medications" | "exams" | "orientations" | "referrals" | "messages";
  itemsAdded: number;
  items: string[];
}

export interface EnrichmentStatistics {
  nodesEnriched: number;
  medicationsAdded: number;
  examsAdded: number;
  orientationsAdded: number;
  referralsAdded: number;
  messagesAdded: number;
}

/**
 * Enrich flowchart with extracted medical content
 */
export function enrichFlowchartContent(
  flowchart: ClinicalFlowchart,
  extractedContent: ExtractedMedicalContent
): EnrichmentResult {
  // Deep clone the flowchart to avoid mutations
  const enrichedFlowchart: ClinicalFlowchart = JSON.parse(JSON.stringify(flowchart));
  const modifications: EnrichmentModification[] = [];
  const statistics: EnrichmentStatistics = {
    nodesEnriched: 0,
    medicationsAdded: 0,
    examsAdded: 0,
    orientationsAdded: 0,
    referralsAdded: 0,
    messagesAdded: 0
  };

  // Create pools of content to distribute
  const medicationPool = [...extractedContent.medications];
  const examPool = [...extractedContent.exams];
  const orientationPool = [...extractedContent.orientations];

  // Process each node
  for (const node of enrichedFlowchart.nodes) {
    if (isConductNode(node)) {
      const enrichmentMods = enrichConductNode(
        node,
        medicationPool,
        examPool,
        orientationPool,
        extractedContent.conducts
      );

      if (enrichmentMods.length > 0) {
        statistics.nodesEnriched++;
        modifications.push(...enrichmentMods);

        // Update statistics
        for (const mod of enrichmentMods) {
          switch (mod.type) {
            case "medications":
              statistics.medicationsAdded += mod.itemsAdded;
              break;
            case "exams":
              statistics.examsAdded += mod.itemsAdded;
              break;
            case "orientations":
              statistics.orientationsAdded += mod.itemsAdded;
              break;
            case "referrals":
              statistics.referralsAdded += mod.itemsAdded;
              break;
            case "messages":
              statistics.messagesAdded += mod.itemsAdded;
              break;
          }
        }
      }
    }
  }

  // If there are still items in pools and empty nodes, do a second pass
  if (medicationPool.length > 0 || examPool.length > 0 || orientationPool.length > 0) {
    for (const node of enrichedFlowchart.nodes) {
      if (isConductNode(node) && isNodeEmpty(node.data)) {
        const additionalMods = forceEnrichNode(
          node,
          medicationPool,
          examPool,
          orientationPool
        );

        if (additionalMods.length > 0) {
          statistics.nodesEnriched++;
          modifications.push(...additionalMods);

          // Update statistics
          for (const mod of additionalMods) {
            switch (mod.type) {
              case "medications":
                statistics.medicationsAdded += mod.itemsAdded;
                break;
              case "exams":
                statistics.examsAdded += mod.itemsAdded;
                break;
              case "orientations":
                statistics.orientationsAdded += mod.itemsAdded;
                break;
            }
          }
        }
      }
    }
  }

  return {
    enrichedFlowchart,
    modifications,
    statistics
  };
}

/**
 * Enrich a single conduct node
 */
function enrichConductNode(
  node: ClinicalNode & { data: ConductNodeData },
  medicationPool: ExtractedMedicalContent["medications"],
  examPool: ExtractedMedicalContent["exams"],
  orientationPool: ExtractedMedicalContent["orientations"],
  conducts: ExtractedConduct[]
): EnrichmentModification[] {
  const modifications: EnrichmentModification[] = [];
  const nodeLabel = node.data.label?.toLowerCase() || "";

  // Ensure node has condutaDataNode
  if (!hasConductData(node.data)) {
    node.data.condutaDataNode = {
      orientacao: [],
      exame: [],
      medicamento: [],
      encaminhamento: [],
      mensagem: []
    };
  }

  const condutaData = node.data.condutaDataNode;

  // Match node to extracted conducts by label similarity
  const matchingConduct = findMatchingConduct(node.data.label, conducts);

  // Add medications
  if (condutaData.medicamento.length === 0) {
    const medicationsToAdd = selectMedicationsForNode(
      nodeLabel,
      medicationPool,
      matchingConduct
    );

    if (medicationsToAdd.length > 0) {
      const flowchartMeds = medicationsToAdd.map((med, idx) => 
        toFlowchartMedication(med, condutaData.medicamento.length + idx)
      );
      
      condutaData.medicamento.push(...flowchartMeds);
      
      modifications.push({
        nodeId: node.id,
        nodeLabel: node.data.label,
        type: "medications",
        itemsAdded: medicationsToAdd.length,
        items: medicationsToAdd.map(m => m.name)
      });

      // Remove used medications from pool
      medicationsToAdd.forEach(med => {
        const index = medicationPool.findIndex(m => m.name === med.name);
        if (index > -1) medicationPool.splice(index, 1);
      });
    }
  }

  // Add exams
  if (condutaData.exame.length === 0) {
    const examsToAdd = selectExamsForNode(
      nodeLabel,
      examPool,
      matchingConduct
    );

    if (examsToAdd.length > 0) {
      const flowchartExams = examsToAdd.map((exam, idx) => 
        toFlowchartExam(exam, condutaData.exame.length + idx)
      );
      
      condutaData.exame.push(...flowchartExams);
      
      modifications.push({
        nodeId: node.id,
        nodeLabel: node.data.label,
        type: "exams",
        itemsAdded: examsToAdd.length,
        items: examsToAdd.map(e => e.name)
      });

      // Remove used exams from pool
      examsToAdd.forEach(exam => {
        const index = examPool.findIndex(e => e.name === exam.name);
        if (index > -1) examPool.splice(index, 1);
      });
    }
  }

  // Add orientations
  if (condutaData.orientacao.length === 0) {
    const orientationsToAdd = selectOrientationsForNode(
      nodeLabel,
      orientationPool,
      matchingConduct
    );

    if (orientationsToAdd.length > 0) {
      const flowchartOrientations = orientationsToAdd.map((orientation, idx) => 
        toFlowchartOrientation(orientation, condutaData.orientacao.length + idx)
      );
      
      condutaData.orientacao.push(...flowchartOrientations);
      
      modifications.push({
        nodeId: node.id,
        nodeLabel: node.data.label,
        type: "orientations",
        itemsAdded: orientationsToAdd.length,
        items: orientationsToAdd.map(o => o.title)
      });

      // Remove used orientations from pool
      orientationsToAdd.forEach(orientation => {
        const index = orientationPool.findIndex(o => o.content === orientation.content);
        if (index > -1) orientationPool.splice(index, 1);
      });
    }
  }

  // Add referrals from matching conduct
  if (matchingConduct && matchingConduct.referrals.length > 0 && condutaData.encaminhamento.length === 0) {
    const referrals = matchingConduct.referrals.map((ref, idx) => ({
      id: `ref-${idx}`,
      nome: `Encaminhamento para ${ref}`,
      descricao: "",
      condicional: "visivel" as const,
      condicao: "",
      especialidade: ref,
      motivo: ""
    }));

    condutaData.encaminhamento.push(...referrals);

    modifications.push({
      nodeId: node.id,
      nodeLabel: node.data.label,
      type: "referrals",
      itemsAdded: referrals.length,
      items: matchingConduct.referrals
    });
  }

  return modifications;
}

/**
 * Force enrich an empty node with remaining content
 */
function forceEnrichNode(
  node: ClinicalNode & { data: ConductNodeData },
  medicationPool: ExtractedMedicalContent["medications"],
  examPool: ExtractedMedicalContent["exams"],
  orientationPool: ExtractedMedicalContent["orientations"]
): EnrichmentModification[] {
  const modifications: EnrichmentModification[] = [];
  const condutaData = node.data.condutaDataNode!;

  // Add up to 3 medications if available
  if (medicationPool.length > 0 && condutaData.medicamento.length === 0) {
    const medsToAdd = medicationPool.splice(0, Math.min(3, medicationPool.length));
    const flowchartMeds = medsToAdd.map((med, idx) => toFlowchartMedication(med, idx));
    condutaData.medicamento.push(...flowchartMeds);

    modifications.push({
      nodeId: node.id,
      nodeLabel: node.data.label,
      type: "medications",
      itemsAdded: medsToAdd.length,
      items: medsToAdd.map(m => m.name)
    });
  }

  // Add up to 2 exams if available
  if (examPool.length > 0 && condutaData.exame.length === 0) {
    const examsToAdd = examPool.splice(0, Math.min(2, examPool.length));
    const flowchartExams = examsToAdd.map((exam, idx) => toFlowchartExam(exam, idx));
    condutaData.exame.push(...flowchartExams);

    modifications.push({
      nodeId: node.id,
      nodeLabel: node.data.label,
      type: "exams",
      itemsAdded: examsToAdd.length,
      items: examsToAdd.map(e => e.name)
    });
  }

  // Add up to 2 orientations if available
  if (orientationPool.length > 0 && condutaData.orientacao.length === 0) {
    const orientationsToAdd = orientationPool.splice(0, Math.min(2, orientationPool.length));
    const flowchartOrientations = orientationsToAdd.map((o, idx) => toFlowchartOrientation(o, idx));
    condutaData.orientacao.push(...flowchartOrientations);

    modifications.push({
      nodeId: node.id,
      nodeLabel: node.data.label,
      type: "orientations",
      itemsAdded: orientationsToAdd.length,
      items: orientationsToAdd.map(o => o.title)
    });
  }

  return modifications;
}

/**
 * Select medications appropriate for a node
 */
function selectMedicationsForNode(
  nodeLabel: string,
  medicationPool: ExtractedMedicalContent["medications"],
  matchingConduct?: ExtractedConduct
): ExtractedMedicalContent["medications"] {
  // First try medications from matching conduct
  if (matchingConduct && matchingConduct.medications.length > 0) {
    return matchingConduct.medications;
  }

  // Otherwise select based on node label keywords
  const selected: ExtractedMedicalContent["medications"] = [];
  
  for (const med of medicationPool) {
    const medName = med.name.toLowerCase();
    
    // Match medications to node context
    if (
      (nodeLabel.includes("dor") && (medName.includes("analg") || medName.includes("morfi") || medName.includes("dipirona"))) ||
      (nodeLabel.includes("infecção") && (medName.includes("antibi") || medName.includes("cilina"))) ||
      (nodeLabel.includes("inflama") && (medName.includes("anti-inflam") || medName.includes("cortic"))) ||
      (nodeLabel.includes("inicial") || nodeLabel.includes("primár")) ||
      (nodeLabel.includes("tratamento") && selected.length < 3)
    ) {
      selected.push(med);
      if (selected.length >= 3) break; // Limit medications per node
    }
  }

  // If no specific matches, take first available
  if (selected.length === 0 && medicationPool.length > 0) {
    selected.push(...medicationPool.slice(0, 2));
  }

  return selected;
}

/**
 * Select exams appropriate for a node
 */
function selectExamsForNode(
  nodeLabel: string,
  examPool: ExtractedMedicalContent["exams"],
  matchingConduct?: ExtractedConduct
): ExtractedMedicalContent["exams"] {
  // First try exams from matching conduct
  if (matchingConduct && matchingConduct.exams.length > 0) {
    return matchingConduct.exams;
  }

  // Otherwise select based on node label keywords
  const selected: ExtractedMedicalContent["exams"] = [];
  
  for (const exam of examPool) {
    const examName = exam.name.toLowerCase();
    
    // Match exams to node context
    if (
      (nodeLabel.includes("diagnóstico") || nodeLabel.includes("avaliação")) ||
      (nodeLabel.includes("laboratório") && examName.match(/hemograma|glicemia|ureia|creatinina/)) ||
      (nodeLabel.includes("imagem") && examName.match(/raio|tc|rm|eco|ultra/)) ||
      (nodeLabel.includes("inicial") && exam.urgency === "Urgente") ||
      (nodeLabel.includes("investigar") && selected.length < 2)
    ) {
      selected.push(exam);
      if (selected.length >= 3) break; // Limit exams per node
    }
  }

  // If no specific matches, take first available
  if (selected.length === 0 && examPool.length > 0) {
    selected.push(...examPool.slice(0, 2));
  }

  return selected;
}

/**
 * Select orientations appropriate for a node
 */
function selectOrientationsForNode(
  nodeLabel: string,
  orientationPool: ExtractedMedicalContent["orientations"],
  matchingConduct?: ExtractedConduct
): ExtractedMedicalContent["orientations"] {
  // First try orientations from matching conduct
  if (matchingConduct && matchingConduct.orientations.length > 0) {
    return matchingConduct.orientations;
  }

  // Otherwise select based on node label keywords and category
  const selected: ExtractedMedicalContent["orientations"] = [];
  
  for (const orientation of orientationPool) {
    // Match orientations to node context
    if (
      (nodeLabel.includes("alta") && orientation.category === "monitorização") ||
      (nodeLabel.includes("diet") && orientation.category === "dieta") ||
      (nodeLabel.includes("exerc") && orientation.category === "exercício") ||
      (nodeLabel.includes("orienta") || nodeLabel.includes("cuidado")) ||
      selected.length < 2
    ) {
      selected.push(orientation);
      if (selected.length >= 3) break;
    }
  }

  return selected;
}

/**
 * Find matching conduct by label similarity
 */
function findMatchingConduct(
  nodeLabel: string,
  conducts: ExtractedConduct[]
): ExtractedConduct | undefined {
  const label = nodeLabel.toLowerCase();
  
  // Direct match
  for (const conduct of conducts) {
    const conductTitle = conduct.title.toLowerCase();
    if (label.includes(conductTitle) || conductTitle.includes(label)) {
      return conduct;
    }
  }

  // Keyword match
  for (const conduct of conducts) {
    const conductTitle = conduct.title.toLowerCase();
    const keywords = ["tratamento", "monitorização", "inicial", "seguimento"];
    
    for (const keyword of keywords) {
      if (label.includes(keyword) && conductTitle.includes(keyword)) {
        return conduct;
      }
    }
  }

  return undefined;
}

/**
 * Check if a conduct node is empty
 */
function isNodeEmpty(data: ConductNodeData): boolean {
  if (!hasConductData(data)) return true;
  
  const condutaData = data.condutaDataNode!;
  return (
    condutaData.medicamento.length === 0 &&
    condutaData.exame.length === 0 &&
    condutaData.orientacao.length === 0 &&
    condutaData.encaminhamento.length === 0 &&
    condutaData.mensagem.length === 0
  );
}

/**
 * Generate enrichment report
 */
export function generateEnrichmentReport(result: EnrichmentResult): string {
  let report = "## Enrichment Report\n\n";
  
  report += `### Summary\n`;
  report += `- Nodes enriched: ${result.statistics.nodesEnriched}\n`;
  report += `- Medications added: ${result.statistics.medicationsAdded}\n`;
  report += `- Exams added: ${result.statistics.examsAdded}\n`;
  report += `- Orientations added: ${result.statistics.orientationsAdded}\n`;
  report += `- Referrals added: ${result.statistics.referralsAdded}\n`;
  report += `- Messages added: ${result.statistics.messagesAdded}\n\n`;
  
  if (result.modifications.length > 0) {
    report += `### Modifications\n`;
    for (const mod of result.modifications) {
      report += `\n#### Node: ${mod.nodeLabel} (${mod.nodeId})\n`;
      report += `- Type: ${mod.type}\n`;
      report += `- Items added: ${mod.itemsAdded}\n`;
      report += `- Items: ${mod.items.join(", ")}\n`;
    }
  }
  
  return report;
}