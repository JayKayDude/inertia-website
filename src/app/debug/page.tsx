"use client";

import { useState, useEffect, useRef } from "react";

interface WheelLog {
  time: number;
  deltaY: number;
  deltaX: number;
  deltaMode: number;
  isFractional: boolean;
  dtMs: number | null;
}

export default function DebugPage() {
  const [mouseLogs, setMouseLogs] = useState<WheelLog[]>([]);
  const [trackpadLogs, setTrackpadLogs] = useState<WheelLog[]>([]);
  const mouseLastTime = useRef<number | null>(null);
  const trackpadLastTime = useRef<number | null>(null);

  const mouseRef = useRef<HTMLDivElement>(null);
  const trackpadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mouseEl = mouseRef.current;
    const trackpadEl = trackpadRef.current;
    if (!mouseEl || !trackpadEl) return;

    const handleMouse = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      const dt = mouseLastTime.current !== null ? now - mouseLastTime.current : null;
      mouseLastTime.current = now;

      setMouseLogs((prev) => [
        {
          time: now,
          deltaY: e.deltaY,
          deltaX: e.deltaX,
          deltaMode: e.deltaMode,
          isFractional: e.deltaY % 1 !== 0,
          dtMs: dt !== null ? Math.round(dt * 100) / 100 : null,
        },
        ...prev,
      ].slice(0, 50));
    };

    const handleTrackpad = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      const dt = trackpadLastTime.current !== null ? now - trackpadLastTime.current : null;
      trackpadLastTime.current = now;

      setTrackpadLogs((prev) => [
        {
          time: now,
          deltaY: e.deltaY,
          deltaX: e.deltaX,
          deltaMode: e.deltaMode,
          isFractional: e.deltaY % 1 !== 0,
          dtMs: dt !== null ? Math.round(dt * 100) / 100 : null,
        },
        ...prev,
      ].slice(0, 50));
    };

    mouseEl.addEventListener("wheel", handleMouse, { passive: false });
    trackpadEl.addEventListener("wheel", handleTrackpad, { passive: false });

    return () => {
      mouseEl.removeEventListener("wheel", handleMouse);
      trackpadEl.removeEventListener("wheel", handleTrackpad);
    };
  }, []);

  const renderStats = (logs: WheelLog[]) => {
    if (logs.length < 2) return null;
    const fractionalCount = logs.filter((l) => l.isFractional).length;
    const dts = logs.filter((l) => l.dtMs !== null).map((l) => l.dtMs!);
    const avgDt = dts.length > 0 ? dts.reduce((a, b) => a + b, 0) / dts.length : 0;
    const avgHz = avgDt > 0 ? 1000 / avgDt : 0;
    const avgDelta = logs.reduce((a, b) => a + Math.abs(b.deltaY), 0) / logs.length;

    return (
      <div className="mb-3 rounded-lg bg-blue-50 p-3 text-sm font-mono dark:bg-blue-950">
        <p>Events: {logs.length} | Fractional: {fractionalCount}/{logs.length} ({Math.round(fractionalCount / logs.length * 100)}%)</p>
        <p>Avg interval: {avgDt.toFixed(1)}ms | Avg Hz: {avgHz.toFixed(1)}</p>
        <p>Avg |deltaY|: {avgDelta.toFixed(2)} | deltaMode: {logs[0]?.deltaMode}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-8 dark:bg-gray-950">
      <h1 className="mb-2 text-2xl font-bold">Wheel Event Debug</h1>
      <p className="mb-6 text-gray-500">Scroll inside each box with the labeled input device. Last 50 events shown.</p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Mouse zone */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">Mouse Zone</h2>
          <p className="mb-2 text-sm text-gray-500">Scroll here with your MOUSE</p>
          {renderStats(mouseLogs)}
          <div
            ref={mouseRef}
            className="h-[300px] overflow-hidden rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-4 dark:border-blue-700 dark:bg-blue-950/50"
          >
            <div className="h-[600px] space-y-2 text-xs font-mono">
              {mouseLogs.length === 0 && <p className="text-gray-400">Scroll here with mouse...</p>}
              {mouseLogs.map((log, i) => (
                <div key={i} className={`${log.isFractional ? "text-orange-600" : "text-green-600"}`}>
                  dY={log.deltaY.toFixed(4)} dt={log.dtMs?.toFixed(1) ?? "—"}ms frac={log.isFractional ? "Y" : "N"} mode={log.deltaMode}
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setMouseLogs([]); mouseLastTime.current = null; }} className="mt-2 rounded bg-gray-200 px-3 py-1 text-sm dark:bg-gray-800">Clear</button>
        </div>

        {/* Trackpad zone */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">Trackpad Zone</h2>
          <p className="mb-2 text-sm text-gray-500">Scroll here with your TRACKPAD</p>
          {renderStats(trackpadLogs)}
          <div
            ref={trackpadRef}
            className="h-[300px] overflow-hidden rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/50 p-4 dark:border-purple-700 dark:bg-purple-950/50"
          >
            <div className="h-[600px] space-y-2 text-xs font-mono">
              {trackpadLogs.length === 0 && <p className="text-gray-400">Scroll here with trackpad...</p>}
              {trackpadLogs.map((log, i) => (
                <div key={i} className={`${log.isFractional ? "text-orange-600" : "text-green-600"}`}>
                  dY={log.deltaY.toFixed(4)} dt={log.dtMs?.toFixed(1) ?? "—"}ms frac={log.isFractional ? "Y" : "N"} mode={log.deltaMode}
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setTrackpadLogs([]); trackpadLastTime.current = null; }} className="mt-2 rounded bg-gray-200 px-3 py-1 text-sm dark:bg-gray-800">Clear</button>
        </div>
      </div>
    </div>
  );
}
