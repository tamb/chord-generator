import { EffectDial } from "./EffectDial";
import { VOICES, type VoiceId } from "../audio/voices";

type SoundControlsProps = {
  voiceId: VoiceId;
  reverb: number;
  tremolo: number;
  phaser: number;
  onVoiceChange: (voiceId: VoiceId) => void;
  onReverbChange: (value: number) => void;
  onTremoloChange: (value: number) => void;
  onPhaserChange: (value: number) => void;
};

export function SoundControls({
  voiceId,
  reverb,
  tremolo,
  phaser,
  onVoiceChange,
  onReverbChange,
  onTremoloChange,
  onPhaserChange,
}: SoundControlsProps) {
  return (
    <section className="sound-controls" aria-label="Sound controls">
      <div className="voice-selector">
        <p className="sound-controls-heading">Voice</p>
        <div className="voice-options">
          {VOICES.map((voice) => (
            <button
              key={voice.id}
              type="button"
              className={`voice-option ${voiceId === voice.id ? "active" : ""}`}
              aria-pressed={voiceId === voice.id}
              onClick={() => onVoiceChange(voice.id)}
            >
              <span className="voice-option-label">{voice.label}</span>
              <span className="voice-option-description">{voice.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="effect-dials">
        <p className="sound-controls-heading">Effects</p>
        <div className="effect-dials-row">
          <EffectDial label="Reverb" value={reverb} onChange={onReverbChange} />
          <EffectDial label="Tremolo" value={tremolo} onChange={onTremoloChange} />
          <EffectDial label="Phaser" value={phaser} onChange={onPhaserChange} />
        </div>
      </div>
    </section>
  );
}
