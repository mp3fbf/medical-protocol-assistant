#!/usr/bin/env tsx
/**
 * Test script for flowchart content enrichment
 * Tests the medical content extraction and enrichment pipeline
 */

import fs from "fs";
import path from "path";
import { extractMedicalContent } from "../src/lib/ai/extractors/medical-content-extractor";
import { enrichFlowchartContent } from "../src/lib/flowchart/content-enricher";
import { validateMedicalContent } from "../src/lib/validators/medical-content-validator";
import type { ClinicalFlowchart } from "../src/types/flowchart-clinical";
import type { ProtocolFullContent } from "../src/types/protocol";

// Test with the Constipação flowchart
const FLOWCHART_PATH = path.join(__dirname, "../examples/flowchart-Constipação.json");
const OUTPUT_PATH = path.join(__dirname, "../examples/flowchart-Constipação-enriched.json");

// Mock protocol content for testing
const mockProtocolContent: ProtocolFullContent = {
  "8": {
    sectionNumber: "8",
    title: "Tratamento",
    content: `
    Tratamento da Constipação Intestinal:
    
    1. Medidas não-farmacológicas (primeira linha):
    - Aumentar ingesta hídrica para 2-3 litros/dia
    - Dieta rica em fibras (25-30g/dia)
    - Atividade física regular (30 minutos/dia)
    - Estabelecer rotina de evacuação
    
    2. Tratamento farmacológico:
    
    a) Laxantes formadores de massa:
    - Psyllium: 1 envelope (5g) VO 1-3x/dia com água
    - Metilcelulose: 2g VO até 3x/dia
    
    b) Laxantes osmóticos:
    - Lactulose: 15-30ml VO 1-2x/dia
    - Polietilenoglicol (PEG): 17g VO 1x/dia dissolvido em água
    - Hidróxido de magnésio: 30-60ml VO ao deitar
    
    c) Laxantes estimulantes (uso eventual):
    - Bisacodil: 5-10mg VO ao deitar
    - Sene: 1-2 comprimidos VO ao deitar
    
    d) Supositórios e enemas (alívio rápido):
    - Glicerina supositório: 1 unidade VR se necessário
    - Fleet enema: 1 unidade VR se necessário
    
    3. Tratamento de segunda linha (constipação refratária):
    - Linaclotida: 145mcg VO 1x/dia
    - Prucaloprida: 2mg VO 1x/dia
    `
  },
  "6": {
    sectionNumber: "6",
    title: "Exames Complementares",
    content: `
    Exames para investigação de constipação:
    
    1. Exames laboratoriais:
    - Hemograma completo
    - Glicemia de jejum
    - TSH e T4 livre
    - Eletrólitos (Na, K, Ca, Mg)
    - Ureia e creatinina
    
    2. Exames de imagem:
    - Radiografia simples de abdome (avaliar fecaloma)
    - Colonoscopia (>50 anos ou sinais de alarme)
    - Tempo de trânsito colônico com marcadores radiopacos
    
    3. Exames funcionais:
    - Manometria anorretal
    - Defecografia
    - Teste de expulsão do balão
    `
  },
  "9": {
    sectionNumber: "9",
    title: "Monitorização",
    content: `
    Monitorização do tratamento:
    
    - Avaliar resposta terapêutica em 2-4 semanas
    - Ajustar dose de laxantes conforme resposta
    - Monitorar eletrólitos se uso prolongado de laxantes
    - Reavaliar necessidade de exames se sem melhora em 3 meses
    - Orientar diário de hábito intestinal
    `
  }
};

async function testEnrichment() {
  console.log("🧪 Testing Flowchart Content Enrichment\n");

  try {
    // 1. Load the problematic flowchart
    console.log("1️⃣ Loading flowchart from:", FLOWCHART_PATH);
    const flowchartContent = fs.readFileSync(FLOWCHART_PATH, "utf-8");
    const flowchart: ClinicalFlowchart = JSON.parse(flowchartContent);
    
    console.log(`   ✓ Loaded flowchart with ${flowchart.nodes.length} nodes\n`);

    // 2. Extract medical content from mock protocol
    console.log("2️⃣ Extracting medical content from protocol...");
    const extractedContent = extractMedicalContent(mockProtocolContent);
    
    console.log(`   ✓ Extracted:`);
    console.log(`     - ${extractedContent.medications.length} medications`);
    console.log(`     - ${extractedContent.exams.length} exams`);
    console.log(`     - ${extractedContent.orientations.length} orientations`);
    console.log(`     - ${extractedContent.conducts.length} conducts\n`);

    // Show some extracted content
    if (extractedContent.medications.length > 0) {
      console.log("   Sample medications:");
      extractedContent.medications.slice(0, 3).forEach(med => {
        console.log(`     - ${med.name}: ${med.dose || "N/A"} ${med.route || ""} ${med.frequency || ""}`);
      });
      console.log();
    }

    // 3. Validate original flowchart
    console.log("3️⃣ Validating original flowchart...");
    const originalValidation = validateMedicalContent(flowchart, extractedContent);
    
    console.log(`   Original flowchart validation:`);
    console.log(`     - Valid: ${originalValidation.isValid}`);
    console.log(`     - Empty conduct nodes: ${originalValidation.statistics.emptyConductNodes}/${originalValidation.statistics.conductNodes}`);
    console.log(`     - Total medications: ${originalValidation.statistics.totalMedications}`);
    console.log(`     - Total exams: ${originalValidation.statistics.totalExams}`);
    console.log(`     - Errors: ${originalValidation.errors.length}`);
    console.log(`     - Warnings: ${originalValidation.warnings.length}\n`);

    // 4. Enrich the flowchart
    console.log("4️⃣ Enriching flowchart with extracted content...");
    const enrichmentResult = enrichFlowchartContent(flowchart, extractedContent);
    
    console.log(`   Enrichment results:`);
    console.log(`     - Nodes enriched: ${enrichmentResult.statistics.nodesEnriched}`);
    console.log(`     - Medications added: ${enrichmentResult.statistics.medicationsAdded}`);
    console.log(`     - Exams added: ${enrichmentResult.statistics.examsAdded}`);
    console.log(`     - Orientations added: ${enrichmentResult.statistics.orientationsAdded}\n`);

    // Show modifications
    if (enrichmentResult.modifications.length > 0) {
      console.log("   Modifications made:");
      enrichmentResult.modifications.slice(0, 5).forEach(mod => {
        console.log(`     - Node "${mod.nodeLabel}": Added ${mod.itemsAdded} ${mod.type}`);
      });
      console.log();
    }

    // 5. Validate enriched flowchart
    console.log("5️⃣ Validating enriched flowchart...");
    const enrichedValidation = validateMedicalContent(enrichmentResult.enrichedFlowchart, extractedContent);
    
    console.log(`   Enriched flowchart validation:`);
    console.log(`     - Valid: ${enrichedValidation.isValid}`);
    console.log(`     - Empty conduct nodes: ${enrichedValidation.statistics.emptyConductNodes}/${enrichedValidation.statistics.conductNodes}`);
    console.log(`     - Total medications: ${enrichedValidation.statistics.totalMedications}`);
    console.log(`     - Total exams: ${enrichedValidation.statistics.totalExams}`);
    console.log(`     - Medication coverage: ${enrichedValidation.statistics.medicationCoverage.toFixed(1)}%`);
    console.log(`     - Exam coverage: ${enrichedValidation.statistics.examCoverage.toFixed(1)}%\n`);

    // 6. Save enriched flowchart
    console.log("6️⃣ Saving enriched flowchart to:", OUTPUT_PATH);
    fs.writeFileSync(
      OUTPUT_PATH,
      JSON.stringify(enrichmentResult.enrichedFlowchart, null, 2),
      "utf-8"
    );
    console.log("   ✓ Saved successfully!\n");

    // 7. Summary
    console.log("📊 Summary:");
    console.log(`   Before enrichment: ${originalValidation.statistics.totalMedications} medications, ${originalValidation.statistics.totalExams} exams`);
    console.log(`   After enrichment: ${enrichedValidation.statistics.totalMedications} medications, ${enrichedValidation.statistics.totalExams} exams`);
    console.log(`   Improvement: ${enrichmentResult.statistics.nodesEnriched} nodes now have medical content\n`);

    console.log("✅ Test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testEnrichment();