"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface UltraCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  glow?: boolean;
  interactive?: boolean;
  glass?: boolean;
  featured?: boolean;
}

export const UltraCard: React.FC<UltraCardProps> = ({
  children,
  className,
  gradient = false,
  glow = false,
  interactive = true,
  glass = false,
  featured = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
      setMousePosition({ x: 0.5, y: 0.5 });
    }
  };

  // Calculate dynamic transform based on mouse position
  const transform =
    interactive && isHovered
      ? {
          transform: `
          perspective(1000px)
          rotateX(${(mousePosition.y - 0.5) * -1}deg)
          rotateY(${(mousePosition.x - 0.5) * 1}deg)
          translateZ(2px)
        `,
        }
      : {};

  // Dynamic gradient position based on mouse
  const gradientStyle =
    gradient && isHovered
      ? {
          background: `
          radial-gradient(
            circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
            rgba(59, 130, 246, 0.1) 0%,
            transparent 50%
          )
        `,
        }
      : {};

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-700",
        "backface-hidden transform-gpu",
        {
          "bg-gray-50 dark:bg-gray-900": !glass,
          "border border-white/10 bg-white/5 backdrop-blur-sm": glass,
          "shadow-lg hover:shadow-2xl": !featured,
          "shadow-xl hover:shadow-[0_20px_70px_-15px_rgba(59,130,246,0.5)]":
            featured,
          "hover:scale-[1.02]": interactive,
          "before:absolute before:inset-0 before:opacity-0 hover:before:opacity-100":
            glow,
          "before:bg-gradient-to-r before:from-primary-400/20 before:via-primary-500/20 before:to-primary-600/20":
            glow,
          "before:blur-sm before:transition-opacity before:duration-500": glow,
        },
        className,
      )}
      style={transform}
    >
      {/* Animated gradient overlay */}
      {gradient && (
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={gradientStyle}
        />
      )}

      {/* Shimmer effect */}
      {featured && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}

      {/* Corner accent */}
      {featured && (
        <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-gradient-to-br from-primary-400/20 to-primary-600/20 blur-2xl" />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Hover border glow */}
      {interactive && (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
            "bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600",
            "hover:opacity-100",
          )}
          style={{
            padding: "1px",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}
    </div>
  );
};

// Specialized variants
export const UltraGlassCard: React.FC<Omit<UltraCardProps, "glass">> = (
  props,
) => <UltraCard {...props} glass gradient glow />;

export const UltraFeaturedCard: React.FC<Omit<UltraCardProps, "featured">> = (
  props,
) => <UltraCard {...props} featured gradient glow />;
