export const RIPPLE_STORAGE_KEY = "chord-generator-ripple";

export function parseRippleEnabled(value: unknown): boolean {
  return value === "true" || value === true;
}

export function loadRippleEnabled(): boolean {
  try {
    return parseRippleEnabled(localStorage.getItem(RIPPLE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function saveRippleEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(RIPPLE_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore quota / private-mode failures; preference still applies in-session.
  }
}
