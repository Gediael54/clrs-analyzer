import { describe, expect, it } from 'bun:test';
import { calculateNextN } from '../timeline';

describe('Timeline & Dynamic Speed Domain', () => {
  it('should support ultra-slow speeds (0.0001x) with micro increments', () => {
    const startN = 1;
    const maxN = 5000;
    const speed = 0.0001;
    const delta = 0.016; // 1 quadro a 60fps

    const nextN = calculateNextN(startN, maxN, speed, 'constant', delta);
    expect(nextN).toBeGreaterThan(startN);
    expect(nextN - startN).toBeLessThan(0.01);
  });

  it('should progress smoothly under adaptive speed mode', () => {
    let n = 0;
    const maxN = 3000;
    const speed = 1.0;
    const delta = 0.016;

    for (let frame = 0; frame < 60; frame++) {
      const nextN = calculateNextN(n, maxN, speed, 'adaptive', delta);
      expect(nextN).toBeGreaterThan(n);
      n = nextN;
    }
  });

  it('should cap at maxN without exceeding boundaries', () => {
    const startN = 2999.9;
    const maxN = 3000;
    const nextN = calculateNextN(startN, maxN, 10.0, 'constant', 1.0);
    expect(nextN).toBe(maxN);
  });
});
