export type ChordType = "dim" | "min" | "maj" | "sus";
export type ChordExtension = "6" | "m7" | "M7" | "9";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

const TYPE_INTERVALS: Record<ChordType, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  sus: [0, 5, 7],
};

const EXTENSION_INTERVALS: Record<ChordExtension, number> = {
  "6": 9,
  m7: 10,
  M7: 11,
  "9": 14,
};

export function buildChord(
  rootMidi: number,
  chordType: ChordType | null,
  extensions: readonly ChordExtension[],
): number[] {
  if (chordType === null) {
    return [rootMidi];
  }

  const intervals = new Set<number>(TYPE_INTERVALS[chordType]);
  for (const extension of extensions) {
    if (chordType === "dim" && extension === "m7") {
      intervals.add(9);
      continue;
    }

    intervals.add(EXTENSION_INTERVALS[extension]);
  }

  return [...intervals].sort((a, b) => a - b).map((interval) => rootMidi + interval);
}

export function formatChordName(
  rootMidi: number,
  chordType: ChordType | null,
  extensions: readonly ChordExtension[],
): string {
  const root = NOTE_NAMES[rootMidi % 12]!;

  if (chordType === null) {
    return root;
  }

  const has6 = extensions.includes("6");
  const hasM7 = extensions.includes("M7");
  const hasm7 = extensions.includes("m7");
  const has9 = extensions.includes("9");

  if (chordType === "maj") {
    if (hasM7 && has9) return `${root}maj9`;
    if (hasM7) return `${root}maj7`;
    if (hasm7) return `${root}7`;
    if (has6 && has9) return `${root}6/9`;
    if (has6) return `${root}6`;
    if (has9) return `${root}add9`;
    return root;
  }

  if (chordType === "min") {
    if (hasM7 && has9) return `${root}mM9`;
    if (hasM7) return `${root}mM7`;
    if (hasm7 && has9) return `${root}m9`;
    if (hasm7) return `${root}m7`;
    if (has6) return `${root}m6`;
    if (has9) return `${root}madd9`;
    return `${root}m`;
  }

  if (chordType === "dim") {
    if (hasm7) return `${root}dim7`;
    if (hasM7) return `${root}dimM7`;
    if (has6) return `${root}dim6`;
    if (has9) return `${root}dim9`;
    return `${root}dim`;
  }

  if (hasm7 && has9) return `${root}sus4-9`;
  if (hasm7) return `${root}sus4-7`;
  if (hasM7) return `${root}sus4M7`;
  if (has6) return `${root}sus4-6`;
  if (has9) return `${root}sus4-9`;
  return `${root}sus4`;
}

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[midi % 12]!}${octave}`;
}

export function formatNoteList(midiNotes: number[]): string {
  return midiNotes.map(midiToNoteName).join(" · ");
}

export const OCTAVE_START = 60;

export const PIANO_KEYS = [
  { midi: 60, label: "C", isBlack: false },
  { midi: 61, label: "C#", isBlack: true },
  { midi: 62, label: "D", isBlack: false },
  { midi: 63, label: "D#", isBlack: true },
  { midi: 64, label: "E", isBlack: false },
  { midi: 65, label: "F", isBlack: false },
  { midi: 66, label: "F#", isBlack: true },
  { midi: 67, label: "G", isBlack: false },
  { midi: 68, label: "G#", isBlack: true },
  { midi: 69, label: "A", isBlack: false },
  { midi: 70, label: "A#", isBlack: true },
  { midi: 71, label: "B", isBlack: false },
] as const;
