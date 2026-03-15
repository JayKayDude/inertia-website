# Project Memory

**Project:** Inertia Landing Page Website
**Memory Type:** Semantic (decisions, constraints, gates)
**Updated:** 2026-03-14

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-14 | Next.js + Tailwind + Framer Motion stack | Modern, performant, Vercel-native hosting |
| 2026-03-14 | Tri-gradient accent (cyan/blue/purple) | Matches Inertia app icon triskelion design |
| 2026-03-14 | Interactive scroll demo as hero | Users feel the difference firsthand — strongest pitch |
| 2026-03-14 | GitHub Releases API for downloads | Pull latest `Inertia.zip` dynamically, no manual file hosting |
| 2026-03-14 | No competitor comparison table | Keep focus positive, Inertia-only |
| 2026-03-14 | SF Pro + Inter fallback fonts | Apple-native on macOS, Inter for cross-platform |
| 2026-03-14 | Dark mode via Tailwind `class` strategy | Explicit toggle + system preference default |

## Constraints
- Must respect `prefers-reduced-motion` — disable all animations
- Wheel listeners must use `{ passive: false }` via useEffect (not React onWheel)
- GitHub asset matched by exact name `Inertia.zip` (multiple .zip files possible in releases)
- App requires macOS 15.0+ — note on download section
- No personal info in public-facing files unless explicitly asked

## Phase Gates

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation: scaffold, config, governance docs, GitHub repo | In Progress |
| 2 | Physics Engine: port scrollPhysics.ts, create useInertialScroll hook | Not Started |
| 3 | Interactive Demo: ScrollDemo, ScrollComparison, EasingCurveCanvas | Not Started |
| 4 | Page Sections: Hero, Problem, Features, CurveEditor, Screenshots, Download | Not Started |
| 5 | Infrastructure: Header, Footer, API route, download integration | Not Started |
| 6 | Polish: dark mode, responsive, a11y, performance, deploy | Not Started |
