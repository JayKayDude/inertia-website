"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useScrollEngine } from "./ScrollEngineContext";
import { DEFAULT_CONFIG, type EasingPreset } from "@/lib/scrollPhysics";
import CurveEditor from "./CurveEditor";
import type { CurvePoint } from "@/lib/scrollPhysics";

const EASING_OPTIONS: { label: string; value: EasingPreset }[] = [
  { label: "Smooth", value: "smooth" },
  { label: "Snappy", value: "snappy" },
  { label: "Linear", value: "linear" },
  { label: "Gradual", value: "gradual" },
  { label: "Custom", value: "custom-curve" },
];

export default function ScrollControls() {
  const { getEngine } = useScrollEngine();

  const [speed, setSpeed] = useState(DEFAULT_CONFIG.baseSpeed);
  const [smoothness, setSmoothness] = useState(DEFAULT_CONFIG.smoothness);
  const [easing, setEasing] = useState<EasingPreset>(DEFAULT_CONFIG.easing);
  const [curvePoints, setCurvePoints] = useState<CurvePoint[]>([]);

  const updateEngine = useCallback(
    (config: Partial<{
      baseSpeed: number;
      smoothness: number;
      momentumDuration: number;
      easing: EasingPreset;
      customCurvePoints: CurvePoint[];
    }>) => {
      getEngine()?.updateConfig(config);
    },
    [getEngine]
  );

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    updateEngine({ baseSpeed: value });
  };

  const handleSmoothnessChange = (value: number) => {
    setSmoothness(value);
    // Map smoothness 0-1 to momentumDuration 0.2-1.0
    const momentumDuration = 0.2 + value * 0.8;
    updateEngine({ smoothness: value, momentumDuration });
  };

  const handleEasingChange = (preset: EasingPreset) => {
    setEasing(preset);
    updateEngine({ easing: preset });
  };

  const handleCurvePointsChange = (points: CurvePoint[]) => {
    setCurvePoints(points);
    updateEngine({ customCurvePoints: points });
  };

  const handleReset = () => {
    setSpeed(DEFAULT_CONFIG.baseSpeed);
    setSmoothness(DEFAULT_CONFIG.smoothness);
    setEasing(DEFAULT_CONFIG.easing);
    setCurvePoints([]);
    getEngine()?.updateConfig({
      baseSpeed: DEFAULT_CONFIG.baseSpeed,
      smoothness: DEFAULT_CONFIG.smoothness,
      momentumDuration: DEFAULT_CONFIG.momentumDuration,
      easing: DEFAULT_CONFIG.easing,
      customCurvePoints: [],
    });
  };

  const smoothnessLabel =
    smoothness <= 0.3 ? "Low" : smoothness <= 0.7 ? "Regular" : "High";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Speed slider */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label
            htmlFor="speed-slider"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Speed
          </label>
          <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
            {speed.toFixed(1)}
          </span>
        </div>
        <input
          id="speed-slider"
          type="range"
          min="2.0"
          max="7.0"
          step="0.1"
          value={speed}
          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
          className="scroll-slider w-full"
          aria-label={`Scroll speed: ${speed.toFixed(1)}`}
        />
      </div>

      {/* Smoothness slider */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label
            htmlFor="smoothness-slider"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Smoothness
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {smoothnessLabel} ({smoothness.toFixed(2)})
          </span>
        </div>
        <input
          id="smoothness-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={smoothness}
          onChange={(e) =>
            handleSmoothnessChange(parseFloat(e.target.value))
          }
          className="scroll-slider w-full"
          aria-label={`Smoothness: ${smoothnessLabel}`}
        />
      </div>

      {/* Easing preset buttons */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Easing
        </p>
        <div className="flex flex-wrap gap-2">
          {EASING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleEasingChange(opt.value)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors min-h-[44px] cursor-pointer ${
                easing === opt.value
                  ? "gradient-bg text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              aria-label={`${opt.label} easing preset`}
              aria-pressed={easing === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Curve visualization — always visible */}
      {easing === "custom-curve" ? (
        <CurveEditor points={curvePoints} onChange={handleCurvePointsChange} />
      ) : (
        <PresetCurveDisplay preset={easing} />
      )}

      {/* Reset button */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 min-h-[44px] cursor-pointer dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Reset all controls to defaults"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

// --- Read-only curve display for standard presets ---

function computePresetCurve(
  preset: Exclude<EasingPreset, "custom-curve">,
  steps: number = 100
): { x: number; y: number }[] {
  const friction = 0.96;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let value: number;

    switch (preset) {
      case "smooth":
        value = Math.pow(friction, t * 120);
        break;
      case "snappy": {
        const f = friction * (1.0 - 0.08 * (1.0 - t));
        value = Math.pow(f, t * 120);
        break;
      }
      case "linear":
        value = 1.0 - t;
        break;
      case "gradual": {
        const fg = friction + (1.0 - friction) * 0.5 * (1.0 - t);
        value = Math.pow(fg, t * 120);
        break;
      }
    }

    points.push({ x: t, y: value });
  }

  return points;
}

const CURVE_PADDING = 24;

function PresetCurveDisplay({
  preset,
}: {
  preset: Exclude<EasingPreset, "custom-curve">;
}) {
  const animRef = useRef<number | null>(null);
  const [dotProgress, setDotProgress] = useState(0);
  const [reducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const points = useMemo(() => computePresetCurve(preset), [preset]);

  // Animate dot along curve
  useEffect(() => {
    if (reducedMotion) return;

    let start: number | null = null;
    const duration = 2000;
    const pause = 1000;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = (elapsed % (duration + pause)) / duration;
      setDotProgress(progress <= 1 ? progress : 0);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [preset, reducedMotion]);

  const width = 600;
  const height = 300;
  const innerW = width - CURVE_PADDING * 2;
  const innerH = height - CURVE_PADDING * 2;

  const pathD = points
    .map((p, i) => {
      const x = CURVE_PADDING + p.x * innerW;
      const y = CURVE_PADDING + (1 - p.y) * innerH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const dotPoint =
    dotProgress > 0 && dotProgress < 1
      ? points[Math.min(Math.floor(dotProgress * points.length), points.length - 1)]
      : null;
  const dotX = dotPoint ? CURVE_PADDING + dotPoint.x * innerW : 0;
  const dotY = dotPoint ? CURVE_PADDING + (1 - dotPoint.y) * innerH : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`${preset} easing curve — shows how scroll velocity decreases over time`}
      >
        <defs>
          <linearGradient id="presetCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <radialGradient id="presetDotGrad">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </radialGradient>
        </defs>

        {/* Grid lines */}
        <line
          x1={CURVE_PADDING} y1={CURVE_PADDING}
          x2={CURVE_PADDING} y2={height - CURVE_PADDING}
          stroke="currentColor" strokeOpacity={0.1}
        />
        <line
          x1={CURVE_PADDING} y1={height - CURVE_PADDING}
          x2={width - CURVE_PADDING} y2={height - CURVE_PADDING}
          stroke="currentColor" strokeOpacity={0.1}
        />

        {/* Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#presetCurveGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Animated dot */}
        {!reducedMotion && dotPoint && (
          <circle cx={dotX} cy={dotY} r={5} fill="url(#presetDotGrad)" />
        )}
      </svg>

      {/* Axis labels */}
      <div className="mt-2 flex justify-between px-2 text-xs text-gray-400">
        <span>Fast</span>
        <span>Time &rarr;</span>
        <span>Slow</span>
      </div>
    </div>
  );
}
