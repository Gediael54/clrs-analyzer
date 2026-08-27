export interface Metrics {
  comparisons: number;
  assignments: number;
  time_microseconds: number;
  totalOps: number;
}

export interface AlgorithmDef {
  id: string;
  name: string;
  family: string; // e.g. 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)', 'O(2^n)'
  complexityLabel: string; // e.g. '𝒪(n log₂ n)'
  color: string;
  glowColor: string;
  description: string;
  formula: string;
  computeMetrics: (n: number, wasmModule?: any) => Metrics;
}

export interface DataPoint {
  n: number;
  metrics: Record<string, Metrics>;
}

export interface CameraState {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'finished';
export type ScaleMode = 'linear' | 'log10';
