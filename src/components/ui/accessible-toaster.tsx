"use client";

import React from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface AccessibleToasterProps extends ToasterProps {
  // Additional props can be added here if needed
}

export function AccessibleToaster(props: AccessibleToasterProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <SonnerToaster
      {...props}
      // Expand toasts when hovered/focused for better readability
      expand={true}
      // Add ARIA live region for screen readers
      toastOptions={{
        ...props.toastOptions,
        unstyled: false,
        classNames: {
          ...props.toastOptions?.classNames,
          toast: `group toast ${props.toastOptions?.classNames?.toast || ""}`,
          title: "font-semibold",
          description: "text-sm opacity-90",
          actionButton:
            "bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500",
          cancelButton:
            "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500",
        },
        // Disable animations if user prefers reduced motion
        ...(prefersReducedMotion
          ? {
              duration: Infinity, // Keep visible until manually dismissed
              style: {
                animation: "none",
                transition: "none",
              },
            }
          : {}),
      }}
      // Custom styles for better accessibility
      style={{
        ...props.style,
      }}
      // Close button for all toasts
      closeButton={true}
      // Increase default duration for better readability
      duration={props.duration || 6000}
      // Add keyboard support
      hotkey={["Escape"]}
    />
  );
}
