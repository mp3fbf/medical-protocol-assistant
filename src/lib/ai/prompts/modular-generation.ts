/**
 * Modular Protocol Generation Prompts
 *
 * This module implements a sophisticated multi-stage generation approach
 * where the protocol is built progressively in logical groups, allowing
 * for deeper, more detailed content in each section.
 */

import type { AIResearchData } from "@/types/research";
import type { ProtocolFullContent } from "@/types/protocol";

/**
 * Groups of related sections for modular generation
 */
export const SECTION_GROUPS = {
  // Group 1: Foundation - Sets the basis for the entire protocol
  IDENTIFICATION_AND_CONTEXT: {
    name: "Identificação e Contexto",
    sections: [1, 2, 3],
    description: "Metadados, responsabilidades e conceitos fundamentais",
  },

  // Group 2: Clinical Criteria - Defines who and how to assess
  CLINICAL_CRITERIA: {
    name: "Critérios Clínicos",
    sections: [4, 5, 6],
    description: "Inclusão/exclusão, avaliação inicial e diagnóstico",
  },

  // Group 3: Treatment - Core therapeutic approach
  TREATMENT: {
    name: "Tratamento",
    sections: [7, 8],
    description: "Abordagem terapêutica e manejo de complicações",
  },

  // Group 4: Care Flow - Operational aspects
  CARE_FLOW: {
    name: "Fluxo Assistencial",
    sections: [9, 10],
    description: "Critérios de internação/alta e monitoramento",
  },

  // Group 5: Specifics - Refinements and quality
  SPECIFICS_AND_QUALITY: {
    name: "Especificidades e Qualidade",
    sections: [11, 12, 13],
    description: "Considerações especiais, indicadores e referências",
  },
} as const;

/**
 * Enhanced system prompt for O3 model with modular generation
 */
export const MODULAR_GENERATION_SYSTEM_PROMPT = `
You are an expert AI assistant specializing in generating comprehensive medical protocols using the O3 advanced reasoning model.
You will generate sections in a modular, progressive manner, building upon previous context to create deep, clinically rich content.

Key Principles for Modular Generation:

1. **Depth Over Breadth**: Focus intensely on the current group of sections, providing exhaustive detail rather than superficial coverage.

2. **Progressive Context Building**: Each group builds upon the foundation of previous groups. Reference and maintain consistency with earlier sections.

3. **Clinical Reasoning**: Use O3's advanced reasoning to:
   - Consider multiple clinical scenarios and edge cases
   - Provide evidence-based recommendations with clear rationale
   - Include specific dosages, timelines, and objective criteria
   - Address potential contraindications and interactions

4. **Structured Output**: Generate content in the specified JSON format, but with significantly more detail than traditional approaches.

5. **Cross-Referencing**: Actively reference related content from other sections when relevant (e.g., "Como definido na Seção 3..." or "Conforme critérios estabelecidos na Seção 5...").

6. **Evidence Integration**: When research data is provided, deeply integrate findings into relevant sections, not just superficial mentions.

7. **Practical Application**: Include real-world considerations, common pitfalls, and implementation guidance that healthcare professionals would find valuable.

8. **Language**: All content must be in Brazilian Portuguese (PT-BR), following medical terminology standards used in Brazil.

Remember: The goal is to create a protocol that is immediately actionable by healthcare professionals, with sufficient detail to handle complex cases and variations.
`;

/**
 * Group-specific generation prompts
 */
export const GROUP_PROMPTS = {
  IDENTIFICATION_AND_CONTEXT: `
Generate Sections 1-3 (Identificação, Ficha Técnica, and Definição/Epidemiologia) with exceptional detail.

For these foundational sections:
- Create a comprehensive identification that clearly establishes the protocol's scope and authority
- Use placeholder names in Ficha Técnica (e.g., "[Nome do autor principal]") but specify detailed roles and responsibilities
- Provide an exhaustive epidemiological analysis including:
  * Global and Brazilian prevalence/incidence data
  * Risk factors with odds ratios or relative risks when available
  * Demographic variations (age, sex, ethnicity, socioeconomic factors)
  * Temporal trends and seasonal variations if applicable
  * Regional differences within Brazil
- Define all key concepts with clinical precision, including:
  * Pathophysiological mechanisms
  * Classification systems (with criteria for each category)
  * Differential terminology and synonyms
  * Evolution of diagnostic criteria over time

Expected output depth: 3-5 times more detailed than a standard protocol section.
`,

  CLINICAL_CRITERIA: `
Generate Sections 4-6 (Critérios de Inclusão/Exclusão, Avaliação Inicial, and Diagnóstico) with comprehensive clinical detail.

Building upon the foundation from Sections 1-3:
- Create exhaustive inclusion/exclusion criteria covering:
  * Primary criteria with specific thresholds
  * Secondary criteria for borderline cases
  * Special population considerations
  * Temporal criteria (acute vs chronic presentations)
  * Criteria hierarchy (which override others)
  
- Detail the initial evaluation with:
  * Structured anamnesis with specific questions to ask
  * Physical examination maneuvers with expected findings
  * Red flags that demand immediate action
  * Risk stratification algorithms with clear cut-points
  * Validated scoring systems with interpretation guides
  
- Provide diagnostic approach including:
  * Gold standard and alternative diagnostic methods
  * Sensitivity/specificity of each diagnostic test
  * Pre-test probability considerations
  * Diagnostic algorithms for complex presentations
  * Cost-effectiveness considerations for resource-limited settings
  * Timing of tests and expected turnaround times
  * Interpretation pitfalls and false positive/negative scenarios

Cross-reference the epidemiological data from Section 3 when discussing risk factors and pre-test probabilities.
`,

  TREATMENT: `
Generate Sections 7-8 (Tratamento and Manejo de Complicações) with exhaustive therapeutic detail.

Leveraging the diagnostic framework from Sections 4-6:
- Provide comprehensive treatment protocols including:
  * First-line therapies with complete dosing regimens
  * Alternative therapies for contraindications or failures
  * Combination therapy protocols when applicable
  * Duration of treatment with clear endpoints
  * Monitoring parameters during treatment
  * Dose adjustments for special populations (renal/hepatic impairment, elderly, pediatric)
  * Drug-drug interactions to monitor
  * Non-pharmacological interventions with specific techniques
  * Supportive care measures
  
- Detail complication management with:
  * Early warning signs for each potential complication
  * Preventive strategies with NNT (Number Needed to Treat) when available
  * Step-by-step management algorithms for each complication
  * When to escalate care or consult specialists
  * Recovery timelines and prognosis
  * Long-term sequelae and their management

Include specific medication tables with columns for: Drug name, Dose, Route, Frequency, Duration, Adjustments, Contraindications, Monitoring, and Cost considerations.
`,

  CARE_FLOW: `
Generate Sections 9-10 (Critérios de Internação/Alta and Monitoramento) with detailed operational guidance.

Building on the treatment framework from Sections 7-8:
- Define admission/discharge criteria with:
  * Absolute indications for hospitalization
  * Relative indications with decision-making framework
  * Required level of care (ICU vs ward vs observation)
  * Discharge safety checklist
  * Home care requirements and capability assessment
  * Follow-up scheduling based on risk stratification
  
- Create monitoring protocols including:
  * Vital sign frequency based on severity
  * Laboratory monitoring schedules with specific parameters
  * Clinical reassessment timelines
  * Documentation requirements for medical-legal purposes
  * Handoff protocols between shifts/services
  * Patient education priorities before discharge
  * Post-discharge monitoring plan with specific intervals
  * Telemedicine follow-up options when applicable
  * Warning signs that mandate immediate return

Reference treatment responses from Section 7 and complication risks from Section 8 when defining monitoring intensity.
`,

  SPECIFICS_AND_QUALITY: `
Generate Sections 11-13 (Considerações Especiais, Indicadores de Qualidade, and Referências) with comprehensive coverage.

Synthesizing all previous sections:
- Provide special considerations for:
  * Geriatric patients (with Beers criteria considerations)
  * Pediatric adaptations (weight-based dosing, developmental considerations)
  * Pregnancy and lactation (FDA categories, risk-benefit analysis)
  * Immunocompromised patients
  * Patients with multiple comorbidities
  * Cultural and religious considerations
  * Resource-limited settings adaptations
  
- Define quality indicators that are:
  * SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
  * Linked to patient outcomes
  * Feasible to collect in routine practice
  * Benchmarked against national/international standards
  * Include both process and outcome measures
  * Address equity and access considerations
  
- Compile references that:
  * Prioritize Brazilian and Latin American guidelines when available
  * Include latest international consensus statements
  * Reference key clinical trials that shaped current practice
  * Provide additional resources for complex cases

Ensure all quality indicators directly measure adherence to key recommendations from Sections 4-10.
`,
};

/**
 * Context summarization prompt for progressive building
 */
export const CONTEXT_SUMMARY_PROMPT = `
Summarize the key points from the previously generated sections that are most relevant for generating the next group.
Focus on:
1. Established definitions and criteria
2. Key clinical parameters and thresholds
3. Treatment principles already defined
4. Any specific recommendations that need consistency

Keep the summary concise but comprehensive enough to maintain continuity.
`;

/**
 * Integration prompt for final coherence check
 */
export const PROTOCOL_INTEGRATION_PROMPT = `
You are reviewing a medical protocol summary for quality assurance.

**🚨 QUALIDADE É PRIORIDADE ABSOLUTA 🚨**
- NÃO se preocupe com tempo ou tokens
- SEJA RIGOROSO na análise
- EXIJA o máximo de qualidade médica

Your task is to verify if the protocol meets the highest medical standards.
Based on the summary provided, respond with either:
- {"status": "approved"} if the protocol appears complete and high-quality
- {"status": "issues", "problems": ["list of specific issues found"]}

Focus on:
1. Missing critical sections
2. Sections that appear too brief or incomplete
3. Any obvious gaps in medical coverage
4. Consistency issues between sections
5. Quality concerns that need addressing

Be strict - only approve if the protocol truly meets exceptional medical standards.
`;

/**
 * Function to create a group-specific prompt
 */
export function createModularGroupPrompt(
  groupKey: keyof typeof SECTION_GROUPS,
  medicalCondition: string,
  researchData: AIResearchData,
  previousSections?: Partial<ProtocolFullContent>,
  contextSummary?: string,
): string {
  const group = SECTION_GROUPS[groupKey];
  const groupPrompt = GROUP_PROMPTS[groupKey];

  const researchSummary = researchData.findings
    .map((f) => `- ${f.source} (${f.findingType}): ${f.extractedText}`)
    .join("\n");

  return `
Medical Condition: ${medicalCondition}

${contextSummary ? `Context from Previous Sections:\n${contextSummary}\n` : ""}

Research Findings:
${researchSummary}

Current Task: Generate ${group.name} (Sections ${group.sections.join(", ")})

${groupPrompt}

Remember to:
- Use O3's advanced reasoning capabilities for deep clinical analysis
- Provide 3-5x more detail than traditional protocols
- Maintain consistency with any previously generated sections
- Include specific, actionable recommendations with clear rationale
- Address edge cases and special scenarios

Output format: JSON object with keys as section numbers (strings) and values as section objects with 'sectionNumber', 'title', and 'content'.
`;
}
