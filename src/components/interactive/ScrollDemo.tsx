"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ScrollPhysicsEngine } from "@/lib/scrollPhysics";

export default function ScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [inertiaEnabled, setInertiaEnabled] = useState(false);
  const [isTrackpad, setIsTrackpad] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const engineRef = useRef<ScrollPhysicsEngine | null>(null);
  const scrollOffsetRef = useRef(0);

  // Trackpad detection: track recent wheel events and look for
  // the high-frequency, small-delta pattern unique to trackpads.
  // Mice produce discrete ticks (low frequency, larger deltas).
  // Trackpads produce continuous streams (high frequency, often fractional).
  const recentEventsRef = useRef<{ time: number; deltaY: number }[]>([]);

  useEffect(() => {
    const engine = new ScrollPhysicsEngine({
      baseSpeed: 4.0,
      smoothness: 0.6,
      momentumDuration: 0.6,
      easing: "smooth",
    });

    engine.onScroll = (delta) => {
      const inner = innerRef.current;
      const container = containerRef.current;
      if (!inner || !container) return;

      const maxScroll = inner.scrollHeight - container.clientHeight;
      scrollOffsetRef.current = Math.max(0, Math.min(scrollOffsetRef.current + delta, maxScroll));
      inner.style.transform = `translateY(${-scrollOffsetRef.current}px)`;
    };

    engineRef.current = engine;

    return () => engine.destroy();
  }, []);

  const detectTrackpad = useCallback((e: WheelEvent) => {
    const now = performance.now();
    const events = recentEventsRef.current;

    events.push({ time: now, deltaY: e.deltaY });

    // Keep only events from the last 200ms
    while (events.length > 0 && now - events[0].time > 200) {
      events.shift();
    }

    // Observed on macOS (from debug data):
    //   Mouse:    fractional deltaY, large magnitude (100-300), ~11 Hz
    //   Trackpad: integer deltaY, small magnitude (1-2), ~80 Hz
    //
    // Detect trackpad: 10+ events in 200ms (50+ Hz) where most
    // have small integer deltas (|deltaY| <= 4).
    // Re-evaluates on every event so switching devices updates the notice.
    if (events.length >= 10) {
      const smallIntCount = events.filter(
        ev => Math.abs(ev.deltaY) <= 4 && ev.deltaY % 1 === 0
      ).length;
      setIsTrackpad(smallIntCount >= events.length * 0.7);
    } else if (events.length >= 3 && isTrackpad) {
      // If we have a few events and they look like mouse, clear quickly
      const smallIntCount = events.filter(
        ev => Math.abs(ev.deltaY) <= 4 && ev.deltaY % 1 === 0
      ).length;
      if (smallIntCount < events.length * 0.3) {
        setIsTrackpad(false);
      }
    }
  }, [isTrackpad]);

  // Sync scrollOffsetRef when switching modes
  const switchToInertia = useCallback(() => {
    setInertiaEnabled(true);
    const container = containerRef.current;
    if (container) {
      scrollOffsetRef.current = container.scrollTop;
      const inner = innerRef.current;
      if (inner) {
        inner.style.transform = `translateY(${-scrollOffsetRef.current}px)`;
      }
      container.scrollTop = 0;
    }
  }, []);

  const switchToDefault = useCallback(() => {
    engineRef.current?.stop();
    const container = containerRef.current;
    const inner = innerRef.current;
    if (container && inner) {
      inner.style.transform = "";
      container.scrollTop = scrollOffsetRef.current;
    }
    setInertiaEnabled(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!hasScrolled) setHasScrolled(true);
      detectTrackpad(e);

      if (!inertiaEnabled) return;

      e.preventDefault();
      e.stopPropagation();

      engineRef.current?.handleWheel(e.deltaY, e.deltaMode);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [inertiaEnabled, detectTrackpad, hasScrolled]);

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
          onClick={switchToDefault}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors min-h-[44px] ${
            !inertiaEnabled
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Default Scroll
        </button>
        <button
          onClick={switchToInertia}
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
          style={{ overflow: inertiaEnabled ? "hidden" : "auto" }}
        >
          <div ref={innerRef} className="p-6" style={{ willChange: inertiaEnabled ? "transform" : "auto" }}>
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

      {/* Hint — disappears after first scroll */}
      {!hasScrolled && (
        <p className="mt-3 text-center text-sm text-gray-400 dark:text-gray-500">
          Try scrolling here with your mouse wheel
        </p>
      )}

      {/* Trackpad notice */}
      {isTrackpad && (
        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          Looks like you&apos;re using a trackpad. This web demo applies smooth scrolling to all input,
          but the actual app only affects mouse wheels — your trackpad scrolling stays untouched.
        </p>
      )}
    </div>
  );
}
