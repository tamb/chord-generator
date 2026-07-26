import { describe, expect, it } from "vite-plus/test";
import { buildChord, formatChordName, formatNoteList, midiToNoteName, PIANO_KEYS } from "./chords";

describe("buildChord", () => {
  it("returns root only when no chord type is held", () => {
    expect(buildChord(60, null, [])).toEqual([60]);
  });

  it("ignores extensions when no chord type is held", () => {
    expect(buildChord(60, null, ["M7", "9"])).toEqual([60]);
  });

  it("builds major, minor, diminished, and suspended triads", () => {
    expect(buildChord(60, "maj", [])).toEqual([60, 64, 67]);
    expect(buildChord(60, "min", [])).toEqual([60, 63, 67]);
    expect(buildChord(60, "dim", [])).toEqual([60, 63, 66]);
    expect(buildChord(60, "sus", [])).toEqual([60, 65, 67]);
  });

  it("builds Cmaj7", () => {
    expect(buildChord(60, "maj", ["M7"])).toEqual([60, 64, 67, 71]);
  });

  it("builds C7 (dominant)", () => {
    expect(buildChord(60, "maj", ["m7"])).toEqual([60, 64, 67, 70]);
  });

  it("builds Am7", () => {
    expect(buildChord(69, "min", ["m7"])).toEqual([69, 72, 76, 79]);
  });

  it("builds Cdim7 using diminished seventh interval", () => {
    expect(buildChord(60, "dim", ["m7"])).toEqual([60, 63, 66, 69]);
  });

  it("builds minM7 from minor type and major seventh extension", () => {
    expect(buildChord(60, "min", ["M7"])).toEqual([60, 63, 67, 71]);
  });

  it("builds sus4-7 from suspended type and minor seventh extension", () => {
    expect(buildChord(60, "sus", ["m7"])).toEqual([60, 65, 67, 70]);
  });

  it("deduplicates overlapping intervals", () => {
    expect(buildChord(60, "maj", ["6", "M7"])).toEqual([60, 64, 67, 69, 71]);
  });

  it("adds multiple extensions", () => {
    expect(buildChord(60, "maj", ["6", "9"])).toEqual([60, 64, 67, 69, 74]);
  });

  it("works for sharp and flat roots", () => {
    expect(buildChord(66, "maj", ["m7"])).toEqual([66, 70, 73, 76]);
    expect(buildChord(70, "min", [])).toEqual([70, 73, 77]);
  });
});

describe("formatChordName", () => {
  it("shows root only without a chord type", () => {
    expect(formatChordName(60, null, [])).toBe("C");
  });

  it("names common major-family chords", () => {
    expect(formatChordName(60, "maj", [])).toBe("C");
    expect(formatChordName(60, "maj", ["M7"])).toBe("Cmaj7");
    expect(formatChordName(60, "maj", ["m7"])).toBe("C7");
    expect(formatChordName(60, "maj", ["6"])).toBe("C6");
    expect(formatChordName(60, "maj", ["9"])).toBe("Cadd9");
    expect(formatChordName(60, "maj", ["6", "9"])).toBe("C6/9");
    expect(formatChordName(60, "maj", ["M7", "9"])).toBe("Cmaj9");
  });

  it("names common minor-family chords", () => {
    expect(formatChordName(69, "min", [])).toBe("Am");
    expect(formatChordName(69, "min", ["m7"])).toBe("Am7");
    expect(formatChordName(60, "min", ["M7"])).toBe("CmM7");
    expect(formatChordName(60, "min", ["6"])).toBe("Cm6");
    expect(formatChordName(60, "min", ["m7", "9"])).toBe("Cm9");
    expect(formatChordName(60, "min", ["M7", "9"])).toBe("CmM9");
  });

  it("names diminished and suspended chords", () => {
    expect(formatChordName(60, "dim", [])).toBe("Cdim");
    expect(formatChordName(60, "dim", ["m7"])).toBe("Cdim7");
    expect(formatChordName(60, "dim", ["M7"])).toBe("CdimM7");
    expect(formatChordName(67, "sus", [])).toBe("Gsus4");
    expect(formatChordName(60, "sus", ["m7"])).toBe("Csus4-7");
    expect(formatChordName(60, "sus", ["9"])).toBe("Csus4-9");
    expect(formatChordName(60, "sus", ["m7", "9"])).toBe("Csus4-9");
  });

  it("uses correct spellings for black-key roots", () => {
    expect(formatChordName(61, "maj", ["M7"])).toBe("C#maj7");
    expect(formatChordName(70, "min", ["m7"])).toBe("A#m7");
  });
});

describe("midiToNoteName", () => {
  it("formats note names with octave numbers", () => {
    expect(midiToNoteName(60)).toBe("C4");
    expect(midiToNoteName(69)).toBe("A4");
    expect(midiToNoteName(71)).toBe("B4");
  });
});

describe("formatNoteList", () => {
  it("joins note names for display", () => {
    expect(formatNoteList([60, 64, 67])).toBe("C4 · E4 · G4");
    expect(formatNoteList(buildChord(60, "maj", ["M7"]))).toBe("C4 · E4 · G4 · B4");
  });
});

describe("PIANO_KEYS", () => {
  it("defines one chromatic octave starting at C4", () => {
    expect(PIANO_KEYS).toHaveLength(12);
    expect(PIANO_KEYS[0]?.midi).toBe(60);
    expect(PIANO_KEYS.at(-1)?.midi).toBe(71);
    expect(PIANO_KEYS.filter((key) => !key.isBlack)).toHaveLength(7);
    expect(PIANO_KEYS.filter((key) => key.isBlack)).toHaveLength(5);
  });
});
