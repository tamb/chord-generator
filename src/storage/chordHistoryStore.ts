import localforage from "localforage";
import { DEFAULT_VOICE_ID, VOICES, type VoiceId } from "../audio/voices";
import type { ChordExtension, ChordType } from "../music/chords";
import { DEFAULT_KEY } from "../music/keyMode";
import type { ScaleMode } from "../music/keyMode";
import {
  DEFAULT_PLAYBACK_SETTINGS,
  type ChordHistoryEntry,
  type ChordPlaybackSettings,
} from "../music/resolveChord";

export const CHORD_HISTORY_STORAGE_KEY = "chord-history";
export const CHORD_HISTORY_COUNTER_KEY = "chord-history-counter";

const chordHistoryStore = localforage.createInstance({
  name: "chord-generator",
  storeName: "chord_history",
  driver: localforage.INDEXEDDB,
});

const CHORD_TYPES = new Set<ChordType>(["dim", "min", "maj", "sus"]);
const CHORD_EXTENSIONS = new Set<ChordExtension>(["6", "m7", "M7", "9"]);
const SCALE_MODES = new Set<ScaleMode>(["major", "minor"]);
const VOICE_IDS = new Set<VoiceId>(VOICES.map((voice) => voice.id));

export type StoredChordHistory = {
  entries: ChordHistoryEntry[];
  counter: number;
};

function isChordType(value: unknown): value is ChordType {
  return typeof value === "string" && CHORD_TYPES.has(value as ChordType);
}

function isChordExtension(value: unknown): value is ChordExtension {
  return typeof value === "string" && CHORD_EXTENSIONS.has(value as ChordExtension);
}

function isVoiceId(value: unknown): value is VoiceId {
  return typeof value === "string" && VOICE_IDS.has(value as VoiceId);
}

function parsePlaybackSettings(value: unknown): ChordPlaybackSettings {
  if (typeof value !== "object" || value === null) {
    return { ...DEFAULT_PLAYBACK_SETTINGS };
  }

  const settings = value as Partial<ChordPlaybackSettings>;
  return {
    voiceId: isVoiceId(settings.voiceId) ? settings.voiceId : DEFAULT_VOICE_ID,
    reverb:
      typeof settings.reverb === "number" && settings.reverb >= 0 && settings.reverb <= 1
        ? settings.reverb
        : DEFAULT_PLAYBACK_SETTINGS.reverb,
    tremolo:
      typeof settings.tremolo === "number" && settings.tremolo >= 0 && settings.tremolo <= 1
        ? settings.tremolo
        : DEFAULT_PLAYBACK_SETTINGS.tremolo,
    phaser:
      typeof settings.phaser === "number" && settings.phaser >= 0 && settings.phaser <= 1
        ? settings.phaser
        : DEFAULT_PLAYBACK_SETTINGS.phaser,
    volume:
      typeof settings.volume === "number" && settings.volume >= 0 && settings.volume <= 1
        ? settings.volume
        : DEFAULT_PLAYBACK_SETTINGS.volume,
  };
}

export function parseChordHistoryEntry(value: unknown): ChordHistoryEntry | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const entry = value as Partial<ChordHistoryEntry> & {
    keyRoot?: number;
    keyMode?: ScaleMode;
    keyModeEnabled?: boolean;
    manualType?: ChordType | null;
    settings?: unknown;
    favorite?: boolean;
    playedAt?: number;
  };

  if (
    typeof entry.id !== "string" ||
    typeof entry.rootMidi !== "number" ||
    typeof entry.voicing !== "number" ||
    typeof entry.name !== "string" ||
    typeof entry.usedKeyMode !== "boolean" ||
    typeof entry.keyLabel !== "string" ||
    !Array.isArray(entry.extensions) ||
    !entry.extensions.every(isChordExtension)
  ) {
    return null;
  }

  const chordType = entry.chordType ?? null;
  if (chordType !== null && !isChordType(chordType)) {
    return null;
  }

  const manualType =
    entry.manualType === undefined ? (entry.usedKeyMode ? null : chordType) : entry.manualType;

  if (manualType !== null && !isChordType(manualType)) {
    return null;
  }

  const keyRoot =
    typeof entry.keyRoot === "number" && entry.keyRoot >= 0 && entry.keyRoot <= 11
      ? entry.keyRoot
      : DEFAULT_KEY.root;
  const keyMode =
    typeof entry.keyMode === "string" && SCALE_MODES.has(entry.keyMode)
      ? entry.keyMode
      : DEFAULT_KEY.mode;

  return {
    id: entry.id,
    rootMidi: entry.rootMidi,
    manualType,
    chordType,
    extensions: [...entry.extensions],
    voicing: entry.voicing,
    name: entry.name,
    usedKeyMode: entry.usedKeyMode,
    keyModeEnabled: entry.keyModeEnabled ?? entry.usedKeyMode,
    keyRoot,
    keyMode,
    keyLabel: entry.keyLabel,
    settings: parsePlaybackSettings(entry.settings),
    favorite: entry.favorite ?? false,
    playedAt: typeof entry.playedAt === "number" ? entry.playedAt : 0,
  };
}

export function parseChordHistoryEntries(value: unknown): ChordHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(parseChordHistoryEntry)
    .filter((entry): entry is ChordHistoryEntry => entry !== null);
}

export function parseHistoryCounter(value: unknown, entries: readonly ChordHistoryEntry[]): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }

  const highestFromIds = entries.reduce((highest, entry) => {
    const match = /^history-(\d+)$/.exec(entry.id);
    if (!match) {
      return highest;
    }

    return Math.max(highest, Number(match[1]));
  }, 0);

  return highestFromIds;
}

export async function loadChordHistory(): Promise<StoredChordHistory> {
  const [storedEntries, storedCounter] = await Promise.all([
    chordHistoryStore.getItem<unknown>(CHORD_HISTORY_STORAGE_KEY),
    chordHistoryStore.getItem<unknown>(CHORD_HISTORY_COUNTER_KEY),
  ]);

  const entries = parseChordHistoryEntries(storedEntries);
  const counter = parseHistoryCounter(storedCounter, entries);

  return { entries, counter };
}

export async function saveChordHistory(
  entries: readonly ChordHistoryEntry[],
  counter: number,
): Promise<void> {
  await Promise.all([
    chordHistoryStore.setItem(CHORD_HISTORY_STORAGE_KEY, [...entries]),
    chordHistoryStore.setItem(CHORD_HISTORY_COUNTER_KEY, counter),
  ]);
}

export async function clearChordHistory(): Promise<void> {
  await Promise.all([
    chordHistoryStore.removeItem(CHORD_HISTORY_STORAGE_KEY),
    chordHistoryStore.removeItem(CHORD_HISTORY_COUNTER_KEY),
  ]);
}
