import { describe, expect, it } from "vite-plus/test";
import {
  classifyAtmosphereQuality,
  resolveAtmospherePalette,
  type AtmosphereInput,
} from "./atmosphereColors";

describe("classifyAtmosphereQuality", () => {
  it("maps type and extensions to emotion-matrix qualities", () => {
    expect(classifyAtmosphereQuality(null, [])).toBe("root");
    expect(classifyAtmosphereQuality("maj", [])).toBe("major");
    expect(classifyAtmosphereQuality("min", [])).toBe("minor");
    expect(classifyAtmosphereQuality("maj", ["M7"])).toBe("maj7");
    expect(classifyAtmosphereQuality("maj", ["m7"])).toBe("dom7");
    expect(classifyAtmosphereQuality("min", ["m7"])).toBe("min7");
    expect(classifyAtmosphereQuality("dim", [])).toBe("dim");
    expect(classifyAtmosphereQuality("dim", ["m7"])).toBe("dim7");
    expect(classifyAtmosphereQuality("sus", [])).toBe("sus");
    expect(classifyAtmosphereQuality("maj", ["6"])).toBe("sixth");
    expect(classifyAtmosphereQuality("maj", ["9"])).toBe("ninth");
  });
});

describe("resolveAtmospherePalette", () => {
  const base: AtmosphereInput = {
    rootMidi: 60,
    chordType: "maj",
    extensions: [],
    keyMode: "major",
    keyRoot: 0,
  };

  it("returns a complete palette with positive intensity for sounding chords", () => {
    const palette = resolveAtmospherePalette(base);
    expect(palette.intensity).toBeGreaterThan(0);
    expect(palette.primary).toMatch(/^rgba\(/);
    expect(palette.border).toMatch(/^rgba\(/);
    expect(palette.glow).toMatch(/^rgba\(/);
  });

  it("uses cooler/deeper colors for minor chords in a minor key than major in major", () => {
    const bright = resolveAtmospherePalette(base);
    const dark = resolveAtmospherePalette({
      ...base,
      chordType: "min",
      keyMode: "minor",
      keyRoot: 9,
    });

    expect(dark.intensity).toBeGreaterThan(0);
    expect(bright.primary).not.toBe(dark.primary);
  });

  it("makes dim7 more intense than a plain major triad", () => {
    const major = resolveAtmospherePalette(base);
    const dim7 = resolveAtmospherePalette({
      ...base,
      chordType: "dim",
      extensions: ["m7"],
      keyMode: "minor",
    });

    expect(dim7.intensity).toBeGreaterThan(major.intensity);
  });

  it("shifts maj7 minor-key palettes toward bittersweet blue-pink vs sunny maj7", () => {
    const sunny = resolveAtmospherePalette({
      ...base,
      extensions: ["M7"],
      keyMode: "major",
    });
    const bittersweet = resolveAtmospherePalette({
      ...base,
      extensions: ["M7"],
      keyMode: "minor",
      keyRoot: 9,
    });

    expect(sunny.primary).not.toBe(bittersweet.primary);
    expect(sunny.secondary).not.toBe(bittersweet.secondary);
  });
});
