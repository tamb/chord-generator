import { describe, expect, it } from "vite-plus/test";
import { parseRippleEnabled } from "./rippleStore";

describe("parseRippleEnabled", () => {
  it("defaults to off", () => {
    expect(parseRippleEnabled(null)).toBe(false);
    expect(parseRippleEnabled("")).toBe(false);
    expect(parseRippleEnabled("false")).toBe(false);
  });

  it("enables only for explicit true", () => {
    expect(parseRippleEnabled("true")).toBe(true);
    expect(parseRippleEnabled(true)).toBe(true);
  });
});
