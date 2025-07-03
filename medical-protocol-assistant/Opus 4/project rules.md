```md
# Medical Protocol Assistant - Project Rules

## Core Principles

1. **Format over Content**: Structure and formatting must be 100% correct. Clinical accuracy is secondary.
2. **Portuguese First**: All user-facing text in PT-BR. Code/comments in English.
3. **Type Safety**: Full TypeScript with strict mode. No `any` types.
4. **Validation First**: Every input must be validated before processing.

## Architecture Decisions

1. **Monorepo Structure**: Single Next.js app with clear module separation
2. **Database**: PostgreSQL for structured protocol data, S3 for document storage
3. **AI Integration**: OpenAI API with structured outputs, fallback to manual entry
4. **Document Generation**: Server-side only for consistency
5. **State Management**: Zustand for complex UI state, React Query for server state

## Code Standards

1. **Components**: Functional components only, use custom hooks for logic
2. **Styling**: Tailwind CSS only, no inline styles
3. **Naming**:
   - Components: PascalCase
   - Functions/hooks: camelCase
   - Constants: UPPER_SNAKE_CASE
   - Files: kebab-case
4. **Testing**: Required for all business logic and AI prompts

## Medical Protocol Specifics

1. **13 Sections**: Every protocol MUST have all 13 sections, even if empty
2. **Objective Criteria**: No vague terms. Numbers, thresholds, binary decisions only
3. **Medication Format**: Always include dose, route, frequency, duration
4. **Flowchart Rules**:
   - Every text decision must map to flowchart node
   - No orphan paths or infinite loops
   - Color coding: green (low risk), yellow (medium), red (high)

## Security & Compliance

1. **No PII**: System must never store patient data
2. **Audit Trail**: Log all protocol changes with timestamps
3. **Version Control**: Every protocol edit creates new version
4. **Access Control**: Role-based (creator, reviewer, admin)

## Performance Targets

1. **Protocol Generation**: < 30 seconds for AI generation
2. **Document Export**: < 5 seconds for Word/PDF
3. **Flowchart Rendering**: < 2 seconds for complex diagrams
4. **Concurrent Users**: Support 10 simultaneous editors

## Error Handling

1. **User Errors**: Clear Portuguese messages with recovery actions
2. **AI Failures**: Always provide manual fallback option
3. **Validation Errors**: Highlight specific fields/sections
4. **System Errors**: Generic message to user, detailed logs for devs
```
