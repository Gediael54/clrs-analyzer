import { useState } from 'react';
import { useCLRSModule } from './hooks/useCLRSModule';
import { useSimulation } from './hooks/useSimulation';
import type { ScaleMode } from './types/simulation';
import InfiniteCartesianCanvas from './components/InfiniteCartesianCanvas';
import HeaderHUD from './components/HeaderHUD';
import FloatingControlBar from './components/FloatingControlBar';
import FloatingScoreboard from './components/FloatingScoreboard';

export default function App() {
  const { module: wasmModule, isLoading, error } = useCLRSModule();
  const [autoCamera, setAutoCamera] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('linear');

  const {
    arraySize,
    setArraySize,
    speedMultiplier,
    setSpeedMultiplier,
    speedMode,
    setSpeedMode,
    status,
    currentN,
    activeMetrics,
    selectedAlgoIds,
    toggleAlgorithm,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    stepForward,
    seekTo,
  } = useSimulation({ wasmModule });

  const isWasmLoaded = !isLoading && !!wasmModule;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Plano Cartesiano Infinito de Tela Inteira com Linha Guia e Zoom Microscópico */}
      <InfiniteCartesianCanvas
        currentN={currentN}
        arraySize={arraySize}
        status={status}
        autoCamera={autoCamera}
        setAutoCamera={setAutoCamera}
        selectedAlgoIds={selectedAlgoIds}
        scaleMode={scaleMode}
        setScaleMode={setScaleMode}
        seekTo={seekTo}
      />

      {/* 2. Barra Superior Flutuante (Header HUD & Seletor de Algoritmos) */}
      <HeaderHUD
        isWasmLoaded={isWasmLoaded}
        status={status}
        selectedAlgoIds={selectedAlgoIds}
        toggleAlgorithm={toggleAlgorithm}
        scaleMode={scaleMode}
        setScaleMode={setScaleMode}
      />

      {/* 3. Painel de Métricas Flutuante em Tempo Real com Ranking */}
      <FloatingScoreboard
        currentN={currentN}
        status={status}
        selectedAlgoIds={selectedAlgoIds}
        activeMetrics={activeMetrics}
      />

      {/* 4. Barra de Controle Dinâmica Flutuante com Velocidades Ultra-Finas e Scrubber */}
      <FloatingControlBar
        arraySize={arraySize}
        setArraySize={setArraySize}
        speedMultiplier={speedMultiplier}
        setSpeedMultiplier={setSpeedMultiplier}
        speedMode={speedMode}
        setSpeedMode={setSpeedMode}
        status={status}
        currentN={currentN}
        startSimulation={startSimulation}
        pauseSimulation={pauseSimulation}
        resetSimulation={() => {
          resetSimulation();
          setAutoCamera(true);
        }}
        stepForward={stepForward}
        seekTo={seekTo}
        isWasmLoaded={isWasmLoaded}
        autoCamera={autoCamera}
        setAutoCamera={setAutoCamera}
      />

      {/* Alerta de Erro */}
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#450a0a',
            color: '#fca5a5',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #7f1d1d',
            fontSize: '0.85rem',
            zIndex: 40,
          }}
        >
          {error} (utilizando modelos analíticos certificados)
        </div>
      )}
    </div>
  );
}