# Inertia Landing Page Website

Marketing landing page for Inertia, a macOS menubar app for smooth mouse wheel scrolling.

## Tech Stack
- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion 11
- **Icons:** Lucide React
- **Hosting:** Vercel (inertia-scroll.vercel.app)
- **Repo:** github.com/JayKayDude/inertia-website

## Commands
- `npm run dev` — Start dev server at localhost:3000
- `npm run build` — Production build
- `npm run lint` — ESLint check

## Project Conventions
- Apple-inspired design: SF Pro fonts, generous whitespace, glass-morphism effects
- Tri-gradient accent: cyan (#06b6d4) -> blue (#3b82f6) -> purple (#8b5cf6)
- Dark mode via Tailwind `class` strategy — requires `@custom-variant dark` in globals.css
- `prefers-reduced-motion` must be respected — disable animations AND scroll hijacking
- Wheel listeners use `{ passive: false }` via useEffect (not React onWheel)
- GitHub Releases API: match asset by exact name `Inertia.zip`, validate URL starts with trusted prefix
- Trackpad detection: 8+ events in 300ms where 70%+ are small integers (|deltaY| <= 4)
- Physics-driven scrolling uses translateY transforms (not scrollTop) with will-change: transform
- No screenshots — interactive demos replace static images
- `position: fixed` elements (Header) must be outside the translated content div (use `overlay` prop on PageScrollEngine)
- Scroll position resets to top on page reload (history.scrollRestoration = "manual")

## Page Architecture (v3)
The entire page is the demo. Visitors scroll natively at the top (choppy), then Inertia physics kick in at a reveal point. The controls section lets users tweak scroll behavior in real-time.

**Page flow:** Hero → Problem → Reveal (switch point) → Features → Controls → Download → Footer

### Reveal Animation (time-based)
- 200vh section with simulated sticky viewport
- Text floats into view, then at 30% scroll progress a time-based animation triggers (2.5s forward, 1.5s reverse)
- Burst includes: glow build, color ripple wave, 7 expanding rings, 20 particles, gradient text, tri-gradient line, subtitle
- Scrolling back up past trigger plays reverse animation at 1.5s
- Scroll always drives viewport position (never blocked); only visual effects are time-based

### Problem Section
- Animated scroll demos: choppy (CSS steps) vs smooth (CSS ease-in-out)
- Synced 4s loops, both forward and back

## Nav
- Minimal: just GitHub link + dark mode toggle (like Mos/Mac Mouse Fix)
- Header rendered via `overlay` prop (outside translated content div, inside context provider)
- Glass effect uses `subscribeToScroll` (not window.scrollY, which doesn't change with translateY scrolling)

## Security
- Security headers in `next.config.ts`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Download URL validated against trusted GitHub prefix before serving
- Optional `GITHUB_TOKEN` env var for higher GitHub API rate limits (5,000/hr vs 60/hr)

## Key Files
- `src/lib/scrollPhysics.ts` — Ported physics engine from ScrollEngine.swift (includes custom curve support)
- `src/components/interactive/PageScrollEngine.tsx` — Global scroll controller wrapping the page
- `src/components/interactive/ScrollEngineContext.tsx` — React context for engine access (subscribeToScroll, scrollToOffset)
- `src/components/interactive/CurveEditor.tsx` — Interactive draggable easing curve editor
- `src/components/interactive/ScrollControls.tsx` — Speed/Smoothness/Easing live controls
- `src/components/sections/RevealSection.tsx` — "This is Inertia" time-based burst animation
- `src/components/sections/ProblemSection.tsx` — Animated choppy vs smooth scroll comparison
- `src/components/sections/ControlsSection.tsx` — Wrapper for ScrollControls
- `src/components/layout/Header.tsx` — Minimal nav (GitHub + dark mode)
- `src/components/layout/Footer.tsx` — Branded footer with app icon, tagline, tri-gradient divider
- `src/app/api/release/route.ts` — GitHub Releases API proxy with URL validation
- `src/app/sitemap.ts` — Dynamic sitemap generation
- `src/lib/constants.ts` — Feature data, GitHub URLs, easing presets
- `next.config.ts` — Security headers
- `public/robots.txt` — Crawler directives
