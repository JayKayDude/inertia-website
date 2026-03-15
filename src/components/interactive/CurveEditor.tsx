"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  type CurvePoint,
  precomputeCurveTangents,
  interpolateCurve,
} from "@/lib/scrollPhysics";

interface CurveEditorProps {
  points: CurvePoint[];
  onChange: (points: CurvePoint[]) => void;
}

const PADDING = 24;
const POINT_RADIUS = 8;
const HIT_RADIUS = 22; // ≥44px diameter touch target

export default function CurveEditor({ points, onChange }: CurveEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [hasDragged, setHasDragged] = useState(false);
  const [dotProgress, setDotProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Animate dot along curve
  useEffect(() => {
    if (reducedMotion) return;

    let start: number | null = null;
    const duration = 2000;
    const pause = 1000;

    const animate = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = (elapsed % (duration + pause)) / duration;
      setDotProgress(progress <= 1 ? progress : 0);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [points, reducedMotion]);

  // Compute SVG dimensions reactively
  const [svgSize, setSvgSize] = useState({ width: 600, height: 300 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = entry.contentRect.width;
        setSvgSize({ width: w, height: w * 0.5 });
      }
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const { width, height } = svgSize;
  const innerW = width - PADDING * 2;
  const innerH = height - PADDING * 2;

  // Coordinate transforms
  const toSvg = useCallback(
    (p: CurvePoint) => ({
      x: PADDING + p.x * innerW,
      y: PADDING + (1 - p.y) * innerH,
    }),
    [innerW, innerH]
  );

  const fromSvg = useCallback(
    (sx: number, sy: number): CurvePoint => ({
      x: Math.max(0.01, Math.min(0.99, (sx - PADDING) / innerW)),
      y: Math.max(0, Math.min(1, 1 - (sy - PADDING) / innerH)),
    }),
    [innerW, innerH]
  );

  // Generate the curve path for rendering
  const curveCache = precomputeCurveTangents(points);
  const pathSteps = 100;
  const pathD = Array.from({ length: pathSteps + 1 }, (_, i) => {
    const t = i / pathSteps;
    const y = interpolateCurve(t, curveCache);
    const svgP = toSvg({ x: t, y });
    return `${i === 0 ? "M" : "L"} ${svgP.x} ${svgP.y}`;
  }).join(" ");

  // Animated dot position
  const dotVal =
    dotProgress > 0 && dotProgress < 1
      ? interpolateCurve(dotProgress, curveCache)
      : null;
  const dotSvg = dotVal !== null ? toSvg({ x: dotProgress, y: dotVal }) : null;

  // Convert pointer event to SVG coordinates
  const pointerToSvg = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [width, height]
  );

  // Find which user point is near the pointer
  const findNearPoint = useCallback(
    (sx: number, sy: number): number | null => {
      for (let i = 0; i < points.length; i++) {
        const sp = toSvg(points[i]);
        const dist = Math.hypot(sx - sp.x, sy - sp.y);
        if (dist <= HIT_RADIUS) return i;
      }
      return null;
    },
    [points, toSvg]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const pos = pointerToSvg(e);
      const idx = findNearPoint(pos.x, pos.y);

      if (idx !== null) {
        setDragging(idx);
        setDragStart(pos);
        setHasDragged(false);
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
    },
    [pointerToSvg, findNearPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging === null) return;
      const pos = pointerToSvg(e);
      if (
        dragStart &&
        !hasDragged &&
        Math.hypot(pos.x - dragStart.x, pos.y - dragStart.y) < 4
      ) {
        return;
      }
      setHasDragged(true);

      const p = fromSvg(pos.x, pos.y);

      // Enforce monotonic X: can't cross neighbors
      const sorted = [...points];
      sorted[dragging] = p;

      // Prevent X overlap with adjacent points
      const allPts = [{ x: 0 }, ...sorted, { x: 1 }];
      const realIdx = dragging + 1; // offset by endpoint
      if (realIdx > 0 && p.x <= allPts[realIdx - 1].x + 0.01) {
        p.x = allPts[realIdx - 1].x + 0.01;
      }
      if (realIdx < allPts.length - 1 && p.x >= allPts[realIdx + 1].x - 0.01) {
        p.x = allPts[realIdx + 1].x - 0.01;
      }

      const next = [...points];
      next[dragging] = p;
      onChange(next);
    },
    [dragging, dragStart, hasDragged, points, onChange, pointerToSvg, fromSvg]
  );

  const handlePointerUp = useCallback(
    () => {
      if (dragging !== null && !hasDragged) {
        // Click on existing point — delete it
        const next = points.filter((_, i) => i !== dragging);
        onChange(next);
      }
      setDragging(null);
      setDragStart(null);
      setHasDragged(false);
    },
    [dragging, hasDragged, points, onChange]
  );

  // Click on empty area to add a point
  const handleSvgClick = useCallback(
    (e: React.MouseEvent) => {
      if (hasDragged) return;
      const pos = pointerToSvg(e as unknown as React.PointerEvent);
      const nearIdx = findNearPoint(pos.x, pos.y);
      if (nearIdx !== null) return; // handled by pointer events

      const p = fromSvg(pos.x, pos.y);
      const next = [...points, p].sort((a, b) => a.x - b.x);
      onChange(next);
    },
    [points, onChange, hasDragged, pointerToSvg, findNearPoint, fromSvg]
  );

  // Fixed endpoints
  const startPt = toSvg({ x: 0, y: 1 });
  const endPt = toSvg({ x: 1, y: 0 });

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full cursor-crosshair select-none"
          role="img"
          aria-label="Custom easing curve editor — click to add control points, drag to move, click a point to delete"
          onClick={handleSvgClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: "none" }}
        >
          <defs>
            <linearGradient
              id="editorCurveGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <radialGradient id="editorDotGrad">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={PADDING}
            y1={PADDING}
            x2={PADDING}
            y2={height - PADDING}
            stroke="currentColor"
            strokeOpacity={0.1}
          />
          <line
            x1={PADDING}
            y1={height - PADDING}
            x2={width - PADDING}
            y2={height - PADDING}
            stroke="currentColor"
            strokeOpacity={0.1}
          />
          {/* Diagonal reference (linear) */}
          <line
            x1={startPt.x}
            y1={startPt.y}
            x2={endPt.x}
            y2={endPt.y}
            stroke="currentColor"
            strokeOpacity={0.06}
            strokeDasharray="4 4"
          />

          {/* Curve path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#editorCurveGrad)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Animated dot */}
          {!reducedMotion && dotSvg && (
            <circle
              cx={dotSvg.x}
              cy={dotSvg.y}
              r={5}
              fill="url(#editorDotGrad)"
            />
          )}

          {/* Fixed endpoints */}
          <circle
            cx={startPt.x}
            cy={startPt.y}
            r={POINT_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={1.5}
          />
          <circle
            cx={endPt.x}
            cy={endPt.y}
            r={POINT_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={1.5}
          />

          {/* Draggable user points */}
          {points.map((p, i) => {
            const sp = toSvg(p);
            return (
              <g key={i}>
                {/* Invisible hit area for touch targets */}
                <circle
                  cx={sp.x}
                  cy={sp.y}
                  r={HIT_RADIUS}
                  fill="transparent"
                  style={{ cursor: dragging === i ? "grabbing" : "grab" }}
                />
                {/* Visible point */}
                <circle
                  cx={sp.x}
                  cy={sp.y}
                  r={POINT_RADIUS}
                  fill="url(#editorCurveGrad)"
                  stroke="white"
                  strokeWidth={2}
                  style={{ cursor: dragging === i ? "grabbing" : "grab" }}
                />
              </g>
            );
          })}
        </svg>

        {/* Axis labels */}
        <div className="mt-2 flex justify-between px-2 text-xs text-gray-400">
          <span>Fast &darr;</span>
          <span>Start &rarr; End</span>
          <span>&darr; Slow</span>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        Click to add points. Drag to move. Click a point to delete.
      </p>
    </div>
  );
}
