import { IDLE_ATMOSPHERE_PALETTE, type AtmospherePalette } from "../music/atmosphereColors";

const ATMOSPHERE_VARS = [
  "--atmosphere-primary",
  "--atmosphere-secondary",
  "--atmosphere-top",
  "--atmosphere-bottom",
  "--atmosphere-border",
  "--atmosphere-glow",
  "--atmosphere-intensity",
] as const;

export function applyAtmospherePalette(palette: AtmospherePalette): void {
  const root = document.documentElement;
  root.style.setProperty("--atmosphere-primary", palette.primary);
  root.style.setProperty("--atmosphere-secondary", palette.secondary);
  root.style.setProperty("--atmosphere-top", palette.top);
  root.style.setProperty("--atmosphere-bottom", palette.bottom);
  root.style.setProperty("--atmosphere-border", palette.border);
  root.style.setProperty("--atmosphere-glow", palette.glow);
  root.style.setProperty("--atmosphere-intensity", String(palette.intensity));
}

export function clearAtmospherePalette(): void {
  applyAtmospherePalette(IDLE_ATMOSPHERE_PALETTE);
  const root = document.documentElement;
  for (const property of ATMOSPHERE_VARS) {
    root.style.removeProperty(property);
  }
}

export function setAtmosphereEnabled(enabled: boolean): void {
  document.documentElement.classList.toggle("atmosphere-enabled", enabled);
  if (!enabled) {
    clearAtmospherePalette();
  }
}
