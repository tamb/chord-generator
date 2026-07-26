import { CollapsibleSection } from "./CollapsibleSection";

type VoicingDialProps = {
  value: number;
  onChange: (value: number) => void;
};

export function VoicingDial({ value, onChange }: VoicingDialProps) {
  return (
    <CollapsibleSection
      className="voicing-dial"
      title="Voicing"
      subtitle={value === 0 ? "Root position" : `Inversion ${value > 0 ? `+${value}` : value}`}
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
