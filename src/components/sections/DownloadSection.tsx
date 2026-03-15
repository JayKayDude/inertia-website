"use client";

import ScrollReveal from "@/components/effects/ScrollReveal";
import DownloadButton from "@/components/ui/DownloadButton";
import GradientOrb from "@/components/effects/GradientOrb";
import { Code, Heart, Lock } from "lucide-react";

export default function DownloadSection() {
  return (
    <section id="download" className="relative overflow-hidden px-6 py-20 md:py-32">
      <GradientOrb
        className="bottom-0 left-1/2 -translate-x-1/2"
        color="rgba(59, 130, 246, 0.08)"
        size={600}
        delay={1}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
            Start scrolling smoothly. It&apos;s free.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="mx-auto mb-8 max-w-prose text-lg text-gray-600 dark:text-gray-400">
            No paywalls, no tiers, no locked features. Every feature is included.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <DownloadButton size="large" className="mb-6" />

          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            Requires macOS 15.0 (Sequoia) or later
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <Heart className="h-4 w-4 text-red-500" aria-hidden="true" />
              100% Free
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <Code className="h-4 w-4 text-blue-500" aria-hidden="true" />
              Open Source
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <Lock className="h-4 w-4 text-green-500" aria-hidden="true" />
              No Tracking
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
