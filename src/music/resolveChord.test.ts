import { describe, expect, it } from "vite-plus/test";
import { DEFAULT_KEY } from "./keyMode";
import {
  appendHistory,
  createHistoryEntry,
  DEFAULT_PLAYBACK_SETTINGS,
  entrySignature,
  getFavoriteEntries,
  historyEntryToRequest,
  removeHistoryEntries,
  resolveChord,
  sortHistoryEntries,
  toggleEntryFavorite,
  type ChordHistoryEntry,
} from "./resolveChord";

const sampleSettings = {
  ...DEFAULT_PLAYBACK_SETTINGS,
  voiceId: "bright-saw" as const,
  reverb: 0.4,
};

function makeEntry(overrides: Partial<ChordHistoryEntry> = {}): ChordHistoryEntry {
  const request = {
    rootMidi: 60,
    manualType: "maj" as const,
    extensions: [] as const,
    keyModeEnabled: false,
    key: DEFAULT_KEY,
    voicing: 0,
  };

  return {
    ...createHistoryEntry(
      request,
      resolveChord(request),
      sampleSettings,
      overrides.id ?? "history-1",
      overrides.playedAt ?? 1,
    ),
    ...overrides,
  };
}

describe("resolveChord", () => {
  it("uses manual chord type when provided", () => {
    const resolved = resolveChord({
      rootMidi: 60,
      manualType: "maj",
      extensions: ["M7"],
      keyModeEnabled: true,
      key: DEFAULT_KEY,
      voicing: 0,
    });

    expect(resolved.name).toBe("Cmaj7");
    expect(resolved.usedKeyMode).toBe(false);
    expect(resolved.notes).toEqual([60, 64, 67, 71]);
  });

  it("derives diatonic chords when key mode is enabled", () => {
    const resolved = resolveChord({
      rootMidi: 62,
      manualType: null,
      extensions: [],
      keyModeEnabled: true,
      key: DEFAULT_KEY,
      voicing: 0,
    });

    expect(resolved.chordType).toBe("min");
    expect(resolved.name).toBe("Dm");
    expect(resolved.usedKeyMode).toBe(true);
  });

  it("returns only the root when key mode is off and no manual type is held", () => {
    const resolved = resolveChord({
      rootMidi: 60,
      manualType: null,
      extensions: ["M7"],
      keyModeEnabled: false,
      key: DEFAULT_KEY,
      voicing: 0,
    });

    expect(resolved.name).toBe("C");
    expect(resolved.notes).toEqual([60]);
    expect(resolved.usedKeyMode).toBe(false);
  });

  it("applies voicing after building the chord", () => {
    const resolved = resolveChord({
      rootMidi: 60,
      manualType: "maj",
      extensions: [],
      keyModeEnabled: false,
      key: DEFAULT_KEY,
      voicing: 1,
    });

    expect(resolved.notes).toEqual([64, 67, 72]);
  });

  it("stores full settings on history entries", () => {
    const request = {
      rootMidi: 60,
      manualType: "maj" as const,
      extensions: ["m7"] as const,
      keyModeEnabled: false,
      key: DEFAULT_KEY,
      voicing: 0,
    };
    const resolved = resolveChord(request);
    const entry = createHistoryEntry(request, resolved, sampleSettings, "history-1", 100);

    expect(entry.name).toBe("C7");
    expect(entry.settings).toEqual(sampleSettings);
    expect(entry.keyRoot).toBe(DEFAULT_KEY.root);
    expect(entry.favorite).toBe(false);
    expect(historyEntryToRequest(entry)).toEqual(request);
  });

  it("round-trips key mode entries with stored key metadata", () => {
    const request = {
      rootMidi: 62,
      manualType: null,
      extensions: ["M7"] as const,
      keyModeEnabled: true,
      key: DEFAULT_KEY,
      voicing: -1,
    };
    const entry = createHistoryEntry(
      request,
      resolveChord(request),
      sampleSettings,
      "history-key-mode",
    );

    expect(entry.usedKeyMode).toBe(true);
    expect(entry.manualType).toBeNull();
    expect(historyEntryToRequest(entry)).toEqual(request);
  });
});

describe("history helpers", () => {
  it("keeps unlimited unique history entries", () => {
    const base = makeEntry({ id: "history-0", playedAt: 1 });
    const entries = Array.from({ length: 20 }, (_, index) => ({
      ...base,
      id: `history-${index}`,
      playedAt: index,
    }));

    const next = makeEntry({ id: "history-new", playedAt: 99, rootMidi: 62, name: "D" });

    expect(appendHistory(entries, next)).toHaveLength(21);
  });

  it("moves duplicate signatures to the front instead of dropping them", () => {
    const first = makeEntry({ id: "history-1", playedAt: 10 });
    const duplicate = makeEntry({ id: "history-2", playedAt: 20 });

    expect(entrySignature(first)).toBe(entrySignature(duplicate));
    expect(appendHistory([first], duplicate)).toEqual([duplicate]);
  });

  it("sorts history newest first", () => {
    const older = makeEntry({ id: "history-1", playedAt: 10 });
    const newer = makeEntry({ id: "history-2", playedAt: 30, rootMidi: 62, name: "D" });

    expect(sortHistoryEntries([older, newer]).map((entry) => entry.id)).toEqual([
      "history-2",
      "history-1",
    ]);
  });

  it("toggles favorites without removing history entries", () => {
    const entry = makeEntry();
    const favorited = toggleEntryFavorite([entry], entry.id);
    const unfavorited = toggleEntryFavorite(favorited, entry.id);

    expect(favorited[0]?.favorite).toBe(true);
    expect(getFavoriteEntries(favorited)).toHaveLength(1);
    expect(unfavorited[0]?.favorite).toBe(false);
    expect(getFavoriteEntries(unfavorited)).toHaveLength(0);
  });

  it("removes one or many history entries by id", () => {
    const first = makeEntry({ id: "history-1" });
    const second = makeEntry({ id: "history-2", rootMidi: 62, name: "D" });

    expect(removeHistoryEntries([first, second], ["history-1"])).toHaveLength(1);
    expect(removeHistoryEntries([first, second], ["history-1", "history-2"])).toHaveLength(0);
    expect(removeHistoryEntries([first, second], [])).toEqual([first, second]);
    expect(removeHistoryEntries([first, second], ["missing"])).toEqual([first, second]);
  });
});
