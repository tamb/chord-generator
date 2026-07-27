import { useEffect, useId, useRef } from "react";

type OffcanvasMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  darkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
  rippleEnabled: boolean;
  onRippleEnabledChange: (enabled: boolean) => void;
  atmosphereEnabled: boolean;
  onAtmosphereEnabledChange: (enabled: boolean) => void;
};

export function OffcanvasMenu({
  open,
  onOpenChange,
  darkMode,
  onDarkModeChange,
  rippleEnabled,
  onRippleEnabledChange,
  atmosphereEnabled,
  onAtmosphereEnabledChange,
}: OffcanvasMenuProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  return (
    <>
      <button
        type="button"
        className="header-menu-button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="app-settings-offcanvas"
        onClick={() => onOpenChange(true)}
      >
        <span className="header-menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        className={`offcanvas-backdrop ${open ? "open" : ""}`}
        onClick={() => onOpenChange(false)}
        aria-hidden={!open}
      />

      <aside
        id="app-settings-offcanvas"
        className={`offcanvas-panel ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        <div className="offcanvas-header">
          <h3 id={titleId} className="offcanvas-title">
            Settings
          </h3>
          <button
            ref={closeButtonRef}
            type="button"
            className="offcanvas-close"
            aria-label="Close menu"
            onClick={() => onOpenChange(false)}
          >
            ×
          </button>
        </div>

        <section className="offcanvas-section" aria-label="Appearance">
          <p className="sound-controls-heading">Appearance</p>
          <div className="settings-toggle-row">
            <div className="settings-toggle-copy">
              <span className="settings-toggle-label">Dark mode</span>
              <span className="settings-toggle-hint">{darkMode ? "On" : "Off"}</span>
            </div>
            <button
              type="button"
              className={`key-mode-toggle ${darkMode ? "active" : ""}`}
              aria-pressed={darkMode}
              onClick={() => onDarkModeChange(!darkMode)}
            >
              {darkMode ? "On" : "Off"}
            </button>
          </div>
        </section>

        <section className="offcanvas-section" aria-label="Effects">
          <p className="sound-controls-heading">Effects</p>
          <div className="settings-toggle-row">
            <div className="settings-toggle-copy">
              <span className="settings-toggle-label">Ripple effect</span>
              <span className="settings-toggle-hint">
                {rippleEnabled ? "On — press feedback" : "Off"}
              </span>
            </div>
            <button
              type="button"
              className={`key-mode-toggle ${rippleEnabled ? "active" : ""}`}
              aria-pressed={rippleEnabled}
              onClick={() => onRippleEnabledChange(!rippleEnabled)}
            >
              {rippleEnabled ? "On" : "Off"}
            </button>
          </div>
          <div className="settings-toggle-row">
            <div className="settings-toggle-copy">
              <span className="settings-toggle-label">Atmosphere Mode</span>
              <span className="settings-toggle-hint">
                {atmosphereEnabled ? "On — chord color glow" : "Off"}
              </span>
            </div>
            <button
              type="button"
              className={`key-mode-toggle ${atmosphereEnabled ? "active" : ""}`}
              aria-pressed={atmosphereEnabled}
              onClick={() => onAtmosphereEnabledChange(!atmosphereEnabled)}
            >
              {atmosphereEnabled ? "On" : "Off"}
            </button>
          </div>
        </section>
      </aside>
    </>
  );
}
