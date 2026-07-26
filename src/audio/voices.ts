export type VoiceSynthOptions = {
  oscillator: {
    type: "triangle" | "sawtooth" | "square" | "sine";
  };
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
};

export type VoiceId = "warm-pad" | "bright-saw" | "organ" | "pluck" | "hollow";

export type VoicePreset = {
  id: VoiceId;
  label: string;
  description: string;
  options: VoiceSynthOptions;
};

export const VOICES: VoicePreset[] = [
  {
    id: "warm-pad",
    label: "Warm Pad",
    description: "Soft triangle swell",
    options: {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.08,
        decay: 0.3,
        sustain: 0.72,
        release: 0.55,
      },
    },
  },
  {
    id: "bright-saw",
    label: "Bright Saw",
    description: "Cutting lead stack",
    options: {
      oscillator: { type: "sawtooth" },
      envelope: {
        attack: 0.02,
        decay: 0.22,
        sustain: 0.58,
        release: 0.35,
      },
    },
  },
  {
    id: "organ",
    label: "Organ",
    description: "Square tone, steady body",
    options: {
      oscillator: { type: "square" },
      envelope: {
        attack: 0.01,
        decay: 0.12,
        sustain: 0.88,
        release: 0.2,
      },
    },
  },
  {
    id: "pluck",
    label: "Pluck",
    description: "Short percussive hit",
    options: {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.005,
        decay: 0.18,
        sustain: 0.08,
        release: 0.22,
      },
    },
  },
  {
    id: "hollow",
    label: "Hollow",
    description: "Airy sine with bloom",
    options: {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.12,
        decay: 0.35,
        sustain: 0.45,
        release: 0.65,
      },
    },
  },
];

export const DEFAULT_VOICE_ID: VoiceId = "warm-pad";

export function getVoicePreset(id: VoiceId): VoicePreset {
  return VOICES.find((voice) => voice.id === id) ?? VOICES[0]!;
}
