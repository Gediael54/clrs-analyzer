import type { Metrics } from '../types/simulation';

export interface AlgorithmModel {
  id: string;
  name: string;
  family: string;
  complexityLabel: string;
  color: string;
  glowColor: string;
  description: string;
  formula: string;
  wasmMethod: string;
  evaluateContinuousOps: (n: number, wasmModule?: any) => number;
  evaluateLog10Ops: (n: number) => number;
  getMetrics: (n: number, wasmModule?: any) => Metrics;
}

export const ALGORITHMS: AlgorithmModel[] = [
  {
    id: 'constant',
    name: 'Acesso Direto (Array)',
    family: 'O(1)',
    complexityLabel: '𝒪(1)',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    description: 'Acesso a índice ou tabela hash ideal.',
    formula: 'T(n) = 1 (para n > 0)',
    wasmMethod: 'benchmarkConstant',
    evaluateContinuousOps: (n: number) => (n <= 0 ? 0 : Math.min(1, n)),
    evaluateLog10Ops: (n: number) => (n <= 0 ? 0 : 0),
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (wasmModule && wasmModule.benchmarkConstant) {
        try {
          const res = wasmModule.benchmarkConstant(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      return { comparisons: 0, assignments: 1, time_microseconds: 0.05, totalOps: 1 };
    },
  },
  {
    id: 'binary_search',
    name: 'Busca Binária',
    family: 'O(log n)',
    complexityLabel: '𝒪(log₂ n)',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    description: 'Divisão sucessiva do espaço de busca em metades (CLRS Cap. 2.3).',
    formula: 'T(n) = 2 log₂(n + 1)',
    wasmMethod: 'benchmarkBinarySearch',
    evaluateContinuousOps: (n: number) => (n <= 0 ? 0 : 2 * Math.log2(n + 1)),
    evaluateLog10Ops: (n: number) => (n <= 0 ? 0 : Math.log10(Math.max(1, 2 * Math.log2(n + 1)))),
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (wasmModule && wasmModule.benchmarkBinarySearch) {
        try {
          const res = wasmModule.benchmarkBinarySearch(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      const steps = Math.floor(Math.log2(n + 1)) + 1;
      return { comparisons: steps, assignments: steps, time_microseconds: steps * 0.05, totalOps: steps * 2 };
    },
  },
  {
    id: 'linear_search',
    name: 'Busca Linear / Varredura',
    family: 'O(n)',
    complexityLabel: '𝒪(n)',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    description: 'Iteração linear elemento por elemento até o fim do vetor (CLRS Cap. 2.1).',
    formula: 'T(n) = 3n',
    wasmMethod: 'benchmarkLinearSearch',
    evaluateContinuousOps: (n: number) => (n <= 0 ? 0 : 3 * n),
    evaluateLog10Ops: (n: number) => (n <= 0 ? 0 : Math.log10(Math.max(1, 3 * n))),
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (wasmModule && wasmModule.benchmarkLinearSearch) {
        try {
          const res = wasmModule.benchmarkLinearSearch(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      return { comparisons: 2 * n, assignments: n, time_microseconds: 3 * n * 0.02, totalOps: 3 * n };
    },
  },
  {
    id: 'merge_sort',
    name: 'Merge Sort',
    family: 'O(n log n)',
    complexityLabel: '𝒪(n log₂ n)',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    description: 'Ordenação por Divisão e Conquista no pior caso (CLRS Cap. 2.3).',
    formula: 'T(n) = 3n log₂(n + 1)',
    wasmMethod: 'benchmarkMerge',
    evaluateContinuousOps: (n: number) => {
      if (n <= 0) return 0;
      return 3 * n * Math.log2(n + 1);
    },
    evaluateLog10Ops: (n: number) => {
      if (n <= 0) return 0;
      return Math.log10(Math.max(1, 3 * n * Math.log2(n + 1)));
    },
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (n === 1) return { comparisons: 0, assignments: 1, time_microseconds: 0.01, totalOps: 1 };
      if (wasmModule && wasmModule.benchmarkMerge) {
        try {
          const res = wasmModule.benchmarkMerge(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      const log2n = Math.log2(Math.max(1, n));
      const ceilLog = Math.ceil(log2n);
      const comparisons = n * ceilLog - Math.pow(2, ceilLog) + 1;
      const assignments = 2 * n * ceilLog;
      return { comparisons, assignments, time_microseconds: (comparisons + assignments) * 0.0025, totalOps: comparisons + assignments };
    },
  },
  {
    id: 'quick_sort',
    name: 'Quick Sort (Médio)',
    family: 'O(n log n)',
    complexityLabel: '𝒪(n log₂ n)',
    color: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.6)',
    description: 'Particionamento em torno do pivô no caso médio (CLRS Cap. 7).',
    formula: 'T(n) = 2.34n log₂(n + 1)',
    wasmMethod: 'benchmarkQuickSort',
    evaluateContinuousOps: (n: number) => {
      if (n <= 0) return 0;
      return 2.34 * n * Math.log2(n + 1);
    },
    evaluateLog10Ops: (n: number) => {
      if (n <= 0) return 0;
      return Math.log10(Math.max(1, 2.34 * n * Math.log2(n + 1)));
    },
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (n === 1) return { comparisons: 0, assignments: 1, time_microseconds: 0.01, totalOps: 1 };
      if (wasmModule && wasmModule.benchmarkQuickSort) {
        try {
          const res = wasmModule.benchmarkQuickSort(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      const comparisons = Math.round(1.386 * n * Math.log2(n + 1));
      const assignments = Math.round(0.95 * n * Math.log2(n + 1));
      return { comparisons, assignments, time_microseconds: (comparisons + assignments) * 0.002, totalOps: comparisons + assignments };
    },
  },
  {
    id: 'insertion_sort',
    name: 'Insertion Sort (Pior Caso)',
    family: 'O(n^2)',
    complexityLabel: '𝒪(n²)',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    description: 'Inserção incremental com vetor invertido (CLRS Cap. 2.1).',
    formula: 'T(n) = 1.5n² + n',
    wasmMethod: 'benchmarkInsertion',
    evaluateContinuousOps: (n: number) => {
      if (n <= 0) return 0;
      return 1.5 * n * n + 1.0 * n;
    },
    evaluateLog10Ops: (n: number) => {
      if (n <= 0) return 0;
      return Math.log10(Math.max(1, 1.5 * n * n + 1.0 * n));
    },
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (n === 1) return { comparisons: 0, assignments: 1, time_microseconds: 0.01, totalOps: 1 };
      if (wasmModule && wasmModule.benchmarkInsertion) {
        try {
          const res = wasmModule.benchmarkInsertion(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      const comparisons = (n * (n + 1)) / 2 - 1;
      const assignments = n * (n - 1) + (n - 1) * 2;
      return { comparisons, assignments, time_microseconds: (comparisons + assignments) * 0.0015, totalOps: comparisons + assignments };
    },
  },
  {
    id: 'bubble_sort',
    name: 'Bubble Sort (Pior Caso)',
    family: 'O(n^2)',
    complexityLabel: '𝒪(n²)',
    color: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.6)',
    description: 'Troca de pares adjacentes fora de ordem (CLRS Problema 2-2).',
    formula: 'T(n) = 2n² (n / (n + 1))',
    wasmMethod: 'benchmarkBubbleSort',
    evaluateContinuousOps: (n: number) => {
      if (n <= 0) return 0;
      return 2 * n * n * (n / (n + 1));
    },
    evaluateLog10Ops: (n: number) => {
      if (n <= 0) return 0;
      return Math.log10(Math.max(1, 2 * n * n * (n / (n + 1))));
    },
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (n === 1) return { comparisons: 0, assignments: 1, time_microseconds: 0.01, totalOps: 1 };
      if (wasmModule && wasmModule.benchmarkBubbleSort) {
        try {
          const res = wasmModule.benchmarkBubbleSort(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      const pairs = (n * (n - 1)) / 2;
      return { comparisons: pairs, assignments: pairs * 3, time_microseconds: (pairs * 4) * 0.0018, totalOps: pairs * 4 };
    },
  },
  {
    id: 'matrix_mult',
    name: 'Multiplicação de Matrizes (Ingênua)',
    family: 'O(n^3)',
    complexityLabel: '𝒪(n³)',
    color: '#d946ef',
    glowColor: 'rgba(217, 70, 239, 0.6)',
    description: 'Três laços aninhados de produto escalar n×n (CLRS Cap. 4.2).',
    formula: 'T(n) = 4n³',
    wasmMethod: 'benchmarkMatrixMult',
    evaluateContinuousOps: (n: number) => {
      if (n <= 0) return 0;
      return 4 * Math.pow(n, 3);
    },
    evaluateLog10Ops: (n: number) => {
      if (n <= 0) return 0;
      return Math.log10(Math.max(1, 4 * Math.pow(n, 3)));
    },
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (n === 1) return { comparisons: 0, assignments: 1, time_microseconds: 0.01, totalOps: 1 };
      if (wasmModule && wasmModule.benchmarkMatrixMult) {
        try {
          const res = wasmModule.benchmarkMatrixMult(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      const n3 = Math.pow(n, 3);
      return { comparisons: Math.pow(n, 2), assignments: 2 * n3, time_microseconds: (4 * n3) * 0.0005, totalOps: 4 * n3 };
    },
  },
  {
    id: 'exponential',
    name: 'Fibonacci Recursivo / Subconjuntos',
    family: 'O(2^n)',
    complexityLabel: '𝒪(2ⁿ)',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    description: 'Árvore de recursão binária ingênua (CLRS Cap. 3 - Crescimento Exponencial).',
    formula: 'T(n) = 2ⁿ - 1',
    wasmMethod: 'benchmarkExponential',
    evaluateContinuousOps: (n: number) => {
      if (n <= 0) return 0;
      if (n > 50) return Math.pow(2, 50) * Math.pow(1.05, n - 50);
      return Math.pow(2, n) - 1;
    },
    evaluateLog10Ops: (n: number) => (n <= 0 ? 0 : n * 0.3010299956639812),
    getMetrics: (n: number, wasmModule?: any) => {
      if (n <= 0) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (wasmModule && wasmModule.benchmarkExponential) {
        try {
          const res = wasmModule.benchmarkExponential(n);
          return {
            comparisons: Number(res.comparisons),
            assignments: Number(res.assignments),
            time_microseconds: Number(res.time_microseconds),
            totalOps: Number(res.total_ops),
          };
        } catch (_) {}
      }
      const totalOps = n < 50 ? Math.pow(2, n) - 1 : Math.pow(2, 50);
      return { comparisons: totalOps / 2, assignments: totalOps / 2, time_microseconds: totalOps * 0.001, totalOps };
    },
  },
];
