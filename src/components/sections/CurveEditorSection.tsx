"use client";

import ScrollReveal from "@/components/effects/ScrollReveal";
import EasingCurveCanvas from "@/components/interactive/EasingCurveCanvas";
import Image from "next/image";

export default function CurveEditorSection() {
  return (
    <section className="bg-[var(--muted)] px-6 py-20 md:py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Dial in your perfect scroll feel.
            </h2>
            <p className="mx-auto max-w-prose text-lg text-gray-600 dark:text-gray-400">
              Choose from built-in presets or design your own easing curve
              with the visual editor.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <ScrollReveal>
            <EasingCurveCanvas />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg dark:border-gray-700">
              <Image
                src="/images/screenshots/advanced.png"
                alt="Inertia's easing curve editor showing a visual curve with draggable control points and preset buttons for Smooth, Snappy, Linear, Gradual, and Custom modes"
                width={520}
                height={400}
                className="w-full"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
