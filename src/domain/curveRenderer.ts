import type { AlgorithmModel } from './algorithms';
import type { CameraState, ScaleMode } from '../types/simulation';

interface DrawCurveOptions {
  ctx: CanvasRenderingContext2D;
  algo: AlgorithmModel;
  currentN: number;
  cam: CameraState;
  width: number;
  height: number;
  scaleMode: ScaleMode;
  pulsePhase: number;
  worldToScreen: (wx: number, wy: number, width: number, height: number, cam: CameraState) => { sx: number; sy: number };
}

/**
 * Renderiza uma curva contínua e suave no canvas com proteção contra NaN/Infinity
 */
export function drawContinuousCurve({
  ctx,
  algo,
  currentN,
  cam,
  width,
  height,
  scaleMode,
  pulsePhase,
  worldToScreen,
}: DrawCurveOptions) {
  if (currentN <= 0) return;

  const isLog = scaleMode === 'log10';

  // Determina número de amostras proporcional ao tamanho na tela
  const screenStart = worldToScreen(0, 0, width, height, cam);
  const screenEnd = worldToScreen(currentN, 0, width, height, cam);
  const pixelSpanX = Math.max(10, Math.abs(screenEnd.sx - screenStart.sx));
  const sampleCount = Math.min(Math.max(50, Math.floor(pixelSpanX / 2)), 300);

  const points: { sx: number; sy: number; n: number; ops: number }[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    // Amostragem não-linear: maior densidade no início onde a curvatura é acentuada
    const progressFactor = Math.pow(t, 1.2);
    const n = currentN * progressFactor;

    const plotY = isLog ? algo.evaluateLog10Ops(n) : algo.evaluateContinuousOps(n);
    const rawOps = algo.evaluateContinuousOps(n);

    // Proteção estrita contra NaN e Infinity
    if (!Number.isFinite(plotY) || !Number.isFinite(n)) continue;

    const { sx, sy } = worldToScreen(n, plotY, width, height, cam);

    if (Number.isFinite(sx) && Number.isFinite(sy)) {
      // Clampa valores extremos de tela para evitar bugs gráficos no Canvas
      const clampedSx = Math.max(-500, Math.min(width + 500, sx));
      const clampedSy = Math.max(-1000, Math.min(height + 1000, sy));
      points.push({ sx: clampedSx, sy: clampedSy, n, ops: rawOps });
    }
  }

  if (points.length < 2) return;

  const pOrigin = worldToScreen(0, 0, width, height, cam);
  const safeOriginSx = Math.max(-500, Math.min(width + 500, pOrigin.sx));
  const safeOriginSy = Math.max(-1000, Math.min(height + 1000, pOrigin.sy));

  // 1. Preenchimento de Área sob a Curva (Gradiente Suave)
  ctx.save();
  ctx.fillStyle = algo.glowColor.replace('0.6', '0.12');
  ctx.beginPath();
  ctx.moveTo(safeOriginSx, safeOriginSy);

  for (let i = 0; i < points.length; i++) {
    ctx.lineTo(points[i].sx, points[i].sy);
  }

  const lastPoint = points[points.length - 1];
  const { sx: lastX } = worldToScreen(lastPoint.n, 0, width, height, cam);
  const safeLastX = Math.max(-500, Math.min(width + 500, lastX));

  ctx.lineTo(safeLastX, safeOriginSy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Linha Neon Contínua Ultra-Nítida
  ctx.save();
  ctx.shadowColor = algo.color;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = algo.color;
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      ctx.moveTo(points[i].sx, points[i].sy);
    } else {
      ctx.lineTo(points[i].sx, points[i].sy);
    }
  }
  ctx.stroke();
  ctx.restore();

  // 3. Ponta de Radar Pulsante na Posição Ativa
  const tip = points[points.length - 1];
  if (tip.sx >= -20 && tip.sx <= width + 20 && tip.sy >= -20 && tip.sy <= height + 20) {
    const pingRadius = 5 + Math.sin(pulsePhase * 2) * 4;

    ctx.save();
    ctx.strokeStyle = algo.glowColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tip.sx, tip.sy, pingRadius + 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = algo.color;
    ctx.beginPath();
    ctx.arc(tip.sx, tip.sy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
