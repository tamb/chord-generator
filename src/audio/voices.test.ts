import { describe, expect, it } from "vite-plus/test";
import { DEFAULT_PLAYBACK_SETTINGS } from "../music/resolveChord";
import { DEFAULT_VOICE_ID, getVoicePreset, VOICES } from "./voices";

describe("voices", () => {
  it("defines distinct synth presets", () => {
    expect(VOICES.length).toBeGreaterThanOrEqual(4);
    expect(new Set(VOICES.map((voice) => voice.id)).size).toBe(VOICES.length);
  });

  it("returns the default warm pad voice", () => {
    expect(DEFAULT_VOICE_ID).toBe("warm-pad");
    expect(getVoicePreset(DEFAULT_VOICE_ID).label).toBe("Warm Pad");
  });

  it("falls back to the first voice for unknown ids", () => {
    expect(getVoicePreset("unknown" as typeof DEFAULT_VOICE_ID).id).toBe(VOICES[0]!.id);
  });

  it("uses different oscillator types across presets", () => {
    const oscillatorTypes = VOICES.map((voice) => voice.options.oscillator?.type);
    expect(new Set(oscillatorTypes).size).toBeGreaterThan(1);
  });

  it("includes envelope settings on every preset", () => {
    for (const voice of VOICES) {
      expect(voice.options.envelope?.attack).toBeGreaterThanOrEqual(0);
      expect(voice.options.envelope?.release).toBeGreaterThan(0);
      expect(voice.label.length).toBeGreaterThan(0);
      expect(voice.description.length).toBeGreaterThan(0);
    }
  });

  it("aligns default playback settings with the default voice", () => {
    expect(DEFAULT_PLAYBACK_SETTINGS.voiceId).toBe(DEFAULT_VOICE_ID);
  });
});
