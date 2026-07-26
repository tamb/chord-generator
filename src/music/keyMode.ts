import type { ChordType } from "./chords";

export type ScaleMode = "major" | "minor";

export type KeySignature = {
  root: number;
  mode: ScaleMode;
  label: string;
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11] as const;
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10] as const;

const MAJOR_DIATONIC: Record<number, ChordType> = {
  0: "maj",
  2: "min",
  4: "min",
  5: "maj",
  7: "maj",
  9: "min",
  11: "dim",
};

const MINOR_DIATONIC: Record<number, ChordType> = {
  0: "min",
  2: "dim",
  3: "maj",
  5: "min",
  7: "min",
  8: "maj",
  10: "maj",
};

export const KEY_SIGNATURES: KeySignature[] = [
  { root: 0, mode: "major", label: "C Major" },
  { root: 7, mode: "major", label: "G Major" },
  { root: 2, mode: "major", label: "D Major" },
  { root: 9, mode: "major", label: "A Major" },
  { root: 4, mode: "major", label: "E Major" },
  { root: 11, mode: "major", label: "B Major" },
  { root: 5, mode: "major", label: "F Major" },
  { root: 10, mode: "major", label: "Bb Major" },
  { root: 3, mode: "major", label: "Eb Major" },
  { root: 9, mode: "minor", label: "A Minor" },
  { root: 4, mode: "minor", label: "E Minor" },
  { root: 11, mode: "minor", label: "B Minor" },
  { root: 7, mode: "minor", label: "G Minor" },
  { root: 2, mode: "minor", label: "D Minor" },
];

export const DEFAULT_KEY = KEY_SIGNATURES[0]!;

export function getScaleTones(root: number, mode: ScaleMode): number[] {
  const intervals = mode === "major" ? MAJOR_SCALE : MINOR_SCALE;
  return intervals.map((interval) => (root + interval) % 12);
}

export function getRelativeDegree(pitchClass: number, keyRoot: number): number {
  return (pitchClass - keyRoot + 12) % 12;
}

export function nearestScaleDegree(relativeDegree: number, mode: ScaleMode): number {
  const scale = mode === "major" ? MAJOR_SCALE : MINOR_SCALE;
  if ((scale as readonly number[]).includes(relativeDegree)) {
    return relativeDegree;
  }

  return scale.reduce((nearest, tone) =>
    Math.abs(tone - relativeDegree) < Math.abs(nearest - relativeDegree) ? tone : nearest,
  );
}

export function getDiatonicChordType(
  keyRoot: number,
  mode: ScaleMode,
  rootMidi: number,
): ChordType {
  const relativeDegree = getRelativeDegree(rootMidi % 12, keyRoot);
  const scaleDegree = nearestScaleDegree(relativeDegree, mode);
  const diatonicMap = mode === "major" ? MAJOR_DIATONIC : MINOR_DIATONIC;
  return diatonicMap[scaleDegree] ?? (mode === "major" ? "maj" : "min");
}

export function formatKeyLabel(key: KeySignature): string {
  return key.label;
}

export function getKeyByIndex(index: number): KeySignature {
  const normalized =
    ((index % KEY_SIGNATURES.length) + KEY_SIGNATURES.length) % KEY_SIGNATURES.length;
  return KEY_SIGNATURES[normalized]!;
}

export function findKeyIndex(key: KeySignature): number {
  return KEY_SIGNATURES.findIndex(
    (candidate) => candidate.root === key.root && candidate.mode === key.mode,
  );
}

export function pitchClassLabel(pitchClass: number): string {
  return NOTE_NAMES[pitchClass] ?? "C";
}
