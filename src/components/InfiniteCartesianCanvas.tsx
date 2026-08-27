import { useEffect, useRef, useState, useCallback } from 'react';
import type { CameraState, ScaleMode } from '../types/simulation';
import { ALGORITHMS } from '../domain/algorithms';
import { drawContinuousCurve } from '../domain/curveRenderer';
import { formatCompactNumber, calculateGridStep, formatInteger } from '../utils/mathFormat';
import { Crosshair, ZoomIn, ZoomOut, Maximize2, Compass, BarChart, TrendingUp } from 'lucide-react';

interface InfiniteCartesianCanvasProps {
  currentN: number;
  arraySize: number;
  status: string;
  autoCamera: boolean;
  setAutoCamera: (auto: boolean) => void;
  selectedAlgoIds: string[];
  scaleMode: ScaleMode;
  setScaleMode: (mode: ScaleMode) => void;
  seekTo: (n: number) => void;
}

// Margens seguras para desobstruir HeaderHUD no topo e FloatingControlBar na base
const PAD_LEFT = 70;
const PAD_RIGHT = 40;
const PAD_TOP = 80;
const PAD_BOTTOM = 135;

export default function InfiniteCartesianCanvas({
  currentN,
  arraySize,
  status,
  autoCamera,
  setAutoCamera,
  selectedAlgoIds,
  scaleMode,
  setScaleMode,
  seekTo,
}: InfiniteCartesianCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isLog = scaleMode === 'log10';

  // Zoom inicial microscópico próximo à origem (0, 0)
  const cameraRef = useRef<CameraState>({
    xMin: 0,
    xMax: 4.0,
    yMin: 0,
    yMax: isLog ? 1.5 : 8.0,
  });

  const targetCameraRef = useRef<CameraState>({
    xMin: 0,
    xMax: 4.0,
    yMin: 0,
    yMax: isLog ? 1.5 : 8.0,
  });

  const isDraggingRef = useRef<boolean>(false);
  const isScrubbingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; camXMin: number; camXMax: number; camYMin: number; camYMax: number }>({
    x: 0,
    y: 0,
    camXMin: 0,
    camXMax: 0,
    camYMin: 0,
    camYMax: 0,
  });

  const [mousePos, setMousePos] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
  const pulsePhaseRef = useRef<number>(0);

  const activeAlgos = ALGORITHMS.filter((algo) => selectedAlgoIds.includes(algo.id));

  const toPlotY = useCallback((ops: number, logMode: boolean) => {
    if (!logMode) return ops;
    return Math.log10(Math.max(1, ops));
  }, []);

  const handleResetView = useCallback(() => {
    setAutoCamera(true);
    if (currentN <= 0.1) {
      targetCameraRef.current = {
        xMin: 0,
        xMax: 4.0,
        yMin: 0,
        yMax: isLog ? 1.5 : 8.0,
      };
    } else {
      const maxActiveN = Math.max(currentN, 2.5);
      let maxPlotOps = isLog ? 0.5 : 4.0;

      for (const algo of activeAlgos) {
        const plotVal = isLog ? algo.evaluateLog10Ops(currentN) : algo.evaluateContinuousOps(currentN);
        if (plotVal > maxPlotOps) {
          maxPlotOps = plotVal;
        }
      }

      const desiredXMax = maxActiveN * 1.25;
      const desiredYMax = isLog ? Math.max(maxPlotOps * 1.2, 1.5) : Math.max(maxPlotOps * 1.25, 6.0);

      targetCameraRef.current = {
        xMin: 0,
        xMax: desiredXMax,
        yMin: 0,
        yMax: desiredYMax,
      };
    }
  }, [activeAlgos, currentN, isLog, setAutoCamera]);

  const handleManualZoom = useCallback((factor: number) => {
    setAutoCamera(false);
    const cam = cameraRef.current;
    const xSpan = (cam.xMax - cam.xMin) * factor;
    const ySpan = (cam.yMax - cam.yMin) * factor;

    targetCameraRef.current = {
      xMin: cam.xMin,
      xMax: cam.xMin + xSpan,
      yMin: cam.yMin,
      yMax: cam.yMin + ySpan,
    };
  }, [setAutoCamera]);

  // Conversões com margens seguras (Zero Sobreposição com barras superior e inferior)
  const worldToScreen = useCallback((wx: number, wy: number, width: number, height: number, cam: CameraState) => {
    const plotWidth = Math.max(10, width - PAD_LEFT - PAD_RIGHT);
    const plotHeight = Math.max(10, height - PAD_TOP - PAD_BOTTOM);
    const sx = PAD_LEFT + ((wx - cam.xMin) / (cam.xMax - cam.xMin)) * plotWidth;
    const sy = (height - PAD_BOTTOM) - ((wy - cam.yMin) / (cam.yMax - cam.yMin)) * plotHeight;
    return { sx, sy };
  }, []);

  const screenToWorld = useCallback((sx: number, sy: number, width: number, height: number, cam: CameraState) => {
    const plotWidth = Math.max(10, width - PAD_LEFT - PAD_RIGHT);
    const plotHeight = Math.max(10, height - PAD_TOP - PAD_BOTTOM);
    const wx = cam.xMin + ((sx - PAD_LEFT) / plotWidth) * (cam.xMax - cam.xMin);
    const wy = cam.yMin + (((height - PAD_BOTTOM) - sy) / plotHeight) * (cam.yMax - cam.yMin);
    return { wx, wy };
  }, []);

  // Loop de Renderização Principal (60/120 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      pulsePhaseRef.current += 0.04;

      // 1. CÂMERA DINÂMICA COM AUTO-ENQUADRAMENTO
      const cam = cameraRef.current;
      const targetCam = targetCameraRef.current;

      if (autoCamera) {
        if (currentN <= 0.05 || status === 'idle') {
          targetCam.xMin = 0;
          targetCam.xMax = 4.0;
          targetCam.yMin = 0;
          targetCam.yMax = isLog ? 1.5 : 8.0;
        } else {
          const maxActiveN = Math.max(currentN, 2.0);
          let maxPlotOps = isLog ? 0.5 : 4.0;

          for (const algo of activeAlgos) {
            const plotVal = isLog ? algo.evaluateLog10Ops(currentN) : algo.evaluateContinuousOps(currentN);
            if (plotVal > maxPlotOps) {
              maxPlotOps = plotVal;
            }
          }

          const desiredXMax = maxActiveN * 1.25;
          const desiredYMax = isLog ? Math.max(maxPlotOps * 1.2, 1.5) : Math.max(maxPlotOps * 1.25, 6.0);

          targetCam.xMin = 0;
          targetCam.xMax = desiredXMax;
          targetCam.yMin = 0;
          targetCam.yMax = desiredYMax;
        }

        // LERP Adaptativo
        let lerpFactor = 0.14;
        if (currentN > 0.05) {
          let maxTipScreenY = height;
          let maxTipScreenX = 0;

          for (const algo of activeAlgos) {
            const plotVal = isLog ? algo.evaluateLog10Ops(currentN) : algo.evaluateContinuousOps(currentN);
            const { sx, sy } = worldToScreen(currentN, plotVal, width, height, cam);
            if (sy < maxTipScreenY) maxTipScreenY = sy;
            if (sx > maxTipScreenX) maxTipScreenX = sx;
          }

          if (maxTipScreenY < PAD_TOP + 80 || maxTipScreenX > width - PAD_RIGHT - 80) {
            lerpFactor = 0.35;
          }
          if (maxTipScreenY < PAD_TOP + 30 || maxTipScreenX > width - PAD_RIGHT - 20) {
            lerpFactor = 0.7;
          }
        }

        cam.xMin += (targetCam.xMin - cam.xMin) * lerpFactor;
        cam.xMax += (targetCam.xMax - cam.xMax) * lerpFactor;
        cam.yMin += (targetCam.yMin - cam.yMin) * lerpFactor;
        cam.yMax += (targetCam.yMax - cam.yMax) * lerpFactor;
      } else {
        cam.xMin += (targetCam.xMin - cam.xMin) * 0.2;
        cam.xMax += (targetCam.xMax - cam.xMax) * 0.2;
        cam.yMin += (targetCam.yMin - cam.yMin) * 0.2;
        cam.yMax += (targetCam.yMax - cam.yMax) * 0.2;
      }

      // 2. Fundo Infinito Dark Tech
      const bgGrad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#0c1222');
      bgGrad.addColorStop(1, '#060911');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Grade Cartesiana Dinâmica
      const xRange = Math.max(0.1, cam.xMax - cam.xMin);
      const yRange = Math.max(0.1, cam.yMax - cam.yMin);
      const xStep = calculateGridStep(xRange, 10);
      const yStep = isLog ? (yRange < 4 ? 0.5 : 1) : calculateGridStep(yRange, 8);

      const firstGridX = Math.floor(cam.xMin / xStep) * xStep;
      const lastGridX = Math.ceil(cam.xMax / xStep) * xStep;
      const firstGridY = Math.floor(cam.yMin / yStep) * yStep;
      const lastGridY = Math.ceil(cam.yMax / yStep) * yStep;

      // Grade Menor
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const xSubStep = xStep / 5;
      const ySubStep = yStep / 5;

      ctx.beginPath();
      for (let x = Math.floor(cam.xMin / xSubStep) * xSubStep; x <= lastGridX; x += xSubStep) {
        const { sx } = worldToScreen(x, 0, width, height, cam);
        if (sx >= PAD_LEFT && sx <= width - PAD_RIGHT) {
          ctx.moveTo(sx, PAD_TOP);
          ctx.lineTo(sx, height - PAD_BOTTOM);
        }
      }
      for (let y = Math.floor(cam.yMin / ySubStep) * ySubStep; y <= lastGridY; y += ySubStep) {
        const { sy } = worldToScreen(0, y, width, height, cam);
        if (sy >= PAD_TOP && sy <= height - PAD_BOTTOM) {
          ctx.moveTo(PAD_LEFT, sy);
          ctx.lineTo(width - PAD_RIGHT, sy);
        }
      }
      ctx.stroke();

      // Grade Principal
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = firstGridX; x <= lastGridX; x += xStep) {
        const { sx } = worldToScreen(x, 0, width, height, cam);
        if (sx >= PAD_LEFT && sx <= width - PAD_RIGHT) {
          ctx.moveTo(sx, PAD_TOP);
          ctx.lineTo(sx, height - PAD_BOTTOM);
        }
      }
      for (let y = firstGridY; y <= lastGridY; y += yStep) {
        const { sy } = worldToScreen(0, y, width, height, cam);
        if (sy >= PAD_TOP && sy <= height - PAD_BOTTOM) {
          ctx.moveTo(PAD_LEFT, sy);
          ctx.lineTo(width - PAD_RIGHT, sy);
        }
      }
      ctx.stroke();

      // 4. Eixos Principais
      const origin = worldToScreen(0, 0, width, height, cam);

      // Eixo Y
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(origin.sx, PAD_TOP);
      ctx.lineTo(origin.sx, height - PAD_BOTTOM);
      ctx.stroke();

      // Eixo X
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, origin.sy);
      ctx.lineTo(width - PAD_RIGHT, origin.sy);
      ctx.stroke();

      // Marcadores Numéricos nos Eixos
      ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const labelYPos = Math.min(origin.sy + 8, height - PAD_BOTTOM + 6);
      for (let x = firstGridX; x <= lastGridX; x += xStep) {
        const { sx } = worldToScreen(x, 0, width, height, cam);
        if (sx >= PAD_LEFT - 5 && sx <= width - PAD_RIGHT + 5) {
          ctx.fillText(formatCompactNumber(x), sx, labelYPos);
        }
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const labelXPos = Math.max(origin.sx - 8, PAD_LEFT - 8);
      for (let y = firstGridY; y <= lastGridY; y += yStep) {
        const { sy } = worldToScreen(0, y, width, height, cam);
        if (sy >= PAD_TOP - 5 && sy <= height - PAD_BOTTOM + 5) {
          const displayVal = isLog
            ? `10^${y.toFixed(y % 1 === 0 ? 0 : 1)}`
            : formatCompactNumber(y);
          ctx.fillText(displayVal, labelXPos, sy);
        }
      }

      // Origem (0, 0)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(origin.sx, origin.sy, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Rótulos dos eixos
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 12px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Tamanho da Entrada (n) →', width - PAD_RIGHT, height - PAD_BOTTOM + 24);

      ctx.translate(PAD_LEFT - 40, PAD_TOP + 10);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'right';
      ctx.fillText(isLog ? 'log₁₀ Operações f(n) →' : 'Operações Totais f(n) →', 0, 0);
      ctx.restore();

      // 5. Renderização Contínua das Curvas
      for (const algo of activeAlgos) {
        drawContinuousCurve({
          ctx,
          algo,
          currentN,
          cam,
          width,
          height,
          scaleMode,
          pulsePhase: pulsePhaseRef.current,
          worldToScreen,
        });
      }

      // 6. LINHA GUIA VERTICAL DE PROGRESSO (Scrubber Line)
      if (currentN > 0) {
        const { sx: curScreenX } = worldToScreen(currentN, 0, width, height, cam);

        if (curScreenX >= PAD_LEFT && curScreenX <= width - PAD_RIGHT) {
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.setLineDash([6, 6]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(curScreenX, PAD_TOP);
          ctx.lineTo(curScreenX, height - PAD_BOTTOM);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tag de N no topo da linha guia
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          const tagText = `n = ${formatInteger(Math.round(currentN))}`;
          ctx.font = '700 11px "JetBrains Mono", monospace';
          const textWidth = ctx.measureText(tagText).width;
          const tagX = Math.min(Math.max(curScreenX - textWidth / 2 - 8, PAD_LEFT), width - PAD_RIGHT - textWidth - 16);

          ctx.beginPath();
          ctx.roundRect(tagX, PAD_TOP - 26, textWidth + 16, 20, 5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tagText, tagX + textWidth / 2 + 8, PAD_TOP - 16);
          ctx.restore();
        }
      }

      // 7. Mira / Crosshair Interativa do Mouse
      if (mousePos && mousePos.worldX >= 0 && mousePos.worldY >= 0) {
        const { sx, sy } = worldToScreen(mousePos.worldX, mousePos.worldY, width, height, cam);

        if (sx >= PAD_LEFT && sx <= width - PAD_RIGHT && sy >= PAD_TOP && sy <= height - PAD_BOTTOM) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(sx, PAD_TOP);
          ctx.lineTo(sx, height - PAD_BOTTOM);
          ctx.moveTo(PAD_LEFT, sy);
          ctx.lineTo(width - PAD_RIGHT, sy);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeAlgos, autoCamera, currentN, isLog, mousePos, scaleMode, status, toPlotY, worldToScreen]);

  // Manipuladores de Eventos do Mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = screenToWorld(sx, sy, canvas.clientWidth, canvas.clientHeight, cameraRef.current);

    if (e.shiftKey || Math.abs(world.wx - currentN) < (cameraRef.current.xMax - cameraRef.current.xMin) * 0.04) {
      isScrubbingRef.current = true;
      seekTo(world.wx);
      return;
    }

    isDraggingRef.current = true;
    setAutoCamera(false);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      camXMin: cameraRef.current.xMin,
      camXMax: cameraRef.current.xMax,
      camYMin: cameraRef.current.yMin,
      camYMax: cameraRef.current.yMax,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = screenToWorld(sx, sy, canvas.clientWidth, canvas.clientHeight, cameraRef.current);

    setMousePos({ x: sx, y: sy, worldX: world.wx, worldY: world.wy });

    if (isScrubbingRef.current) {
      seekTo(world.wx);
      return;
    }

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const plotWidth = Math.max(10, canvas.clientWidth - PAD_LEFT - PAD_RIGHT);
      const plotHeight = Math.max(10, canvas.clientHeight - PAD_TOP - PAD_BOTTOM);

      const xSpan = dragStartRef.current.camXMax - dragStartRef.current.camXMin;
      const ySpan = dragStartRef.current.camYMax - dragStartRef.current.camYMin;

      const worldDx = (dx / plotWidth) * xSpan;
      const worldDy = (dy / plotHeight) * ySpan;

      const newCam = {
        xMin: dragStartRef.current.camXMin - worldDx,
        xMax: dragStartRef.current.camXMax - worldDx,
        yMin: dragStartRef.current.camYMin + worldDy,
        yMax: dragStartRef.current.camYMax + worldDy,
      };

      cameraRef.current = newCam;
      targetCameraRef.current = newCam;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isScrubbingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setAutoCamera(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87;
    const cam = cameraRef.current;
    const worldCenter = screenToWorld(sx, sy, canvas.clientWidth, canvas.clientHeight, cam);

    const newXMin = worldCenter.wx + (cam.xMin - worldCenter.wx) * zoomFactor;
    const newXMax = worldCenter.wx + (cam.xMax - worldCenter.wx) * zoomFactor;
    const newYMin = worldCenter.wy + (cam.yMin - worldCenter.wy) * zoomFactor;
    const newYMax = worldCenter.wy + (cam.yMax - worldCenter.wy) * zoomFactor;

    targetCameraRef.current = {
      xMin: newXMin,
      xMax: newXMax,
      yMin: newYMin,
      yMax: newYMax,
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: isDraggingRef.current ? 'grabbing' : isScrubbingRef.current ? 'ew-resize' : 'crosshair',
        userSelect: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setMousePos(null);
        }}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* Quick Viewport Controls (Top Left) */}
      <div
        style={{
          position: 'absolute',
          top: '84px',
          left: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 20,
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(51, 65, 85, 0.7)',
            borderRadius: '12px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <button
            onClick={() => handleManualZoom(0.7)}
            title="Aproximar Zoom"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <ZoomIn size={18} />
          </button>

          <button
            onClick={() => handleManualZoom(1.4)}
            title="Afastar Zoom"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <ZoomOut size={18} />
          </button>

          <div style={{ height: '1px', background: '#334155', margin: '2px 4px' }} />

          {/* Toggle Escala Linear / Logarítmica */}
          <button
            onClick={() => setScaleMode(isLog ? 'linear' : 'log10')}
            title={isLog ? 'Alternar para Escala Linear' : 'Alternar para Escala Logarítmica (log₁₀)'}
            style={{
              background: isLog ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              border: isLog ? '1px solid #c084fc' : '1px solid transparent',
              color: isLog ? '#c084fc' : '#94a3b8',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {isLog ? <TrendingUp size={18} /> : <BarChart size={18} />}
          </button>

          <button
            onClick={handleResetView}
            title="Auto Câmera / Seguir Curva Dinamicamente"
            style={{
              background: autoCamera ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              border: autoCamera ? '1px solid #38bdf8' : '1px solid transparent',
              color: autoCamera ? '#38bdf8' : '#94a3b8',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <Compass size={18} />
          </button>

          <button
            onClick={handleResetView}
            title="Centralizar Visualização"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Floating Mouse Coordinates Inspector Badge */}
      {mousePos && mousePos.worldX >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(mousePos.x + 16, window.innerWidth - 240)}px`,
            top: `${Math.min(mousePos.y + 16, window.innerHeight - 200)}px`,
            pointerEvents: 'none',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '0.8rem',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            color: '#e2e8f0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
            <Crosshair size={12} color="#38bdf8" />
            <span>Ponto (n = {formatInteger(Math.max(0, mousePos.worldX))})</span>
          </div>

          {activeAlgos.map((algo) => {
            const ops = algo.evaluateContinuousOps(Math.max(0, Math.round(mousePos.worldX)));
            return (
              <div key={algo.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: algo.color, fontWeight: 600 }}>{algo.name}:</span>
                <span style={{ color: '#f8fafc' }}>{formatCompactNumber(ops)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
