"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useScrollEngine } from "@/components/interactive/ScrollEngineContext";
import { useRevealRef } from "@/components/interactive/PageScrollEngine";

const RING_COUNT = 7;
const PARTICLE_COUNT = 20;
const FORWARD_DURATION = 2500; // ms
const REVERSE_DURATION = 1500; // ms — faster reverse feels snappier

function generateParticles(count: number) {
  const particles: { angle: number; maxDist: number; size: number; color: string }[] = [];
  const colors = ["#8b5cf6", "#f97316", "#06b6d4"];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const maxDist = 300 + (i % 3) * 120;
    const size = 4 + (i % 3) * 2;
    particles.push({ angle, maxDist, size, color: colors[i % 3] });
  }
  return particles;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function progress(value: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (value - start) / (end - start)));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function RevealSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Time-based animation
  const animRef = useRef(0); // 0-1 raw progress
  const directionRef = useRef<"forward" | "reverse" | "idle">("idle");
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const { subscribeToScroll } = useScrollEngine();
  const registerReveal = useRevealRef();
  const particles = useMemo(() => generateParticles(PARTICLE_COUNT), []);

  useEffect(() => {
    registerReveal?.(sectionRef.current);
    return () => registerReveal?.(null);
  }, [registerReveal]);

  // Apply all visual effects from a 0-1 value
  const applyEffects = useCallback((t: number) => {
    const text = textRef.current;
    const glow = glowRef.current;
    const ripple = rippleRef.current;
    const line = lineRef.current;
    const subtitle = subtitleRef.current;
    if (!text || !glow || !ripple || !line || !subtitle) return;

    // Map t through easing
    const e = easeOutCubic(t);

    // --- Text float + scale ---
    const ty = lerp(120, 0, Math.min(e / 0.3, 1)); // float up in first 30%
    const opacity = Math.min(e / 0.3, 1);
    const scaleBuild = lerp(0.85, 1.03, Math.min(e / 0.4, 1));
    const scaleSettle = e > 0.4 ? lerp(1.03, 1.0, progress(e, 0.4, 0.6)) : scaleBuild;
    const scale = e > 0.4 ? scaleSettle : scaleBuild;

    text.style.transform = `translateY(${ty}px) scale(${scale})`;
    text.style.opacity = `${opacity}`;

    // --- Gradient text ---
    const gradientP = progress(e, 0.5, 0.7);
    if (gradientP > 0) {
      text.style.background = `linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)`;
      text.style.webkitBackgroundClip = "text";
      text.style.backgroundClip = "text";
      text.style.webkitTextFillColor = "transparent";
      text.style.backgroundSize = "100% 100%";
    } else {
      text.style.background = "";
      text.style.webkitBackgroundClip = "";
      text.style.backgroundClip = "";
      text.style.webkitTextFillColor = "";
      text.style.backgroundSize = "";
    }

    // --- Glow ---
    const glowBuild = progress(e, 0.2, 0.45);
    const glowBurst = progress(e, 0.45, 0.8);
    const glowOpacity = glowBurst > 0 ? lerp(0.7, 0, glowBurst) : lerp(0, 0.7, glowBuild);
    const glowScale = glowBurst > 0 ? lerp(1.0, 4.0, glowBurst) : lerp(0.3, 1.0, glowBuild);
    glow.style.opacity = `${glowOpacity}`;
    glow.style.transform = `translate(-50%, -50%) scale(${glowScale})`;

    // --- Ripple ---
    const rippleP = progress(e, 0.45, 0.85);
    const rippleScale = lerp(0, 12, rippleP);
    const rippleFadeIn = progress(rippleP, 0, 0.15);
    const rippleFadeOut = progress(rippleP, 0.6, 1.0);
    const rippleOpacity = rippleP > 0 ? lerp(0, 0.45, rippleFadeIn) * (1 - rippleFadeOut) : 0;
    ripple.style.transform = `translate(-50%, -50%) scale(${rippleScale})`;
    ripple.style.opacity = `${rippleOpacity}`;

    // --- Rings ---
    for (let i = 0; i < RING_COUNT; i++) {
      const ring = ringRefs.current[i];
      if (!ring) continue;
      const ringStart = 0.45 + i * 0.04;
      const ringEnd = ringStart + 0.25;
      const ringP = progress(e, ringStart, ringEnd);
      const ringScale = lerp(0, 12, ringP);
      const ringFadeIn = progress(ringP, 0, 0.2);
      const ringFadeOut = progress(ringP, 0.5, 1.0);
      const ringOpacity = ringP > 0 ? lerp(0, 0.5, ringFadeIn) * (1 - ringFadeOut) : 0;
      ring.style.transform = `translate(-50%, -50%) scale(${ringScale})`;
      ring.style.opacity = `${ringOpacity}`;
    }

    // --- Particles ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = particleRefs.current[i];
      if (!particle) continue;
      const burstP = progress(e, 0.45, 0.8);
      const { angle, maxDist } = particles[i];
      const r = burstP * maxDist;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      const particleFadeIn = progress(burstP, 0, 0.1);
      const particleFadeOut = progress(burstP, 0.6, 1.0);
      const particleOpacity = burstP > 0 ? lerp(0, 0.8, particleFadeIn) * (1 - particleFadeOut) : 0;
      particle.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
      particle.style.opacity = `${particleOpacity}`;
    }

    // --- Line ---
    const lineP = progress(e, 0.7, 0.88);
    line.style.transform = `scaleX(${lineP})`;
    line.style.opacity = `${lineP}`;

    // --- Subtitle ---
    const subP = progress(e, 0.8, 1.0);
    subtitle.style.transform = `translateY(${lerp(15, 0, subP)}px)`;
    subtitle.style.opacity = `${subP}`;
  }, [particles]);

  // Animation loop — handles both forward and reverse
  const startAnim = useCallback((dir: "forward" | "reverse") => {
    directionRef.current = dir;
    // If already running, just change direction (no restart needed)
    if (rafRef.current !== null) return;

    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const duration = directionRef.current === "forward" ? FORWARD_DURATION : REVERSE_DURATION;
      const step = dt / duration;

      if (directionRef.current === "forward") {
        animRef.current = Math.min(1, animRef.current + step);
      } else {
        animRef.current = Math.max(0, animRef.current - step);
      }

      applyEffects(animRef.current);

      // Done?
      if (
        (directionRef.current === "forward" && animRef.current >= 1) ||
        (directionRef.current === "reverse" && animRef.current <= 0)
      ) {
        directionRef.current = "idle";
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [applyEffects]);

  // Scroll subscription — only drives viewport sticky + triggers animation
  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return;

    const TRIGGER = 0.3;
    let wasAboveTrigger = true;

    const unsubscribe = subscribeToScroll((offset: number) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollDistance = sectionHeight - windowHeight;

      const rawProgress = (offset - sectionTop) / scrollDistance;
      const p = Math.max(0, Math.min(1, rawProgress));

      // Simulated sticky — always scroll-driven, never blocked
      viewport.style.transform = `translateY(${p * scrollDistance}px)`;

      const isAboveTrigger = p < TRIGGER;

      if (wasAboveTrigger && !isAboveTrigger) {
        // Crossed trigger going down → play forward
        startAnim("forward");
      } else if (!wasAboveTrigger && isAboveTrigger) {
        // Crossed trigger going up → play reverse
        startAnim("reverse");
      }

      wasAboveTrigger = isAboveTrigger;
    });

    return () => {
      unsubscribe();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [subscribeToScroll, startAnim]);

  // Reduced motion / mobile fallback
  const isReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);

  if (isReducedMotion || isMobile) {
    return (
      <section
        ref={sectionRef}
        className="relative flex min-h-[60vh] items-center justify-center px-6 py-20"
      >
        <div className="text-center">
          <h2 className="gradient-text text-4xl font-bold tracking-tight md:text-6xl">
            This is Inertia.
          </h2>
          <div
            className="mx-auto mt-8 h-0.5 w-48 rounded-full"
            style={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)" }}
            aria-hidden="true"
          />
          <p className="mx-auto mt-6 max-w-md text-lg text-gray-500 dark:text-gray-400">
            Smooth, physics-based momentum — feel the difference.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "200vh", contain: "layout style paint" }}
    >
      <div
        ref={viewportRef}
        className="absolute top-0 left-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[var(--background)]"
        style={{ willChange: "transform" }}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute top-1/2 left-1/2"
          style={{
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(139,92,246,0.5), rgba(249,115,22,0.25), transparent 70%)",
            borderRadius: "50%", opacity: 0,
            transform: "translate(-50%, -50%) scale(0.3)",
            willChange: "transform, opacity",
          }}
          aria-hidden="true"
        />

        <div
          ref={rippleRef}
          className="pointer-events-none absolute top-1/2 left-1/2"
          style={{
            width: 200, height: 200,
            background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(249,115,22,0.4) 30%, rgba(6,182,212,0.2) 60%, transparent 80%)",
            borderRadius: "50%", opacity: 0,
            transform: "translate(-50%, -50%) scale(0)",
            willChange: "transform, opacity",
          }}
          aria-hidden="true"
        />

        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <div
            key={`ring-${i}`}
            ref={(el) => { ringRefs.current[i] = el; }}
            className="reveal-ring pointer-events-none absolute top-1/2 left-1/2"
            style={{
              width: 200, height: 200, opacity: 0,
              transform: "translate(-50%, -50%) scale(0)",
              willChange: "transform, opacity",
              borderColor: i % 3 === 0
                ? "rgba(139, 92, 246, 0.8)"
                : i % 3 === 1
                  ? "rgba(249, 115, 22, 0.7)"
                  : "rgba(6, 182, 212, 0.7)",
            }}
            aria-hidden="true"
          />
        ))}

        {particles.map((particle, i) => (
          <div
            key={`particle-${i}`}
            ref={(el) => { particleRefs.current[i] = el; }}
            className="pointer-events-none absolute top-1/2 left-1/2"
            style={{
              width: particle.size, height: particle.size,
              borderRadius: "50%", backgroundColor: particle.color,
              opacity: 0, transform: "translate(-50%, -50%)",
              willChange: "transform, opacity",
            }}
            aria-hidden="true"
          />
        ))}

        <div className="relative z-10 text-center">
          <h2
            ref={textRef}
            className="text-4xl font-bold tracking-tight md:text-6xl"
            style={{ opacity: 0, transform: "translateY(120px) scale(0.85)", willChange: "transform, opacity" }}
          >
            This is Inertia.
          </h2>

          {/* Positioned below heading but absolute so they don't shift the heading's center */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 flex flex-col items-center">
            <div
              ref={lineRef}
              className="mt-8 h-0.5 w-48 rounded-full"
              style={{
                background: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)",
                transform: "scaleX(0)", opacity: 0, willChange: "transform, opacity",
              }}
              aria-hidden="true"
            />

            <p
              ref={subtitleRef}
              className="mt-6 max-w-md text-lg text-gray-500 dark:text-gray-400"
              style={{ opacity: 0, transform: "translateY(15px)", willChange: "transform, opacity" }}
            >
              Smooth, physics-based momentum — feel the difference.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
