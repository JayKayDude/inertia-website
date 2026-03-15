"use client";

import ScrollReveal from "@/components/effects/ScrollReveal";
import FeatureCard from "@/components/ui/FeatureCard";
import { FEATURES } from "@/lib/constants";

export default function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-20 md:py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mx-auto max-w-prose text-lg text-gray-600 dark:text-gray-400">
              Powerful features wrapped in a simple, lightweight package.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.08}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
