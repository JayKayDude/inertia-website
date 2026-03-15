"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import ScrollReveal from "@/components/effects/ScrollReveal";
import { SCREENSHOT_TABS } from "@/lib/constants";

export default function ScreenshotsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="px-6 py-20 md:py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Simple. Powerful. Beautiful.
            </h2>
            <p className="mx-auto max-w-prose text-lg text-gray-600 dark:text-gray-400">
              A clean, native interface that feels right at home on macOS.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          {/* Tab buttons */}
          <div className="mb-6 flex justify-center gap-2">
            {SCREENSHOT_TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                  activeTab === i
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Screenshot with macOS chrome */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" aria-hidden="true" />
                <div className="h-3 w-3 rounded-full bg-green-500" aria-hidden="true" />
              </div>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                Inertia Settings — {SCREENSHOT_TABS[activeTab].label}
              </span>
            </div>

            {/* Screenshot */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={`/images/screenshots/${SCREENSHOT_TABS[activeTab].file}`}
                    alt={`Inertia ${SCREENSHOT_TABS[activeTab].label} settings tab showing scroll configuration options`}
                    width={520}
                    height={400}
                    className="w-full"
                    priority={activeTab === 0}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
