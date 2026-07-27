import { describe, expect, it } from "vite-plus/test";
import { parseThemeMode } from "./themeStore";

describe("parseThemeMode", () => {
  it("defaults to dark for missing or unknown values", () => {
    expect(parseThemeMode(null)).toBe("dark");
    expect(parseThemeMode("")).toBe("dark");
    expect(parseThemeMode("system")).toBe("dark");
  });

  it("accepts explicit light mode", () => {
    expect(parseThemeMode("light")).toBe("light");
  });

  it("accepts dark mode", () => {
    expect(parseThemeMode("dark")).toBe("dark");
  });
});
