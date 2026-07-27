import { describe, expect, it } from "vite-plus/test";
import { parseAtmosphereEnabled } from "./atmosphereStore";

describe("parseAtmosphereEnabled", () => {
  it("defaults to on when unset", () => {
    expect(parseAtmosphereEnabled(null)).toBe(true);
    expect(parseAtmosphereEnabled("")).toBe(true);
    expect(parseAtmosphereEnabled(undefined)).toBe(true);
  });

  it("disables only for explicit false", () => {
    expect(parseAtmosphereEnabled("false")).toBe(false);
    expect(parseAtmosphereEnabled(false)).toBe(false);
  });

  it("enables for explicit true", () => {
    expect(parseAtmosphereEnabled("true")).toBe(true);
    expect(parseAtmosphereEnabled(true)).toBe(true);
  });
});
