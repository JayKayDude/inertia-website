# Learning Log

**Project:** Inertia Landing Page Website
**Memory Type:** Episodic (experiences)
**Updated:** 2026-03-14

> **Entry rules:** Each entry <=5 lines. State what happened, then the actionable rule.
> Record conclusions, not evidence. If it wouldn't change future behavior, it doesn't belong here.

---

## Active Lessons

### L001: create-next-app React Compiler prompt (2026-03-14)
`create-next-app` now asks about React Compiler interactively. Pipe `echo "n"` to skip it non-interactively. The `--turbopack` flag alone doesn't suppress this prompt.

### L002: Math.random causes hydration mismatch (2026-03-14)
Using `Math.random()` in JSX produces different values on server vs client, causing React hydration errors. Use deterministic values (hardcoded arrays) instead.

### L003: Tailwind v4 dark mode needs @custom-variant (2026-03-14)
Tailwind v4 defaults to `prefers-color-scheme` media query for `dark:` utilities. To use class-based dark mode, add `@custom-variant dark (&:where(.dark, .dark *));` in globals.css. Without this, only CSS custom properties toggle — Tailwind utilities don't.

### L004: Screenshots already have macOS window chrome (2026-03-14)
The Inertia app screenshots include the macOS title bar with traffic lights. Adding CSS-drawn window chrome creates a double header. Don't wrap screenshots in fake window chrome.

### L005: Trackpad vs mouse detection is device-specific (2026-03-14)
Common assumption (fractional = trackpad, integer = mouse) is WRONG on this machine. Actual observed data: Mouse produces large fractional deltas at ~11 Hz. Trackpad produces small integer deltas at ~80 Hz. Always build a debug page to observe actual values before writing detection logic.

### L006: scrollTop doesn't work with overflow:hidden (2026-03-14)
Setting `scrollTop` on a div with `overflow: hidden` has no effect. For physics-driven scrolling, use `translateY()` transforms on an inner content div instead. Add `will-change: transform` for GPU acceleration.

### L007: CSS transform scroll needs mode-switch sync (2026-03-14)
When toggling between native scroll (scrollTop) and transform scroll (translateY), must sync the position: read scrollTop before switching to transform, and restore scrollTop when switching back. Otherwise the content jumps.

### L008: React 19 strict linter — no ref.current in render (2026-03-14)
React 19's `react-hooks/refs` rule forbids accessing `ref.current` during render (including in JSX, useMemo, context values). Use a `getEngine()` accessor callback pattern instead of passing `engineRef.current` directly through context. `useCallback(() => ref.current, [])` satisfies the linter.

### L009: React 19 strict linter — no setState in effects (2026-03-14)
`react-hooks/set-state-in-effect` blocks synchronous `setState` inside `useEffect`. Use lazy state initializers (`useState(() => computeValue())`) for values that can be computed at mount time. For DOM reads that must happen post-hydration (e.g., `document.documentElement.classList`), use a targeted `// eslint-disable-next-line` with a comment explaining why.

### L010: React 19 strict linter — no state mutation (2026-03-14)
`react-hooks/immutability` prevents mutating values returned from `useState()` (e.g., setting `engine.onScroll = ...` where `engine` came from state). Store mutable objects in refs, not state. If they need to appear in context, use an accessor callback that reads from the ref.

### L011: Don't use body position:fixed for scroll locking (2026-03-14)
Using `body { position: fixed; top: -scrollY }` to lock scrolling while preserving visual position causes double-offset when combined with `translateY` on content. Instead, just set `document.documentElement.style.overflow = 'hidden'` and manage all positioning through transforms.

### L012: Direct deltaY scroll feels wrong without interpolation (2026-03-14)
Applying `scrollOffset += e.deltaY` directly per wheel tick produces jerkier scrolling than native browser behavior, because browsers apply their own smoothing between ticks. Use a lerp target + rAF loop (target accumulates deltaY, loop interpolates toward it) to replicate native-feeling smoothness.

### L013: Don't check scroll threshold in engine onScroll callback (2026-03-14)
Checking physics activation/deactivation threshold inside the engine's `onScroll` (animation frame callback) causes problems: calling `engine.stop()` kills momentum mid-scroll (user gets stuck), and not calling it causes both engine and lerp to fight over the offset simultaneously. Instead, check the threshold only on new wheel events — let engine momentum play out naturally, evaluate position when the user sends new input.

### L014: Trackpad users need scroll handling when page is overflow:hidden (2026-03-14)
When the page uses `overflow: hidden` + `translateY` for scrolling, native scroll is disabled for everyone. Trackpad users must also go through the custom scroll handler — but use the lerp path (no physics momentum, since macOS already provides trackpad momentum). Don't just `return` and skip the handler for trackpad.

## Graduated Patterns

| Pattern | Graduated To | Date |
|---------|-------------|------|
