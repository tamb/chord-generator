import * as Tone from "tone";
import { DEFAULT_VOICE_ID, getVoicePreset, type VoiceId } from "./voices";

type EffectLevels = {
  reverb: number;
  tremolo: number;
  phaser: number;
};

let started = false;
let synth: Tone.PolySynth<Tone.Synth> | null = null;
let tremolo: Tone.Tremolo | null = null;
let phaser: Tone.Phaser | null = null;
let reverb: Tone.Reverb | null = null;

function createSynth(voiceId: VoiceId): Tone.PolySynth<Tone.Synth> {
  return new Tone.PolySynth(Tone.Synth, getVoicePreset(voiceId).options as Tone.SynthOptions);
}

export async function ensureAudioStarted(): Promise<void> {
  if (started) {
    return;
  }

  await Tone.start();

  tremolo = new Tone.Tremolo({
    frequency: 5,
    depth: 0,
    spread: 180,
    type: "sine",
  }).start();

  phaser = new Tone.Phaser({
    frequency: 0.6,
    octaves: 2.2,
    baseFrequency: 520,
    wet: 0,
  });

  reverb = new Tone.Reverb({
    decay: 2.8,
    preDelay: 0.02,
    wet: 0,
  });
  await reverb.generate();

  synth = createSynth(DEFAULT_VOICE_ID);
  synth.chain(tremolo, phaser, reverb, Tone.getDestination());

  started = true;
}

export function playMidiNotes(midiNotes: number[]): void {
  if (!synth) {
    return;
  }

  const frequencies = midiNotes.map((midi) => Tone.Frequency(midi, "midi").toFrequency());
  synth.triggerAttack(frequencies);
}

export function stopAllNotes(): void {
  synth?.releaseAll();
}

export function setMasterVolume(normalized: number): void {
  const clamped = Math.min(1, Math.max(0, normalized));
  Tone.getDestination().volume.value = Tone.gainToDb(clamped);
}

export function setVoice(voiceId: VoiceId): void {
  if (!synth) {
    return;
  }

  synth.releaseAll();
  synth.set(getVoicePreset(voiceId).options as Tone.SynthOptions);
}

export function setEffectLevels({
  reverb: reverbAmount,
  tremolo: tremoloAmount,
  phaser: phaserAmount,
}: EffectLevels): void {
  tremolo?.depth.rampTo(tremoloAmount, 0.05);

  if (phaser) {
    phaser.wet.rampTo(phaserAmount, 0.05);
  }

  if (reverb) {
    reverb.wet.rampTo(reverbAmount, 0.05);
  }
}
