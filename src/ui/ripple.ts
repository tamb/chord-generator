type RipplePoint = {
  clientX: number;
  clientY: number;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function appendRipple(target: HTMLElement, size: number, x: number, y: number): void {
  const ripple = document.createElement("span");
  ripple.className = "md-ripple";
  ripple.setAttribute("aria-hidden", "true");
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  target.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

export function spawnRipple(target: HTMLElement, point: RipplePoint): void {
  if (prefersReducedMotion()) {
    return;
  }

  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = point.clientX - rect.left - size / 2;
  const y = point.clientY - rect.top - size / 2;
  appendRipple(target, size, x, y);
}

export function spawnRippleAtCenter(target: HTMLElement): void {
  if (prefersReducedMotion()) {
    return;
  }

  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = rect.width / 2 - size / 2;
  const y = rect.height * 0.85 - size / 2;
  appendRipple(target, size, x, y);
}

export function maybeSpawnRipple(enabled: boolean, target: HTMLElement, point: RipplePoint): void {
  if (!enabled) {
    return;
  }

  spawnRipple(target, point);
}

export function maybeSpawnRippleAtCenter(enabled: boolean, target: HTMLElement): void {
  if (!enabled) {
    return;
  }

  spawnRippleAtCenter(target);
}
