/**
 * Scroll physics engine ported from Inertia's ScrollEngine.swift.
 * Pure TypeScript — no React dependencies.
 */

// Constants from ScrollEngine.swift lines 75-79
const PIXELS_PER_TICK = 45.0;
const VELOCITY_THRESHOLD = 30.0;
const REFERENCE_SMOOTHNESS = 0.9;

export type EasingPreset = "smooth" | "snappy" | "linear" | "gradual";

export interface ScrollPhysicsConfig {
  baseSpeed: number;       // default 4.0
  smoothness: number;      // default 0.6
  momentumDuration: number; // default 0.6
  easing: EasingPreset;    // default "smooth"
}

export const DEFAULT_CONFIG: ScrollPhysicsConfig = {
  baseSpeed: 4.0,
  smoothness: 0.6,
  momentumDuration: 0.6,
  easing: "smooth",
};

export class ScrollPhysicsEngine {
  private velocity = 0;
  private friction = 0.96;
  private animating = false;
  private lastTickTime = 0;
  private rafId: number | null = null;
  private lastFrameTime = 0;

  // Momentum tracking
  private momentumPhaseStarted = false;
  private momentumFrameCount = 0;
  private momentumInitialVelocity = 0;
  private totalFrames = 120;

  private config: ScrollPhysicsConfig;

  // Callbacks
  onScroll: ((delta: number) => void) | null = null;
  onVelocityChange: ((velocity: number, progress: number | null) => void) | null = null;

  constructor(config: Partial<ScrollPhysicsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.computeFriction();
  }

  updateConfig(config: Partial<ScrollPhysicsConfig>) {
    this.config = { ...this.config, ...config };
    this.computeFriction();
  }

  // Friction formula from ScrollEngine.swift lines 222-225
  private computeFriction() {
    const md = this.config.momentumDuration;
    const halfLifeSeconds = 0.02 + md * 0.2;
    const halfLifeFrames = halfLifeSeconds * 120.0;
    this.friction = Math.pow(0.5, 1.0 / halfLifeFrames);
  }

  // Estimated total frames from ScrollEngine.swift line 81-84
  private estimatedTotalFrames(friction: number, initialV: number): number {
    if (friction <= 0 || friction >= 1 || Math.abs(initialV) <= VELOCITY_THRESHOLD) return 120;
    return Math.log(VELOCITY_THRESHOLD / Math.abs(initialV)) / Math.log(friction);
  }

  /**
   * Process a wheel event. Call this from the wheel event listener.
   * @param deltaY - The wheel event's deltaY (raw browser value)
   * @param deltaMode - 0 = pixels, 1 = lines, 2 = pages
   */
  handleWheel(deltaY: number, deltaMode: number = 0) {
    if (Math.abs(deltaY) < 0.001) return;

    // Direction-only, like the real Inertia (ignores magnitude)
    const direction = deltaY > 0 ? 1.0 : -1.0;

    const now = performance.now() / 1000; // Convert to seconds

    // Zero velocity on direction change (ScrollEngine.swift lines 300-301)
    if (direction > 0 && this.velocity < 0) {
      this.velocity = 0;
      this.momentumPhaseStarted = false;
    }
    if (direction < 0 && this.velocity > 0) {
      this.velocity = 0;
      this.momentumPhaseStarted = false;
    }

    // Reset momentum if we were in it (lines 302-308)
    if (this.momentumPhaseStarted) {
      this.momentumPhaseStarted = false;
      this.momentumFrameCount = 0;
    }

    // Compute impulse (line 270)
    const impulse = direction * this.config.baseSpeed * PIXELS_PER_TICK;

    // Smoothness compensation (lines 285-287)
    const effectiveSmoothness = Math.min(this.config.smoothness, REFERENCE_SMOOTHNESS);
    const ratio = (1.0 - effectiveSmoothness) / (1.0 - REFERENCE_SMOOTHNESS);
    const compensation = Math.pow(ratio, 0.15);

    // Velocity blend (line 309)
    this.velocity = this.velocity * effectiveSmoothness + impulse * compensation;

    // Cap velocity (lines 310-311)
    const maxVelocity = this.config.baseSpeed * 3.0 * PIXELS_PER_TICK * 4.0;
    this.velocity = Math.min(Math.max(this.velocity, -maxVelocity), maxVelocity);

    this.lastTickTime = now;

    this.startAnimation();
  }

  private startAnimation() {
    if (this.animating) return;
    this.animating = true;
    this.lastFrameTime = performance.now() / 1000;
    this.rafId = requestAnimationFrame((t) => this.animationFrame(t));
  }

  private animationFrame(timestamp: number) {
    const now = timestamp / 1000;
    const dt = Math.min(now - this.lastFrameTime, 0.05); // Cap at 50ms to avoid jumps
    this.lastFrameTime = now;

    const timeSinceTick = now - this.lastTickTime;
    const inMomentum = timeSinceTick > 0.15;

    // Enter momentum phase (lines 420-430)
    if (inMomentum && !this.momentumPhaseStarted) {
      this.momentumPhaseStarted = true;
      this.momentumFrameCount = 0;
      this.momentumInitialVelocity = this.velocity;
      this.totalFrames = Math.max(
        this.estimatedTotalFrames(this.friction, this.velocity),
        10
      );
    }

    // Apply easing (lines 432-469)
    if (inMomentum && this.momentumPhaseStarted) {
      // Scale frame count by delta time for display-rate independence
      this.momentumFrameCount += Math.round(dt * 120);
      const t = Math.min(this.momentumFrameCount / this.totalFrames, 1.0);

      // Apply friction with delta-time scaling
      const frictionPower = dt * 120;

      switch (this.config.easing) {
        case "smooth":
          // Line 438
          this.velocity *= Math.pow(this.friction, frictionPower);
          break;
        case "snappy":
          // Line 440
          {
            const f = this.friction * (1.0 - 0.08 * (1.0 - t));
            this.velocity *= Math.pow(f, frictionPower);
          }
          break;
        case "linear":
          // Lines 443-445
          {
            const decrement = (Math.abs(this.momentumInitialVelocity) / this.totalFrames) * frictionPower;
            const sign = this.velocity > 0 ? 1.0 : -1.0;
            this.velocity = sign * Math.max(Math.abs(this.velocity) - decrement, 0);
          }
          break;
        case "gradual":
          // Lines 447-448
          {
            const f = this.friction + (1.0 - this.friction) * 0.5 * (1.0 - t);
            this.velocity *= Math.pow(f, frictionPower);
          }
          break;
      }

      this.onVelocityChange?.(this.velocity, t);
    } else {
      // Pre-momentum: apply base friction (line 468)
      this.velocity *= Math.pow(this.friction, dt * 120);
      this.onVelocityChange?.(this.velocity, null);
    }

    // Stop condition (lines 471-488)
    if (Math.abs(this.velocity) < VELOCITY_THRESHOLD) {
      this.stop();
      return;
    }

    // Compute pixel delta (line 491)
    const delta = this.velocity * dt;
    this.onScroll?.(delta);

    this.rafId = requestAnimationFrame((t) => this.animationFrame(t));
  }

  stop() {
    this.animating = false;
    this.velocity = 0;
    this.momentumPhaseStarted = false;
    this.momentumFrameCount = 0;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.onVelocityChange?.(0, null);
  }

  get isAnimating() {
    return this.animating;
  }

  get currentVelocity() {
    return this.velocity;
  }

  destroy() {
    this.stop();
    this.onScroll = null;
    this.onVelocityChange = null;
  }
}
