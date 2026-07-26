import type { ChordExtension, ChordType } from "../music/chords";
import { maybeSpawnRipple } from "../ui/ripple";

const CHORD_TYPES: { id: ChordType; label: string; shortcut: string }[] = [
  { id: "dim", label: "Dim", shortcut: "1" },
  { id: "min", label: "Min", shortcut: "2" },
  { id: "maj", label: "Maj", shortcut: "3" },
  { id: "sus", label: "Sus", shortcut: "4" },
];

const CHORD_EXTENSIONS: { id: ChordExtension; label: string; shortcut: string }[] = [
  { id: "6", label: "6", shortcut: "Q" },
  { id: "m7", label: "m7", shortcut: "W" },
  { id: "M7", label: "M7", shortcut: "E" },
  { id: "9", label: "9", shortcut: "R" },
];

type ChordButtonsProps = {
  activeType: ChordType | null;
  activeExtensions: ReadonlySet<ChordExtension>;
  rippleEnabled?: boolean;
  onTypeChange: (type: ChordType | null) => void;
  onExtensionChange: (extension: ChordExtension, active: boolean) => void;
};

function HoldButton({
  label,
  shortcut,
  active,
  rippleEnabled,
  onPress,
  onRelease,
}: {
  label: string;
  shortcut: string;
  active: boolean;
  rippleEnabled: boolean;
  onPress: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      className={`chord-button ripple-host ${active ? "active" : ""}`}
      aria-pressed={active}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        maybeSpawnRipple(rippleEnabled, event.currentTarget, event);
        onPress();
      }}
      onPointerUp={(event) => {
        event.preventDefault();
        onRelease();
      }}
      onPointerCancel={onRelease}
      onLostPointerCapture={onRelease}
    >
      <span className="chord-button-label">{label}</span>
      <span className="chord-button-shortcut">{shortcut}</span>
    </button>
  );
}

export function ChordButtons({
  activeType,
  activeExtensions,
  rippleEnabled = false,
  onTypeChange,
  onExtensionChange,
}: ChordButtonsProps) {
  return (
    <div className="chord-buttons">
      <div className="chord-button-row">
        {CHORD_TYPES.map(({ id, label, shortcut }) => (
          <HoldButton
            key={id}
            label={label}
            shortcut={shortcut}
            active={activeType === id}
            rippleEnabled={rippleEnabled}
            onPress={() => onTypeChange(id)}
            onRelease={() => {
              if (activeType === id) {
                onTypeChange(null);
              }
            }}
          />
        ))}
      </div>
      <div className="chord-button-row">
        {CHORD_EXTENSIONS.map(({ id, label, shortcut }) => (
          <HoldButton
            key={id}
            label={label}
            shortcut={shortcut}
            active={activeExtensions.has(id)}
            rippleEnabled={rippleEnabled}
            onPress={() => onExtensionChange(id, true)}
            onRelease={() => onExtensionChange(id, false)}
          />
        ))}
      </div>
    </div>
  );
}

export { CHORD_EXTENSIONS, CHORD_TYPES };
