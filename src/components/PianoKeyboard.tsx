import { useEffect, useRef } from "react";
import { PIANO_KEYS } from "../music/chords";
import { PIANO_SHORTCUT_LABELS } from "../music/keyboardShortcuts";
import { maybeSpawnRipple, maybeSpawnRippleAtCenter } from "../ui/ripple";

type PianoKeyboardProps = {
  activeMidi: number | null;
  rippleEnabled?: boolean;
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

export function PianoKeyboard({
  activeMidi,
  rippleEnabled = false,
  onKeyPress,
  onKeyRelease,
}: PianoKeyboardProps) {
  const whiteKeys = PIANO_KEYS.filter((key) => !key.isBlack);
  const blackKeys = PIANO_KEYS.filter((key) => key.isBlack);
  const keyRefs = useRef(new Map<number, HTMLButtonElement>());
  const pointerActivatedRef = useRef(false);

  useEffect(() => {
    if (activeMidi === null || !rippleEnabled) {
      return;
    }

    if (pointerActivatedRef.current) {
      pointerActivatedRef.current = false;
      return;
    }

    const keyElement = keyRefs.current.get(activeMidi);
    if (keyElement) {
      maybeSpawnRippleAtCenter(true, keyElement);
    }
  }, [activeMidi, rippleEnabled]);

  const bindKeyRef = (midi: number, element: HTMLButtonElement | null) => {
    if (element) {
      keyRefs.current.set(midi, element);
    } else {
      keyRefs.current.delete(midi);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, midi: number) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerActivatedRef.current = true;
    maybeSpawnRipple(rippleEnabled, event.currentTarget, event);
    onKeyPress(midi);
  };

  return (
    <div className="piano-keyboard">
      <div className="piano-key-area">
        <div className="piano-whites">
          {whiteKeys.map((key) => (
            <button
              key={key.midi}
              ref={(element) => bindKeyRef(key.midi, element)}
              type="button"
              className={`piano-key white ripple-host ${activeMidi === key.midi ? "active" : ""}`}
              aria-label={key.label}
              onPointerDown={(event) => handlePointerDown(event, key.midi)}
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
              ref={(element) => bindKeyRef(key.midi, element)}
              type="button"
              className={`piano-key black ripple-host ${activeMidi === key.midi ? "active" : ""}`}
              aria-label={key.label}
              style={{
                left: `calc(var(--white-key-width) * ${BLACK_KEY_BOUNDARY[key.midi] ?? 0} + var(--white-key-gap) * ${(BLACK_KEY_BOUNDARY[key.midi] ?? 0) - 0.5} - var(--black-key-width) / 2)`,
              }}
              onPointerDown={(event) => handlePointerDown(event, key.midi)}
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
