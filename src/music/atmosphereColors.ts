import type { ChordExtension, ChordType } from "./chords";
import type { ScaleMode } from "./keyMode";

/** Harmonic flavor used for emotion → color mapping. */
export type AtmosphereQuality =
  | "root"
  | "major"
  | "minor"
  | "maj7"
  | "min7"
  | "dom7"
  | "dim"
  | "dim7"
  | "sus"
  | "sixth"
  | "ninth";

export type AtmosphereInput = {
  rootMidi: number;
  chordType: ChordType | null;
  extensions: readonly ChordExtension[];
  keyMode: ScaleMode;
  keyRoot: number;
};

export type AtmospherePalette = {
  /** Soft wash near the top of the viewport */
  primary: string;
  /** Counter-wash toward the opposite corner */
  secondary: string;
  /** Page gradient top */
  top: string;
  /** Page gradient bottom */
  bottom: string;
  /** Inner viewport border glow */
  border: string;
  /** Outer / diffuse glow */
  glow: string;
  /** 0–1 intensity when a chord is sounding */
  intensity: number;
};

type Rgb = { r: number; g: number; b: number };

/** Flat-side pitch classes (Db, Eb, Ab, Bb and enharmonics used as flats). */
const FLAT_PITCH_CLASSES = new Set([1, 3, 8, 10]);

/** Sharp-leaning key centers (E, B, F#, and bright majors). */
const SHARP_KEY_ROOTS = new Set([4, 6, 11]);

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgba({ r, g, b }: Rgb, alpha: number): string {
  return `rgba(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)}, ${alpha})`;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function shiftToward(color: Rgb, target: Rgb, amount: number): Rgb {
  return mix(color, target, amount);
}

function lighten(color: Rgb, amount: number): Rgb {
  return mix(color, { r: 255, g: 255, b: 255 }, amount);
}

function darken(color: Rgb, amount: number): Rgb {
  return mix(color, { r: 0, g: 0, b: 0 }, amount);
}

/**
 * Classify chord type + extensions into the emotion-matrix qualities
 * described in Atmosphere Mode research (maj7, dom7, min7, dim7, sus, …).
 */
export function classifyAtmosphereQuality(
  chordType: ChordType | null,
  extensions: readonly ChordExtension[],
): AtmosphereQuality {
  if (chordType === null) {
    return "root";
  }

  const hasM7 = extensions.includes("M7");
  const hasm7 = extensions.includes("m7");
  const has6 = extensions.includes("6");
  const has9 = extensions.includes("9");

  if (chordType === "dim") {
    return hasm7 ? "dim7" : "dim";
  }

  if (chordType === "sus") {
    return "sus";
  }

  if (chordType === "maj") {
    if (hasM7) return "maj7";
    if (hasm7) return "dom7";
    if (has9) return "ninth";
    if (has6) return "sixth";
    return "major";
  }

  // minor
  if (hasM7) return "maj7"; // mM7 → bittersweet longing (maj7 minor-context palette)
  if (hasm7) return "min7";
  if (has9) return "ninth";
  if (has6) return "sixth";
  return "minor";
}

/**
 * Emotion matrix palettes: chord quality × major/minor key context.
 * Colors follow the psychology spectrum in the Atmosphere research notes.
 */
function basePalette(quality: AtmosphereQuality, keyMode: ScaleMode): { a: Rgb; b: Rgb } {
  const major = keyMode === "major";

  switch (quality) {
    case "root":
      // Clarity & void — soft neutral
      return major
        ? { a: { r: 245, g: 240, b: 232 }, b: { r: 210, g: 205, b: 198 } }
        : { a: { r: 180, g: 185, b: 195 }, b: { r: 90, g: 95, b: 110 } };

    case "major":
      // Joy / triumphant gold-yellow vs bittersweet hope
      return major
        ? { a: { r: 255, g: 210, b: 80 }, b: { r: 255, g: 150, b: 60 } }
        : { a: { r: 255, g: 220, b: 140 }, b: { r: 255, g: 170, b: 150 } };

    case "minor":
      // Soft sorrow / pink-blue tenderness vs deep melancholic blue-purple
      return major
        ? { a: { r: 160, g: 180, b: 220 }, b: { r: 220, g: 160, b: 180 } }
        : { a: { r: 60, g: 80, b: 150 }, b: { r: 90, g: 50, b: 120 } };

    case "maj7":
      // Warm sunlight nostalgia vs bittersweet: deep blue + warm pink
      return major
        ? { a: { r: 255, g: 200, b: 120 }, b: { r: 255, g: 170, b: 180 } }
        : { a: { r: 70, g: 100, b: 180 }, b: { r: 220, g: 140, b: 170 } };

    case "min7":
      // Cozy teal calm vs cool urban indigo
      return major
        ? { a: { r: 120, g: 190, b: 170 }, b: { r: 90, g: 150, b: 160 } }
        : { a: { r: 50, g: 70, b: 130 }, b: { r: 80, g: 60, b: 140 } };

    case "dom7":
      // Bluesy amber expectancy vs unsettled red-orange menace
      return major
        ? { a: { r: 255, g: 140, b: 50 }, b: { r: 220, g: 90, b: 40 } }
        : { a: { r: 200, g: 50, b: 40 }, b: { r: 140, g: 30, b: 60 } };

    case "dim":
      // Suspense — dark purple with a shock edge
      return major
        ? { a: { r: 120, g: 50, b: 140 }, b: { r: 60, g: 30, b: 80 } }
        : { a: { r: 80, g: 20, b: 90 }, b: { r: 30, g: 10, b: 40 } };

    case "dim7":
      // Dread / extreme tension — near-black with crimson
      return major
        ? { a: { r: 90, g: 20, b: 40 }, b: { r: 40, g: 10, b: 30 } }
        : { a: { r: 50, g: 5, b: 15 }, b: { r: 15, g: 0, b: 10 } };

    case "sus":
      // Ethereal open yearning vs anxious mysterious tension
      return major
        ? { a: { r: 180, g: 230, b: 240 }, b: { r: 200, g: 200, b: 255 } }
        : { a: { r: 140, g: 130, b: 180 }, b: { r: 90, g: 100, b: 140 } };

    case "sixth":
      // Playful warmth / cozy optimism (orange-green balance)
      return major
        ? { a: { r: 255, g: 180, b: 100 }, b: { r: 160, g: 200, b: 120 } }
        : { a: { r: 180, g: 140, b: 100 }, b: { r: 100, g: 130, b: 120 } };

    case "ninth":
      // Alert clarity / open air (yellow-cyan lift)
      return major
        ? { a: { r: 255, g: 235, b: 120 }, b: { r: 140, g: 210, b: 220 } }
        : { a: { r: 200, g: 190, b: 100 }, b: { r: 100, g: 150, b: 180 } };
  }
}

function keyWarmthBias(keyRoot: number): { warm: number; bright: number } {
  const isFlat = FLAT_PITCH_CLASSES.has(keyRoot);
  const isSharp = SHARP_KEY_ROOTS.has(keyRoot);

  if (isFlat) {
    // Flat keys: warm, rich, velvet
    return { warm: 0.18, bright: -0.06 };
  }
  if (isSharp) {
    // Sharp keys: bright, piercing, crystalline
    return { warm: -0.08, bright: 0.16 };
  }
  return { warm: 0, bright: 0 };
}

/**
 * Subtle chromatic hue nudge from the chord root (synesthetic accent),
 * without overriding the emotion-driven palette.
 */
function rootAccent(pitchClass: number): Rgb {
  // Map pitch class around a soft color wheel starting at C = warm rose.
  const accents: Rgb[] = [
    { r: 220, g: 90, b: 100 }, // C — red / intensity
    { r: 230, g: 120, b: 70 }, // C#
    { r: 240, g: 160, b: 50 }, // D — orange / energy
    { r: 235, g: 190, b: 60 }, // D#
    { r: 230, g: 210, b: 70 }, // E — yellow / alertness
    { r: 140, g: 190, b: 90 }, // F — green / balance
    { r: 80, g: 180, b: 140 }, // F#
    { r: 70, g: 160, b: 190 }, // G — blue-green
    { r: 80, g: 120, b: 210 }, // G# — blue / calm
    { r: 120, g: 90, b: 200 }, // A — purple / elevation
    { r: 190, g: 100, b: 180 }, // A# — pink / tenderness
    { r: 160, g: 100, b: 140 }, // B
  ];
  return accents[pitchClass % 12]!;
}

function intensityFor(quality: AtmosphereQuality): number {
  switch (quality) {
    case "dim7":
      return 0.92;
    case "dim":
    case "dom7":
      return 0.85;
    case "maj7":
    case "min7":
      return 0.72;
    case "sus":
    case "ninth":
      return 0.68;
    case "root":
      return 0.35;
    default:
      return 0.75;
  }
}

export const IDLE_ATMOSPHERE_PALETTE: AtmospherePalette = {
  primary: "rgba(255, 245, 230, 0)",
  secondary: "rgba(200, 190, 180, 0)",
  top: "rgba(0, 0, 0, 0)",
  bottom: "rgba(0, 0, 0, 0)",
  border: "rgba(255, 255, 255, 0)",
  glow: "rgba(255, 255, 255, 0)",
  intensity: 0,
};

/**
 * Resolve a glowing Atmosphere palette from chord quality, key context,
 * and root pitch — following sound / color / emotion correspondences.
 */
export function resolveAtmospherePalette(input: AtmosphereInput): AtmospherePalette {
  const quality = classifyAtmosphereQuality(input.chordType, input.extensions);
  const { a, b } = basePalette(quality, input.keyMode);
  const bias = keyWarmthBias(input.keyRoot);
  const accent = rootAccent(input.rootMidi % 12);

  const warmTarget = { r: 255, g: 140, b: 60 };
  const coolTarget = { r: 120, g: 160, b: 220 };

  let primary = a;
  let secondary = b;

  if (bias.warm > 0) {
    primary = shiftToward(primary, warmTarget, bias.warm);
    secondary = shiftToward(secondary, warmTarget, bias.warm * 0.7);
  } else if (bias.warm < 0) {
    primary = shiftToward(primary, coolTarget, -bias.warm);
    secondary = shiftToward(secondary, coolTarget, -bias.warm * 0.7);
  }

  if (bias.bright > 0) {
    primary = lighten(primary, bias.bright);
    secondary = lighten(secondary, bias.bright * 0.6);
  } else if (bias.bright < 0) {
    primary = darken(primary, -bias.bright);
    secondary = darken(secondary, -bias.bright * 0.6);
  }

  // Root accent as a gentle blend so pitch color is felt, not dominant.
  primary = mix(primary, accent, 0.14);
  secondary = mix(secondary, accent, 0.08);

  const intensity = intensityFor(quality);
  const washAlpha = 0.28 + intensity * 0.32;
  const borderAlpha = 0.35 + intensity * 0.4;
  const glowAlpha = 0.22 + intensity * 0.35;

  return {
    primary: rgba(primary, washAlpha),
    secondary: rgba(secondary, washAlpha * 0.9),
    top: rgba(lighten(primary, 0.15), 0.22 + intensity * 0.2),
    bottom: rgba(darken(secondary, 0.1), 0.2 + intensity * 0.18),
    border: rgba(lighten(primary, 0.05), borderAlpha),
    glow: rgba(mix(primary, secondary, 0.4), glowAlpha),
    intensity,
  };
}
