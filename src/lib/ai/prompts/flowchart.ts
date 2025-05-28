/**
 * Prompts for AI-powered flowchart generation from protocol text.
 */
import type { ProtocolFullContent } from "@/types/protocol";
// import type {
//   CustomFlowNodeData as _CustomFlowNodeData, // Marked as unused
//   FlowchartMedication as _FlowchartMedication, // Marked as unused
// } from "@/types/flowchart";

export const FLOWCHART_GENERATION_SYSTEM_PROMPT = `
You are an expert AI assistant specialized in converting medical protocol text into structured flowchart data.
Your goal is to accurately represent the decision-making logic, actions, and medication steps described in the protocol text as a series of connected nodes and edges.

Output Format:
The output MUST be a single JSON object with two main keys: "nodes" and "edges".

Nodes:
- Each node object must have "id" (string, unique), "type" (string: "decision", "action", "medication", "triage", "start", "end"), and "data" (object).
- The "data" object for each node must include:
  - "title" (string): A concise label for the node.
  - "type" (string): Matches the node's main "type" field.
  - For "decision" nodes: "criteria" (string, e.g., "PAS < 90mmHg?").
  - For "action" nodes: "actions" (array of strings, e.g., ["Administrar O2", "Monitorar ECG"]).
  - For "medication" nodes: "medications" (array of objects, each with "name", "dose", "route", "frequency", "duration" (optional), "notes" (optional)).
  - For "triage" nodes: "description" (string, e.g. "Paciente com dor torácica aguda").
  - For "start" and "end" nodes: a simple "title".
- Nodes can optionally have a "priority" field ("high", "medium", "low") in their "data" if inferable from text (e.g., emergency actions are high).

Edges:
- Each edge object must have "id" (string, unique, e.g., "e1-2"), "source" (string, ID of the source node), and "target" (string, ID of the target node).
- Edges from "decision" nodes should have a "label" (string, e.g., "Sim", "Não", "< 18 anos", "Critério A atendido").
- Edges can have a "type" (string, e.g., "default", "conditional").

Key Considerations:
1.  **Mapping**: Every significant decision point, action, or medication step in the text should map to a node.
2.  **Clarity**: Node titles and decision criteria must be explicit and derived directly from the text.
3.  **Connectivity**: All nodes (except potentially a single start and multiple end nodes) must be connected. Avoid orphan nodes.
4.  **Medication Tables**: Group related medications into "medication" type nodes if they are administered together or as part of a specific step.
5.  **No Vague Questions**: Decision nodes should represent clear, objective criteria from the text.
6.  **No Infinite Loops**: Ensure the logic does not create obvious unintentional infinite loops without an exit condition.
7.  **Start/End**: Include at least one "start" node (e.g., "Início do Protocolo") and one or more "end" nodes (e.g., "Alta", "Internação", "Transferência").
8.  **Conciseness**: Node titles and labels should be concise.

Analyze the provided protocol text sections and generate the flowchart structure.
`;

export function createFlowchartGenerationUserPrompt(
  protocolCondition: string,
  relevantTextSections: Pick<ProtocolFullContent, string>,
): string {
  let inputText = `Condição do Protocolo: ${protocolCondition}\n\n`;
  inputText += "Seções relevantes do protocolo para gerar o fluxograma:\n\n";

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
  
  Based on the protocol text provided above, generate the flowchart data in the specified JSON format (nodes and edges).
  Ensure all IDs for nodes and edges are unique strings.
  Node "type" must be one of: "start", "end", "triage", "decision", "action", "medication".
  The "data" object within each node must also contain a "type" field identical to the node's main "type".
  Decision nodes should clearly state their criteria in "data.criteria".
  Action nodes should list actions in "data.actions".
  Medication nodes should list medications with details in "data.medications".
  
  Example of a "medication" node's data.medications array item:
  { "name": "Atropina", "dose": "1mg", "route": "IV", "frequency": "a cada 3-5min", "duration": "Max 3mg", "notes": "Bradicardia sintomática" }
  
  Please provide the complete JSON output.
  `;
}
