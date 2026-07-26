export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "chord-generator-theme";

export function parseThemeMode(value: unknown): ThemeMode {
  return value === "dark" ? "dark" : "light";
}

export function loadThemeMode(): ThemeMode {
  try {
    return parseThemeMode(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "light";
  }
}

export function saveThemeMode(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore quota / private-mode failures; theme still applies in-session.
  }
}

export function applyThemeMode(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme;
}
