"use client";

import GradientText from "@/components/ui/GradientText";
import DownloadButton from "@/components/ui/DownloadButton";
import GradientOrb from "@/components/effects/GradientOrb";
import ScrollReveal from "@/components/effects/ScrollReveal";
import { GITHUB_URL } from "@/lib/constants";
import { Github } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-32 md:pb-32 md:pt-44">
      {/* Background orbs */}
      <GradientOrb
        className="-top-20 -left-32"
        color="rgba(6, 182, 212, 0.12)"
        size={500}
      />
      <GradientOrb
        className="-top-10 -right-32"
        color="rgba(139, 92, 246, 0.12)"
        size={500}
        delay={2}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl md:leading-[1.1]">
            <GradientText>Smooth scrolling</GradientText>{" "}
            for every mouse.
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="mx-auto mb-8 max-w-prose text-lg leading-relaxed text-gray-600 dark:text-gray-400 md:text-xl">
            Inertia replaces choppy mouse wheel scrolling on macOS with fluid,
            physics-based momentum — making any mouse feel as smooth as a trackpad.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <DownloadButton size="large" />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-8 py-4 text-lg font-semibold transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900 min-h-[52px]"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
              View on GitHub
            </a>
          </div>

          <details className="mx-auto mt-4 max-w-md text-left text-sm text-gray-400 dark:text-gray-500">
            <summary className="cursor-pointer text-center hover:text-gray-600 dark:hover:text-gray-300">
              First launch instructions
            </summary>
            <p className="mt-2 rounded-lg bg-gray-100 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Inertia is not currently signed or notarized. On first launch, right-click the app and select <strong>Open</strong>, then click <strong>Open</strong> in the dialog. If that doesn&apos;t work, go to <strong>System Settings → Privacy &amp; Security</strong>, scroll down, and click <strong>Open Anyway</strong>. This is only needed once.
            </p>
          </details>
        </ScrollReveal>
      </div>
    </section>
  );
}
