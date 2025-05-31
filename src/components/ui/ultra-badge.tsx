"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UltraBadgeProps {
  status:
    | "draft"
    | "review"
    | "published"
    | "archived"
    | "error"
    | "warning"
    | "success"
    | "info";
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  glow?: boolean;
  floating?: boolean;
  className?: string;
}

export const UltraBadge: React.FC<UltraBadgeProps> = ({
  status,
  children,
  size = "md",
  animate = true,
  glow = true,
  floating = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Status configurations
  const statusConfig = {
    draft: {
      colors:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      glowColor: "rgba(245, 158, 11, 0.5)",
      dotColor: "bg-amber-500",
      icon: "✏️",
    },
    review: {
      colors:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      glowColor: "rgba(59, 130, 246, 0.5)",
      dotColor: "bg-blue-500",
      icon: "👁️",
    },
    published: {
      colors:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.5)",
      dotColor: "bg-emerald-500",
      icon: "✅",
    },
    archived: {
      colors:
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
      glowColor: "rgba(107, 114, 128, 0.5)",
      dotColor: "bg-gray-500",
      icon: "📦",
    },
    error: {
      colors: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      glowColor: "rgba(239, 68, 68, 0.5)",
      dotColor: "bg-red-500",
      icon: "❌",
    },
    warning: {
      colors:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
      glowColor: "rgba(234, 179, 8, 0.5)",
      dotColor: "bg-yellow-500",
      icon: "⚠️",
    },
    success: {
      colors:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      glowColor: "rgba(34, 197, 94, 0.5)",
      dotColor: "bg-green-500",
      icon: "✨",
    },
    info: {
      colors:
        "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
      glowColor: "rgba(99, 102, 241, 0.5)",
      dotColor: "bg-indigo-500",
      icon: "ℹ️",
    },
  };

  const config = statusConfig[status];

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: "px-2 py-0.5",
      text: "text-xs",
      dot: "w-1.5 h-1.5",
      icon: "text-xs",
    },
    md: {
      padding: "px-3 py-1",
      text: "text-sm",
      dot: "w-2 h-2",
      icon: "text-sm",
    },
    lg: {
      padding: "px-4 py-1.5",
      text: "text-base",
      dot: "w-2.5 h-2.5",
      icon: "text-base",
    },
  };

  const sizeStyles = sizeConfig[size];

  return (
    <div
      className={cn(
        // Base styles
        "inline-flex items-center gap-2 rounded-full",
        "font-medium backdrop-blur-sm",
        "border transition-all duration-500",
        "relative overflow-hidden",

        // Animation
        isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0",

        // Floating effect
        floating && "animate-[float_3s_ease-in-out_infinite]",

        // Size
        sizeStyles.padding,
        sizeStyles.text,

        // Colors
        config.colors,

        className,
      )}
      style={{
        boxShadow: glow ? `0 0 20px ${config.glowColor}` : undefined,
      }}
    >
      {/* Animated background gradient */}
      {animate && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 -skew-x-12 animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
      )}

      {/* Status dot with pulse */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "rounded-full",
            sizeStyles.dot,
            config.dotColor,
            animate && "animate-pulse",
          )}
        />
        {animate && (
          <div
            className={cn(
              "absolute animate-ping rounded-full",
              sizeStyles.dot,
              config.dotColor,
              "opacity-75",
            )}
          />
        )}
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-1">
        {size !== "sm" && (
          <span className={sizeStyles.icon}>{config.icon}</span>
        )}
        {children}
      </span>

      {/* Glow effect on hover */}
      {glow && (
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 70%)`,
            filter: "blur(10px)",
          }}
        />
      )}
    </div>
  );
};

// Preset badge components
export const DraftBadge: React.FC<Omit<UltraBadgeProps, "status">> = (
  props,
) => <UltraBadge {...props} status="draft" />;

export const ReviewBadge: React.FC<Omit<UltraBadgeProps, "status">> = (
  props,
) => <UltraBadge {...props} status="review" />;

export const PublishedBadge: React.FC<Omit<UltraBadgeProps, "status">> = (
  props,
) => <UltraBadge {...props} status="published" />;

// Badge group for showing multiple statuses
interface BadgeGroupProps {
  badges: Array<{
    status: UltraBadgeProps["status"];
    label: string;
  }>;
  size?: UltraBadgeProps["size"];
  className?: string;
}

export const UltraBadgeGroup: React.FC<BadgeGroupProps> = ({
  badges,
  size = "sm",
  className,
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge, index) => (
        <UltraBadge
          key={index}
          status={badge.status}
          size={size}
          animate={false}
          glow={false}
        >
          {badge.label}
        </UltraBadge>
      ))}
    </div>
  );
};
