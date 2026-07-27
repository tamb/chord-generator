import { describe, expect, it } from "vite-plus/test";
import {
  createParticleField,
  expandFromCenter,
  parseCssRgba,
  readAtmosphereParticleColors,
  resolveParticleMotion,
  stepParticles,
} from "./atmosphereParticles";

describe("parseCssRgba", () => {
  it("parses rgb and rgba values", () => {
    expect(parseCssRgba("rgb(10, 20, 30)")).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(parseCssRgba("rgba(10, 20, 30, 0.5)")).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    expect(parseCssRgba("transparent")).toBeNull();
  });
});

describe("readAtmosphereParticleColors", () => {
  it("reads css custom properties with fallbacks", () => {
    const styles = {
      getPropertyValue(name: string) {
        if (name === "--atmosphere-primary") return "rgba(255, 100, 50, 0.4)";
        if (name === "--atmosphere-secondary") return "rgba(40, 80, 200, 0.3)";
        if (name === "--atmosphere-intensity") return "0.8";
        return "";
      },
    } as CSSStyleDeclaration;

    expect(readAtmosphereParticleColors(styles)).toEqual({
      primary: { r: 255, g: 100, b: 50, a: 0.4 },
      secondary: { r: 40, g: 80, b: 200, a: 0.3 },
      intensity: 0.8,
    });
  });
});

describe("resolveParticleMotion", () => {
  it("scales wave, depth, and spacing with effect dials", () => {
    const idle = resolveParticleMotion({ reverb: 0, tremolo: 0, phaser: 0 });
    const hot = resolveParticleMotion({ reverb: 1, tremolo: 1, phaser: 1 });

    expect(hot.waveGain).toBeGreaterThan(idle.waveGain);
    expect(hot.phaseGain).toBeGreaterThan(idle.phaseGain);
    expect(hot.depthSpeed).toBeGreaterThan(idle.depthSpeed);
    expect(hot.depthSwing).toBeGreaterThan(idle.depthSwing);
    expect(hot.spacingExpand).toBeGreaterThan(idle.spacingExpand);
    expect(hot.spacingExpand).toBeLessThanOrEqual(1.4);
  });
});

describe("expandFromCenter", () => {
  it("pushes points outward as reverb spacing increases", () => {
    const idle = expandFromCenter(10, 10, 100, 100, 1);
    const wet = expandFromCenter(10, 10, 100, 100, 1.35);

    expect(idle).toEqual({ x: 10, y: 10 });
    expect(Math.hypot(wet.x - 50, wet.y - 50)).toBeGreaterThan(
      Math.hypot(idle.x - 50, idle.y - 50),
    );
  });
});

describe("particle field", () => {
  it("creates the expected count and wraps while stepping", () => {
    const particles = createParticleField(200, 100, 12);
    expect(particles).toHaveLength(12);

    for (const particle of particles) {
      particle.x = -20;
      particle.vx = -1;
    }

    stepParticles(particles, 200, 100, 16, true);
    expect(particles.every((particle) => particle.x > 0)).toBe(true);
  });

  it("does not move when motion is disabled", () => {
    const particles = createParticleField(200, 100, 4);
    const snapshot = particles.map((particle) => ({ x: particle.x, y: particle.y }));
    stepParticles(particles, 200, 100, 32, false);
    expect(particles.map((particle) => ({ x: particle.x, y: particle.y }))).toEqual(snapshot);
  });

  it("waves farther with high tremolo than with none", () => {
    const quiet = createParticleField(200, 200, 1);
    const loud = createParticleField(200, 200, 1);
    quiet[0]!.x = 100;
    quiet[0]!.y = 100;
    quiet[0]!.vx = 0;
    quiet[0]!.vy = 0;
    quiet[0]!.phase = 0;
    quiet[0]!.speed = 1;
    loud[0]!.x = 100;
    loud[0]!.y = 100;
    loud[0]!.vx = 0;
    loud[0]!.vy = 0;
    loud[0]!.phase = 0;
    loud[0]!.speed = 1;

    stepParticles(quiet, 200, 200, 16, true, { reverb: 0, tremolo: 0, phaser: 0 });
    stepParticles(loud, 200, 200, 16, true, { reverb: 0, tremolo: 1, phaser: 0 });

    const quietTravel = Math.hypot(quiet[0]!.x - 100, quiet[0]!.y - 100);
    const loudTravel = Math.hypot(loud[0]!.x - 100, loud[0]!.y - 100);
    expect(loudTravel).toBeGreaterThan(quietTravel);
  });
});
