import { useEffect, useRef } from "react";
import {
  createParticleField,
  drawParticles,
  readAtmosphereParticleColors,
  stepParticles,
  type ParticleEffectLevels,
} from "../ui/atmosphereParticles";

type AtmosphereParticlesProps = {
  /** When false, canvas unmounts and the rAF loop stops. */
  enabled: boolean;
  /** Audio dials — modulate wave (tremolo), depth (phaser), spacing (reverb). */
  reverb: number;
  tremolo: number;
  phaser: number;
};

/**
 * Full-bleed canvas behind instrument UI.
 * Reads Atmosphere CSS vars each frame and draws drifting glow particles
 * shaped by the current reverb / tremolo / phaser levels.
 */
export function AtmosphereParticles({
  enabled,
  reverb,
  tremolo,
  phaser,
}: AtmosphereParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Ref so dial changes apply next frame without restarting the rAF loop
  const effectsRef = useRef<ParticleEffectLevels>({ reverb, tremolo, phaser });
  effectsRef.current = { reverb, tremolo, phaser };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    // Freeze motion (but still draw) when the user prefers reduced motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let motionEnabled = !motionQuery.matches;
    let particles = createParticleField(1, 1);
    let frameId = 0;
    let lastTime = performance.now();
    let disposed = false;
    // Smoothed intensity so particles fade in/out instead of popping with the chord
    let displayIntensity = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }

      const rect = parent.getBoundingClientRect();
      // Cap DPR at 2 for perf on sharp displays
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Respawn so density matches the new size
      particles = createParticleField(width, height);
    };

    const onMotionChange = () => {
      motionEnabled = !motionQuery.matches;
    };

    const tick = (now: number) => {
      if (disposed) {
        return;
      }

      const delta = now - lastTime;
      lastTime = now;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const colors = readAtmosphereParticleColors(getComputedStyle(document.documentElement));
      // Higher divisor = slower fade toward target intensity (ms-ish feel)
      const blend = Math.min(1, delta / 280);
      displayIntensity += (colors.intensity - displayIntensity) * blend;

      const effects = effectsRef.current;
      stepParticles(particles, width, height, delta, motionEnabled, effects);
      context.clearRect(0, 0, width, height);

      if (displayIntensity > 0.01) {
        drawParticles(
          context,
          particles,
          { ...colors, intensity: displayIntensity },
          width,
          height,
          effects,
        );
      }

      frameId = window.requestAnimationFrame(tick);
    };

    resize();
    lastTime = performance.now();
    frameId = window.requestAnimationFrame(tick);

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    motionQuery.addEventListener("change", onMotionChange);
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return <canvas className="atmosphere-particles" ref={canvasRef} aria-hidden="true" />;
}
