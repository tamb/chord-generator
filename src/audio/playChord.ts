import { playMidiNotes, stopAllNotes } from "./synth";
import { sendMidiNotes, stopMidiNotes } from "./midiOut";

export function playChord(notes: readonly number[]): void {
  playMidiNotes([...notes]);
  sendMidiNotes(notes);
}

export function stopChord(): void {
  stopAllNotes();
  stopMidiNotes();
}
