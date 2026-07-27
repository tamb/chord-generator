import { CollapsibleSection } from "./CollapsibleSection";
import { MAX_OCTAVE, MIN_OCTAVE } from "../music/voicing";

type VoicingDialProps = {
  value: number;
  octave: number;
  onChange: (value: number) => void;
  onOctaveChange: (octave: number) => void;
};

export function VoicingDial({ value, octave, onChange, onOctaveChange }: VoicingDialProps) {
  return (
    <CollapsibleSection
      className="voicing-dial"
      title="Voicing"
      subtitle={value === 0 ? "Root position" : `Inversion ${value > 0 ? `+${value}` : value}`}
      headerActions={
        <div className="voicing-octave" role="group" aria-label="Octave">
          <button
            type="button"
            className="voicing-octave-step"
            onClick={() => onOctaveChange(octave - 1)}
            disabled={octave <= MIN_OCTAVE}
            aria-label="Lower octave"
          >
            −
          </button>
          <span className="voicing-octave-readout" title="Octave shift">
            <span className="voicing-octave-label">oct</span>
            <span className="voicing-octave-value">{octave > 0 ? `+${octave}` : octave}</span>
          </span>
          <button
            type="button"
            className="voicing-octave-step"
            onClick={() => onOctaveChange(octave + 1)}
            disabled={octave >= MAX_OCTAVE}
            aria-label="Raise octave"
          >
            +
          </button>
        </div>
      }
    >
      <div className="voicing-dial-body">
        <button
          type="button"
          className="voicing-step"
          onClick={() => onChange(value - 1)}
          aria-label="Lower voicing"
        >
          −
        </button>
        <div className="voicing-readout">
          <span className="voicing-value">{value > 0 ? `+${value}` : value}</span>
          <span className="voicing-caption">{value === 0 ? "Root position" : "Inversion"}</span>
        </div>
        <button
          type="button"
          className="voicing-step"
          onClick={() => onChange(value + 1)}
          aria-label="Raise voicing"
        >
          +
        </button>
      </div>
    </CollapsibleSection>
  );
}
