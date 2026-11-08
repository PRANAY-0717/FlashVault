"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface ShimmerButtonProps extends HTMLMotionProps<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children: React.ReactNode;
}

export function ShimmerButton({
  shimmerColor = "#10b981",
  shimmerSize = "0.1em",
  shimmerDuration = "2.5s",
  borderRadius = "0.75rem",
  background = "rgba(16,185,129,0.1)",
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative group flex items-center justify-center gap-2",
        "overflow-hidden whitespace-nowrap px-6 py-3",
        "border border-emerald-DEFAULT/30 text-emerald-DEFAULT font-semibold",
        "cursor-pointer transition-all duration-300",
        className
      )}
      style={{ borderRadius, background }}
      {...props}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}25, transparent)`,
          backgroundSize: "200% 100%",
          animation: `shimmer ${shimmerDuration} linear infinite`,
        }}
      />
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: `inset 0 0 30px ${shimmerColor}20`,
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
