# Session State

**Project:** Inertia Landing Page Website
**Memory Type:** Working (current position)
**Updated:** 2026-03-14

## Current Phase
v1 complete — preparing for v2 immersive redesign

## Current Task
Commit and push v1 of the website. Then begin v2 redesign where the entire page becomes the scroll demo.

## Completed Work (v1)
- Next.js 15 + Tailwind CSS 4 + Framer Motion 11 scaffolded
- GitHub repo created: github.com/JayKayDude/inertia-website
- Physics engine ported from ScrollEngine.swift (scrollPhysics.ts)
- Scroll acceleration curve, tick rate tracking, swipe detection, all 4 easing presets
- Interactive scroll demo with Default/Inertia toggle
- Trackpad detection (high-frequency small integer deltas)
- All page sections: Hero, Problem, Features, Easing Curves, Screenshots, Download
- GitHub Releases API route (ISR hourly, exact Inertia.zip match)
- Dark mode with class strategy + system preference sync
- Header with glass-morphism, mobile nav, dark mode toggle
- Framer Motion scroll reveals, prefers-reduced-motion respected
- Hydration bug fixed (Math.random → deterministic values)
- Screenshot chrome removed (images already have macOS window chrome)
- Tailwind v4 dark mode fixed (@custom-variant dark)

## Next Actions
1. Update all governance documents (this file, PROJECT-MEMORY, LEARNING-LOG, CLAUDE.md)
2. Commit and push v1
3. Begin v2 redesign: immersive scroll demo (page IS the demo)

## Blockers
None
