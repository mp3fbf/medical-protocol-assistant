/**
 * Common instructions or helper functions for generating section-specific prompts.
 */

export const COMMON_MEDICATION_DOSAGE_INSTRUCTIONS = `
When detailing medications, always include:
- Nome do medicamento (substância ativa)
- Dose (e.g., "500mg", "10mg/kg", "2 puffs")
- Via de administração (e.g., "Oral", "IV", "IM", "Subcutânea", "Inalatória")
- Frequência (e.g., "a cada 8 horas", "2 vezes ao dia", "se necessário")
- Duração do tratamento (e.g., "por 7 dias", "uso contínuo", "até reavaliação") if applicable.
- Quaisquer observações importantes (e.g., "diluir em 100ml SF 0.9%", "administrar lentamente").
If information for any of these fields is not available in the provided research for a specific medication, state "Não especificado".
`;

export const COMMON_OBJECTIVE_CRITERIA_INSTRUCTIONS = `
All criteria (diagnostic, inclusion/exclusion, risk classification, etc.) must be objective.
Use numerical thresholds (e.g., "Glicemia > 126 mg/dL", "PAS < 90 mmHg"), specific findings (e.g., "Presença de infiltrado pulmonar ao raio-X"), or binary states (e.g., "História de IAM prévio: Sim/Não").
Avoid vague terms like "significativo", "grave", "moderado" unless they are part of a validated scoring system that is also cited.
`;

export const COMMON_JSON_OUTPUT_INSTRUCTIONS = `
The final output for this section MUST be a valid JSON object as described.
Ensure all string values within the JSON are properly escaped.
If a field is optional and no information is available, either omit the field or set its value to null, as appropriate for the schema.
`;

// Add other common instructions as needed
