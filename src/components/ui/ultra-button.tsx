"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface UltraButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gradient" | "glow";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
  ripple?: boolean;
  magnetic?: boolean;
  children: React.ReactNode;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const UltraButton: React.FC<UltraButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  ripple = true,
  magnetic = true,
  children,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Ripple effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    if (ripple && !prefersReducedMotion) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const rippleX = e.clientX - rect.left;
        const rippleY = e.clientY - rect.top;
        const newRipple = { x: rippleX, y: rippleY, id: Date.now() };

        setRipples((prev) => [...prev, newRipple]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 1000);
      }
    }

    onClick?.(e);
  };

  // Magnetic effect
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || disabled || loading || prefersReducedMotion) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Magnetic pull strength
      const magnetStrength = 0.3;
      const maxDistance = 100;

      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        setMagneticOffset({
          x: distanceX * force * magnetStrength,
          y: distanceY * force * magnetStrength,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary: cn(
      "bg-primary-500 text-white",
      "hover:bg-primary-600 active:bg-primary-700",
      "shadow-lg hover:shadow-xl",
      "border-2 border-transparent",
    ),
    secondary: cn(
      "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
      "hover:bg-gray-50 dark:hover:bg-gray-700",
      "shadow-md hover:shadow-lg",
      "border-2 border-gray-200 dark:border-gray-700",
    ),
    ghost: cn(
      "bg-transparent text-gray-700 dark:text-gray-300",
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      "border-2 border-transparent",
    ),
    gradient: cn(
      "bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700",
      "hover:from-indigo-800 hover:via-purple-800 hover:to-pink-800",
      "text-white shadow-xl hover:shadow-2xl shadow-purple-500/30",
      "border-2 border-white/20", // Added border for better definition
      "relative overflow-hidden",
      "font-semibold",
      // Ensure WCAG AA contrast with darker gradient
      "after:absolute after:inset-0 after:bg-black/10 after:pointer-events-none",
    ),
    glow: cn(
      "bg-primary-500 text-white",
      "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
      "hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]",
      "border-2 border-primary-400/50",
      "relative overflow-hidden",
    ),
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled || loading}
      className={cn(
        // Base styles
        "relative inline-flex items-center justify-center",
        "rounded-xl font-medium",
        prefersReducedMotion
          ? "transition-none"
          : "transition-all duration-300 ease-out",
        "transform-gpu",
        "select-none",
        "isolate", // Add isolation to prevent bleed

        // Focus styles
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",

        // Disabled styles
        "disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50",

        // Size
        sizeClasses[size],

        // Variant
        variantClasses[variant],

        // Press effect
        isPressed && "scale-95",

        className,
      )}
      style={{
        transform: prefersReducedMotion
          ? undefined
          : `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`,
      }}
      {...props}
    >
      {/* Gradient overlay for gradient variant - removed shimmer that was causing layer issues */}

      {/* Glow pulse for glow variant */}
      {variant === "glow" && (
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute inset-0 bg-primary-400 opacity-50 blur-md" />
        </div>
      )}

      {/* Ripple container */}
      {ripple && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute animate-ripple rounded-full bg-white/30"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: "2px",
                height: "2px",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
      )}

      {/* Loading spinner */}
      {loading ? (
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
          {icon && <span className="inline-flex flex-shrink-0">{icon}</span>}
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            {children}
          </span>
        </div>
      )}
    </button>
  );
};

// Specialized button variants
export const UltraPrimaryButton: React.FC<Omit<UltraButtonProps, "variant">> = (
  props,
) => <UltraButton {...props} variant="primary" />;

export const UltraGradientButton: React.FC<
  Omit<UltraButtonProps, "variant">
> = (props) => <UltraButton {...props} variant="gradient" />;

export const UltraGlowButton: React.FC<Omit<UltraButtonProps, "variant">> = (
  props,
) => <UltraButton {...props} variant="glow" ripple magnetic />;
