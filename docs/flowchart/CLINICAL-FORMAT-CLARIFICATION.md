# Clinical Flowchart Format Clarification

## Summary of Changes

This document summarizes the documentation updates made to clarify the clinical flowchart format as the default and correct the terminology.

### Key Points Clarified:

1. **Clinical Format is DEFAULT**: The clinical format (rich format compatible with Daktus/Prevent Senior) is now clearly marked as the default format for flowchart generation.

2. **Standard Format is Secondary**: The standard ReactFlow format is now marked as secondary and may be deprecated in the future.

3. **Terminology Mapping**:

   - **"custom" (code) = "coleta" (medical)**: Questionnaire/collection nodes for patient assessment
   - **"summary" = "resumo"**: Summary/triage nodes for classification
   - **"conduct" = "conduta"**: Medical conduct nodes with detailed treatments

4. **Converters Available**: Format converters exist in `/src/lib/utils/flowchart-converter.ts` but are not yet exposed in the UI.

### Files Updated:

1. **CLAUDE.md**:

   - Added detailed explanation of clinical format as default
   - Listed the three node types with proper medical terminology
   - Added reference to converter location

2. **docs/project-roadmap.md**:

   - Updated flowchart section to show clinical format as default
   - Added node type descriptions with medical terms
   - Noted that converters are implemented but not in UI

3. **src/lib/ai/prompts/flowchart-clinical.ts**:

   - Added header comment explaining clinical is default
   - Added terminology mapping in comments
   - Updated node type descriptions to include medical terms

4. **src/lib/flowchart/clinical-generator.ts**:

   - Added header comment about default format
   - Added node type mapping comment

5. **src/lib/utils/flowchart-converter.ts**:

   - Added header comment about format priorities
   - Added mapping comments in conversion functions
   - Clarified that converters are not yet in UI

6. **docs/clinical-flowchart-guide.md**:
   - Reordered formats to show clinical as default
   - Added terminology notes for each node type
   - Added section about converters and limitations
   - Updated roadmap to include converter UI exposure

### Future Considerations:

1. **Code Refactoring**: Eventually rename "custom" to "coleta" in the code for consistency, but this would be a breaking change requiring data migration.

2. **UI Updates**: Add import/export functionality to expose the format converters in the UI.

3. **Deprecation Plan**: Consider fully deprecating the standard format and migrating all functionality to clinical format.

### Note on Implementation:

The code currently uses "custom" for technical reasons (likely compatibility with existing systems), but all documentation now clarifies that this represents "coleta" (collection) nodes in medical terminology. This approach maintains backward compatibility while improving clarity for medical professionals.
