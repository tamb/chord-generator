import { describe, expect, it } from "vite-plus/test";
import { parseAtmosphereEnabled } from "./atmosphereStore";

describe("parseAtmosphereEnabled", () => {
  it("defaults to off", () => {
    expect(parseAtmosphereEnabled(null)).toBe(false);
    expect(parseAtmosphereEnabled("")).toBe(false);
    expect(parseAtmosphereEnabled("false")).toBe(false);
  });

  it("enables only for explicit true", () => {
    expect(parseAtmosphereEnabled("true")).toBe(true);
    expect(parseAtmosphereEnabled(true)).toBe(true);
  });
});
