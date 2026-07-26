import { PIANO_KEYS } from "../music/chords";
import { PIANO_SHORTCUT_LABELS } from "../music/keyboardShortcuts";

type PianoKeyboardProps = {
  activeMidi: number | null;
  onKeyPress: (midi: number) => void;
  onKeyRelease: () => void;
};

const BLACK_KEY_BOUNDARY: Record<number, number> = {
  61: 1,
  63: 2,
  66: 4,
  68: 5,
  70: 6,
};

export function PianoKeyboard({ activeMidi, onKeyPress, onKeyRelease }: PianoKeyboardProps) {
  const whiteKeys = PIANO_KEYS.filter((key) => !key.isBlack);
  const blackKeys = PIANO_KEYS.filter((key) => key.isBlack);

  return (
    <div className="piano-keyboard">
      <div className="piano-key-area">
        <div className="piano-whites">
          {whiteKeys.map((key) => (
            <button
              key={key.midi}
              type="button"
              className={`piano-key white ${activeMidi === key.midi ? "active" : ""}`}
              aria-label={key.label}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                onKeyPress(key.midi);
              }}
              onPointerUp={(event) => {
                event.preventDefault();
                onKeyRelease();
              }}
              onPointerCancel={onKeyRelease}
              onLostPointerCapture={onKeyRelease}
            >
              <span className="piano-key-label">{key.label}</span>
              {PIANO_SHORTCUT_LABELS[key.midi] ? (
                <span className="piano-key-shortcut">{PIANO_SHORTCUT_LABELS[key.midi]}</span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="piano-blacks">
          {blackKeys.map((key) => (
            <button
              key={key.midi}
              type="button"
              className={`piano-key black ${activeMidi === key.midi ? "active" : ""}`}
              aria-label={key.label}
              style={{
                left: `calc(var(--white-key-width) * ${BLACK_KEY_BOUNDARY[key.midi] ?? 0} + var(--white-key-gap) * ${(BLACK_KEY_BOUNDARY[key.midi] ?? 0) - 0.5} - var(--black-key-width) / 2)`,
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                onKeyPress(key.midi);
              }}
              onPointerUp={(event) => {
                event.preventDefault();
                onKeyRelease();
              }}
              onPointerCancel={onKeyRelease}
              onLostPointerCapture={onKeyRelease}
            >
              <span className="piano-key-label">{key.label.replace("#", "♯")}</span>
              {PIANO_SHORTCUT_LABELS[key.midi] ? (
                <span className="piano-key-shortcut">{PIANO_SHORTCUT_LABELS[key.midi]}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
