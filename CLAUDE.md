# Inertia Landing Page Website

Marketing landing page for Inertia, a macOS menubar app for smooth mouse wheel scrolling.

## Tech Stack
- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion 11
- **Icons:** Lucide React
- **Hosting:** Vercel
- **Repo:** github.com/JayKayDude/inertia-website

## Commands
- `npm run dev` — Start dev server at localhost:3000
- `npm run build` — Production build
- `npm run lint` — ESLint check

## Project Conventions
- Apple-inspired design: SF Pro fonts, generous whitespace, glass-morphism effects
- Tri-gradient accent: cyan (#06b6d4) -> blue (#3b82f6) -> purple (#8b5cf6)
- Dark mode via Tailwind `class` strategy
- All images via `next/image`
- `prefers-reduced-motion` must be respected — disable animations when set
- Interactive scroll demo uses `{ passive: false }` wheel listeners via useEffect (not React onWheel)
- GitHub Releases API: match asset by exact name `Inertia.zip`

## Key Files
- `src/lib/scrollPhysics.ts` — Ported physics engine from ScrollEngine.swift
- `src/components/interactive/` — Interactive scroll demo components
- `src/app/api/release/route.ts` — GitHub Releases API proxy

## Memory (Cognitive Types)

| Type | File | Purpose |
|------|------|---------|
| Working | SESSION-STATE.md | Current position, next actions |
| Semantic | PROJECT-MEMORY.md | Decisions, constraints, gates |
| Episodic | LEARNING-LOG.md | Lessons learned |
