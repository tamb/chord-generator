export const ATMOSPHERE_STORAGE_KEY = "chord-generator-atmosphere";

/** Default on when unset; only an explicit false disables. */
export function parseAtmosphereEnabled(value: unknown): boolean {
  if (value === "false" || value === false) {
    return false;
  }
  return true;
}

export function loadAtmosphereEnabled(): boolean {
  try {
    return parseAtmosphereEnabled(localStorage.getItem(ATMOSPHERE_STORAGE_KEY));
  } catch {
    return true;
  }
}

export function saveAtmosphereEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ATMOSPHERE_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore quota / private-mode failures; preference still applies in-session.
  }
}
