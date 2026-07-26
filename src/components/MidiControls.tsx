import { CollapsibleSection } from "./CollapsibleSection";

type MidiControlsProps = {
  supported: boolean;
  enabled: boolean;
  outputs: { id: string; name: string }[];
  selectedOutputId: string | null;
  onEnable: () => void;
  onDisable: () => void;
  onOutputChange: (outputId: string) => void;
};

export function MidiControls({
  supported,
  enabled,
  outputs,
  selectedOutputId,
  onEnable,
  onDisable,
  onOutputChange,
}: MidiControlsProps) {
  const status = !supported
    ? "Web MIDI not supported in this browser"
    : enabled
      ? "Sending chords on channel 1"
      : "Disabled";

  return (
    <CollapsibleSection
      className="midi-controls"
      title="MIDI Out"
      subtitle={status}
      headerActions={
        <button
          type="button"
          className={`key-mode-toggle ${enabled ? "active" : ""}`}
          disabled={!supported || outputs.length === 0}
          aria-pressed={enabled}
          onClick={() => (enabled ? onDisable() : onEnable())}
        >
          {enabled ? "On" : "Enable"}
        </button>
      }
    >
      {supported && outputs.length > 0 ? (
        <label className="key-mode-select">
          <span>Output</span>
          <select
            value={selectedOutputId ?? outputs[0]!.id}
            onChange={(event) => onOutputChange(event.target.value)}
          >
            {outputs.map((output) => (
              <option key={output.id} value={output.id}>
                {output.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </CollapsibleSection>
  );
}
