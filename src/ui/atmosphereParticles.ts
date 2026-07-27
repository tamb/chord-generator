type Rgba = { r: number; g: number; b: number; a: number };

/** Audio effect dials (0–1) that modulate particle motion / depth / spacing. */
export type ParticleEffectLevels = {
  reverb: number;
  tremolo: number;
  phaser: number;
};

export const DEFAULT_PARTICLE_EFFECTS: ParticleEffectLevels = {
  reverb: 0,
  tremolo: 0,
  phaser: 0,
};

type Particle = {
  x: number;
  y: number;
  vx: number; // constant lateral drift (px per ~frame)
  vy: number; // constant vertical drift (slight upward bias)
  radius: number; // core size before glow falloff
  baseAlpha: number; // per-particle brightness before intensity/pulse
  phase: number; // wobble / pulse phase (radians) — driven harder by tremolo
  speed: number; // how fast phase / depth advance
  colorIndex: 0 | 1; // 0 = primary atmosphere color, 1 = secondary
  depthPhase: number; // phaser-driven depth oscillation phase
  depth: number; // 0 = far / small, 1 = near / large (fake z)
};

/** How many sparks to spawn. Raise for denser field; lower for subtler look. */
const PARTICLE_COUNT = 96;

/** Clamp effect dials to a safe 0–1 range. */
export function clampEffectLevel(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export function normalizeParticleEffects(
  effects: Partial<ParticleEffectLevels> | null | undefined,
): ParticleEffectLevels {
  return {
    reverb: clampEffectLevel(effects?.reverb ?? 0),
    tremolo: clampEffectLevel(effects?.tremolo ?? 0),
    phaser: clampEffectLevel(effects?.phaser ?? 0),
  };
}

/** Parse `rgb(...)` / `rgba(...)` from CSS custom properties. */
export function parseCssRgba(value: string): Rgba | null {
  const match = value.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
  );
  if (!match) {
    return null;
  }

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

/**
 * Pull live Atmosphere colors from document CSS vars
 * (`--atmosphere-primary`, `--atmosphere-secondary`, `--atmosphere-intensity`).
 */
export function readAtmosphereParticleColors(styles: CSSStyleDeclaration): {
  primary: Rgba;
  secondary: Rgba;
  intensity: number;
} {
  // Fall back through related vars, then a warm default if nothing is set yet
  const primary = parseCssRgba(styles.getPropertyValue("--atmosphere-primary").trim()) ??
    parseCssRgba(styles.getPropertyValue("--atmosphere-glow").trim()) ?? {
      r: 255,
      g: 210,
      b: 140,
      a: 0.4,
    };

  const secondary =
    parseCssRgba(styles.getPropertyValue("--atmosphere-secondary").trim()) ??
    parseCssRgba(styles.getPropertyValue("--atmosphere-border").trim()) ??
    primary;

  const intensityRaw = Number(styles.getPropertyValue("--atmosphere-intensity").trim());
  const intensity = Number.isFinite(intensityRaw) ? Math.max(0, Math.min(1, intensityRaw)) : 0;

  return { primary, secondary, intensity };
}

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    // Velocity multipliers — raise for faster drift across the panel
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.28 - 0.08, // -0.08 nudges particles slowly upward
    radius: 1.2 + Math.random() * 2.8, // min + spread of spark size
    baseAlpha: 0.25 + Math.random() * 0.55, // dimmest → brightest spark
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.9, // pulse / wobble rate
    colorIndex: Math.random() > 0.45 ? 0 : 1, // ~55% primary, ~45% secondary
    depthPhase: Math.random() * Math.PI * 2,
    depth: Math.random(),
  };
}

export function createParticleField(
  width: number,
  height: number,
  count = PARTICLE_COUNT,
): Particle[] {
  return Array.from({ length: count }, () => createParticle(width, height));
}

/**
 * Map effect dials → motion multipliers used while stepping / drawing.
 * Keep gains modest so dials color the motion without taking over.
 */
export function resolveParticleMotion(effects: ParticleEffectLevels): {
  /** Extra sin/cos wave strength from tremolo */
  waveGain: number;
  /** Phase advance multiplier (tremolo also speeds the shimmer a bit) */
  phaseGain: number;
  /** How fast depth oscillates (phaser) */
  depthSpeed: number;
  /** How far depth swings toward near/far (phaser) */
  depthSwing: number;
  /** Radial expand from canvas center (reverb) — 1 = no expand */
  spacingExpand: number;
} {
  const { reverb, tremolo, phaser } = normalizeParticleEffects(effects);
  return {
    // Base wave is 1; tremolo up to ~+2.2× wobble amplitude
    waveGain: 1 + tremolo * 2.2,
    phaseGain: 1 + tremolo * 0.7,
    // Phaser: faster + wider fake-z oscillation
    depthSpeed: 0.018 + phaser * 0.055,
    depthSwing: 0.12 + phaser * 0.38,
    // Reverb: up to ~35% more distance from center (particles spread apart)
    spacingExpand: 1 + reverb * 0.35,
  };
}

/**
 * Advance particle positions for one animation frame.
 * Effects combine: tremolo → wave, phaser → depth, reverb is applied at draw time as spacing.
 * `motionEnabled` is false when prefers-reduced-motion is on (particles freeze in place).
 */
export function stepParticles(
  particles: Particle[],
  width: number,
  height: number,
  deltaMs: number,
  motionEnabled: boolean,
  effects: ParticleEffectLevels = DEFAULT_PARTICLE_EFFECTS,
): void {
  if (!motionEnabled || width <= 0 || height <= 0) {
    return;
  }

  // Normalize to ~60fps units; clamp huge frame gaps (tab backgrounding)
  const dt = Math.min(deltaMs, 48) / 16.67;
  const motion = resolveParticleMotion(effects);

  for (const particle of particles) {
    particle.phase += 0.015 * particle.speed * motion.phaseGain * dt; // 0.015 = pulse speed scale

    // Sin/cos wobble — tremolo raises waveGain so sparks sway more
    const waveX = Math.sin(particle.phase) * 0.18 * motion.waveGain;
    const waveY = Math.cos(particle.phase * 0.7) * 0.12 * motion.waveGain;
    particle.x += (particle.vx + waveX) * dt;
    particle.y += (particle.vy + waveY) * dt;

    // Phaser: oscillate fake z-depth (used for scale, alpha, and draw order)
    particle.depthPhase += motion.depthSpeed * particle.speed * dt;
    particle.depth = 0.5 + Math.sin(particle.depthPhase) * motion.depthSwing;
    particle.depth = Math.max(0, Math.min(1, particle.depth));

    // Wrap around edges with a small margin so sparks don't pop mid-screen
    if (particle.x < -12) particle.x = width + 12;
    if (particle.x > width + 12) particle.x = -12;
    if (particle.y < -12) particle.y = height + 12;
    if (particle.y > height + 12) particle.y = -12;
  }
}

/**
 * Expand a point away from the canvas center by `spacingExpand` (reverb).
 * Pure helper so spacing stays testable.
 */
export function expandFromCenter(
  x: number,
  y: number,
  width: number,
  height: number,
  spacingExpand: number,
): { x: number; y: number } {
  const cx = width * 0.5;
  const cy = height * 0.5;
  return {
    x: cx + (x - cx) * spacingExpand,
    y: cy + (y - cy) * spacingExpand,
  };
}

/** Soft radial “glow dots” tinted by the current chord palette + effect dials. */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: readonly Particle[],
  colors: { primary: Rgba; secondary: Rgba; intensity: number },
  width: number,
  height: number,
  effects: ParticleEffectLevels = DEFAULT_PARTICLE_EFFECTS,
): void {
  const intensity = Math.max(0, Math.min(1, colors.intensity));
  if (intensity <= 0.01) {
    return; // skip draw when atmosphere is idle / fully faded
  }

  const motion = resolveParticleMotion(effects);

  // Painter's algorithm: far (low depth) first, near (high depth) on top — phaser “z-index”
  const ordered = [...particles].sort((left, right) => left.depth - right.depth);

  for (const particle of ordered) {
    const color = particle.colorIndex === 0 ? colors.primary : colors.secondary;
    const pulse = 0.65 + Math.sin(particle.phase) * 0.35; // 0.65–1.0 brightness breathe

    // Reverb spreads particles outward from center
    const { x, y } = expandFromCenter(particle.x, particle.y, width, height, motion.spacingExpand);

    // Phaser depth → size + opacity (near = larger / brighter)
    const depthScale = 0.72 + particle.depth * 0.55;
    const depthAlpha = 0.55 + particle.depth * 0.45;

    // Final alpha: per-particle base × chord intensity × pulse × depth × global dimmer
    const alpha = Math.min(1, particle.baseAlpha * intensity * pulse * depthAlpha * 0.9);
    const radius = particle.radius * (0.85 + intensity * 0.4) * depthScale;

    // Soft halo — radius * 3.2 is glow falloff size relative to core
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.2);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    gradient.addColorStop(0.45, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.35})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, radius * 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}
