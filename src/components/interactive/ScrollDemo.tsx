"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ScrollPhysicsEngine } from "@/lib/scrollPhysics";

export default function ScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [inertiaEnabled, setInertiaEnabled] = useState(true);
  const [velocity, setVelocity] = useState(0);
  const [isTrackpad, setIsTrackpad] = useState(false);
  const engineRef = useRef<ScrollPhysicsEngine | null>(null);

  useEffect(() => {
    const engine = new ScrollPhysicsEngine({
      baseSpeed: 4.0,
      smoothness: 0.6,
      momentumDuration: 0.6,
      easing: "smooth",
    });

    engine.onScroll = (delta) => {
      const content = contentRef.current;
      const container = containerRef.current;
      if (!content || !container) return;

      const maxScroll = content.scrollHeight - container.clientHeight;
      const currentScroll = content.scrollTop;
      const newScroll = Math.max(0, Math.min(currentScroll + delta, maxScroll));
      content.scrollTop = newScroll;
    };

    engine.onVelocityChange = (v) => {
      setVelocity(v);
    };

    engineRef.current = engine;

    return () => engine.destroy();
  }, []);

  // Trackpad detection: fractional deltaY values suggest trackpad
  const detectTrackpad = useCallback((e: WheelEvent) => {
    if (e.deltaY % 1 !== 0 && Math.abs(e.deltaY) < 50) {
      setIsTrackpad(true);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      detectTrackpad(e);

      if (!inertiaEnabled) return; // Let native scroll handle it

      e.preventDefault();
      e.stopPropagation();

      engineRef.current?.handleWheel(e.deltaY, e.deltaMode);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [inertiaEnabled, detectTrackpad]);

  const sampleContent = [
    { title: "Getting Started", text: "Inertia transforms your mouse scrolling experience on macOS. Instead of the choppy, line-by-line jumps you're used to, every scroll feels fluid and natural." },
    { title: "How It Works", text: "When you scroll your mouse wheel, Inertia intercepts the input and applies physics-based momentum. The scroll continues smoothly after you stop, just like a trackpad." },
    { title: "Fine-Tune Everything", text: "Adjust speed, smoothness, and scroll distance with intuitive presets or precise sliders. Choose from five easing curve presets or design your own in the visual editor." },
    { title: "Per-App Control", text: "Different apps need different scroll settings. Set up custom profiles for Photoshop, VS Code, your browser — each app gets its own speed and behavior." },
    { title: "Always Ready", text: "Inertia lives quietly in your menubar. It starts at login, uses minimal resources, and stays out of your way until you need to adjust something." },
    { title: "Open Source", text: "Built with Swift and SwiftUI, Inertia is fully open source. Inspect the code, contribute improvements, or learn how it works under the hood." },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Toggle */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <button
          onClick={() => { setInertiaEnabled(false); engineRef.current?.stop(); }}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors min-h-[44px] ${
            !inertiaEnabled
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Default Scroll
        </button>
        <button
          onClick={() => setInertiaEnabled(true)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors min-h-[44px] ${
            inertiaEnabled
              ? "gradient-bg text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Inertia Scroll
        </button>
      </div>

      {/* macOS Window Chrome */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Title Bar */}
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" aria-hidden="true" />
            <div className="h-3 w-3 rounded-full bg-green-500" aria-hidden="true" />
          </div>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            Scroll Demo — {inertiaEnabled ? "Inertia Enabled" : "Default Browser Scroll"}
          </span>
        </div>

        {/* Scrollable Content */}
        <div
          ref={containerRef}
          className="relative h-[400px]"
        >
          <div
            ref={contentRef}
            className={`h-full overflow-y-auto p-6 ${inertiaEnabled ? "overflow-hidden" : ""}`}
            style={inertiaEnabled ? { overflow: "hidden" } : {}}
          >
            <div className="space-y-6">
              {sampleContent.map((item, i) => (
                <article key={i} className="rounded-lg border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-800/50">
                  <h4 className="mb-2 text-base font-semibold">{item.title}</h4>
                  <p className="max-w-prose text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Velocity indicator */}
      {inertiaEnabled && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div
            className="h-1.5 rounded-full gradient-bg transition-all duration-75"
            style={{ width: `${Math.min(Math.abs(velocity) / 10, 100)}%`, minWidth: 4 }}
            role="presentation"
          />
          <span>{Math.abs(velocity) > 30 ? "Scrolling..." : "Try scrolling here"}</span>
        </div>
      )}

      {/* Trackpad notice */}
      {isTrackpad && (
        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
          Looks like you&apos;re using a trackpad — Inertia is designed for mouse wheels.
          The demo works best with a mouse.
        </p>
      )}
    </div>
  );
}
