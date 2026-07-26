import { describe, expect, it } from "vite-plus/test";
import {
  DEFAULT_KEY,
  findKeyIndex,
  formatKeyLabel,
  getDiatonicChordType,
  getKeyByIndex,
  getRelativeDegree,
  getScaleTones,
  KEY_SIGNATURES,
  nearestScaleDegree,
  pitchClassLabel,
} from "./keyMode";

describe("keyMode", () => {
  it("maps C major scale degrees to diatonic chord types", () => {
    expect(getDiatonicChordType(0, "major", 60)).toBe("maj");
    expect(getDiatonicChordType(0, "major", 62)).toBe("min");
    expect(getDiatonicChordType(0, "major", 64)).toBe("min");
    expect(getDiatonicChordType(0, "major", 65)).toBe("maj");
    expect(getDiatonicChordType(0, "major", 67)).toBe("maj");
    expect(getDiatonicChordType(0, "major", 69)).toBe("min");
    expect(getDiatonicChordType(0, "major", 71)).toBe("dim");
  });

  it("maps A minor scale degrees to diatonic chord types", () => {
    expect(getDiatonicChordType(9, "minor", 69)).toBe("min");
    expect(getDiatonicChordType(9, "minor", 71)).toBe("dim");
    expect(getDiatonicChordType(9, "minor", 60)).toBe("maj");
    expect(getDiatonicChordType(9, "minor", 62)).toBe("min");
  });

  it("uses nearest scale degree for out-of-key roots", () => {
    expect(getDiatonicChordType(0, "major", 61)).toBe("maj");
    expect(nearestScaleDegree(1, "major")).toBe(0);
    expect(nearestScaleDegree(6, "major")).toBe(5);
    expect(nearestScaleDegree(4, "minor")).toBe(3);
  });

  it("exposes common key signatures", () => {
    expect(KEY_SIGNATURES.length).toBeGreaterThan(8);
    expect(DEFAULT_KEY.label).toBe("C Major");
    expect(getKeyByIndex(0)).toEqual(DEFAULT_KEY);
    expect(getKeyByIndex(-1)).toEqual(KEY_SIGNATURES.at(-1));
  });

  it("returns seven pitch classes for major and minor scales", () => {
    expect(getScaleTones(0, "major")).toHaveLength(7);
    expect(getScaleTones(9, "minor")).toHaveLength(7);
    expect(getScaleTones(0, "major")).toContain(0);
    expect(getScaleTones(7, "major")).toContain(7);
  });

  it("computes relative degrees across the octave", () => {
    expect(getRelativeDegree(0, 0)).toBe(0);
    expect(getRelativeDegree(60, 0)).toBe(0);
    expect(getRelativeDegree(67, 0)).toBe(7);
    expect(getRelativeDegree(0, 7)).toBe(5);
  });

  it("finds and formats key metadata", () => {
    expect(findKeyIndex(DEFAULT_KEY)).toBe(0);
    expect(formatKeyLabel(DEFAULT_KEY)).toBe("C Major");
    expect(pitchClassLabel(10)).toBe("A#");
    expect(pitchClassLabel(99)).toBe("C");
  });
});
