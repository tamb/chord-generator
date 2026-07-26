export const PIANO_SHORTCUTS: Record<string, number> = {
  f: 60,
  t: 61,
  g: 62,
  y: 63,
  h: 64,
  j: 65,
  o: 66,
  k: 67,
  p: 68,
  l: 69,
  i: 70,
  ";": 71,
};

export const PIANO_SHORTCUT_LABELS: Record<number, string> = Object.fromEntries(
  Object.entries(PIANO_SHORTCUTS).map(([shortcut, midi]) => [
    midi,
    shortcut.length === 1 ? shortcut.toUpperCase() : shortcut,
  ]),
);
