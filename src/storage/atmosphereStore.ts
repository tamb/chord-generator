export const ATMOSPHERE_STORAGE_KEY = "chord-generator-atmosphere";

export function parseAtmosphereEnabled(value: unknown): boolean {
  return value === "true" || value === true;
}

export function loadAtmosphereEnabled(): boolean {
  try {
    return parseAtmosphereEnabled(localStorage.getItem(ATMOSPHERE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function saveAtmosphereEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ATMOSPHERE_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore quota / private-mode failures; preference still applies in-session.
  }
}
