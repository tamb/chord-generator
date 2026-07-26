import type { ChordHistoryEntry } from "../music/resolveChord";

type ChordHistoryProps = {
  entries: readonly ChordHistoryEntry[];
  favorites: readonly ChordHistoryEntry[];
  selectedIds: ReadonlySet<string>;
  onReplayStart: (entry: ChordHistoryEntry) => void;
  onReplayStop: () => void;
  onToggleFavorite: (entryId: string) => void;
  onToggleSelect: (entryId: string) => void;
  onSelectAll: (entryIds: readonly string[]) => void;
  onClearSelection: () => void;
  onDeleteEntry: (entryId: string) => void;
  onDeleteSelected: () => void;
};

type HistoryListProps = {
  entries: readonly ChordHistoryEntry[];
  selectedIds: ReadonlySet<string>;
  selectable: boolean;
  onReplayStart: (entry: ChordHistoryEntry) => void;
  onReplayStop: () => void;
  onToggleFavorite: (entryId: string) => void;
  onToggleSelect: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
};

function HistoryList({
  entries,
  selectedIds,
  selectable,
  onReplayStart,
  onReplayStop,
  onToggleFavorite,
  onToggleSelect,
  onDeleteEntry,
}: HistoryListProps) {
  return (
    <div className="chord-history-list">
      {entries.map((entry) => {
        const selected = selectedIds.has(entry.id);

        return (
          <div
            key={entry.id}
            className={`chord-history-item ${selected ? "selected" : ""} ${selectable ? "" : "compact"}`}
          >
            {selectable ? (
              <label className="chord-history-select">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleSelect(entry.id)}
                  aria-label={`Select ${entry.name}`}
                />
              </label>
            ) : null}
            <button
              type="button"
              className={`chord-history-favorite ${entry.favorite ? "active" : ""}`}
              aria-label={entry.favorite ? "Remove favorite" : "Add favorite"}
              aria-pressed={entry.favorite}
              onClick={() => onToggleFavorite(entry.id)}
            >
              {entry.favorite ? "★" : "☆"}
            </button>
            <button
              type="button"
              className="chord-history-chip"
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                onReplayStart(entry);
              }}
              onPointerUp={onReplayStop}
              onPointerCancel={onReplayStop}
              onLostPointerCapture={onReplayStop}
            >
              <span className="chord-history-name">{entry.name}</span>
              <span className="chord-history-meta">{formatEntryMeta(entry)}</span>
            </button>
            <button
              type="button"
              className="chord-history-delete"
              aria-label={`Delete ${entry.name}`}
              onClick={() => onDeleteEntry(entry.id)}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

function formatEntryMeta(entry: ChordHistoryEntry): string {
  const parts = [
    entry.usedKeyMode ? entry.keyLabel : "Manual",
    entry.settings.voiceId.replace("-", " "),
  ];

  if (entry.voicing !== 0) {
    parts.push(`voicing ${entry.voicing > 0 ? `+${entry.voicing}` : entry.voicing}`);
  }

  return parts.join(" · ");
}

export function ChordHistory({
  entries,
  favorites,
  selectedIds,
  onReplayStart,
  onReplayStop,
  onToggleFavorite,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onDeleteEntry,
  onDeleteSelected,
}: ChordHistoryProps) {
  const allEntryIds = entries.map((entry) => entry.id);
  const allSelected = entries.length > 0 && entries.every((entry) => selectedIds.has(entry.id));

  return (
    <section className="chord-history" aria-label="Chord history">
      <section className="chord-history-section" aria-label="Favorite chords">
        <p className="sound-controls-heading">Favorites</p>
        {favorites.length === 0 ? (
          <p className="chord-history-empty">Star a chord to save it here.</p>
        ) : (
          <HistoryList
            entries={favorites}
            selectedIds={selectedIds}
            selectable={false}
            onReplayStart={onReplayStart}
            onReplayStop={onReplayStop}
            onToggleFavorite={onToggleFavorite}
            onToggleSelect={onToggleSelect}
            onDeleteEntry={onDeleteEntry}
          />
        )}
      </section>

      <section className="chord-history-section chord-history-scroll" aria-label="Played chords">
        <div className="chord-history-toolbar">
          <p className="sound-controls-heading">History ({entries.length})</p>
          {entries.length > 0 ? (
            <div className="chord-history-actions">
              <button
                type="button"
                className="chord-history-action"
                onClick={() => (allSelected ? onClearSelection() : onSelectAll(allEntryIds))}
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
              {selectedIds.size > 0 ? (
                <>
                  <button type="button" className="chord-history-action" onClick={onClearSelection}>
                    Clear
                  </button>
                  <button
                    type="button"
                    className="chord-history-action danger"
                    onClick={onDeleteSelected}
                  >
                    Delete ({selectedIds.size})
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        {entries.length === 0 ? (
          <p className="chord-history-empty">Play a few chords to build your progression.</p>
        ) : (
          <HistoryList
            entries={entries}
            selectedIds={selectedIds}
            selectable
            onReplayStart={onReplayStart}
            onReplayStop={onReplayStop}
            onToggleFavorite={onToggleFavorite}
            onToggleSelect={onToggleSelect}
            onDeleteEntry={onDeleteEntry}
          />
        )}
      </section>
    </section>
  );
}
