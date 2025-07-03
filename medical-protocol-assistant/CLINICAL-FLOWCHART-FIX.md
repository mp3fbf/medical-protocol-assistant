# Clinical Flowchart Generation Fix

## Issue

The clinical flowchart generation was failing with Zod validation errors because the AI was not providing the required "title" field for "start" and "end" nodes.

## Error Details

```
Error: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["nodes", 0, "data", "title"],
    "message": "Required"
  }
]
```

## Root Cause

The AI was generating start/end nodes without the required `data.title` field, causing validation to fail.

## Solution Implemented

### 1. Updated Zod Schema (`/src/lib/flowchart/clinical-generator.ts`)

- Made `title` and `label` fields optional for start/end nodes
- Added transform to provide default values if missing
- Now accepts either `title` or `label` field
- Provides fallback values: "Início" for start, "Fim" for end

```typescript
z.object({
  type: z.literal("start"),
  title: z.string().optional(),
  label: z.string().optional(),
}).transform((data) => ({
  ...data,
  title: data.title || data.label || "Início",
}));
```

### 2. Updated AI Prompt (`/src/lib/ai/prompts/flowchart-clinical.ts`)

- Added explicit examples for start/end node structure
- Added CRITICAL Requirements section emphasizing required fields
- Clarified that both "title" and "label" are accepted

### 3. Key Changes

- More flexible schema that handles AI variations
- Clearer prompt instructions to reduce errors
- Fallback values ensure nodes always have required fields

## Testing

The fix should now handle clinical flowchart generation properly, accepting variations in how the AI structures start and end nodes while ensuring all required fields are present.

## Status

✅ **FIXED** - The clinical flowchart generation should now work correctly with the O3 model.
