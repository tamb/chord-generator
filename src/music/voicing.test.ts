import { describe, expect, it } from "vite-plus/test";
import { applyVoicing, clampVoicing, stepVoicing } from "./voicing";

describe("voicing", () => {
  it("returns root position unchanged at zero", () => {
    expect(applyVoicing([60, 64, 67], 0)).toEqual([60, 64, 67]);
  });

  it("leaves single-note chords unchanged", () => {
    expect(applyVoicing([60], 2)).toEqual([60]);
    expect(applyVoicing([60], -3)).toEqual([60]);
  });

  it("moves the lowest note up for positive voicing", () => {
    expect(applyVoicing([60, 64, 67], 1)).toEqual([64, 67, 72]);
    expect(applyVoicing([60, 64, 67], 2)).toEqual([67, 72, 76]);
  });

  it("moves the highest note down for negative voicing", () => {
    expect(applyVoicing([60, 64, 67], -1)).toEqual([55, 60, 64]);
    expect(applyVoicing([60, 64, 67], -2)).toEqual([52, 55, 60]);
  });

  it("clamps voicing to available note count", () => {
    expect(clampVoicing(5, 3)).toBe(2);
    expect(clampVoicing(-5, 3)).toBe(-2);
    expect(clampVoicing(3, 1)).toBe(0);
    expect(stepVoicing(1, 1, 3)).toBe(2);
    expect(stepVoicing(-2, -1, 3)).toBe(-2);
    expect(stepVoicing(0, -1, 4)).toBe(-1);
  });
});
