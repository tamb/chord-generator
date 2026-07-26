import { buildChord, formatChordName, type ChordExtension, type ChordType } from "./chords";
import { getDiatonicChordType, type KeySignature, type ScaleMode } from "./keyMode";
import { applyVoicing } from "./voicing";
import { DEFAULT_VOICE_ID, type VoiceId } from "../audio/voices";

export type ChordRequest = {
  rootMidi: number;
  manualType: ChordType | null;
  extensions: readonly ChordExtension[];
  keyModeEnabled: boolean;
  key: KeySignature;
  voicing: number;
};

export type ChordPlaybackSettings = {
  voiceId: VoiceId;
  reverb: number;
  tremolo: number;
  phaser: number;
  volume: number;
};

export type ResolvedChord = {
  notes: number[];
  chordType: ChordType | null;
  name: string;
  usedKeyMode: boolean;
};

export type ChordHistoryEntry = {
  id: string;
  rootMidi: number;
  manualType: ChordType | null;
  chordType: ChordType | null;
  extensions: ChordExtension[];
  voicing: number;
  name: string;
  usedKeyMode: boolean;
  keyModeEnabled: boolean;
  keyRoot: number;
  keyMode: ScaleMode;
  keyLabel: string;
  settings: ChordPlaybackSettings;
  favorite: boolean;
  playedAt: number;
};

export const DEFAULT_PLAYBACK_SETTINGS: ChordPlaybackSettings = {
  voiceId: DEFAULT_VOICE_ID,
  reverb: 0.18,
  tremolo: 0,
  phaser: 0,
  volume: 0.75,
};

export function resolveChord({
  rootMidi,
  manualType,
  extensions,
  keyModeEnabled,
  key,
  voicing,
}: ChordRequest): ResolvedChord {
  const usedKeyMode = manualType === null && keyModeEnabled;
  const chordType =
    manualType ?? (keyModeEnabled ? getDiatonicChordType(key.root, key.mode, rootMidi) : null);

  const baseNotes = buildChord(rootMidi, chordType, extensions);
  const notes = applyVoicing(baseNotes, voicing);
  const name = formatChordName(rootMidi, chordType, extensions);

  return {
    notes,
    chordType,
    name,
    usedKeyMode,
  };
}

export function createHistoryEntry(
  request: ChordRequest,
  resolved: ResolvedChord,
  settings: ChordPlaybackSettings,
  id: string,
  playedAt = Date.now(),
): ChordHistoryEntry {
  return {
    id,
    rootMidi: request.rootMidi,
    manualType: request.manualType,
    chordType: resolved.chordType,
    extensions: [...request.extensions],
    voicing: request.voicing,
    name: resolved.name,
    usedKeyMode: resolved.usedKeyMode,
    keyModeEnabled: request.keyModeEnabled,
    keyRoot: request.key.root,
    keyMode: request.key.mode,
    keyLabel: request.key.label,
    settings: { ...settings },
    favorite: false,
    playedAt,
  };
}

export function historyEntryToRequest(entry: ChordHistoryEntry): ChordRequest {
  return {
    rootMidi: entry.rootMidi,
    manualType: entry.manualType,
    extensions: entry.extensions,
    keyModeEnabled: entry.keyModeEnabled,
    key: {
      root: entry.keyRoot,
      mode: entry.keyMode,
      label: entry.keyLabel,
    },
    voicing: entry.voicing,
  };
}

export function entrySignature(entry: ChordHistoryEntry): string {
  return JSON.stringify({
    rootMidi: entry.rootMidi,
    manualType: entry.manualType,
    extensions: entry.extensions,
    voicing: entry.voicing,
    keyModeEnabled: entry.keyModeEnabled,
    keyRoot: entry.keyRoot,
    keyMode: entry.keyMode,
    settings: entry.settings,
  });
}

export function appendHistory(
  history: readonly ChordHistoryEntry[],
  entry: ChordHistoryEntry,
): ChordHistoryEntry[] {
  const signature = entrySignature(entry);
  const withoutDuplicate = history.filter((existing) => entrySignature(existing) !== signature);

  return [entry, ...withoutDuplicate];
}

export function toggleEntryFavorite(
  history: readonly ChordHistoryEntry[],
  entryId: string,
): ChordHistoryEntry[] {
  return history.map((entry) =>
    entry.id === entryId ? { ...entry, favorite: !entry.favorite } : entry,
  );
}

export function sortHistoryEntries(entries: readonly ChordHistoryEntry[]): ChordHistoryEntry[] {
  return [...entries].sort((left, right) => right.playedAt - left.playedAt);
}

export function getFavoriteEntries(entries: readonly ChordHistoryEntry[]): ChordHistoryEntry[] {
  return sortHistoryEntries(entries.filter((entry) => entry.favorite));
}

export function removeHistoryEntries(
  history: readonly ChordHistoryEntry[],
  entryIds: readonly string[],
): ChordHistoryEntry[] {
  if (entryIds.length === 0) {
    return [...history];
  }

  const ids = new Set(entryIds);
  return history.filter((entry) => !ids.has(entry.id));
}
