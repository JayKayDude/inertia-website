"use client";

import ScrollReveal from "@/components/effects/ScrollReveal";

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
            {/* Without Inertia */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-4 text-sm font-semibold text-red-500">Without Inertia</p>
              <div className="flex flex-col gap-1.5" aria-label="Choppy scroll visualization showing stuttery steps">
                {[45, 42, 48, 41, 46, 43, 47, 44].map((w, i) => (
                  <div
                    key={i}
                    className="h-2.5 rounded-full bg-red-100 dark:bg-red-900/30"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Stepped, jarring jumps
              </p>
            </div>

            {/* With Inertia */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-4 text-sm font-semibold text-green-500">With Inertia</p>
              <div className="flex flex-col gap-1.5" aria-label="Smooth scroll visualization showing fluid motion">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2.5 rounded-full bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 dark:from-cyan-900/30 dark:via-blue-900/30 dark:to-purple-900/30"
                    style={{ width: `${80 - i * 6}%` }}
                  />
                ))}
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
