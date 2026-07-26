import { describe, expect, it } from "vite-plus/test";
import { parseThemeMode } from "./themeStore";

describe("parseThemeMode", () => {
  it("defaults to light for missing or unknown values", () => {
    expect(parseThemeMode(null)).toBe("light");
    expect(parseThemeMode("")).toBe("light");
    expect(parseThemeMode("system")).toBe("light");
  });

  it("accepts dark mode", () => {
    expect(parseThemeMode("dark")).toBe("dark");
  });
});
