import { describe, expect, it } from "vite-plus/test";
import { CHORD_EXTENSIONS, CHORD_TYPES } from "./ChordButtons";

describe("chord modifier shortcuts", () => {
  it("maps chord types to the number row", () => {
    expect(CHORD_TYPES.map(({ id }) => id)).toEqual(["dim", "min", "maj", "sus"]);
    expect(CHORD_TYPES.map(({ shortcut }) => shortcut)).toEqual(["1", "2", "3", "4"]);
  });

  it("maps extensions to q w e r", () => {
    expect(CHORD_EXTENSIONS.map(({ id }) => id)).toEqual(["6", "m7", "M7", "9"]);
    expect(CHORD_EXTENSIONS.map(({ shortcut }) => shortcut)).toEqual(["Q", "W", "E", "R"]);
  });

  it("uses unique modifier shortcuts", () => {
    const shortcuts = [...CHORD_TYPES, ...CHORD_EXTENSIONS].map(({ shortcut }) =>
      shortcut.toLowerCase(),
    );

    expect(new Set(shortcuts).size).toBe(shortcuts.length);
  });
});
