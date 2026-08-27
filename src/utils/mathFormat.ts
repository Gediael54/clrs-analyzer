/**
 * Formata números grandes com sufixos intuitivos (1.2k, 3.5M, 10.0B)
 */
export function formatCompactNumber(val: number): string {
  if (val === 0) return '0';
  const abs = Math.abs(val);

  if (abs >= 1e9) {
    return (val / 1e9).toFixed(abs >= 1e10 ? 1 : 2).replace(/\.0+$/, '') + 'B';
  }
  if (abs >= 1e6) {
    return (val / 1e6).toFixed(abs >= 1e7 ? 1 : 2).replace(/\.0+$/, '') + 'M';
  }
  if (abs >= 1e3) {
    return (val / 1e3).toFixed(abs >= 1e4 ? 1 : 2).replace(/\.0+$/, '') + 'k';
  }
  if (abs >= 1) {
    return Number.isInteger(val) ? val.toString() : val.toFixed(1);
  }
  return val.toFixed(2);
}

/**
 * Formata números inteiros com separadores de milhar
 */
export function formatInteger(val: number): string {
  return Math.round(val).toLocaleString('pt-BR');
}

/**
 * Formata tempo de execução (microsegundos, milissegundos ou segundos)
 */
export function formatExecutionTime(microsec: number): string {
  if (microsec < 1000) {
    return `${microsec.toFixed(0)} µs`;
  }
  const ms = microsec / 1000;
  if (ms < 1000) {
    return `${ms.toFixed(2)} ms`;
  }
  const sec = ms / 1000;
  return `${sec.toFixed(2)} s`;
}

/**
 * Calcula a grade dinâmica para o plano cartesiano infinito (base 1, 2, 5 * 10^k)
 */
export function calculateGridStep(range: number, targetDivisions = 8): number {
  if (range <= 0) return 100;
  const rawStep = range / targetDivisions;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  if (residual < 1.5) return magnitude * 1;
  if (residual < 3.5) return magnitude * 2;
  if (residual < 7.5) return magnitude * 5;
  return magnitude * 10;
}
