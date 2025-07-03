/**
 * Ultra Design System - Main Layout without wasteful sidebar
 * Maximum screen utilization with integrated navigation
 */
"use client";

import React from "react";
import { HeaderUltra } from "./header-ultra";

interface MainLayoutUltraProps {
  children: React.ReactNode;
}

export const MainLayoutUltra: React.FC<MainLayoutUltraProps> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <HeaderUltra />
      <main id="main-content" className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
