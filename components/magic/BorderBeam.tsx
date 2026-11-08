"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  borderWidth = 1.5,
  colorFrom = "#10b981",
  colorTo = "#6366f1",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden", className)}
      style={{ "--duration": duration } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          border: `${borderWidth}px solid transparent`,
          backgroundImage: `linear-gradient(#090909, #090909), linear-gradient(to right, ${colorFrom}, ${colorTo}, ${colorFrom})`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "destination-out",
          maskComposite: "exclude",
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(from 0deg, transparent, ${colorFrom}, transparent)`,
          filter: `blur(${size / 4}px)`,
          opacity: 0.6,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
        initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
      />
    </div>
  );
}

