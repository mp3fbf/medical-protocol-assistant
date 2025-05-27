/**
 * SVG Flowchart Export
 *
 * This module will be responsible for generating SVG representations
 * of the protocol flowcharts.
 */
import type { FlowchartData } from "@/types/protocol"; // Assuming this type will be defined

/**
 * Generates an SVG string from flowchart data.
 * Placeholder implementation.
 *
 * @param flowchartData - The structured data representing the flowchart.
 * @returns A string containing the SVG representation of the flowchart.
 */
export async function generateFlowchartSvg(
  flowchartData?: FlowchartData, // Make optional for now
): Promise<string> {
  if (!flowchartData || !flowchartData.nodes || !flowchartData.edges) {
    // Return a simple placeholder SVG if no data or incomplete data
    return `
      <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="lightgray" />
        <text x="10" y="50" font-family="Arial" font-size="12" fill="black">
          Fluxograma não disponível.
        </text>
      </svg>
    `.trim();
  }

  // TODO: Implement actual SVG generation logic based on flowchartData.
  // This will involve:
  // 1. Defining SVG dimensions.
  // 2. Iterating over nodes (positions, shapes, text).
  // 3. Iterating over edges (lines, arrows, labels).
  // 4. Using a library like a virtual DOM to SVG or direct string concatenation.
  // For now, a more complex placeholder:

  let svgElements = "";
  const PADDING = 20;
  let maxX = 200; // Default width
  let maxY = 100; // Default height

  if (flowchartData.nodes.length > 0) {
    maxX =
      Math.max(
        ...flowchartData.nodes.map(
          (n) => (n.position?.x || 0) + (n.width || 150),
        ),
      ) + PADDING;
    maxY =
      Math.max(
        ...flowchartData.nodes.map(
          (n) => (n.position?.y || 0) + (n.height || 80),
        ),
      ) + PADDING;
  }

  flowchartData.nodes.forEach((node: any) => {
    const x = node.position?.x || 0;
    const y = node.position?.y || 0;
    const width = node.width || 150;
    const height = node.height || 80;
    const label = node.data?.title || node.id || "Node";

    svgElements += `
      <g transform="translate(${x}, ${y})">
        <rect width="${width}" height="${height}" fill="#fff" stroke="#000" />
        <text x="${width / 2}" y="${height / 2}" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10">${label.length > 20 ? label.substring(0, 17) + "..." : label}</text>
      </g>
    `;
  });

  flowchartData.edges.forEach((edge: any) => {
    const sourceNode = flowchartData.nodes.find((n) => n.id === edge.source);
    const targetNode = flowchartData.nodes.find((n) => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sx = (sourceNode.position?.x || 0) + (sourceNode.width || 150) / 2;
      const sy = (sourceNode.position?.y || 0) + (sourceNode.height || 80);
      const tx = (targetNode.position?.x || 0) + (targetNode.width || 150) / 2;
      const ty = targetNode.position?.y || 0;
      svgElements += `<line x1="${sx}" y1="${sy}" x2="${tx}" y2="${ty}" stroke="#000" marker-end="url(#arrowhead)" />`;
      if (edge.label) {
        svgElements += `<text x="${(sx + tx) / 2}" y="${(sy + ty) / 2}" font-family="Arial" font-size="10" text-anchor="middle">${edge.label}</text>`;
      }
    }
  });

  return `
    <svg width="${maxX}" height="${maxY}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      ${svgElements}
    </svg>
  `.trim();
}
