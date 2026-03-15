"use client";

import { useEffect, useRef, useMemo } from "react";
import { useScrollEngine } from "@/components/interactive/ScrollEngineContext";
import { useRevealRef } from "@/components/interactive/PageScrollEngine";

const RING_COUNT = 7;
const PARTICLE_COUNT = 20;

// Deterministic particle layout — evenly distributed angles with varied distances
function generateParticles(count: number) {
  const particles: { angle: number; maxDist: number; size: number; color: string }[] = [];
  const colors = ["#8b5cf6", "#f97316", "#06b6d4"];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    // Alternate distances for visual variety (deterministic, not random)
    const maxDist = 300 + (i % 3) * 120;
    const size = 4 + (i % 3) * 2;
    particles.push({ angle, maxDist, size, color: colors[i % 3] });
  }
  return particles;
}

// Linear interpolation helper
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// Map a value from one range to 0-1
function progress(value: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (value - start) / (end - start)));
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

  const { subscribeToScroll } = useScrollEngine();
  const registerReveal = useRevealRef();

  const particles = useMemo(() => generateParticles(PARTICLE_COUNT), []);

  // Register with PageScrollEngine
  useEffect(() => {
    registerReveal?.(sectionRef.current);
    return () => registerReveal?.(null);
  }, [registerReveal]);

  // Subscribe to scroll and drive all animations imperatively
  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const text = textRef.current;
    const glow = glowRef.current;
    const ripple = rippleRef.current;
    const line = lineRef.current;
    const subtitle = subtitleRef.current;
    if (!section || !viewport || !text || !glow || !ripple || !line || !subtitle) return;

    const unsubscribe = subscribeToScroll((offset: number) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollDistance = sectionHeight - windowHeight;

      // How far through the 200vh section we've scrolled (0-1)
      const rawProgress = (offset - sectionTop) / scrollDistance;
      const p = Math.max(0, Math.min(1, rawProgress));

      // Simulated sticky: pin viewport within the tall section
      const translateY = p * scrollDistance;
      viewport.style.transform = `translateY(${translateY}px)`;

      // --- Text animation ---
      const textFloat = progress(p, 0.0, 0.4);
      const textHold = progress(p, 0.4, 0.65);
      const textSettle = progress(p, 0.65, 0.75);
      const gradientReveal = progress(p, 0.75, 1.0);

      const ty = lerp(120, 0, textFloat);
      const opacity = textFloat;
      const scaleFloat = lerp(0.85, 1.0, textFloat);
      const scaleHold = lerp(1.0, 1.03, textHold);
      const scaleSettle = lerp(1.03, 1.0, textSettle);
      let scale = scaleFloat;
      if (p > 0.4) scale = scaleHold;
      if (p > 0.65) scale = scaleSettle;

      text.style.transform = `translateY(${ty}px) scale(${scale})`;
      text.style.opacity = `${opacity}`;

      // Gradient text transition (inline styles to avoid class-toggle jumps)
      if (gradientReveal > 0) {
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

      // --- Glow animation (builds, then expands into burst) ---
      const glowBuild = progress(p, 0.4, 0.65);
      const glowBurst = progress(p, 0.65, 0.92);

      const glowOpacity = glowBurst > 0 ? lerp(0.7, 0, glowBurst) : lerp(0, 0.7, glowBuild);
      const glowScale = glowBurst > 0 ? lerp(1.0, 4.0, glowBurst) : lerp(0.3, 1.0, glowBuild);

      glow.style.opacity = `${glowOpacity}`;
      glow.style.transform = `translate(-50%, -50%) scale(${glowScale})`;

      // --- Full-screen color ripple wave ---
      // Expands from center outward across the entire viewport
      const rippleP = progress(p, 0.65, 0.93);
      // Scale needs to be large enough to cover entire viewport from center
      // At scale 1 the ripple is 200x200, need ~10x to cover a 1920px screen diagonally
      const rippleScale = lerp(0, 12, rippleP);
      // Opacity: ramp up fast, hold, then fade out in the last third
      const rippleFadeIn = progress(rippleP, 0, 0.15);
      const rippleFadeOut = progress(rippleP, 0.6, 1.0);
      const rippleOpacity = rippleP > 0 ? lerp(0, 0.45, rippleFadeIn) * (1 - rippleFadeOut) : 0;
      ripple.style.transform = `translate(-50%, -50%) scale(${rippleScale})`;
      ripple.style.opacity = `${rippleOpacity}`;

      // --- Rings (expanded to fill screen, staggered like a shockwave) ---
      for (let i = 0; i < RING_COUNT; i++) {
        const ring = ringRefs.current[i];
        if (!ring) continue;
        // Each ring starts slightly later, creating a cascading wave
        const ringStart = 0.65 + i * 0.025;
        const ringEnd = ringStart + 0.20;
        const ringP = progress(p, ringStart, ringEnd);
        // Scale large enough to reach screen edges (200px base * 12 = 2400px)
        const ringScale = lerp(0, 12, ringP);
        // Fade in quickly then fade out as it expands
        const ringFadeIn = progress(ringP, 0, 0.2);
        const ringFadeOut = progress(ringP, 0.5, 1.0);
        const ringOpacity = ringP > 0 ? lerp(0, 0.5, ringFadeIn) * (1 - ringFadeOut) : 0;
        ring.style.transform = `translate(-50%, -50%) scale(${ringScale})`;
        ring.style.opacity = `${ringOpacity}`;
      }

      // --- Particles (fly further, persist longer) ---
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = particleRefs.current[i];
        if (!particle) continue;
        const burstP = progress(p, 0.65, 0.90);
        const { angle, maxDist } = particles[i];
        const r = burstP * maxDist;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        // Fade in fast, fade out in last 40%
        const particleFadeIn = progress(burstP, 0, 0.1);
        const particleFadeOut = progress(burstP, 0.6, 1.0);
        const particleOpacity = burstP > 0 ? lerp(0, 0.8, particleFadeIn) * (1 - particleFadeOut) : 0;
        particle.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
        particle.style.opacity = `${particleOpacity}`;
      }

      // --- Tri-gradient line ---
      const lineP = progress(p, 0.8, 0.95);
      line.style.transform = `scaleX(${lineP})`;
      line.style.opacity = `${lineP}`;

      // --- Subtitle ---
      const subP = progress(p, 0.85, 1.0);
      subtitle.style.transform = `translateY(${lerp(15, 0, subP)}px)`;
      subtitle.style.opacity = `${subP}`;
    });

    return unsubscribe;
  }, [subscribeToScroll, particles]);

  // Check for reduced motion / mobile — render static fallback
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
      {/* Sticky viewport (simulated) */}
      <div
        ref={viewportRef}
        className="absolute top-0 left-0 flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ willChange: "transform" }}
      >
        {/* Glow */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute top-1/2 left-1/2"
          style={{
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(139,92,246,0.5), rgba(249,115,22,0.25), transparent 70%)",
            borderRadius: "50%",
            opacity: 0,
            transform: "translate(-50%, -50%) scale(0.3)",
            willChange: "transform, opacity",
          }}
          aria-hidden="true"
        />

        {/* Full-screen color ripple wave */}
        <div
          ref={rippleRef}
          className="pointer-events-none absolute top-1/2 left-1/2"
          style={{
            width: 200,
            height: 200,
            background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(249,115,22,0.4) 30%, rgba(6,182,212,0.2) 60%, transparent 80%)",
            borderRadius: "50%",
            opacity: 0,
            transform: "translate(-50%, -50%) scale(0)",
            willChange: "transform, opacity",
          }}
          aria-hidden="true"
        />

        {/* Rings */}
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <div
            key={`ring-${i}`}
            ref={(el) => { ringRefs.current[i] = el; }}
            className="reveal-ring pointer-events-none absolute top-1/2 left-1/2"
            style={{
              width: 200,
              height: 200,
              opacity: 0,
              transform: "translate(-50%, -50%) scale(0)",
              willChange: "transform, opacity",
              // Alternate purple/orange/cyan border colors
              borderColor: i % 3 === 0
                ? "rgba(139, 92, 246, 0.8)"
                : i % 3 === 1
                  ? "rgba(249, 115, 22, 0.7)"
                  : "rgba(6, 182, 212, 0.7)",
            }}
            aria-hidden="true"
          />
        ))}

        {/* Particles */}
        {particles.map((particle, i) => (
          <div
            key={`particle-${i}`}
            ref={(el) => { particleRefs.current[i] = el; }}
            className="pointer-events-none absolute top-1/2 left-1/2"
            style={{
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              backgroundColor: particle.color,
              opacity: 0,
              transform: "translate(-50%, -50%)",
              willChange: "transform, opacity",
            }}
            aria-hidden="true"
          />
        ))}

        {/* Text content */}
        <div className="relative z-10 text-center">
          <h2
            ref={textRef}
            className="text-4xl font-bold tracking-tight md:text-6xl"
            style={{
              opacity: 0,
              transform: "translateY(120px) scale(0.85)",
              willChange: "transform, opacity",
            }}
          >
            This is Inertia.
          </h2>

          {/* Tri-gradient line */}
          <div
            ref={lineRef}
            className="mx-auto mt-8 h-0.5 w-48 rounded-full"
            style={{
              background: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)",
              transform: "scaleX(0)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
            aria-hidden="true"
          />

          <p
            ref={subtitleRef}
            className="mx-auto mt-6 max-w-md text-lg text-gray-500 dark:text-gray-400"
            style={{
              opacity: 0,
              transform: "translateY(15px)",
              willChange: "transform, opacity",
            }}
          >
            Smooth, physics-based momentum — feel the difference.
          </p>
        </div>
      </div>
    </section>
  );
}
