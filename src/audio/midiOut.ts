import { encodeNoteOff, encodeNoteOn, uniqueSortedNotes } from "./midiMessages";

type MidiOutputInfo = {
  id: string;
  name: string;
};

let access: MIDIAccess | null = null;
let selectedOutputId: string | null = null;
let enabled = false;
let activeNotes: number[] = [];

export function isWebMidiSupported(): boolean {
  return typeof navigator !== "undefined" && "requestMIDIAccess" in navigator;
}

export async function requestMidiAccess(): Promise<boolean> {
  if (!isWebMidiSupported()) {
    return false;
  }

  access = await navigator.requestMIDIAccess({ sysex: false });
  const outputs = listMidiOutputs();
  if (outputs.length > 0 && selectedOutputId === null) {
    selectedOutputId = outputs[0]!.id;
  }

  return true;
}

export function listMidiOutputs(): MidiOutputInfo[] {
  if (!access) {
    return [];
  }

  return [...access.outputs.values()].map((output) => ({
    id: output.id,
    name: output.name || "Unknown MIDI Output",
  }));
}

export function setSelectedMidiOutput(outputId: string | null): void {
  selectedOutputId = outputId;
}

export function setMidiOutputEnabled(nextEnabled: boolean): void {
  enabled = nextEnabled;
  if (!enabled) {
    stopMidiNotes();
  }
}

export function isMidiOutputEnabled(): boolean {
  return enabled;
}

function getSelectedOutput(): MIDIOutput | null {
  if (!access || !selectedOutputId) {
    return null;
  }

  return access.outputs.get(selectedOutputId) ?? null;
}

export function sendMidiNotes(notes: readonly number[]): void {
  if (!enabled) {
    return;
  }

  const output = getSelectedOutput();
  if (!output) {
    return;
  }

  stopMidiNotes(output);

  const sortedNotes = uniqueSortedNotes(notes);
  for (const note of sortedNotes) {
    output.send(encodeNoteOn(note));
  }

  activeNotes = sortedNotes;
}

export function stopMidiNotes(output: MIDIOutput | null = getSelectedOutput()): void {
  if (!output) {
    activeNotes = [];
    return;
  }

  for (const note of activeNotes) {
    output.send(encodeNoteOff(note));
  }

  activeNotes = [];
}

export function resetMidiState(): void {
  stopMidiNotes();
  enabled = false;
  selectedOutputId = null;
  access = null;
}
