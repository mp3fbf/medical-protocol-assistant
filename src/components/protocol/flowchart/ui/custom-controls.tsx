/**
 * Custom controls component for the ReactFlow canvas with better layout and tooltips
 */
"use client";

import React from "react";
import { useReactFlow } from "reactflow";
import { ZoomIn, ZoomOut, Maximize, Lock, Unlock } from "lucide-react";

interface CustomControlsProps {
  showInteractive?: boolean;
  onInteractiveToggle?: () => void;
}

export const CustomControls: React.FC<CustomControlsProps> = ({
  showInteractive = true,
  onInteractiveToggle,
}) => {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [isLocked, setIsLocked] = React.useState(false);
  const [currentZoom, setCurrentZoom] = React.useState(100);

  const handleZoomIn = React.useCallback(() => {
    zoomIn({ duration: 200 });
  }, [zoomIn]);

  const handleZoomOut = React.useCallback(() => {
    zoomOut({ duration: 200 });
  }, [zoomOut]);

  const handleFitView = React.useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  const handleLockToggle = React.useCallback(() => {
    setIsLocked((prev) => !prev);
    if (onInteractiveToggle) {
      onInteractiveToggle();
    }
  }, [onInteractiveToggle]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleFitView();
          }
          break;
        case "l":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleLockToggle();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleZoomIn, handleZoomOut, handleFitView, handleLockToggle]);

  // Update zoom percentage whenever the viewport changes
  React.useEffect(() => {
    const updateZoom = () => {
      setCurrentZoom(Math.round(getZoom() * 100));
    };

    // Initial zoom
    updateZoom();

    // Listen for zoom changes by checking periodically
    const interval = setInterval(updateZoom, 100);

    return () => clearInterval(interval);
  }, [getZoom]);

  const ControlButton = ({ onClick, children, title, ariaLabel }: any) => (
    <button
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-gray-300 bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      title={title}
      aria-label={ariaLabel || title}
    >
      {children}
    </button>
  );

  return (
    <div className="absolute bottom-6 left-6 z-10">
      <div className="flex flex-col gap-2 rounded-xl border-2 border-gray-300 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-800">
        <ControlButton
          onClick={handleZoomIn}
          title="Ampliar (Ctrl/Cmd + ou Ctrl + Scroll)"
          ariaLabel="Ampliar fluxograma"
        >
          <ZoomIn className="h-5 w-5" />
        </ControlButton>
        <ControlButton
          onClick={handleZoomOut}
          title="Reduzir (Ctrl/Cmd - ou Ctrl + Scroll)"
          ariaLabel="Reduzir fluxograma"
        >
          <ZoomOut className="h-5 w-5" />
        </ControlButton>
        <div className="my-1 h-px bg-gray-300 dark:bg-gray-600" />
        <ControlButton
          onClick={handleFitView}
          title="Ajustar à tela (Ctrl/Cmd F)"
          ariaLabel="Ajustar fluxograma à tela"
        >
          <Maximize className="h-5 w-5" />
        </ControlButton>
        {showInteractive && (
          <>
            <div className="my-1 h-px bg-gray-300 dark:bg-gray-600" />
            <ControlButton
              onClick={handleLockToggle}
              title={
                isLocked
                  ? "Desbloquear movimento (Ctrl/Cmd L)"
                  : "Bloquear movimento (Ctrl/Cmd L)"
              }
            >
              {isLocked ? (
                <Lock className="h-5 w-5" />
              ) : (
                <Unlock className="h-5 w-5" />
              )}
            </ControlButton>
          </>
        )}
      </div>
      <div className="mt-3 rounded-lg bg-gray-800/90 px-3 py-1.5 text-center text-sm font-medium text-white shadow-md dark:bg-gray-900/90">
        {currentZoom}%
      </div>
    </div>
  );
};
