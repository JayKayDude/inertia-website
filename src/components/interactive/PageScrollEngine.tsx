"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { ScrollPhysicsEngine, DEFAULT_CONFIG } from "@/lib/scrollPhysics";
import { ScrollEngineContext } from "./ScrollEngineContext";

// Context for reveal section to register its DOM element
export const RevealRefContext = createContext<
  ((el: HTMLDivElement | null) => void) | null
>(null);

export function useRevealRef() {
  return useContext(RevealRefContext);
}

interface PageScrollEngineProps {
  children: ReactNode;
  /** Elements rendered outside the translated content div (e.g. fixed headers) */
  overlay?: ReactNode;
}

/**
 * The entire page is always transform-based (overflow hidden, translateY).
 * Before the reveal point: wheel events scroll directly (no momentum).
 * After the reveal point: wheel events go through the physics engine (smooth momentum).
 */
export default function PageScrollEngine({ children, overlay }: PageScrollEngineProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const revealElRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ScrollPhysicsEngine | null>(null);
  const scrollOffsetRef = useRef(0);
  const subscribersRef = useRef<Set<(offset: number) => void>>(new Set());
  const physicsActiveRef = useRef(false);
  const [isInertiaActive, setIsInertiaActive] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches
    );
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Trackpad detection
  const recentEventsRef = useRef<{ time: number; deltaY: number }[]>([]);
  const isTrackpadRef = useRef(false);

  // Lerp scrolling for pre-reveal / trackpad
  const targetOffsetRef = useRef(0);
  const lerpRafRef = useRef<number | null>(null);

  // Apply the current scroll offset to the content div
  const applyTransform = useCallback(() => {
    const content = contentRef.current;
    if (content) {
      content.style.transform = `translateY(${-scrollOffsetRef.current}px)`;
    }
    // Notify scroll subscribers
    const offset = scrollOffsetRef.current;
    subscribersRef.current.forEach((cb) => cb(offset));
  }, []);

  // Clamp offset to valid range
  const clampOffset = useCallback((offset: number) => {
    const content = contentRef.current;
    if (!content) return offset;
    const maxScroll = content.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(offset, maxScroll));
  }, []);

  // Initialize engine
  useEffect(() => {
    const eng = new ScrollPhysicsEngine({ ...DEFAULT_CONFIG });
    engineRef.current = eng;

    eng.onScroll = (delta: number) => {
      scrollOffsetRef.current = clampOffset(scrollOffsetRef.current + delta);
      targetOffsetRef.current = scrollOffsetRef.current;
      applyTransform();
    };

    return () => {
      eng.destroy();
      if (lerpRafRef.current !== null) {
        cancelAnimationFrame(lerpRafRef.current);
      }
    };
  }, [applyTransform, clampOffset]);

  // Reset scroll position on mount (page reload)
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    scrollOffsetRef.current = 0;
    targetOffsetRef.current = 0;
    applyTransform();
  }, [applyTransform]);

  // Lock body overflow on mount (whole page is transform-based)
  useEffect(() => {
    if (isMobile || reducedMotion) return;

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100vh";

    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, [isMobile, reducedMotion]);

  // Subscribe to mobile and reduced-motion changes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          window.matchMedia("(pointer: coarse)").matches
      );
    };
    window.addEventListener("resize", checkMobile);

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", onChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mql.removeEventListener("change", onChange);
    };
  }, []);

  // Trackpad detection
  const detectTrackpad = useCallback((e: WheelEvent) => {
    const now = performance.now();
    const events = recentEventsRef.current;
    events.push({ time: now, deltaY: e.deltaY });
    while (events.length > 0 && now - events[0].time > 300) events.shift();

    if (events.length >= 8) {
      const smallInt = events.filter(
        (ev) => Math.abs(ev.deltaY) <= 4 && ev.deltaY % 1 === 0
      ).length;
      isTrackpadRef.current = smallInt >= events.length * 0.7;
    }
  }, []);

  // Get the reveal threshold offset
  const getRevealThreshold = useCallback(() => {
    const reveal = revealElRef.current;
    if (!reveal) return Infinity;
    return reveal.offsetTop + (reveal.offsetHeight - window.innerHeight) * 0.9;
  }, []);

  // Check if we've scrolled past the reveal point (activate)
  const checkRevealThreshold = useCallback(() => {
    if (physicsActiveRef.current) return;
    const threshold = getRevealThreshold();
    if (scrollOffsetRef.current >= threshold) {
      physicsActiveRef.current = true;
      setIsInertiaActive(true);
      // Stop the lerp loop — physics engine takes over
      if (lerpRafRef.current !== null) {
        cancelAnimationFrame(lerpRafRef.current);
        lerpRafRef.current = null;
      }
    }
  }, [getRevealThreshold]);

  // Lerp loop: smoothly interpolate scrollOffset toward targetOffset
  const startLerp = useCallback(() => {
    if (lerpRafRef.current !== null) return; // already running

    const tick = () => {
      const diff = targetOffsetRef.current - scrollOffsetRef.current;
      if (Math.abs(diff) < 0.5) {
        // Close enough — snap and stop
        scrollOffsetRef.current = targetOffsetRef.current;
        applyTransform();
        lerpRafRef.current = null;
        return;
      }

      // Lerp factor: higher = snappier. 0.15 feels close to native browser smoothing.
      scrollOffsetRef.current += diff * 0.15;
      applyTransform();
      checkRevealThreshold();
      lerpRafRef.current = requestAnimationFrame(tick);
    };

    lerpRafRef.current = requestAnimationFrame(tick);
  }, [applyTransform, checkRevealThreshold]);

  // Reveal ref callback
  const registerReveal = useCallback(
    (el: HTMLDivElement | null) => {
      revealElRef.current = el;
    },
    []
  );

  // Handle ALL wheel events — direct scroll before reveal, physics after
  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const onWheel = (e: WheelEvent) => {
      detectTrackpad(e);
      e.preventDefault();

      // Re-evaluate threshold on every wheel event
      const threshold = getRevealThreshold();
      const aboveThreshold = scrollOffsetRef.current < threshold;

      if (aboveThreshold && physicsActiveRef.current) {
        // Scrolled back above reveal — deactivate physics
        physicsActiveRef.current = false;
        setIsInertiaActive(false);
        engineRef.current?.stop();
      }

      if (isTrackpadRef.current || !physicsActiveRef.current) {
        // Trackpad always, or mouse before/above reveal: lerp to target
        targetOffsetRef.current = clampOffset(
          targetOffsetRef.current + e.deltaY
        );
        startLerp();
        checkRevealThreshold();
      } else {
        // Mouse after reveal: feed to physics engine for smooth momentum
        engineRef.current?.handleWheel(e.deltaY, e.deltaMode);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isMobile, reducedMotion, detectTrackpad, clampOffset, startLerp, getRevealThreshold, checkRevealThreshold]);

  // Keyboard scrolling
  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const content = contentRef.current;
      if (!content) return;
      const maxScroll = content.scrollHeight - window.innerHeight;
      let delta = 0;

      switch (e.key) {
        case "ArrowDown":
          delta = 60;
          break;
        case "ArrowUp":
          delta = -60;
          break;
        case "PageDown":
        case " ":
          delta = window.innerHeight * 0.8;
          break;
        case "PageUp":
          delta = -window.innerHeight * 0.8;
          break;
        case "Home":
          targetOffsetRef.current = 0;
          startLerp();
          e.preventDefault();
          return;
        case "End":
          targetOffsetRef.current = maxScroll;
          startLerp();
          e.preventDefault();
          return;
        default:
          return;
      }

      e.preventDefault();
      targetOffsetRef.current = clampOffset(targetOffsetRef.current + delta);
      startLerp();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, reducedMotion, clampOffset, startLerp]);

  // Recalculate on resize
  useEffect(() => {
    const onResize = () => {
      scrollOffsetRef.current = clampOffset(scrollOffsetRef.current);
      applyTransform();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampOffset, applyTransform]);

  // Stable accessor function for engine (avoids ref-in-render)
  const getEngine = useCallback(() => engineRef.current, []);

  // Subscribe to scroll offset updates (imperative, no re-renders)
  const subscribeToScroll = useCallback((cb: (offset: number) => void) => {
    subscribersRef.current.add(cb);
    return () => { subscribersRef.current.delete(cb); };
  }, []);

  // Programmatic scroll-to for nav links
  const scrollToOffset = useCallback((offset: number) => {
    // Stop physics engine if running
    engineRef.current?.stop();
    if (physicsActiveRef.current) {
      physicsActiveRef.current = false;
      setIsInertiaActive(false);
    }
    targetOffsetRef.current = clampOffset(offset);
    startLerp();
  }, [clampOffset, startLerp]);

  // Stable context value
  const contextValue = useMemo(
    () => ({
      getEngine,
      isInertiaActive,
      subscribeToScroll,
      scrollToOffset,
    }),
    [getEngine, isInertiaActive, subscribeToScroll, scrollToOffset]
  );

  // Mobile / reduced motion: no scroll engine, native scroll
  if (isMobile || reducedMotion) {
    return (
      <ScrollEngineContext.Provider
        value={{ getEngine: () => null, isInertiaActive: false, subscribeToScroll: () => () => {}, scrollToOffset: () => {} }}
      >
        {overlay}
        <RevealRefContext.Provider value={null}>
          {children}
        </RevealRefContext.Provider>
      </ScrollEngineContext.Provider>
    );
  }

  return (
    <ScrollEngineContext.Provider value={contextValue}>
      {overlay}
      <RevealRefContext.Provider value={registerReveal}>
        <div
          ref={contentRef}
          style={{ willChange: "transform" }}
        >
          {children}
        </div>
      </RevealRefContext.Provider>
    </ScrollEngineContext.Provider>
  );
}
