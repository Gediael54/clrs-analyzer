import { describe, expect, it } from 'bun:test';
import { ALGORITHMS } from '../algorithms';

describe('Algorithm Domain Mathematical Accuracy', () => {
  it('should start every algorithm at origin n = 0 with 0 operations', () => {
    for (const algo of ALGORITHMS) {
      const ops = algo.evaluateContinuousOps(0);
      expect(ops).toBe(0);
      const metrics = algo.getMetrics(0);
      expect(metrics.totalOps).toBe(0);
      expect(metrics.comparisons).toBe(0);
      expect(metrics.assignments).toBe(0);
    }
  });

  it('should maintain monotonic growth for all algorithms as N increases from 0', () => {
    const testNs = [0, 1, 5, 10, 50, 100, 500, 1000, 5000];

    for (const algo of ALGORITHMS) {
      let prevOps = algo.evaluateContinuousOps(testNs[0]);
      for (let i = 1; i < testNs.length; i++) {
        const currentOps = algo.evaluateContinuousOps(testNs[i]);
        expect(currentOps).toBeGreaterThanOrEqual(prevOps);
        prevOps = currentOps;
      }
    }
  });

  it('should strictly satisfy CLRS asymptotic hierarchy for large N = 1000', () => {
    const n = 1000;
    const constant = ALGORITHMS.find((a) => a.id === 'constant')!.evaluateContinuousOps(n);
    const binary = ALGORITHMS.find((a) => a.id === 'binary_search')!.evaluateContinuousOps(n);
    const linear = ALGORITHMS.find((a) => a.id === 'linear_search')!.evaluateContinuousOps(n);
    const merge = ALGORITHMS.find((a) => a.id === 'merge_sort')!.evaluateContinuousOps(n);
    const insertion = ALGORITHMS.find((a) => a.id === 'insertion_sort')!.evaluateContinuousOps(n);
    const matrix = ALGORITHMS.find((a) => a.id === 'matrix_mult')!.evaluateContinuousOps(n);

    // O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(n^3)
    expect(constant).toBeLessThan(binary);
    expect(binary).toBeLessThan(linear);
    expect(linear).toBeLessThan(merge);
    expect(merge).toBeLessThan(insertion);
    expect(insertion).toBeLessThan(matrix);
  });

  it('should verify speedup ratio increases with N between Insertion Sort and Merge Sort', () => {
    const insAlgo = ALGORITHMS.find((a) => a.id === 'insertion_sort')!;
    const mergeAlgo = ALGORITHMS.find((a) => a.id === 'merge_sort')!;

    const ratioSmall = insAlgo.evaluateContinuousOps(50) / mergeAlgo.evaluateContinuousOps(50);
    const ratioMedium = insAlgo.evaluateContinuousOps(500) / mergeAlgo.evaluateContinuousOps(500);
    const ratioLarge = insAlgo.evaluateContinuousOps(5000) / mergeAlgo.evaluateContinuousOps(5000);

    expect(ratioMedium).toBeGreaterThan(ratioSmall);
    expect(ratioLarge).toBeGreaterThan(ratioMedium);
  });
});
