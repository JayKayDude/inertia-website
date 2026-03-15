"use client";

import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-lg font-semibold leading-snug">{title}</h3>
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </article>
  );
}
