"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollEngine } from "@/components/interactive/ScrollEngineContext";
import { useRevealRef } from "@/components/interactive/PageScrollEngine";

export default function RevealSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { isInertiaActive } = useScrollEngine();
  const registerReveal = useRevealRef();

  // Register with PageScrollEngine
  useEffect(() => {
    registerReveal?.(sectionRef.current);
    return () => registerReveal?.(null);
  }, [registerReveal]);

  // Fade in when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 py-20"
    >
      {/* Content */}
      <div
        className={`relative text-center transition-all duration-700 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h2
          className={`text-4xl font-bold tracking-tight md:text-6xl ${
            isInertiaActive ? "gradient-text" : ""
          }`}
        >
          {isInertiaActive ? "This is Inertia." : "Now, scroll again."}
        </h2>

        {/* Tri-gradient line */}
        <div
          className={`mx-auto mt-8 h-0.5 rounded-full transition-all duration-800 ease-out ${
            isInertiaActive ? "w-48 opacity-100" : "w-0 opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)",
          }}
          aria-hidden="true"
        />

        <p
          className={`mx-auto mt-6 max-w-md text-lg text-gray-500 transition-opacity duration-500 dark:text-gray-400 ${
            isInertiaActive ? "opacity-100" : "opacity-0"
          }`}
        >
          Smooth, physics-based momentum — feel the difference.
        </p>
      </div>
    </section>
  );
}
