import type { AlgorithmDef, Metrics } from '../types/simulation';

export const AVAILABLE_ALGORITHMS: AlgorithmDef[] = [
  {
    id: 'constant',
    name: 'Acesso Direto (Array)',
    family: 'O(1)',
    complexityLabel: '𝒪(1)',
    color: '#10b981', // Emerald green
    glowColor: 'rgba(16, 185, 129, 0.6)',
    description: 'Acesso a índice ou tabela hash ideal (independe de N).',
    formula: 'T(n) = c',
    computeMetrics: (n: number) => ({
      comparisons: 0,
      assignments: 1,
      time_microseconds: 0.05,
      totalOps: 1,
    }),
  },
  {
    id: 'binary_search',
    name: 'Busca Binária',
    family: 'O(log n)',
    complexityLabel: '𝒪(log₂ n)',
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.6)',
    description: 'Divisão sucessiva do espaço de busca em metades (CLRS Cap. 2.3).',
    formula: 'T(n) = 2 ⌊log₂(n)⌋ + 2',
    computeMetrics: (n: number) => {
      if (n <= 1) return { comparisons: 1, assignments: 1, time_microseconds: 0.1, totalOps: 2 };
      const steps = Math.floor(Math.log2(n)) + 1;
      const comparisons = steps;
      const assignments = steps;
      const totalOps = comparisons + assignments;
      return {
        comparisons,
        assignments,
        time_microseconds: totalOps * 0.05,
        totalOps,
      };
    },
  },
  {
    id: 'linear_search',
    name: 'Busca Linear / Varredura',
    family: 'O(n)',
    complexityLabel: '𝒪(n)',
    color: '#3b82f6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.6)',
    description: 'Iteração linear elemento por elemento até o fim do vetor (CLRS Cap. 2.1).',
    formula: 'T(n) = 3n',
    computeMetrics: (n: number) => {
      const comparisons = 2 * n; // verificação do laço + teste de igualdade
      const assignments = n;
      const totalOps = comparisons + assignments;
      return {
        comparisons,
        assignments,
        time_microseconds: totalOps * 0.02,
        totalOps,
      };
    },
  },
  {
    id: 'merge_sort',
    name: 'Merge Sort',
    family: 'O(n log n)',
    complexityLabel: '𝒪(n log₂ n)',
    color: '#38bdf8', // Sky Blue
    glowColor: 'rgba(56, 189, 248, 0.6)',
    description: 'Ordenação por Divisão e Conquista no pior caso (CLRS Cap. 2.3).',
    formula: 'T(n) = 2T(n/2) + cn  ≈  3n log₂(n)',
    computeMetrics: (n: number, wasmModule?: any) => {
      if (n <= 1) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (wasmModule && wasmModule.benchmarkMerge) {
        try {
          const res = wasmModule.benchmarkMerge(n);
          const comp = Number(res.comparisons);
          const ass = Number(res.assignments);
          return {
            comparisons: comp,
            assignments: ass,
            time_microseconds: Number(res.time_microseconds),
            totalOps: comp + ass,
          };
        } catch (_) {}
      }
      const log2n = Math.log2(Math.max(1, n));
      const ceilLog = Math.ceil(log2n);
      const comparisons = n * ceilLog - Math.pow(2, ceilLog) + 1;
      const assignments = 2 * n * ceilLog;
      const totalOps = comparisons + assignments;
      return {
        comparisons,
        assignments,
        time_microseconds: totalOps * 0.0025,
        totalOps,
      };
    },
  },
  {
    id: 'quick_sort',
    name: 'Quick Sort (Médio)',
    family: 'O(n log n)',
    complexityLabel: '𝒪(n log₂ n)',
    color: '#818cf8', // Indigo
    glowColor: 'rgba(129, 140, 248, 0.6)',
    description: 'Particionamento em torno do pivô no caso médio (CLRS Cap. 7).',
    formula: 'T(n) ≈ 2n ln(n)  ≈  2.4n log₂(n)',
    computeMetrics: (n: number) => {
      if (n <= 1) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      const comparisons = Math.round(1.386 * n * Math.log2(n));
      const assignments = Math.round(0.95 * n * Math.log2(n));
      const totalOps = comparisons + assignments;
      return {
        comparisons,
        assignments,
        time_microseconds: totalOps * 0.002,
        totalOps,
      };
    },
  },
  {
    id: 'insertion_sort',
    name: 'Insertion Sort (Pior Caso)',
    family: 'O(n^2)',
    complexityLabel: '𝒪(n²)',
    color: '#f43f5e', // Rose Neon
    glowColor: 'rgba(244, 63, 94, 0.6)',
    description: 'Inserção incremental com vetor invertido (CLRS Cap. 2.1).',
    formula: 'T(n) = (n² + n - 2)/2 + n² + 2n - 3  ≈  1.5n²',
    computeMetrics: (n: number, wasmModule?: any) => {
      if (n <= 1) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      if (wasmModule && wasmModule.benchmarkInsertion) {
        try {
          const res = wasmModule.benchmarkInsertion(n);
          const comp = Number(res.comparisons);
          const ass = Number(res.assignments);
          return {
            comparisons: comp,
            assignments: ass,
            time_microseconds: Number(res.time_microseconds),
            totalOps: comp + ass,
          };
        } catch (_) {}
      }
      const comparisons = (n * (n + 1)) / 2 - 1;
      const assignments = n * (n - 1) + (n - 1) * 2;
      const totalOps = comparisons + assignments;
      return {
        comparisons,
        assignments,
        time_microseconds: totalOps * 0.0015,
        totalOps,
      };
    },
  },
  {
    id: 'bubble_sort',
    name: 'Bubble Sort (Pior Caso)',
    family: 'O(n^2)',
    complexityLabel: '𝒪(n²)',
    color: '#fb923c', // Orange
    glowColor: 'rgba(251, 146, 60, 0.6)',
    description: 'Troca de pares adjacentes fora de ordem (CLRS Problema 2-2).',
    formula: 'T(n) = n(n-1)/2 comp + 3·n(n-1)/2 atrib  ≈  2n²',
    computeMetrics: (n: number) => {
      if (n <= 1) return { comparisons: 0, assignments: 0, time_microseconds: 0, totalOps: 0 };
      const pairs = (n * (n - 1)) / 2;
      const comparisons = pairs;
      const assignments = pairs * 3; // 3 passos por swap
      const totalOps = comparisons + assignments;
      return {
        comparisons,
        assignments,
        time_microseconds: totalOps * 0.0018,
        totalOps,
      };
    },
  },
  {
    id: 'matrix_mult',
    name: 'Multiplicação de Matrizes (Ingênua)',
    family: 'O(n^3)',
    complexityLabel: '𝒪(n³)',
    color: '#d946ef', // Fuchsia / Magenta
    glowColor: 'rgba(217, 70, 239, 0.6)',
    description: 'Três laços aninhados de produto escalar n×n (CLRS Cap. 4.2).',
    formula: 'T(n) = n³ mult + (n³ - n²) soma + 2n³ atrib  ≈  4n³',
    computeMetrics: (n: number) => {
      if (n <= 1) return { comparisons: 0, assignments: 1, time_microseconds: 0, totalOps: 1 };
      const n3 = Math.pow(n, 3);
      const comparisons = Math.pow(n, 2); // laços internos
      const assignments = 2 * n3;
      const totalOps = 4 * n3;
      return {
        comparisons,
        assignments,
        time_microseconds: Math.min(totalOps * 0.0005, 1e8),
        totalOps,
      };
    },
  },
  {
    id: 'exponential',
    name: 'Fibonacci Recursivo / Subconjuntos',
    family: 'O(2^n)',
    complexityLabel: '𝒪(2ⁿ)',
    color: '#ef4444', // Bright Red
    glowColor: 'rgba(239, 68, 68, 0.6)',
    description: 'Árvore de recursão binária ingênua (CLRS Cap. 3 - Crescimento Exponencial).',
    formula: 'T(n) = 2ⁿ - 1',
    computeMetrics: (n: number) => {
      if (n <= 1) return { comparisons: 1, assignments: 0, time_microseconds: 0, totalOps: 1 };
      // Para evitar Infinity no JS para n grande, usamos aproximação com teto seguro
      const totalOps = n < 50 ? Math.pow(2, n) - 1 : Math.pow(2, 50);
      const comparisons = totalOps / 2;
      const assignments = totalOps / 2;
      return {
        comparisons,
        assignments,
        time_microseconds: Math.min(totalOps * 0.001, 1e8),
        totalOps,
      };
    },
  },
];
