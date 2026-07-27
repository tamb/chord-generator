export const RIPPLE_STORAGE_KEY = "chord-generator-ripple";

/** Default on when unset; only an explicit false disables. */
export function parseRippleEnabled(value: unknown): boolean {
  if (value === "false" || value === false) {
    return false;
  }
  return true;
}

export function loadRippleEnabled(): boolean {
  try {
    return parseRippleEnabled(localStorage.getItem(RIPPLE_STORAGE_KEY));
  } catch {
    return true;
  }
}

export function saveRippleEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(RIPPLE_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore quota / private-mode failures; preference still applies in-session.
  }
}
