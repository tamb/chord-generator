import { describe, expect, it } from "vite-plus/test";
import { CHORD_EXTENSIONS, CHORD_TYPES } from "../components/ChordButtons";
import { PIANO_KEYS } from "./chords";
import { PIANO_SHORTCUTS, PIANO_SHORTCUT_LABELS } from "./keyboardShortcuts";

describe("keyboardShortcuts", () => {
  it("starts the octave on F with C", () => {
    expect(Object.keys(PIANO_SHORTCUTS)).toHaveLength(12);
    expect(PIANO_SHORTCUTS.f).toBe(60);
    expect(PIANO_SHORTCUTS.t).toBe(61);
    expect(PIANO_SHORTCUTS.g).toBe(62);
    expect(PIANO_SHORTCUTS.y).toBe(63);
    expect(PIANO_SHORTCUTS.h).toBe(64);
    expect(PIANO_SHORTCUTS.j).toBe(65);
    expect(PIANO_SHORTCUTS.o).toBe(66);
    expect(PIANO_SHORTCUTS.k).toBe(67);
    expect(PIANO_SHORTCUTS.p).toBe(68);
    expect(PIANO_SHORTCUTS.l).toBe(69);
    expect(PIANO_SHORTCUTS.i).toBe(70);
    expect(PIANO_SHORTCUTS[";"]).toBe(71);
  });

  it("covers the same midi notes as the on-screen keyboard", () => {
    const keyboardMidis = PIANO_KEYS.map((key) => key.midi).sort((left, right) => left - right);
    const shortcutMidis = Object.values(PIANO_SHORTCUTS).sort((left, right) => left - right);

    expect(shortcutMidis).toEqual(keyboardMidis);
  });

  it("uses unique shortcuts for each key", () => {
    const shortcuts = Object.keys(PIANO_SHORTCUTS);
    expect(new Set(shortcuts).size).toBe(shortcuts.length);
  });

  it("builds display labels for white and black keys", () => {
    expect(PIANO_SHORTCUT_LABELS[60]).toBe("F");
    expect(PIANO_SHORTCUT_LABELS[61]).toBe("T");
    expect(PIANO_SHORTCUT_LABELS[71]).toBe(";");
  });

  it("does not overlap with chord modifier shortcuts", () => {
    const modifierKeys = new Set([
      ...CHORD_TYPES.map(({ shortcut }) => shortcut.toLowerCase()),
      ...CHORD_EXTENSIONS.map(({ shortcut }) => shortcut.toLowerCase()),
    ]);

    for (const shortcut of Object.keys(PIANO_SHORTCUTS)) {
      expect(modifierKeys.has(shortcut)).toBe(false);
    }
  });
});
