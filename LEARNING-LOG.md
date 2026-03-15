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

## Graduated Patterns

| Pattern | Graduated To | Date |
|---------|-------------|------|
