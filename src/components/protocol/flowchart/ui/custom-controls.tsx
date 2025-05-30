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

  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
  };

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 200 });
  };

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
    if (onInteractiveToggle) {
      onInteractiveToggle();
    }
  };

  const ControlButton = ({ onClick, children, title }: any) => (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="flex flex-col gap-1 rounded-lg border border-gray-300 bg-white p-1 shadow-md dark:border-gray-600 dark:bg-gray-800">
        <ControlButton onClick={handleZoomIn} title="Ampliar (Ctrl + Scroll)">
          <ZoomIn className="h-4 w-4" />
        </ControlButton>
        <ControlButton onClick={handleZoomOut} title="Reduzir (Ctrl + Scroll)">
          <ZoomOut className="h-4 w-4" />
        </ControlButton>
        <div className="my-1 h-px bg-gray-300 dark:bg-gray-600" />
        <ControlButton onClick={handleFitView} title="Ajustar à tela">
          <Maximize className="h-4 w-4" />
        </ControlButton>
        {showInteractive && (
          <>
            <div className="my-1 h-px bg-gray-300 dark:bg-gray-600" />
            <ControlButton
              onClick={handleLockToggle}
              title={isLocked ? "Desbloquear movimento" : "Bloquear movimento"}
            >
              {isLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </ControlButton>
          </>
        )}
      </div>
      <div className="mt-2 rounded bg-gray-800/80 px-2 py-1 text-center text-xs text-white">
        {currentZoom}%
      </div>
    </div>
  );
};
