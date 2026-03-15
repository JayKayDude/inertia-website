"use client";

import ScrollReveal from "@/components/effects/ScrollReveal";
import ScrollControls from "@/components/interactive/ScrollControls";

export default function ControlsSection() {
  return (
    <section className="bg-[var(--muted)] px-6 py-20 md:py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Dial in your scroll feel.
            </h2>
            <p className="mx-auto max-w-prose text-lg text-gray-600 dark:text-gray-400">
              Adjust speed, smoothness, and easing — changes apply to this
              page&apos;s scroll in real time.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <ScrollControls />
        </ScrollReveal>
      </div>
    </section>
  );
}
