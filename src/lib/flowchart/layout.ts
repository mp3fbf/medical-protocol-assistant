/**
 * Automatic layout for flowcharts using the Dagre library.
 */
import dagre from "dagre";
import type { CustomFlowNode, CustomFlowEdge } from "@/types/flowchart";

const DEFAULT_NODE_WIDTH = 180; // Default width for layout calculation if not specified
const DEFAULT_NODE_HEIGHT = 80; // Default height

interface DagreLayoutOptions {
  rankdir?: "TB" | "LR" | "BT" | "RL"; // Top-to-Bottom, Left-to-Right, etc.
  align?: "UL" | "UR" | "DL" | "DR";
  nodesep?: number;
  edgesep?: number;
  ranksep?: number;
  marginx?: number;
  marginy?: number;
}

/**
 * Applies automatic layout to flowchart nodes using Dagre.
 * Modifies the `position` property of the input nodes in place.
 *
 * @param nodes - Array of flowchart nodes.
 * @param edges - Array of flowchart edges.
 * @param options - Optional Dagre layout configuration.
 * @returns The array of nodes with updated positions.
 */
export function applyDagreLayout(
  nodes: CustomFlowNode[],
  edges: CustomFlowEdge[],
  options?: DagreLayoutOptions,
): CustomFlowNode[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({})); // Default empty label for edges

  // Set layout options
  dagreGraph.setGraph({
    rankdir: options?.rankdir || "TB", // Top-to-Bottom layout by default
    align: options?.align,
    nodesep: options?.nodesep || 60,
    edgesep: options?.edgesep || 20,
    ranksep: options?.ranksep || 60,
    marginx: options?.marginx || 20,
    marginy: options?.marginy || 20,
  });

  nodes.forEach((node) => {
    // Ensure width and height are numbers for Dagre
    const rawWidth = node.style?.width;
    const parsedWidth =
      typeof rawWidth === "string"
        ? parseFloat(rawWidth)
        : typeof rawWidth === "number"
          ? rawWidth
          : NaN;
    const widthForDagre = !isNaN(parsedWidth)
      ? parsedWidth
      : DEFAULT_NODE_WIDTH;

    const rawHeight = node.style?.height;
    const parsedHeight =
      typeof rawHeight === "string"
        ? parseFloat(rawHeight)
        : typeof rawHeight === "number"
          ? rawHeight
          : NaN;
    const heightForDagre = !isNaN(parsedHeight)
      ? parsedHeight
      : DEFAULT_NODE_HEIGHT;

    dagreGraph.setNode(node.id, {
      width: widthForDagre,
      height: heightForDagre,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  try {
    dagre.layout(dagreGraph);
  } catch (e) {
    console.error("Dagre layout failed:", e);
    // Fallback or error handling: return nodes without layout / original positions
    // Or, attempt a simpler layout, or just log and continue
    return nodes.map((node) => ({
      ...node,
      position: node.position || { x: 0, y: 0 }, // Ensure position exists
    }));
  }

  const laidOutNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Ensure width and height are numbers for calculations and final assignment
    const rawWidth = node.style?.width;
    const parsedWidth =
      typeof rawWidth === "string"
        ? parseFloat(rawWidth)
        : typeof rawWidth === "number"
          ? rawWidth
          : NaN;
    const finalWidth = !isNaN(parsedWidth) ? parsedWidth : DEFAULT_NODE_WIDTH;

    const rawHeight = node.style?.height;
    const parsedHeight =
      typeof rawHeight === "string"
        ? parseFloat(rawHeight)
        : typeof rawHeight === "number"
          ? rawHeight
          : NaN;
    const finalHeight = !isNaN(parsedHeight)
      ? parsedHeight
      : DEFAULT_NODE_HEIGHT;

    if (nodeWithPosition) {
      return {
        ...node,
        // Dagre positions are center of the node, React Flow expects top-left
        position: {
          x: Number(nodeWithPosition.x) - finalWidth / 2,
          y: Number(nodeWithPosition.y) - finalHeight / 2,
        },
        // Store width and height if calculated or default, for rendering
        width: finalWidth,
        height: finalHeight,
      };
    }
    // Should not happen if all nodes were added to graph
    return {
      ...node,
      position: node.position || { x: 0, y: 0 },
      width: finalWidth, // Ensure consistent width/height even in fallback
      height: finalHeight,
    };
  });

  return laidOutNodes;
}
