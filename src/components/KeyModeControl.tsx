import { CollapsibleSection } from "./CollapsibleSection";
import { KEY_SIGNATURES, type KeySignature } from "../music/keyMode";

type KeyModeControlProps = {
  enabled: boolean;
  selectedKey: KeySignature;
  onEnabledChange: (enabled: boolean) => void;
  onKeyChange: (key: KeySignature) => void;
};

export function KeyModeControl({
  enabled,
  selectedKey,
  onEnabledChange,
  onKeyChange,
}: KeyModeControlProps) {
  return (
    <CollapsibleSection
      className="key-mode-control"
      title="Key Mode"
      subtitle={enabled ? `${selectedKey.label} locked` : "Off — manual chord buttons"}
      headerActions={
        <button
          type="button"
          className={`key-mode-toggle ${enabled ? "active" : ""}`}
          aria-pressed={enabled}
          onClick={() => onEnabledChange(!enabled)}
        >
          {enabled ? "On" : "Off"}
        </button>
      }
    >
      <label className="key-mode-select">
        <span>Key</span>
        <select
          value={`${selectedKey.root}:${selectedKey.mode}`}
          onChange={(event) => {
            const [root, mode] = event.target.value.split(":");
            const nextKey = KEY_SIGNATURES.find(
              (candidate) => candidate.root === Number(root) && candidate.mode === mode,
            );
            if (nextKey) {
              onKeyChange(nextKey);
            }
          }}
        >
          {KEY_SIGNATURES.map((signature) => (
            <option
              key={`${signature.root}:${signature.mode}`}
              value={`${signature.root}:${signature.mode}`}
            >
              {signature.label}
            </option>
          ))}
        </select>
      </label>
    </CollapsibleSection>
  );
}
