/**
 * Scroll physics engine ported from Inertia's ScrollEngine.swift.
 * Pure TypeScript — no React dependencies.
 */

// Constants from ScrollEngine.swift lines 75-79
const PIXELS_PER_TICK = 45.0;
const VELOCITY_THRESHOLD = 30.0;
const REFERENCE_SMOOTHNESS = 0.9;

// Tick rate history size from ScrollEngine.swift line 63
const TICK_RATE_HISTORY_SIZE = 3;

// Swipe detection from ScrollEngine.swift lines 71-73
const SWIPE_MIN_TICKS = 2;
const SWIPE_MAX_INTERVAL = 0.4;
const SWIPE_MIN_TICK_SPEED = 5.0;

export type EasingPreset = "smooth" | "snappy" | "linear" | "gradual";

export interface ScrollPhysicsConfig {
  baseSpeed: number;       // default 4.0
  smoothness: number;      // default 0.6
  momentumDuration: number; // default 0.6
  easing: EasingPreset;    // default "smooth"
  scrollAccelerationEnabled: boolean; // default true
  scrollDistanceMultiplier: number;   // default 1.0
}

export const DEFAULT_CONFIG: ScrollPhysicsConfig = {
  baseSpeed: 4.0,
  smoothness: 0.6,
  momentumDuration: 0.6,
  easing: "smooth",
  scrollAccelerationEnabled: true,
  scrollDistanceMultiplier: 1.0,
};

export class ScrollPhysicsEngine {
  private velocity = 0;
  private friction = 0.96;
  private animating = false;
  private lastTickTime = 0;
  private rafId: number | null = null;
  private lastFrameTime = 0;

  // Tick rate tracking (ScrollEngine.swift lines 62-63, 197-207)
  private tickRate = 5.0;
  private tickRateHistory: number[] = [];

  // Swipe/acceleration tracking (ScrollEngine.swift lines 65-69)
  private consecutiveTickCount = 0;
  private consecutiveSwipeCount = 0;
  private swipeSequenceStartTime = 0;
  private swipeSequenceTickCount = 0;
  private lastDirection = 0;

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

  // Speed curve from ScrollEngine.swift lines 352-369
  // y = a * pow(1.1, (x-t)*c) + 1 - a
  private computeSpeed(tickRate: number): number {
    const base = this.config.baseSpeed;
    if (!this.config.scrollAccelerationEnabled) return base * 2.0;

    const b = 1.1;
    const c = 1.5;
    const t = 8.0;
    const p = 1.33;
    const denominator = Math.pow(b, c) - 1.0;
    if (Math.abs(denominator) < 0.001) return base;
    const a = (p - 1.0) / denominator;

    const x = Math.min(tickRate, 100.0);
    if (x < t) return base;

    const multiplier = a * Math.pow(b, (x - t) * c) + 1.0 - a;
    const clamped = Math.min(Math.max(multiplier, 1.0), 3.0);
    return base * clamped;
  }

  // Fast scroll factor from ScrollEngine.swift lines 320-328
  private fastScrollFactor(): number {
    const threshold = 3;
    const exponential = 7.5;
    const initial = 1.33;
    if (this.consecutiveSwipeCount < threshold) return 1.0;
    const n = this.consecutiveSwipeCount - threshold;
    const factor = initial * Math.pow(exponential, n / exponential);
    return Math.min(factor, 50.0);
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
    const dt = now - this.lastTickTime;

    // Tick rate tracking (ScrollEngine.swift lines 197-207)
    if (dt > 0 && dt < 0.16) {
      const instantRate = 1.0 / dt;
      this.tickRateHistory.push(instantRate);
      if (this.tickRateHistory.length > TICK_RATE_HISTORY_SIZE) {
        this.tickRateHistory.shift();
      }
      this.tickRate = this.tickRateHistory.reduce((a, b) => a + b, 0) / this.tickRateHistory.length;
    } else {
      this.tickRateHistory = [];
      this.tickRate = 5.0;
    }

    // Swipe detection (ScrollEngine.swift lines 245-265)
    if (dt > 0.16 || direction !== this.lastDirection) {
      if (direction !== this.lastDirection || dt > SWIPE_MAX_INTERVAL) {
        this.consecutiveSwipeCount = 0;
      } else if (this.consecutiveTickCount >= SWIPE_MIN_TICKS) {
        const elapsed = now - this.swipeSequenceStartTime;
        const avgTickSpeed = elapsed > 0 ? this.swipeSequenceTickCount / elapsed : 0;
        if (avgTickSpeed >= SWIPE_MIN_TICK_SPEED) {
          this.consecutiveSwipeCount++;
        } else {
          this.consecutiveSwipeCount = 0;
        }
      } else {
        this.consecutiveSwipeCount = 0;
      }
      this.consecutiveTickCount = 0;
      this.swipeSequenceStartTime = now;
      this.swipeSequenceTickCount = 0;
    }
    this.consecutiveTickCount++;
    this.swipeSequenceTickCount++;
    this.lastDirection = direction;

    this.lastTickTime = now;

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

    // Compute speed with acceleration curve (lines 267-271)
    const speed = this.computeSpeed(this.tickRate);
    const fast = this.config.scrollAccelerationEnabled ? this.fastScrollFactor() : 1.0;
    let impulse = direction * speed * PIXELS_PER_TICK * fast;
    impulse *= this.config.scrollDistanceMultiplier; // line 271

    // Smoothness compensation (lines 285-287)
    const effectiveSmoothness = Math.min(this.config.smoothness, REFERENCE_SMOOTHNESS);
    const ratio = (1.0 - effectiveSmoothness) / (1.0 - REFERENCE_SMOOTHNESS);
    const compensation = Math.pow(ratio, 0.15);

    // Velocity blend (line 309)
    this.velocity = this.velocity * effectiveSmoothness + impulse * compensation;

    // Cap velocity (lines 310-311)
    const maxVelocity = this.config.baseSpeed * 3.0 * PIXELS_PER_TICK * 4.0 * fast;
    this.velocity = Math.min(Math.max(this.velocity, -maxVelocity), maxVelocity);

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
    this.consecutiveSwipeCount = 0;
    this.consecutiveTickCount = 0;
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
