import { describe, expect, it } from "vite-plus/test";
import { shouldApplyLoadedHistory } from "./historyHydration";

describe("shouldApplyLoadedHistory", () => {
  it("applies the first successful load", () => {
    expect(shouldApplyLoadedHistory(false, false)).toBe(true);
  });

  it("ignores loads after hydrate so later snapshots cannot wipe new chords", () => {
    expect(shouldApplyLoadedHistory(true, false)).toBe(false);
  });

  it("ignores cancelled loads from unmounted effects", () => {
    expect(shouldApplyLoadedHistory(false, true)).toBe(false);
  });
});
