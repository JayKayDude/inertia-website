"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASING_PRESETS } from "@/lib/constants";

type Preset = (typeof EASING_PRESETS)[number];

function computeCurvePoints(preset: Preset, steps: number = 100): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const friction = 0.96;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let value: number;

    switch (preset) {
      case "Smooth":
        value = Math.pow(friction, t * 120);
        break;
      case "Snappy": {
        const f = friction * (1.0 - 0.08 * (1.0 - t));
        value = Math.pow(f, t * 120);
        break;
      }
      case "Linear":
        value = 1.0 - t;
        break;
      case "Gradual": {
        const fg = friction + (1.0 - friction) * 0.5 * (1.0 - t);
        value = Math.pow(fg, t * 120);
        break;
      }
    }

    points.push({ x: t, y: value });
  }

  return points;
}

function pointsToPath(points: { x: number; y: number }[], width: number, height: number): string {
  const padding = 8;
  const w = width - padding * 2;
  const h = height - padding * 2;

  return points
    .map((p, i) => {
      const x = padding + p.x * w;
      const y = padding + (1 - p.y) * h;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function EasingCurveCanvas() {
  const [activePreset, setActivePreset] = useState<Preset>("Smooth");
  const [dotProgress, setDotProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const width = 320;
  const height = 200;
  const points = computeCurvePoints(activePreset);
  const path = pointsToPath(points, width, height);

  // Animate dot along curve
  useEffect(() => {
    if (prefersReducedMotion) return;

    let start: number | null = null;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = (elapsed % (duration + 1000)) / duration;

      if (progress <= 1) {
        setDotProgress(progress);
      } else {
        setDotProgress(0);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activePreset, prefersReducedMotion]);

  const dotPoint = points[Math.min(Math.floor(dotProgress * points.length), points.length - 1)];
  const padding = 8;
  const dotX = padding + dotPoint.x * (width - padding * 2);
  const dotY = padding + (1 - dotPoint.y) * (height - padding * 2);

  return (
    <div>
      {/* Preset buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EASING_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => { setActivePreset(preset); setDotProgress(0); }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
              activePreset === preset
                ? "gradient-bg text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* SVG Curve */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`${activePreset} easing curve — shows how scroll velocity decreases over time`}
        >
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" strokeOpacity={0.1} />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeOpacity={0.1} />

          {/* Curve */}
          <motion.path
            d={path}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            key={activePreset}
          />

          {/* Animated dot */}
          {!prefersReducedMotion && dotProgress > 0 && dotProgress < 1 && (
            <circle
              cx={dotX}
              cy={dotY}
              r={5}
              fill="url(#dotGradient)"
            />
          )}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <radialGradient id="dotGradient">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </radialGradient>
          </defs>
        </svg>

        {/* Axis labels */}
        <div className="mt-2 flex justify-between px-2 text-xs text-gray-400">
          <span>Start</span>
          <span>Time →</span>
          <span>End</span>
        </div>
      </div>
    </div>
  );
}
