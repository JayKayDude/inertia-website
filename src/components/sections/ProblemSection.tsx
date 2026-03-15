"use client";

import ScrollReveal from "@/components/effects/ScrollReveal";

// Fake content lines to simulate a document being scrolled
const CONTENT_LINES = [
  85, 60, 90, 45, 75, 55, 80, 50, 70, 65, 85, 40, 90, 55, 75, 60, 80, 45, 70, 50,
];

export default function ProblemSection() {
  return (
    <section className="bg-[var(--muted)] px-6 py-20 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">
            macOS treats your mouse like it&apos;s from 2005.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="mx-auto mb-12 max-w-prose text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Trackpads get beautiful, fluid scrolling with momentum. Mouse wheels?
            Choppy, line-by-line jumps. Inertia fixes that.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mx-auto grid max-w-2xl gap-8 md:grid-cols-2">
            {/* Without Inertia — choppy stepped scroll */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-4 text-sm font-semibold text-red-500">Without Inertia</p>
              <div
                className="scroll-demo-container"
                aria-label="Choppy scroll visualization showing stuttery steps"
              >
                <div className="scroll-demo-choppy">
                  {CONTENT_LINES.map((w, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full bg-red-200/80 dark:bg-red-800/40"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Stepped, jarring jumps
              </p>
            </div>

            {/* With Inertia — smooth momentum scroll */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-4 text-sm font-semibold text-green-500">With Inertia</p>
              <div
                className="scroll-demo-container"
                aria-label="Smooth scroll visualization showing fluid motion"
              >
                <div className="scroll-demo-smooth">
                  {CONTENT_LINES.map((w, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-200/80 via-blue-200/80 to-purple-200/80 dark:from-cyan-800/40 dark:via-blue-800/40 dark:to-purple-800/40"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Smooth, natural momentum
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
