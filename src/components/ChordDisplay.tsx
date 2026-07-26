type ChordDisplayProps = {
  chordName: string;
  noteList: string;
  hint: string;
};

export function ChordDisplay({ chordName, noteList, hint }: ChordDisplayProps) {
  return (
    <div className="chord-display">
      <p className="chord-display-label">Now playing</p>
      <h1 className="chord-display-name">{chordName || "—"}</h1>
      <p className="chord-display-notes">{noteList || "\u00A0"}</p>
      <p className="chord-display-hint">{hint}</p>
    </div>
  );
}
