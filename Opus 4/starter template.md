```typescript
// project-structure.md
medical-protocol-assistant/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── (auth)/                   # Auth-required routes
│   │   │   ├── protocols/
│   │   │   │   ├── page.tsx         # Protocol list
│   │   │   │   ├── new/page.tsx     # Create protocol
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx     # Edit protocol
│   │   │   │       └── preview/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts
│   │   │   └── ai/
│   │   │       ├── research/route.ts
│   │   │       └── generate/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing/login
│   ├── components/
│   │   ├── protocol/
│   │   │   ├── editor/               # Protocol text editor
│   │   │   ├── flowchart/            # Visual flowchart
│   │   │   ├── validation/           # Cross-validation UI
│   │   │   └── sections/             # 13 section components
│   │   ├── ui/                       # Shadcn components
│   │   └── layout/
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── prompts/              # AI prompt templates
│   │   │   ├── research.ts           # DeepResearch integration
│   │   │   └── generator.ts          # Protocol generation
│   │   ├── validators/
│   │   │   ├── protocol.ts           # Protocol structure validation
│   │   │   ├── medication.ts         # Medication CSV validation
│   │   │   └── flowchart.ts          # Flowchart consistency
│   │   ├── generators/
│   │   │   ├── word.ts               # DOCX generation
│   │   │   ├── pdf.ts                # PDF export
│   │   │   └── mermaid.ts            # Flowchart generation
│   │   └── db/
│   │       ├── prisma/
│   │       └── queries/
│   ├── hooks/                        # Custom React hooks
│   ├── stores/                       # Zustand stores
│   ├── types/                        # TypeScript types
│   └── utils/                        # Helper functions
├── public/
│   ├── templates/                    # Word templates
│   └── medications.csv               # Medication list
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── protocol-examples/            # Example protocols
    └── api/                          # API documentation

// package.json dependencies
{
  "dependencies": {
    // Core
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0",

    // Database & API
    "@prisma/client": "^5.14.0",
    "@trpc/server": "^10.45.0",
    "@trpc/client": "^10.45.0",
    "@tanstack/react-query": "^5.0.0",

    // UI
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.0",
    "lucide-react": "latest",

    // Document Generation
    "docx": "^8.5.0",
    "@react-pdf/renderer": "^3.4.0",
    "reactflow": "^11.11.0",
    "mermaid": "^10.9.0",

    // AI & Research
    "openai": "^4.47.0",
    "zod": "^3.23.0",

    // State & Forms
    "zustand": "^4.5.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.0",

    // Auth
    "next-auth": "^4.24.0",

    // Utils
    "date-fns": "^3.6.0",
    "papaparse": "^5.4.0"
  }
}

// Example Protocol Type
interface MedicalProtocol {
  id: string;
  version: number;
  status: 'draft' | 'review' | 'approved';

  // Metadata (Section 1)
  metadata: {
    code: string;
    origin: string;
    application: string;
    dates: {
      created: Date;
      lastReview: Date;
      nextReview: Date;
    };
  };

  // Technical record (Section 2)
  technicalRecord: {
    authors: Person[];
    reviewers: Person[];
    approvers: Person[];
  };

  // Definition (Section 3)
  definition: string;

  // Triage guidelines (Section 4)
  triageGuidelines: {
    criteria: RiskCriteria[];
    alerts: Alert[];
  };

  // ... other 9 sections

  // Visual representation
  flowchart: {
    nodes: FlowNode[];
    edges: FlowEdge[];
    medications: MedicationTable[];
  };
}
```
