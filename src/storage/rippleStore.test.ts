import { describe, expect, it } from "vite-plus/test";
import { parseRippleEnabled } from "./rippleStore";

describe("parseRippleEnabled", () => {
  it("defaults to on when unset", () => {
    expect(parseRippleEnabled(null)).toBe(true);
    expect(parseRippleEnabled("")).toBe(true);
    expect(parseRippleEnabled(undefined)).toBe(true);
  });

  it("disables only for explicit false", () => {
    expect(parseRippleEnabled("false")).toBe(false);
    expect(parseRippleEnabled(false)).toBe(false);
  });

  it("enables for explicit true", () => {
    expect(parseRippleEnabled("true")).toBe(true);
    expect(parseRippleEnabled(true)).toBe(true);
  });
});
