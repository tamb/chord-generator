import { describe, expect, it } from "vite-plus/test";
import {
  encodeNoteOff,
  encodeNoteOn,
  MIDI_CHANNEL,
  MIDI_NOTE_OFF,
  MIDI_NOTE_ON,
  uniqueSortedNotes,
} from "./midiMessages";

describe("midiMessages", () => {
  it("encodes note on and note off messages on channel 1", () => {
    expect(MIDI_CHANNEL).toBe(0);
    expect(MIDI_NOTE_ON).toBe(0x90);
    expect(MIDI_NOTE_OFF).toBe(0x80);
    expect([...encodeNoteOn(60, 100)]).toEqual([0x90, 60, 100]);
    expect([...encodeNoteOff(60)]).toEqual([0x80, 60, 0]);
  });

  it("uses default velocity for note on messages", () => {
    expect([...encodeNoteOn(64)]).toEqual([0x90, 64, 96]);
  });

  it("deduplicates and sorts outgoing notes", () => {
    expect(uniqueSortedNotes([67, 60, 64, 60])).toEqual([60, 64, 67]);
    expect(uniqueSortedNotes([])).toEqual([]);
    expect(uniqueSortedNotes([72])).toEqual([72]);
  });
});
