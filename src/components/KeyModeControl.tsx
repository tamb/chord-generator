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
    <section className="key-mode-control" aria-label="Key mode">
      <div className="key-mode-header">
        <div>
          <p className="sound-controls-heading">Key Mode</p>
          <p className="key-mode-status">
            {enabled ? `${selectedKey.label} locked` : "Off — manual chord buttons"}
          </p>
        </div>
        <button
          type="button"
          className={`key-mode-toggle ${enabled ? "active" : ""}`}
          aria-pressed={enabled}
          onClick={() => onEnabledChange(!enabled)}
        >
          {enabled ? "On" : "Off"}
        </button>
      </div>

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
    </section>
  );
}
