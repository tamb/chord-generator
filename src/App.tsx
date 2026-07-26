import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playChord, stopChord } from "./audio/playChord";
import { ensureAudioStarted, setEffectLevels, setMasterVolume, setVoice } from "./audio/synth";
import {
  isWebMidiSupported,
  listMidiOutputs,
  requestMidiAccess,
  setMidiOutputEnabled,
  setSelectedMidiOutput,
} from "./audio/midiOut";
import { CHORD_EXTENSIONS, CHORD_TYPES, ChordButtons } from "./components/ChordButtons";
import { ChordDisplay } from "./components/ChordDisplay";
import { ChordHistory } from "./components/ChordHistory";
import { KeyModeControl } from "./components/KeyModeControl";
import { MidiControls } from "./components/MidiControls";
import { OffcanvasMenu } from "./components/OffcanvasMenu";
import { PianoKeyboard } from "./components/PianoKeyboard";
import { SoundControls } from "./components/SoundControls";
import { VoicingDial } from "./components/VoicingDial";
import { DEFAULT_VOICE_ID, type VoiceId } from "./audio/voices";
import { PIANO_SHORTCUTS } from "./music/keyboardShortcuts";
import { DEFAULT_KEY, type KeySignature } from "./music/keyMode";
import {
  appendHistory,
  createHistoryEntry,
  getFavoriteEntries,
  historyEntryToRequest,
  removeHistoryEntries,
  resolveChord,
  sortHistoryEntries,
  toggleEntryFavorite,
  type ChordHistoryEntry,
  type ChordPlaybackSettings,
  type ChordRequest,
} from "./music/resolveChord";
import { formatNoteList, type ChordExtension, type ChordType } from "./music/chords";
import { clampVoicing, stepVoicing } from "./music/voicing";
import { loadChordHistory, saveChordHistory } from "./storage/chordHistoryStore";
import { shouldApplyLoadedHistory } from "./storage/historyHydration";
import { applyThemeMode, loadThemeMode, saveThemeMode, type ThemeMode } from "./storage/themeStore";
import { loadRippleEnabled, saveRippleEnabled } from "./storage/rippleStore";
import "./App.css";

type ResolvedDisplay = {
  chordName: string;
  noteList: string;
};

const TYPE_SHORTCUTS = Object.fromEntries(
  CHORD_TYPES.map(({ id, shortcut }) => [shortcut.toLowerCase(), id]),
) as Record<string, ChordType>;

const EXTENSION_SHORTCUTS = Object.fromEntries(
  CHORD_EXTENSIONS.map(({ id, shortcut }) => [shortcut.toLowerCase(), id]),
) as Record<string, ChordExtension>;

function buildRequest(
  rootMidi: number,
  manualType: ChordType | null,
  extensions: readonly ChordExtension[],
  keyModeEnabled: boolean,
  key: KeySignature,
  voicing: number,
): ChordRequest {
  return {
    rootMidi,
    manualType,
    extensions,
    keyModeEnabled,
    key,
    voicing,
  };
}

function requestHistorySignature(request: ChordRequest): string {
  return JSON.stringify({
    rootMidi: request.rootMidi,
    manualType: request.manualType,
    extensions: request.extensions,
    voicing: request.voicing,
    keyModeEnabled: request.keyModeEnabled,
    keyRoot: request.key.root,
    keyMode: request.key.mode,
  });
}

function App() {
  const [activeType, setActiveType] = useState<ChordType | null>(null);
  const [activeExtensions, setActiveExtensions] = useState<Set<ChordExtension>>(() => new Set());
  const [activeMidi, setActiveMidi] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.75);
  const [voiceId, setVoiceId] = useState<VoiceId>(DEFAULT_VOICE_ID);
  const [reverb, setReverb] = useState(0.18);
  const [tremolo, setTremolo] = useState(0);
  const [phaser, setPhaser] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [keyModeEnabled, setKeyModeEnabled] = useState(true);
  const [key, setKey] = useState<KeySignature>(DEFAULT_KEY);
  const [voicing, setVoicing] = useState(0);
  const [history, setHistory] = useState<ChordHistoryEntry[]>([]);
  const [historyHydrated, setHistoryHydrated] = useState(false);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(() => new Set());
  const [replayDisplay, setReplayDisplay] = useState<ResolvedDisplay | null>(null);
  const [midiSupported] = useState(isWebMidiSupported);
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiOutputs, setMidiOutputs] = useState<{ id: string; name: string }[]>([]);
  const [selectedMidiOutputId, setSelectedMidiOutputId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemeMode());
  const [rippleEnabled, setRippleEnabled] = useState(() => loadRippleEnabled());
  const historyCounter = useRef(0);
  const historyHydratedRef = useRef(false);
  const historySaveChain = useRef(Promise.resolve());
  const latestHistorySave = useRef({ entries: [] as ChordHistoryEntry[], counter: 0 });
  const lastRecordedMidi = useRef<number | null>(null);
  const historySessionEntryId = useRef<string | null>(null);
  const lastRecordedRequestSignature = useRef<string | null>(null);

  const sortedHistory = useMemo(() => sortHistoryEntries(history), [history]);
  const favoriteEntries = useMemo(() => getFavoriteEntries(history), [history]);

  const currentPlaybackSettings = useMemo(
    (): ChordPlaybackSettings => ({
      voiceId,
      reverb,
      tremolo,
      phaser,
      volume,
    }),
    [phaser, reverb, tremolo, voiceId, volume],
  );

  const activeExtensionList = useMemo(
    () => [...activeExtensions].sort((left, right) => left.localeCompare(right)),
    [activeExtensions],
  );

  const liveRequest = useMemo(() => {
    if (activeMidi === null) {
      return null;
    }

    return buildRequest(activeMidi, activeType, activeExtensionList, keyModeEnabled, key, voicing);
  }, [activeExtensionList, activeMidi, activeType, key, keyModeEnabled, voicing]);

  const liveResolved = useMemo(() => {
    if (!liveRequest) {
      return null;
    }

    return resolveChord(liveRequest);
  }, [liveRequest]);

  const display =
    replayDisplay ??
    (liveResolved
      ? {
          chordName: liveResolved.name,
          noteList: formatNoteList(liveResolved.notes),
        }
      : {
          chordName: "",
          noteList: "",
        });

  const startAudio = useCallback(async () => {
    await ensureAudioStarted();
    setAudioReady(true);
  }, []);

  const playResolved = useCallback((request: ChordRequest) => {
    const resolved = resolveChord(request);
    playChord(resolved.notes);
    return resolved;
  }, []);

  const applyPlaybackSettings = useCallback(
    (settings: ChordPlaybackSettings) => {
      setVoiceId(settings.voiceId);
      setReverb(settings.reverb);
      setTremolo(settings.tremolo);
      setPhaser(settings.phaser);
      setVolume(settings.volume);
      setMasterVolume(settings.volume);

      if (audioReady) {
        setVoice(settings.voiceId);
        setEffectLevels({
          reverb: settings.reverb,
          tremolo: settings.tremolo,
          phaser: settings.phaser,
        });
      }
    },
    [audioReady],
  );

  const recordHistory = useCallback(
    (
      request: ChordRequest,
      resolved: ReturnType<typeof resolveChord>,
      options?: { replaceSessionEntry?: boolean },
    ) => {
      historyCounter.current += 1;
      const id = `history-${historyCounter.current}`;
      const replaceId = options?.replaceSessionEntry ? historySessionEntryId.current : null;

      setHistory((previous) => {
        const withoutSession = replaceId
          ? previous.filter((entry) => entry.id !== replaceId)
          : previous;

        return appendHistory(
          withoutSession,
          createHistoryEntry(request, resolved, currentPlaybackSettings, id),
        );
      });

      historySessionEntryId.current = id;
    },
    [currentPlaybackSettings],
  );

  const handleKeyPress = useCallback(
    async (midi: number) => {
      await startAudio();
      setActiveMidi(midi);
    },
    [startAudio],
  );

  const handleKeyRelease = useCallback(() => {
    setActiveMidi(null);
    lastRecordedMidi.current = null;
    historySessionEntryId.current = null;
    lastRecordedRequestSignature.current = null;
    stopChord();
  }, []);

  const handleTypeChange = useCallback((type: ChordType | null) => {
    setActiveType(type);
  }, []);

  const handleExtensionChange = useCallback((extension: ChordExtension, active: boolean) => {
    setActiveExtensions((previous) => {
      const next = new Set(previous);
      if (active) {
        next.add(extension);
      } else {
        next.delete(extension);
      }
      return next;
    });
  }, []);

  const handleVoicingChange = useCallback((next: number) => {
    setVoicing(next);
  }, []);

  const handleHistoryReplayStart = useCallback(
    async (entry: ChordHistoryEntry) => {
      await startAudio();
      applyPlaybackSettings(entry.settings);
      const resolved = playResolved(historyEntryToRequest(entry));
      setReplayDisplay({
        chordName: resolved.name,
        noteList: formatNoteList(resolved.notes),
      });
    },
    [applyPlaybackSettings, playResolved, startAudio],
  );

  const handleToggleFavorite = useCallback((entryId: string) => {
    setHistory((previous) => toggleEntryFavorite(previous, entryId));
  }, []);

  const handleToggleHistorySelect = useCallback((entryId: string) => {
    setSelectedHistoryIds((previous) => {
      const next = new Set(previous);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  }, []);

  const handleSelectAllHistory = useCallback((entryIds: readonly string[]) => {
    setSelectedHistoryIds(new Set(entryIds));
  }, []);

  const handleClearHistorySelection = useCallback(() => {
    setSelectedHistoryIds(new Set());
  }, []);

  const handleDeleteHistoryEntries = useCallback((entryIds: readonly string[]) => {
    if (entryIds.length === 0) {
      return;
    }

    setHistory((previous) => removeHistoryEntries(previous, entryIds));
    setSelectedHistoryIds((previous) => {
      const next = new Set(previous);
      for (const entryId of entryIds) {
        next.delete(entryId);
      }
      return next;
    });
  }, []);

  const handleDeleteHistoryEntry = useCallback(
    (entryId: string) => {
      handleDeleteHistoryEntries([entryId]);
    },
    [handleDeleteHistoryEntries],
  );

  const handleDeleteSelectedHistory = useCallback(() => {
    handleDeleteHistoryEntries([...selectedHistoryIds]);
  }, [handleDeleteHistoryEntries, selectedHistoryIds]);

  const handleHistoryReplayStop = useCallback(() => {
    stopChord();
    setReplayDisplay(null);
  }, []);

  const handleEnableMidi = useCallback(async () => {
    const granted = await requestMidiAccess();
    if (!granted) {
      return;
    }

    const outputs = listMidiOutputs();
    setMidiOutputs(outputs);
    if (outputs[0]) {
      setSelectedMidiOutputId(outputs[0].id);
      setSelectedMidiOutput(outputs[0].id);
    }
    setMidiEnabled(true);
    setMidiOutputEnabled(true);
  }, []);

  const handleDisableMidi = useCallback(() => {
    setMidiEnabled(false);
    setMidiOutputEnabled(false);
  }, []);

  useEffect(() => {
    applyThemeMode(themeMode);
    saveThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    saveRippleEnabled(rippleEnabled);
  }, [rippleEnabled]);

  useEffect(() => {
    let cancelled = false;

    void loadChordHistory().then(({ entries, counter }) => {
      // Apply stored history only once. A second load (e.g. React Strict Mode
      // re-running mount effects) must not clobber chords recorded after hydrate.
      if (!shouldApplyLoadedHistory(historyHydratedRef.current, cancelled)) {
        return;
      }

      historyHydratedRef.current = true;
      historyCounter.current = counter;
      latestHistorySave.current = { entries, counter };
      setHistory(entries);
      setHistoryHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!historyHydrated) {
      return;
    }

    const counter = historyCounter.current;
    latestHistorySave.current = { entries: history, counter };

    historySaveChain.current = historySaveChain.current
      .catch(() => undefined)
      .then(async () => {
        const snapshot = latestHistorySave.current;
        await saveChordHistory(snapshot.entries, snapshot.counter);
      });
  }, [history, historyHydrated]);

  useEffect(() => {
    setMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!audioReady) {
      return;
    }

    setVoice(voiceId);
  }, [audioReady, voiceId]);

  useEffect(() => {
    if (!audioReady) {
      return;
    }

    setEffectLevels({ reverb, tremolo, phaser });
  }, [audioReady, phaser, reverb, tremolo]);

  useEffect(() => {
    if (!liveRequest || activeMidi === null || replayDisplay) {
      return;
    }

    const resolved = playResolved(liveRequest);
    if (!historyHydrated) {
      return;
    }

    const signature = requestHistorySignature(liveRequest);
    if (lastRecordedRequestSignature.current === signature) {
      return;
    }

    const replacingSameHold =
      lastRecordedMidi.current === activeMidi && historySessionEntryId.current !== null;
    recordHistory(liveRequest, resolved, { replaceSessionEntry: replacingSameHold });
    lastRecordedMidi.current = activeMidi;
    lastRecordedRequestSignature.current = signature;
  }, [activeMidi, historyHydrated, liveRequest, playResolved, recordHistory, replayDisplay]);

  useEffect(() => {
    if (liveResolved) {
      setVoicing((current) => clampVoicing(current, liveResolved.notes.length));
    }
  }, [liveResolved]);

  useEffect(() => {
    const heldKeys = new Set<string>();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const keyName = event.key.toLowerCase();
      if (heldKeys.has(keyName)) {
        return;
      }

      heldKeys.add(keyName);

      if (keyName === "[") {
        event.preventDefault();
        setVoicing((current) => stepVoicing(current, -1, liveResolved?.notes.length ?? 4));
        return;
      }

      if (keyName === "]") {
        event.preventDefault();
        setVoicing((current) => stepVoicing(current, 1, liveResolved?.notes.length ?? 4));
        return;
      }

      if (keyName in TYPE_SHORTCUTS) {
        event.preventDefault();
        void startAudio();
        setActiveType(TYPE_SHORTCUTS[keyName]!);
        return;
      }

      if (keyName in EXTENSION_SHORTCUTS) {
        event.preventDefault();
        void startAudio();
        const extension = EXTENSION_SHORTCUTS[keyName]!;
        setActiveExtensions((previous) => new Set(previous).add(extension));
        return;
      }

      if (keyName in PIANO_SHORTCUTS) {
        event.preventDefault();
        void handleKeyPress(PIANO_SHORTCUTS[keyName]!);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const keyName = event.key.toLowerCase();
      heldKeys.delete(keyName);

      if (keyName in TYPE_SHORTCUTS) {
        event.preventDefault();
        setActiveType((current) => (current === TYPE_SHORTCUTS[keyName] ? null : current));
        return;
      }

      if (keyName in EXTENSION_SHORTCUTS) {
        event.preventDefault();
        const extension = EXTENSION_SHORTCUTS[keyName]!;
        setActiveExtensions((previous) => {
          const next = new Set(previous);
          next.delete(extension);
          return next;
        });
        return;
      }

      if (keyName in PIANO_SHORTCUTS) {
        event.preventDefault();
        handleKeyRelease();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleKeyPress, handleKeyRelease, liveResolved?.notes.length, startAudio]);

  return (
    <main className="instrument">
      <header className="instrument-header">
        <h2 className="instrument-title">chord-generator</h2>
        <OffcanvasMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          darkMode={themeMode === "dark"}
          onDarkModeChange={(enabled) => setThemeMode(enabled ? "dark" : "light")}
          rippleEnabled={rippleEnabled}
          onRippleEnabledChange={setRippleEnabled}
        />
      </header>

      <div className="instrument-layout">
        <aside className="instrument-left">
          <SoundControls
            voiceId={voiceId}
            reverb={reverb}
            tremolo={tremolo}
            phaser={phaser}
            onVoiceChange={setVoiceId}
            onReverbChange={setReverb}
            onTremoloChange={setTremolo}
            onPhaserChange={setPhaser}
          />

          <label className="volume-control">
            <span>Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(event) => setVolume(Number(event.target.value) / 100)}
            />
          </label>

          <section className="instrument-panel">
            <ChordButtons
              activeType={activeType}
              activeExtensions={activeExtensions}
              rippleEnabled={rippleEnabled}
              onTypeChange={handleTypeChange}
              onExtensionChange={handleExtensionChange}
            />
            <PianoKeyboard
              activeMidi={activeMidi}
              rippleEnabled={rippleEnabled}
              onKeyPress={handleKeyPress}
              onKeyRelease={handleKeyRelease}
            />
          </section>
        </aside>

        <div className="instrument-right">
          <ChordDisplay
            chordName={display.chordName}
            noteList={display.noteList}
            hint={
              audioReady
                ? "Hold chord types (1–4), extensions (Q/W/E/R), play keys (F–;), voicing with [ ]. Key Mode picks diatonic chords."
                : "Click or press a key to enable audio."
            }
          />

          <section className="performance-controls">
            <KeyModeControl
              enabled={keyModeEnabled}
              selectedKey={key}
              onEnabledChange={setKeyModeEnabled}
              onKeyChange={setKey}
            />
            <VoicingDial
              value={voicing}
              onChange={(next) =>
                handleVoicingChange(clampVoicing(next, liveResolved?.notes.length ?? 4))
              }
            />
            <MidiControls
              supported={midiSupported}
              enabled={midiEnabled}
              outputs={midiOutputs}
              selectedOutputId={selectedMidiOutputId}
              onEnable={() => void handleEnableMidi()}
              onDisable={handleDisableMidi}
              onOutputChange={(outputId) => {
                setSelectedMidiOutputId(outputId);
                setSelectedMidiOutput(outputId);
              }}
            />
          </section>

          <ChordHistory
            entries={sortedHistory}
            favorites={favoriteEntries}
            selectedIds={selectedHistoryIds}
            onReplayStart={(entry) => void handleHistoryReplayStart(entry)}
            onReplayStop={handleHistoryReplayStop}
            onToggleFavorite={handleToggleFavorite}
            onToggleSelect={handleToggleHistorySelect}
            onSelectAll={handleSelectAllHistory}
            onClearSelection={handleClearHistorySelection}
            onDeleteEntry={handleDeleteHistoryEntry}
            onDeleteSelected={handleDeleteSelectedHistory}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
