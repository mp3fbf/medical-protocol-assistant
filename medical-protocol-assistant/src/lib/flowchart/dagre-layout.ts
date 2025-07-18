/**
 * Dagre auto-layout utility for flowcharts
 * Ensures proper spacing and prevents node overlap
 */
import dagre from "dagre";
import type { Node, Edge } from "reactflow";

interface LayoutOptions {
  rankdir?: "TB" | "BT" | "LR" | "RL";
  nodesep?: number;
  ranksep?: number;
  marginx?: number;
  marginy?: number;
  edgesep?: number;
  ranker?: "network-simplex" | "tight-tree" | "longest-path";
  acyclicer?: "greedy" | undefined;
}

const DEFAULT_NODE_WIDTH = 240; // Increased from 180
const DEFAULT_NODE_HEIGHT = 100; // Increased from 80

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {},
): { nodes: Node[]; edges: Edge[] } {
  const {
    rankdir = "TB",
    nodesep = 200, // Doubled horizontal separation to eliminate overlaps
    ranksep = 250, // Generous vertical separation for better clarity
    marginx = 40, // Increased margins
    marginy = 40, // Increased margins
    edgesep = 150, // Drastically increased separation between parallel edges
    ranker = "network-simplex", // Better algorithm for reducing edge crossings
    acyclicer = "greedy", // Helps prevent cycles
  } = options;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir,
    nodesep,
    ranksep,
    marginx,
    marginy,
    edgesep,
    ranker,
    acyclicer,
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.width || DEFAULT_NODE_WIDTH,
      height: node.height || DEFAULT_NODE_HEIGHT,
    });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Apply the calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Center the node position
    const x = nodeWithPosition.x - (node.width || DEFAULT_NODE_WIDTH) / 2;
    const y = nodeWithPosition.y - (node.height || DEFAULT_NODE_HEIGHT) / 2;

    return {
      ...node,
      position: {
        x,
        y,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

/**
 * Get the optimal viewport bounds for fitView
 */
export function getViewportBounds(nodes: Node[]) {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const nodeWidth = node.width || DEFAULT_NODE_WIDTH;
    const nodeHeight = node.height || DEFAULT_NODE_HEIGHT;

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
