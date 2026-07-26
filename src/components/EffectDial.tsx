import type { CSSProperties } from "react";

type EffectDialProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function EffectDial({ label, value, onChange }: EffectDialProps) {
  const displayValue = Math.round(value * 100);
  const dialAngle = -135 + value * 270;

  return (
    <label className="effect-dial">
      <span className="effect-dial-label">{label}</span>
      <div
        className="effect-dial-control"
        style={
          {
            "--dial-value": displayValue,
            "--dial-angle": `${dialAngle}deg`,
          } as CSSProperties
        }
      >
        <span className="effect-dial-ring" aria-hidden="true" />
        <span className="effect-dial-arc" aria-hidden="true" />
        <span className="effect-dial-pointer" aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={100}
          value={displayValue}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          aria-valuetext={`${displayValue} percent`}
        />
        <span className="effect-dial-value">{displayValue}</span>
      </div>
    </label>
  );
}
