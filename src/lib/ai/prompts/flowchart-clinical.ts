/**
 * Prompts for AI-powered flowchart generation in clinical format (rich format).
 * This format supports questionnaires, detailed medical conducts, and complex conditional logic.
 */
import type { ProtocolFullContent } from "@/types/protocol";

export const CLINICAL_FLOWCHART_GENERATION_SYSTEM_PROMPT = `
You are an expert AI assistant specialized in converting medical protocol text into rich clinical flowchart data.
Your goal is to create detailed, interactive flowcharts that capture the full complexity of medical decision-making,
including questionnaires, detailed medical conducts, and complex conditional logic.

Output Format:
The output MUST be a single JSON object with two main keys: "nodes" and "edges".

Node Types:
1. "custom" - Questionnaire nodes with multiple questions
2. "summary" - Summary/triage nodes with detailed descriptions
3. "conduct" - Medical conduct nodes with medications, exams, orientations
4. "start" - Start node
5. "end" - End node

Node Structure:

For "custom" (Questionnaire) nodes:
{
  "id": "unique-id",
  "type": "custom",
  "data": {
    "type": "custom",
    "label": "Avaliação Inicial",
    "condicional": "visivel", // or "oculto"
    "condicao": "SEMPRE", // or conditional expression
    "questions": [
      {
        "id": "Q1",
        "uid": "DOR_TORACICA",
        "titulo": "Paciente apresenta dor torácica?",
        "descricao": "Avaliar características da dor",
        "condicional": "visivel",
        "expressao": "SEMPRE",
        "select": "F", // F=radio, E=checkbox, B=text
        "options": [
          {
            "id": "1",
            "label": "Sim - Dor típica anginosa",
            "value": "sim_tipica",
            "preselected": false,
            "exclusive": false
          },
          {
            "id": "2", 
            "label": "Sim - Dor atípica",
            "value": "sim_atipica",
            "preselected": false,
            "exclusive": false
          },
          {
            "id": "3",
            "label": "Não",
            "value": "nao",
            "preselected": false,
            "exclusive": true
          }
        ]
      }
    ],
    "descricao": "<p>Realizar avaliação inicial completa do paciente</p>"
  }
}

For "summary" (Triage/Summary) nodes:
{
  "id": "unique-id",
  "type": "summary",
  "data": {
    "type": "summary",
    "label": "Triagem Manchester",
    "condicional": "visivel",
    "condicao": "SEMPRE",
    "summary": {
      "titulo": "Classificação de Risco",
      "descricao": "<p><strong>Vermelho:</strong> Emergência - Atendimento imediato<br/><strong>Laranja:</strong> Muito urgente - 10 minutos<br/><strong>Amarelo:</strong> Urgente - 60 minutos</p>",
      "tags": ["triagem", "manchester", "prioridade"]
    }
  }
}

For "conduct" (Medical Conduct) nodes:
{
  "id": "unique-id",
  "type": "conduct", 
  "data": {
    "type": "conduct",
    "label": "Conduta Inicial",
    "condicional": "visivel",
    "condicao": "DOR_TORACICA == 'sim_tipica'",
    "conduta": "tratamento", // or "conclusao", "encaminhamento", "retorno"
    "descricao": "<p>Iniciar protocolo de dor torácica</p>",
    "condutaDataNode": {
      "medicamento": [
        {
          "id": "med1",
          "nomeMed": "AAS",
          "posologia": "<p><strong>Dose:</strong> 300mg VO<br/><strong>Frequência:</strong> Dose única<br/><strong>Observação:</strong> Mastigar o comprimido</p>",
          "viaAplicacao": "Oral"
        },
        {
          "id": "med2",
          "nomeMed": "Morfina",
          "posologia": "<p><strong>Dose:</strong> 2-4mg IV<br/><strong>Frequência:</strong> A cada 5-15min se necessário<br/><strong>Máximo:</strong> 15mg<br/><strong>Cuidado:</strong> Monitorar PA e FR</p>",
          "viaAplicacao": "Intravenosa"
        }
      ],
      "exame": [
        {
          "id": "ex1",
          "nome": "ECG 12 derivações",
          "codigo": "40.01.01.10-8",
          "cid": "I20.0",
          "indicacao": "Realizar em menos de 10 minutos da chegada"
        },
        {
          "id": "ex2",
          "nome": "Troponina I",
          "codigo": "40.30.45.10-0",
          "cid": "I21.9",
          "indicacao": "Coletar na admissão e repetir em 3-6h"
        }
      ],
      "orientacao": [
        {
          "id": "or1",
          "nome": "Repouso e Monitorização",
          "conteudo": "<p>• Manter paciente em repouso absoluto<br/>• Monitorização cardíaca contínua<br/>• Oximetria de pulso<br/>• Acesso venoso calibroso</p>"
        }
      ],
      "encaminhamento": [
        {
          "id": "enc1",
          "nome": "Cardiologia",
          "especialidade": "Cardiologia",
          "urgencia": "Imediato",
          "motivo": "Avaliação de síndrome coronariana aguda"
        }
      ],
      "mensagem": [
        {
          "id": "msg1",
          "nome": "Alerta",
          "conteudo": "<p style='color: red;'><strong>ATENÇÃO:</strong> Sinais de alto risco - Ativar protocolo de emergência cardiológica</p>"
        }
      ]
    }
  }
}

For "start" and "end" nodes:
{
  "id": "start-node",
  "type": "start",
  "data": {
    "type": "start",
    "title": "Início do Protocolo"  // or "label" - both are accepted
  }
}

{
  "id": "end-node",
  "type": "end",
  "data": {
    "type": "end",
    "title": "Fim do Protocolo"  // or "label" - both are accepted
  }
}

Edges:
- Each edge must have "id", "source", "target"
- For conditional paths from questionnaires, include:
  - "sourceHandle": matching the option value or "default"
  - "label": describing the condition
- Example: { "id": "e1", "source": "quest1", "target": "conduct1", "sourceHandle": "sim_tipica", "label": "Dor típica" }

Key Guidelines:
1. Create questionnaires for patient assessment points with multiple related questions
2. Use conduct nodes for treatment steps with detailed medications, exams, and orientations
3. Include HTML formatting in descriptions and posologia for better readability
4. Use conditional expressions like "Q1 == 'sim' && idade > 65" for complex logic
5. Group related actions in conduct nodes (medications + exams + orientations)
6. Add warning messages in conduct nodes for critical alerts
7. Use summary nodes for triage systems or protocol summaries
8. Maintain clear flow from questionnaires → decisions → conducts → outcomes

CRITICAL Requirements:
- EVERY node MUST have: "id", "type", and "data" fields at the root level
- The "type" field MUST be at the node root level (node.type), NOT inside data
- The "data" object structure depends on the node type:
  
  For ALL nodes:
  {
    "id": "unique-id",
    "type": "start|end|custom|summary|conduct",  // TYPE MUST BE HERE
    "data": { ... }  // data structure varies by type
  }

- Start nodes: node.type="start", data contains { "type": "start", "title": "..." }
- End nodes: node.type="end", data contains { "type": "end", "title": "..." }
- Custom nodes: node.type="custom", data contains { "type": "custom", "label": "...", "questions": [...] }
- Summary nodes: node.type="summary", data contains { "type": "summary", "label": "...", "summary": {...} }
- Conduct nodes: node.type="conduct", data contains { "type": "conduct", "label": "...", ... }

- The data.type MUST match the node.type
- All descriptions, posologia, and content fields should use HTML formatting
- Use semantic HTML: <strong> for emphasis, <br/> for line breaks, <p> for paragraphs
- Include specific medical details: doses, routes, frequencies, warnings
- Use meaningful UIDs for questions that represent medical concepts
- Conditional expressions can reference question UIDs and values
`;

export function createClinicalFlowchartGenerationUserPrompt(
  protocolCondition: string,
  relevantTextSections: Pick<ProtocolFullContent, string>,
): string {
  let inputText = `Condição do Protocolo: ${protocolCondition}\n\n`;
  inputText +=
    "Seções relevantes do protocolo para gerar o fluxograma clínico:\n\n";

  for (const sectionNumber in relevantTextSections) {
    const section = relevantTextSections[sectionNumber];
    if (section) {
      inputText += `--- SEÇÃO ${section.sectionNumber}: ${section.title} ---\n`;
      if (typeof section.content === "string") {
        inputText += `${section.content}\n\n`;
      } else if (
        typeof section.content === "object" &&
        section.content !== null
      ) {
        inputText += `${JSON.stringify(section.content, null, 2)}\n\n`;
      }
    }
  }

  return `
  ${inputText}
  
  Based on the protocol text provided above, generate a RICH CLINICAL flowchart in the specified format.
  
  The flowchart should include:
  
  1. QUESTIONNAIRE NODES ("custom" type):
     - Create comprehensive questionnaires for patient assessment
     - Include multiple related questions in each questionnaire
     - Use appropriate input types (radio, checkbox, text)
     - Add UIDs that represent medical concepts (e.g., "DOR_TORACICA", "DISPNEIA", "FEBRE")
  
  2. CONDUCT NODES ("conduct" type):
     - Group related medical actions (medications, exams, orientations)
     - Include detailed posologia with HTML formatting
     - Add exam codes and CID when applicable
     - Include orientations and warnings
     - Use conditional logic based on questionnaire responses
  
  3. SUMMARY NODES ("summary" type):
     - Use for triage systems (Manchester, ESI)
     - Protocol overviews or key decision summaries
     - Include HTML-formatted descriptions
  
  4. FLOW LOGIC:
     - Connect nodes with conditional edges based on questionnaire responses
     - Use sourceHandle matching option values from questions
     - Create branching paths for different clinical scenarios
     - End with appropriate outcome nodes (alta, internação, transferência)
  
  5. HTML FORMATTING:
     - Use <strong> for emphasis on important information
     - Use <br/> for line breaks within content
     - Use <p> tags for paragraphs
     - Use <ul>/<li> for lists when appropriate
     - Apply color styling for warnings: style='color: red;'
  
  Example of conditional expression:
  - "SEMPRE" - always visible/executed
  - "DOR_TORACICA == 'sim_tipica'" - if pain is typical angina
  - "idade >= 65 && Q1 == 'sim'" - elderly with positive response
  - "GLASGOW < 8 || PAS < 90" - severe conditions
  
  Generate a complete clinical flowchart capturing all decision points, assessments, and treatments from the protocol.
  
  EXAMPLE of a valid response structure:
  {
    "nodes": [
      {
        "id": "start-1",
        "type": "start",
        "data": {
          "type": "start",
          "title": "Início do Protocolo"
        }
      },
      {
        "id": "quest-1",
        "type": "custom",
        "data": {
          "type": "custom",
          "label": "Avaliação Inicial",
          "condicional": "visivel",
          "condicao": "SEMPRE",
          "questions": [{
            "id": "Q1",
            "uid": "DOR_TORACICA",
            "titulo": "Paciente apresenta dor torácica?",
            "descricao": "Avaliar características",
            "condicional": "visivel",
            "expressao": "SEMPRE",
            "select": "F",
            "options": [
              {"id": "1", "label": "Sim", "value": "sim", "preselected": false, "exclusive": false},
              {"id": "2", "label": "Não", "value": "nao", "preselected": false, "exclusive": true}
            ]
          }]
        }
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "start-1",
        "target": "quest-1"
      }
    ]
  }

  IMPORTANT: Output ONLY the JSON object with "nodes" and "edges" arrays. No additional text or explanation.
  `;
}
