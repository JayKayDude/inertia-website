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
| 2026-03-14 | SF Pro + Inter fallback fonts | Apple-native on macOS, Inter for cross-platform |
| 2026-03-14 | Dark mode via Tailwind `class` strategy | Explicit toggle + system preference default; requires `@custom-variant dark` in Tailwind v4 |
| 2026-03-14 | Direction-only scroll input (ignore deltaY magnitude) | Matches how the real Inertia app works |
| 2026-03-14 | Trackpad detection: high-freq + small integer deltas | Mouse = fractional large deltas ~11Hz; Trackpad = integer small deltas ~80Hz |
| 2026-03-14 | v2: Entire page is transform-based from the start | No native→physics handoff — one coordinate system, `overflow: hidden` + `translateY` throughout |
| 2026-03-14 | v2: Lerp scrolling pre-reveal, physics post-reveal | Pre-reveal uses `target += deltaY` with rAF lerp (0.15 factor); post-reveal uses ScrollPhysicsEngine |
| 2026-03-14 | v2: `getEngine()` accessor instead of direct engine in context | React 19 strict linter prevents ref access during render and state mutation; accessor pattern solves both |
| 2026-03-14 | v2: Threshold check on wheel event, not in onScroll | Checking in engine's onScroll callback caused either momentum kill (stop()) or dual-update conflicts |
| 2026-03-14 | v2: Speed + Smoothness + Easing as live controls | Three controls that change page scroll in real-time |
| 2026-03-14 | v2: Always show easing curve graph | PresetCurveDisplay for standard presets, CurveEditor for custom |
| 2026-03-14 | v2: scrollDistanceMultiplier = 1.5 | User-tuned feel for the smooth scroll zone |

## Constraints
- Must respect `prefers-reduced-motion` — disable all animations AND scroll hijacking
- Wheel listeners must use `{ passive: false }` via useEffect (not React onWheel)
- GitHub asset matched by exact name `Inertia.zip`
- App requires macOS 15.0+ — note on download section
- No personal info in public-facing files unless explicitly asked
- Tailwind v4 dark mode requires `@custom-variant dark (&:where(.dark, .dark *))` in globals.css
- React 19 linter: no ref.current in render, no setState in effects (use lazy initializers or eslint-disable with justification)

## Phase Gates (v2 Redesign)

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Core Architecture: PageScrollEngine, ScrollEngineContext, lerp→physics transition | Done |
| 2 | Reveal Section: basic "This is Inertia" with gradient text | Done (to be redesigned) |
| 3 | Interactive Controls: speed/smoothness sliders, easing buttons, wired to engine | Done |
| 4 | Custom Curve Editor: draggable points, Fritsch-Carlson interpolation, live engine update | Done |
| 5 | Cleanup & Mobile: remove old files, mobile detection, simplified experience | Done |
| 6 | Scroll-driven reveal animation: Apple-style title float-up with burst effect | Not Started |
| 7 | Polish & Bug Testing: reduced-motion, keyboard nav, contrast, responsive | Not Started |
