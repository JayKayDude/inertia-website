# Project Memory

**Project:** Inertia Landing Page Website
**Memory Type:** Semantic (decisions, constraints, gates)
**Updated:** 2026-03-14

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-14 | Next.js + Tailwind + Framer Motion stack | Modern, performant, Vercel-native hosting |
| 2026-03-14 | Tri-gradient accent (cyan/blue/purple) | Matches Inertia app icon triskelion design |
| 2026-03-14 | GitHub Releases API for downloads | Pull latest `Inertia.zip` dynamically, no manual file hosting |
| 2026-03-14 | No competitor comparison table | Keep focus positive, Inertia-only |
| 2026-03-14 | SF Pro + Inter fallback fonts | Apple-native on macOS, Inter for cross-platform |
| 2026-03-14 | Dark mode via Tailwind `class` strategy | Explicit toggle + system preference default; requires `@custom-variant dark` in Tailwind v4 |
| 2026-03-14 | Direction-only scroll input (ignore deltaY magnitude) | Matches how the real Inertia app works |
| 2026-03-14 | Trackpad detection: high-freq + small integer deltas | Mouse = fractional large deltas ~11Hz; Trackpad = integer small deltas ~80Hz (observed via debug page) |
| 2026-03-14 | Remove screenshots, replace with interactive demos | Static screenshots don't add value; interactive controls are more compelling (like mos.caldis.me) |
| 2026-03-14 | v2: Entire page becomes the scroll demo | Page starts with native scroll, switches to Inertia at a reveal point, controls modify live scroll |
| 2026-03-14 | v2: Subtle gradient pulse for reveal transition | Not dramatic — the scroll feel change is the star, not the visuals |
| 2026-03-14 | v2: Speed + Smoothness + Easing as live controls | Three controls that change page scroll in real-time |
| 2026-03-14 | v2: Mobile gets simplified interactive (no scroll hijack) | Detected via viewport width + pointer type; easing curve editor works with touch |

## Constraints
- Must respect `prefers-reduced-motion` — disable all animations AND scroll hijacking
- Wheel listeners must use `{ passive: false }` via useEffect (not React onWheel)
- GitHub asset matched by exact name `Inertia.zip`
- App requires macOS 15.0+ — note on download section
- No personal info in public-facing files unless explicitly asked
- Tailwind v4 dark mode requires `@custom-variant dark (&:where(.dark, .dark *))` in globals.css

## Phase Gates (v2 Redesign)

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Core Architecture: PageScrollEngine, ScrollEngineContext, native→physics transition | Not Started |
| 2 | Reveal Section: "This is Inertia" with gradient pulse, IntersectionObserver trigger | Not Started |
| 3 | Interactive Controls: speed/smoothness sliders, easing buttons, wired to engine | Not Started |
| 4 | Custom Curve Editor: draggable points, Fritsch-Carlson interpolation, live engine update | Not Started |
| 5 | Cleanup & Mobile: remove old files, mobile detection, simplified experience | Not Started |
| 6 | Polish: reduced-motion, keyboard nav, contrast, responsive | Not Started |
| 7 | Bug Testing & Documentation: full test pass, update docs | Not Started |
