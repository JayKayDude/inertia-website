"use client";

import { motion, useReducedMotion } from "framer-motion";

interface GradientOrbProps {
  className?: string;
  color?: string;
  size?: number;
  delay?: number;
}

export default function GradientOrb({
  className = "",
  color = "rgba(59, 130, 246, 0.15)",
  size = 400,
  delay = 0,
}: GradientOrbProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
      }}
      animate={
        prefersReducedMotion
          ? {}
          : {
              y: [-20, 20, -20],
            }
      }
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    />
  );
}
