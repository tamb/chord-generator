import { describe, expect, it } from "vite-plus/test";
import {
  parseChordHistoryEntries,
  parseChordHistoryEntry,
  parseHistoryCounter,
} from "./chordHistoryStore";

describe("chordHistoryStore parsing", () => {
  it("parses valid history entries with settings", () => {
    const entry = parseChordHistoryEntry({
      id: "history-1",
      rootMidi: 60,
      manualType: "maj",
      chordType: "maj",
      extensions: ["M7"],
      voicing: 0,
      name: "Cmaj7",
      usedKeyMode: false,
      keyModeEnabled: false,
      keyRoot: 0,
      keyMode: "major",
      keyLabel: "C Major",
      settings: {
        voiceId: "organ",
        reverb: 0.5,
        tremolo: 0.1,
        phaser: 0.2,
        volume: 0.8,
      },
      favorite: true,
      playedAt: 1234,
    });

    expect(entry?.name).toBe("Cmaj7");
    expect(entry?.settings.voiceId).toBe("organ");
    expect(entry?.favorite).toBe(true);
    expect(entry?.playedAt).toBe(1234);
  });

  it("migrates legacy entries without settings", () => {
    const entry = parseChordHistoryEntry({
      id: "history-1",
      rootMidi: 60,
      chordType: "maj",
      extensions: ["M7"],
      voicing: 0,
      name: "Cmaj7",
      usedKeyMode: false,
      keyLabel: "C Major",
    });

    expect(entry?.manualType).toBe("maj");
    expect(entry?.settings.voiceId).toBe("warm-pad");
    expect(entry?.keyRoot).toBe(0);
  });

  it("rejects malformed entries", () => {
    expect(parseChordHistoryEntry(null)).toBeNull();
    expect(parseChordHistoryEntry({ id: "bad" })).toBeNull();
    expect(
      parseChordHistoryEntry({ id: "history-1", rootMidi: 60, extensions: ["bad"] }),
    ).toBeNull();
  });

  it("parses arrays and ignores invalid items", () => {
    const entries = parseChordHistoryEntries([
      {
        id: "history-2",
        rootMidi: 62,
        chordType: "min",
        extensions: [],
        voicing: 0,
        name: "Dm",
        usedKeyMode: true,
        keyLabel: "C Major",
      },
      { broken: true },
    ]);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.name).toBe("Dm");
  });

  it("derives the counter from stored ids when needed", () => {
    expect(parseHistoryCounter(undefined, [])).toBe(0);
    expect(parseHistoryCounter(12, [])).toBe(12);
    expect(
      parseHistoryCounter(undefined, [
        {
          id: "history-7",
          rootMidi: 60,
          manualType: "maj",
          chordType: "maj",
          extensions: [],
          voicing: 0,
          name: "C",
          usedKeyMode: false,
          keyModeEnabled: false,
          keyRoot: 0,
          keyMode: "major",
          keyLabel: "C Major",
          settings: {
            voiceId: "warm-pad",
            reverb: 0.18,
            tremolo: 0,
            phaser: 0,
            volume: 0.75,
          },
          favorite: false,
          playedAt: 0,
        },
      ]),
    ).toBe(7);
  });

  it("falls back to defaults for invalid stored settings", () => {
    const entry = parseChordHistoryEntry({
      id: "history-1",
      rootMidi: 60,
      chordType: "maj",
      extensions: [],
      voicing: 0,
      name: "C",
      usedKeyMode: false,
      keyLabel: "C Major",
      settings: {
        voiceId: "not-a-voice",
        reverb: 2,
        tremolo: -1,
        phaser: 99,
        volume: -5,
      },
    });

    expect(entry?.settings.voiceId).toBe("warm-pad");
    expect(entry?.settings.reverb).toBe(0.18);
    expect(entry?.settings.tremolo).toBe(0);
    expect(entry?.settings.phaser).toBe(0);
    expect(entry?.settings.volume).toBe(0.75);
  });

  it("defaults favorite and playedAt for legacy entries", () => {
    const entry = parseChordHistoryEntry({
      id: "history-legacy",
      rootMidi: 67,
      chordType: "maj",
      extensions: [],
      voicing: 0,
      name: "G",
      usedKeyMode: true,
      keyLabel: "G Major",
    });

    expect(entry?.favorite).toBe(false);
    expect(entry?.playedAt).toBe(0);
    expect(entry?.keyModeEnabled).toBe(true);
  });

  it("returns an empty array for non-array stored history", () => {
    expect(parseChordHistoryEntries(null)).toEqual([]);
    expect(parseChordHistoryEntries({})).toEqual([]);
  });
});
