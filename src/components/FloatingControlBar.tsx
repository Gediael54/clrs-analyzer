import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  FastForward,
  Sliders,
  Sparkles,
  Gauge,
} from 'lucide-react';
import type { SimulationStatus } from '../types/simulation';
import type { SpeedMode } from '../domain/timeline';
import { formatCompactNumber, formatInteger } from '../utils/mathFormat';

interface FloatingControlBarProps {
  arraySize: number;
  setArraySize: (size: number) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
  speedMode: SpeedMode;
  setSpeedMode: (mode: SpeedMode) => void;
  status: SimulationStatus;
  currentN: number;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  stepForward: () => void;
  seekTo: (n: number) => void;
  isWasmLoaded: boolean;
  autoCamera: boolean;
  setAutoCamera: (auto: boolean) => void;
}

const PRESET_SIZES = [500, 1500, 3000, 6000, 12000, 25000, 50000];
const SPEED_OPTIONS = [0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];

export default function FloatingControlBar({
  arraySize,
  setArraySize,
  speedMultiplier,
  setSpeedMultiplier,
  speedMode,
  setSpeedMode,
  status,
  currentN,
  startSimulation,
  pauseSimulation,
  resetSimulation,
  stepForward,
  seekTo,
  isWasmLoaded,
  autoCamera,
  setAutoCamera,
}: FloatingControlBarProps) {
  const [customInputVal, setCustomInputVal] = useState<string>(arraySize.toString());
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    setCustomInputVal(arraySize.toString());
  }, [arraySize]);

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInputVal(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 100000) {
      setArraySize(num);
    }
  };

  const handleCustomInputBlur = () => {
    let num = parseInt(customInputVal, 10);
    if (isNaN(num) || num < 50) num = 50;
    if (num > 100000) num = 100000;
    setCustomInputVal(num.toString());
    setArraySize(num);
  };

  const selectPreset = (size: number) => {
    setArraySize(size);
    setCustomInputVal(size.toString());
  };

  const isRunning = status === 'running';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        width: 'calc(100% - 32px)',
        maxWidth: '980px',
      }}
    >
      {/* Painel Expansível de Configurações Avançadas e Presets */}
      {showSettings && (
        <div
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(51, 65, 85, 0.7)',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={16} /> Ajuste da Entrada Máxima (N)
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Presets:</span>
              {PRESET_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => selectPreset(size)}
                  style={{
                    background: arraySize === size ? '#0284c7' : 'rgba(30, 41, 59, 0.7)',
                    border: arraySize === size ? '1px solid #38bdf8' : '1px solid #334155',
                    color: arraySize === size ? '#ffffff' : '#94a3b8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {formatCompactNumber(size)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={Math.min(arraySize, 50000)}
              disabled={isRunning}
              onChange={(e) => {
                const val = Number(e.target.value);
                setArraySize(val);
                setCustomInputVal(val.toString());
              }}
              style={{
                flex: 1,
                accentColor: '#38bdf8',
                cursor: isRunning ? 'not-allowed' : 'pointer',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>N Máximo:</span>
              <input
                type="number"
                min="50"
                max="100000"
                value={customInputVal}
                disabled={isRunning}
                onChange={handleCustomInputChange}
                onBlur={handleCustomInputBlur}
                style={{
                  width: '90px',
                  background: '#090d16',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textAlign: 'right',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Linha Scrubber de Progresso com Arrastar Direto */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          borderRadius: '10px',
          padding: '4px 14px',
        }}
      >
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', minWidth: '45px' }}>
          0
        </span>
        <input
          type="range"
          min="0"
          max={arraySize}
          step="0.1"
          value={currentN}
          onChange={(e) => seekTo(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: '#38bdf8',
            cursor: 'ew-resize',
            height: '4px',
          }}
        />
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>
          {formatInteger(Math.round(currentN))} / {formatCompactNumber(arraySize)}
        </span>
      </div>

      {/* Barra Principal de Controle (Dock Flutuante) */}
      <div
        style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '18px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Bloco 1: Ações Principais (Play, Pause, Step, Reset) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isRunning ? (
            <button
              onClick={startSimulation}
              disabled={!isWasmLoaded}
              title="Iniciar Simulação Cartesiana"
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '12px',
                padding: '9px 16px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: !isWasmLoaded ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              }}
            >
              <Play size={17} fill="#ffffff" />
              <span>Executar</span>
            </button>
          ) : (
            <button
              onClick={pauseSimulation}
              title="Pausar Simulação"
              style={{
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: '12px',
                padding: '9px 16px',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 179, 8, 0.4)',
              }}
            >
              <Pause size={17} fill="#0f172a" />
              <span>Pausar</span>
            </button>
          )}

          <button
            onClick={stepForward}
            title="Avançar Passo a Passo"
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(51, 65, 85, 0.7)',
              borderRadius: '10px',
              padding: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <StepForward size={16} />
          </button>

          <button
            onClick={resetSimulation}
            title="Reiniciar Simulação para N = 0"
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(51, 65, 85, 0.7)',
              borderRadius: '10px',
              padding: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Bloco 2: Seletor de Velocidades Finas & Modo Adaptativo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setSpeedMode(speedMode === 'adaptive' ? 'constant' : 'adaptive')}
            title={speedMode === 'adaptive' ? 'Modo Adaptativo (suaviza início e escala)' : 'Modo Linear Constante'}
            style={{
              background: speedMode === 'adaptive' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.6)',
              border: speedMode === 'adaptive' ? '1px solid #38bdf8' : '1px solid #334155',
              color: speedMode === 'adaptive' ? '#38bdf8' : '#94a3b8',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Gauge size={13} />
            <span>{speedMode === 'adaptive' ? 'Adaptativo' : 'Linear'}</span>
          </button>

          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '2px',
              gap: '2px',
              overflowX: 'auto',
              maxWidth: '360px',
            }}
          >
            {SPEED_OPTIONS.map((spd) => {
              const label = spd < 0.01 ? `${spd}x` : spd < 1 ? `${spd}x` : `${spd}x`;
              return (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  style={{
                    background: speedMultiplier === spd ? '#38bdf8' : 'transparent',
                    border: 'none',
                    color: speedMultiplier === spd ? '#0f172a' : '#94a3b8',
                    padding: '3px 6px',
                    borderRadius: '5px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bloco 3: Tamanho N & Botão de Configurações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Ajustar N Máximo e Presets"
            style={{
              background: showSettings ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.7)',
              border: showSettings ? '1px solid #38bdf8' : '1px solid #334155',
              color: showSettings ? '#38bdf8' : '#94a3b8',
              borderRadius: '10px',
              padding: '7px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Sliders size={15} />
            <span>N: {formatCompactNumber(arraySize)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
