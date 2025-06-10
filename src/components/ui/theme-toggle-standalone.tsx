"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleStandaloneProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const ThemeToggleStandalone: React.FC<ThemeToggleStandaloneProps> = ({
  className,
  size = "md",
  showLabel = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    // Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const sizeConfig = {
    sm: {
      button: "h-11 w-11", // 44px minimum
      icon: "h-4 w-4",
      text: "text-xs",
    },
    md: {
      button: "h-11 w-11", // 44px minimum
      icon: "h-5 w-5",
      text: "text-sm",
    },
    lg: {
      button: "h-12 w-12",
      icon: "h-6 w-6",
      text: "text-base",
    },
  };

  const config = sizeConfig[size];

  // Return placeholder to prevent layout shift
  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "rounded-lg bg-gray-100 dark:bg-gray-800",
            config.button,
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={toggleTheme}
        className={cn(
          "relative flex items-center justify-center rounded-lg",
          "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
          "text-gray-700 dark:text-gray-300",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          config.button,
        )}
        aria-label="Alternar tema"
        title="Alternar tema"
      >
        <Sun
          className={cn(
            config.icon,
            "absolute transition-all duration-300",
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0",
          )}
        />
        <Moon
          className={cn(
            config.icon,
            "absolute transition-all duration-300",
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
          )}
        />
      </button>
      {showLabel && (
        <span className={cn("font-medium", config.text)}>
          {theme === "light" ? "Modo Claro" : "Modo Escuro"}
        </span>
      )}
    </div>
  );
};
