/**
 * MainLayout component providing a consistent structure with Header and Sidebar.
 */
import React from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
          {/* Main content area for pages */}
          {children}
        </main>
      </div>
    </div>
  );
};
