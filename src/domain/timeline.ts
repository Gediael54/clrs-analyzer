export type SpeedMode = 'constant' | 'adaptive';

export interface TimelineState {
  currentN: number;
  maxN: number;
  speedMultiplier: number;
  speedMode: SpeedMode;
  status: 'idle' | 'running' | 'paused' | 'finished';
}

/**
 * Calcula o próximo N no tempo baseado na velocidade e no modo adaptativo
 */
export function calculateNextN(
  currentN: number,
  maxN: number,
  speedMultiplier: number,
  speedMode: SpeedMode,
  deltaSeconds: number
): number {
  if (currentN >= maxN) return maxN;

  // Duração base de 0 a maxN em 1x velocidade constante: 16 segundos para visualização detalhada
  const baseSeconds = 16;
  let increment: number;

  if (speedMode === 'adaptive') {
    // Modo adaptativo: desacelera no início (n pequeno) para ver os cruzamentos com detalhes,
    // e mantém uma velocidade visual perceptual constante na tela
    const normalizedN = Math.max(0.01, currentN / maxN);
    // Velocidade perceptual: taxa proporcional a n^(0.5) para compensar o crescimento quadrático f(n)=n^2
    const pacingFactor = Math.pow(normalizedN, 0.45) * 1.5 + 0.15;
    const rate = (maxN / baseSeconds) * pacingFactor * speedMultiplier;
    increment = rate * deltaSeconds;
  } else {
    // Modo constante linear
    const rate = (maxN / baseSeconds) * speedMultiplier;
    increment = rate * deltaSeconds;
  }

  return Math.min(maxN, currentN + Math.max(0.0001, increment));
}
