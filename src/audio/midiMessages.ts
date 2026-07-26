export const MIDI_CHANNEL = 0;
export const MIDI_NOTE_ON = 0x90;
export const MIDI_NOTE_OFF = 0x80;
export const DEFAULT_VELOCITY = 96;

export function encodeNoteOn(note: number, velocity = DEFAULT_VELOCITY): Uint8Array {
  return new Uint8Array([MIDI_NOTE_ON | MIDI_CHANNEL, note, velocity]);
}

export function encodeNoteOff(note: number): Uint8Array {
  return new Uint8Array([MIDI_NOTE_OFF | MIDI_CHANNEL, note, 0]);
}

export function uniqueSortedNotes(notes: readonly number[]): number[] {
  return [...new Set(notes)].sort((left, right) => left - right);
}
