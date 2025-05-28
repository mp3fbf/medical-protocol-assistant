/**
 * SVG Flowchart Export
 *
 * This module is responsible for generating SVG representations
 * of the protocol flowcharts from FlowchartDefinition.
 */
import type {
  FlowchartDefinition,
  CustomFlowNode,
  CustomFlowEdge,
  CustomFlowNodeData,
} from "@/types/flowchart";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 70;
const DECISION_NODE_SIZE = 120; // For diamond shape (width/height before rotation)
const PADDING = 50; // Padding around the flowchart content

interface SvgStyle {
  fill: string;
  stroke: string;
  textColor: string;
}

function getNodeStyle(nodeData: CustomFlowNodeData): SvgStyle {
  const priority = nodeData.priority;
  switch (nodeData.type) {
    case "triage":
      if (priority === "high")
        return { fill: "#FEE2E2", stroke: "#DC2626", textColor: "#991B1B" }; // Light Red
      if (priority === "medium")
        return { fill: "#FEF3C7", stroke: "#D97706", textColor: "#92400E" }; // Light Yellow
      if (priority === "low")
        return { fill: "#D1FAE5", stroke: "#059669", textColor: "#065F46" }; // Light Green
      return { fill: "#E0F2FE", stroke: "#0EA5E9", textColor: "#0369A1" }; // Light Blue (default Triage)
    case "decision":
      if (priority === "high")
        return { fill: "#FECACA", stroke: "#B91C1C", textColor: "#7F1D1D" }; // Red
      if (priority === "medium")
        return { fill: "#FDE68A", stroke: "#B45309", textColor: "#78350F" }; // Yellow
      if (priority === "low")
        return { fill: "#BBF7D0", stroke: "#15803D", textColor: "#14532D" }; // Green
      return { fill: "#E5E7EB", stroke: "#6B7280", textColor: "#1F2937" }; // Gray (default Decision)
    case "action":
      return { fill: "#DBEAFE", stroke: "#3B82F6", textColor: "#1E40AF" }; // Blue
    case "medication":
      return { fill: "#E0E7FF", stroke: "#6366F1", textColor: "#3730A3" }; // Indigo
    case "start":
      return { fill: "#F3E8FF", stroke: "#8B5CF6", textColor: "#5B21B6" }; // Purple (start)
    case "end":
      return { fill: "#F3E8FF", stroke: "#8B5CF6", textColor: "#5B21B6" }; // Purple (end)
    default:
      return { fill: "#F3F4F6", stroke: "#4B5563", textColor: "#111827" }; // Default
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

// Simple text wrapping for SVG <text> elements
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";
  const approxCharWidth = fontSize * 0.6; // Rough estimate

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * approxCharWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function generateFlowchartSvg(
  flowchartData?: FlowchartDefinition,
): Promise<string> {
  if (
    !flowchartData ||
    !flowchartData.nodes ||
    flowchartData.nodes.length === 0
  ) {
    return `
      <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#F3F4F6" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#4B5563">
          Fluxograma não disponível.
        </text>
      </svg>
    `.trim();
  }

  const { nodes, edges } = flowchartData;
  let minX = Infinity,
    minY = Infinity,
    maxX = 0,
    maxY = 0;

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    const width =
      node.width ||
      (node.type === "decision" ? DECISION_NODE_SIZE : NODE_WIDTH);
    const height =
      node.height ||
      (node.type === "decision" ? DECISION_NODE_SIZE : NODE_HEIGHT);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  if (nodes.length === 0) {
    // Should be caught by the first check, but as a safeguard
    minX = 0;
    minY = 0;
    maxX = 200;
    maxY = 100;
  }

  const svgWidth =
    maxX === 0 && minX === Infinity ? 200 : maxX - minX + 2 * PADDING;
  const svgHeight =
    maxY === 0 && minY === Infinity ? 100 : maxY - minY + 2 * PADDING;
  const offsetX = -minX + PADDING;
  const offsetY = -minY + PADDING;

  let svgElements = "";

  // Define arrowhead marker
  svgElements += `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
        <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
      </marker>
    </defs>
  `;

  // Render nodes
  nodes.forEach((node: CustomFlowNode) => {
    const style = getNodeStyle(node.data);
    const x = node.position.x + offsetX;
    const y = node.position.y + offsetY;
    const width =
      node.width ||
      (node.type === "decision" ? DECISION_NODE_SIZE : NODE_WIDTH);
    const height =
      node.height ||
      (node.type === "decision" ? DECISION_NODE_SIZE : NODE_HEIGHT);
    const title = escapeXml(node.data.title);
    const fontSize = 12; // Base font size

    if (node.type === "decision") {
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      svgElements += `
        <g transform="translate(${x + halfWidth}, ${y + halfHeight}) rotate(45)">
          <rect x="${-halfWidth}" y="${-halfHeight}" width="${width}" height="${height}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5" rx="3" ry="3" />
        </g>
        <g transform="translate(${x + halfWidth}, ${y + halfHeight})">
          <text dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${style.textColor}">`;

      const criteria =
        node.data.type === "decision" ? escapeXml(node.data.criteria) : "";
      const wrappedTitle = wrapText(title, width * 0.7, fontSize); // Use ~70% of width for text to fit diamond
      const wrappedCriteria = wrapText(criteria, width * 0.7, fontSize * 0.8);

      wrappedTitle.forEach((line) => {
        svgElements += `<tspan x="0" dy="${fontSize * 1.2}">${line}</tspan>`;
      });

      wrappedCriteria.forEach((line) => {
        svgElements += `<tspan x="0" dy="${fontSize * 0.8 * 1.2}" font-size="${fontSize * 0.8}">${line}</tspan>`;
      });

      svgElements += `
          </text>
        </g>
      `;
    } else {
      svgElements += `
        <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5" rx="5" ry="5" />
        <text x="${x + width / 2}" y="${y + height / 2}" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${style.textColor}">
      `;
      const wrappedTitle = wrapText(title, width - 10, fontSize); // -10 for padding
      const startYOffset = -(wrappedTitle.length - 1) * (fontSize * 0.6);

      wrappedTitle.forEach((line, index) => {
        svgElements += `<tspan x="${x + width / 2}" dy="${index === 0 ? startYOffset : fontSize * 1.2}">${line}</tspan>`;
      });
      svgElements += `</text>`;
    }
  });

  // Render edges
  edges.forEach((edge: CustomFlowEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (sourceNode && targetNode) {
      // Basic line connection - for simplicity, connect centers. More advanced logic would connect to node borders.
      const sWidth =
        sourceNode.width ||
        (sourceNode.type === "decision" ? DECISION_NODE_SIZE : NODE_WIDTH);
      const sHeight =
        sourceNode.height ||
        (sourceNode.type === "decision" ? DECISION_NODE_SIZE : NODE_HEIGHT);
      const tWidth =
        targetNode.width ||
        (targetNode.type === "decision" ? DECISION_NODE_SIZE : NODE_WIDTH);
      const tHeight =
        targetNode.height ||
        (targetNode.type === "decision" ? DECISION_NODE_SIZE : NODE_HEIGHT);

      const sx = sourceNode.position.x + offsetX + sWidth / 2;
      const sy = sourceNode.position.y + offsetY + sHeight / 2;
      const tx = targetNode.position.x + offsetX + tWidth / 2;
      const ty = targetNode.position.y + offsetY + tHeight / 2;

      // Adjust target points to edge of target node for arrowhead
      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = (dist - tHeight / 2 - 5) / dist; // -5 for arrowhead offset
      const targetXAdjusted = sx + dx * ratio;
      const targetYAdjusted = sy + dy * ratio;

      svgElements += `<line x1="${sx}" y1="${sy}" x2="${targetXAdjusted}" y2="${targetYAdjusted}" stroke="#333" stroke-width="1.5" marker-end="url(#arrowhead)" />`;
      if (edge.label) {
        const labelX = sx + dx * 0.5;
        const labelY = sy + dy * 0.5 - 5; // Offset label slightly above the line
        svgElements += `
          <text x="${labelX}" y="${labelY}" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#333" style="background: white; padding: 0 2px;">
            ${escapeXml(String(edge.label))}
          </text>
        `;
      }
    }
  });

  return `
    <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="background-color: #f9fafb;">
      ${svgElements}
    </svg>
  `.trim();
}
