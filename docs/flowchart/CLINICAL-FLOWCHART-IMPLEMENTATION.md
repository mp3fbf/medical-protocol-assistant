# Clinical Flowchart Implementation Summary

## Overview

We've successfully implemented a system to generate rich clinical format flowcharts directly from AI, replacing the previous approach that generated simplified flowcharts and then converted them.

✅ **Status: IMPLEMENTED AND WORKING**

## Key Changes

### 1. **New Clinical Prompt System** (`/src/lib/ai/prompts/flowchart-clinical.ts`)

- Comprehensive prompts for generating clinical format flowcharts
- Supports questionnaires (custom nodes), summaries, and detailed medical conducts
- Includes HTML formatting support for rich content
- Handles conditional logic with expressions like `"DOR_TORACICA == 'sim_tipica'"`

### 2. **Clinical Generator** (`/src/lib/flowchart/clinical-generator.ts`)

- Direct generation of clinical format without conversion
- Zod schemas for validating complex clinical data structures
- Support for:
  - Questionnaires with multiple questions (radio, checkbox, text inputs)
  - Medical conducts with medications, exams, orientations, referrals, and messages
  - HTML-formatted content for posologia and descriptions
  - Conditional visibility based on previous answers

### 3. **Updated Modular Generator** (`/src/lib/flowchart/flowchart-generator-modular.ts`)

- Added `generateClinicalFlowchartModular` function
- Uses clinical generator directly instead of converting from standard format
- Integrates with progress tracking and layout system
- Always uses O3 model for best results

### 4. **Router Updates** (`/src/server/api/routers/flowchart.ts`)

- Updated to support `format: "clinical"` option
- Routes clinical format requests to the new generator
- Maintains backward compatibility with standard format

### 5. **UI Updates** (`/src/app/protocols/[id]/flowchart/page.tsx`)

- Changed default generation to clinical format
- Updated button text to "Gerar Fluxograma Clínico"
- Regenerate button also uses clinical format

## Clinical Format Structure

### Node Types:

1. **"custom"** - Questionnaire nodes

   - Multiple questions with various input types
   - Conditional visibility based on expressions
   - Rich descriptions with HTML support

2. **"summary"** - Summary/triage nodes

   - Detailed descriptions
   - HTML formatted content
   - Tags for categorization

3. **"conduct"** - Medical conduct nodes
   - Medications with detailed posologia
   - Exams with codes and CID
   - Orientations with HTML content
   - Referrals to specialists
   - Alert messages

### Example Clinical Node:

```json
{
  "id": "conduct-1",
  "type": "conduct",
  "data": {
    "type": "conduct",
    "label": "Conduta Inicial",
    "condicional": "visivel",
    "condicao": "DOR_TORACICA == 'sim_tipica'",
    "conduta": "tratamento",
    "condutaDataNode": {
      "medicamento": [
        {
          "id": "med1",
          "nomeMed": "AAS",
          "posologia": "<p><strong>Dose:</strong> 300mg VO<br/><strong>Frequência:</strong> Dose única<br/><strong>Observação:</strong> Mastigar o comprimido</p>",
          "viaAplicacao": "Oral"
        }
      ],
      "exame": [
        {
          "id": "ex1",
          "nome": "ECG 12 derivações",
          "codigo": "40.01.01.10-8",
          "indicacao": "Realizar em menos de 10 minutos da chegada"
        }
      ]
    }
  }
}
```

## Benefits of the New Approach

1. **Direct Generation**: AI generates clinical format directly, no conversion needed
2. **Rich Content**: Supports HTML formatting, multiple questions, detailed medical info
3. **Better Medical Intelligence**: AI understands and creates proper medical workflows
4. **Conditional Logic**: Complex branching based on patient responses
5. **Professional Output**: Matches the format used by imported JSON files

## Testing

Created `test-clinical-flowchart.ts` to verify the implementation works correctly.

## Next Steps

The system is now ready to generate rich clinical flowcharts. Users can click "Gerar Fluxograma Clínico" to create flowcharts with questionnaires, detailed medical conducts, and complex conditional logic.
