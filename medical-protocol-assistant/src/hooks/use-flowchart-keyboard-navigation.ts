"use client";

import { useCallback, useEffect } from "react";
import { useReactFlow, useNodes, useViewport } from "reactflow";
import type { Node } from "reactflow";
import type { CustomFlowNodeData } from "@/types/flowchart";

interface UseFlowchartKeyboardNavigationProps {
  enabled?: boolean;
  onNodeSelect?: (node: Node<CustomFlowNodeData>) => void;
  onNodeEdit?: (node: Node<CustomFlowNodeData>) => void;
  onNodeDelete?: (nodeIds: string[]) => void;
}

export function useFlowchartKeyboardNavigation({
  enabled = true,
  onNodeSelect,
  onNodeEdit,
  onNodeDelete,
}: UseFlowchartKeyboardNavigationProps = {}) {
  const reactFlowInstance = useReactFlow();
  const nodes = useNodes<CustomFlowNodeData>();
  const viewport = useViewport();

  // Get currently selected node
  const getSelectedNode = useCallback(():
    | Node<CustomFlowNodeData>
    | undefined => {
    return nodes.find((node) => node.selected);
  }, [nodes]);

  // Select a node by ID
  const selectNode = useCallback(
    (nodeId: string, focusOnNode = true) => {
      // Deselect all nodes
      reactFlowInstance.setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === nodeId,
        })),
      );

      if (focusOnNode) {
        const node = nodes.find((n) => n.id === nodeId) as
          | Node<CustomFlowNodeData>
          | undefined;
        if (node) {
          // Center the node in the viewport
          reactFlowInstance.setCenter(
            node.position.x + (node.width || 200) / 2,
            node.position.y + (node.height || 100) / 2,
            { zoom: viewport.zoom, duration: 300 },
          );

          // Announce to screen readers
          const nodeData = node.data as CustomFlowNodeData;
          const message = `Nó selecionado: ${nodeData.title || node.type}`;
          announceToScreenReader(message);

          // Call callback if provided
          onNodeSelect?.(node);
        }
      }
    },
    [nodes, reactFlowInstance, viewport, onNodeSelect],
  );

  // Navigate to adjacent nodes
  const navigateToNode = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      const selectedNode = getSelectedNode();
      if (!selectedNode) {
        // Select the first node if none selected
        if (nodes.length > 0) {
          selectNode(nodes[0].id);
        }
        return;
      }

      // Find the nearest node in the specified direction
      const candidateNodes = nodes.filter((node: Node<CustomFlowNodeData>) => {
        if (node.id === selectedNode.id) return false;

        const dx = node.position.x - selectedNode.position.x;
        const dy = node.position.y - selectedNode.position.y;

        // Check if node is in the correct direction
        switch (direction) {
          case "up":
            return dy < -50;
          case "down":
            return dy > 50;
          case "left":
            return dx < -50;
          case "right":
            return dx > 50;
        }
      });

      // Find the closest candidate
      let nearestNode: Node<CustomFlowNodeData> | undefined;
      let minDistance = Infinity;

      candidateNodes.forEach((node) => {
        const dx = node.position.x - selectedNode.position.x;
        const dy = node.position.y - selectedNode.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          nearestNode = node;
        }
      });

      if (nearestNode) {
        selectNode(nearestNode.id);
      }
    },
    [nodes, getSelectedNode, selectNode],
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const selectedNode = getSelectedNode();

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          navigateToNode("up");
          break;
        case "ArrowDown":
          event.preventDefault();
          navigateToNode("down");
          break;
        case "ArrowLeft":
          event.preventDefault();
          navigateToNode("left");
          break;
        case "ArrowRight":
          event.preventDefault();
          navigateToNode("right");
          break;
        case "Enter":
        case " ": // Space
          event.preventDefault();
          if (selectedNode && onNodeEdit) {
            onNodeEdit(selectedNode);
            announceToScreenReader("Editando nó");
          }
          break;
        case "Delete":
        case "Backspace":
          event.preventDefault();
          if (selectedNode && onNodeDelete) {
            onNodeDelete([selectedNode.id]);
            announceToScreenReader("Nó excluído");
          }
          break;
        case "Tab":
          // Let Tab work normally for focus navigation
          break;
        case "Escape":
          event.preventDefault();
          // Deselect all nodes
          reactFlowInstance.setNodes((nds) =>
            nds.map((node) => ({ ...node, selected: false })),
          );
          announceToScreenReader("Seleção limpa");
          break;
        case "h":
        case "H":
        case "?":
          if (event.ctrlKey || event.metaKey || event.key === "?") {
            event.preventDefault();
            announceToScreenReader(
              "Atalhos: Setas para navegar, Enter para editar, Delete para excluir, Escape para limpar seleção",
            );
          }
          break;
      }
    },
    [
      enabled,
      getSelectedNode,
      navigateToNode,
      onNodeEdit,
      onNodeDelete,
      reactFlowInstance,
    ],
  );

  // Add keyboard event listener
  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    selectNode,
    navigateToNode,
    getSelectedNode,
  };
}

// Helper function to announce to screen readers
function announceToScreenReader(message: string) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
