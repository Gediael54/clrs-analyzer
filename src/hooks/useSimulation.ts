import { useState, useRef, useCallback, useEffect } from 'react';
import type { SimulationStatus, Metrics } from '../types/simulation';
import { ALGORITHMS } from '../domain/algorithms';
import { calculateNextN, type SpeedMode } from '../domain/timeline';

interface UseSimulationOptions {
  wasmModule: any;
}

export function useSimulation({ wasmModule }: UseSimulationOptions) {
  const [arraySize, setArraySize] = useState<number>(3000);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(0.25); // Velocidade inicial suave
  const [speedMode, setSpeedMode] = useState<SpeedMode>('adaptive'); // Modo adaptativo de visualização
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [currentN, setCurrentN] = useState<number>(0);
  const [selectedAlgoIds, setSelectedAlgoIds] = useState<string[]>([
    'linear_search',
    'merge_sort',
    'insertion_sort',
  ]);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const statusRef = useRef<SimulationStatus>('idle');
  const speedRef = useRef<number>(speedMultiplier);
  const speedModeRef = useRef<SpeedMode>(speedMode);
  const currentNRef = useRef<number>(0);
  const arraySizeRef = useRef<number>(arraySize);
  const selectedAlgoIdsRef = useRef<string[]>(selectedAlgoIds);

  statusRef.current = status;
  speedRef.current = speedMultiplier;
  speedModeRef.current = speedMode;
  currentNRef.current = currentN;
  arraySizeRef.current = arraySize;
  selectedAlgoIdsRef.current = selectedAlgoIds;

  const toggleAlgorithm = useCallback((id: string) => {
    setSelectedAlgoIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const seekTo = useCallback((n: number) => {
    const clamped = Math.max(0, Math.min(n, arraySizeRef.current));
    setCurrentN(clamped);
    currentNRef.current = clamped;
    if (clamped >= arraySizeRef.current) {
      setStatus('finished');
    }
  }, []);

  // Loop de animação desacoplado via timeline domain
  const runAnimationLoop = useCallback((timestamp: number) => {
    if (statusRef.current !== 'running') return;

    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = timestamp;

    const nextN = calculateNextN(
      currentNRef.current,
      arraySizeRef.current,
      speedRef.current,
      speedModeRef.current,
      delta
    );

    if (nextN >= arraySizeRef.current) {
      setCurrentN(arraySizeRef.current);
      currentNRef.current = arraySizeRef.current;
      setStatus('finished');
      statusRef.current = 'finished';
      return;
    } else {
      setCurrentN(nextN);
      currentNRef.current = nextN;
    }

    animFrameRef.current = requestAnimationFrame(runAnimationLoop);
  }, []);

  const startSimulation = useCallback(() => {
    if (currentNRef.current >= arraySizeRef.current) {
      setCurrentN(0);
      currentNRef.current = 0;
    }

    setStatus('running');
    statusRef.current = 'running';
    lastTimeRef.current = 0;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    animFrameRef.current = requestAnimationFrame(runAnimationLoop);
  }, [runAnimationLoop]);

  const pauseSimulation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setStatus('paused');
    statusRef.current = 'paused';
    lastTimeRef.current = 0;
  }, []);

  const resetSimulation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setStatus('idle');
    statusRef.current = 'idle';
    setCurrentN(0);
    currentNRef.current = 0;
    lastTimeRef.current = 0;
  }, []);

  const stepForward = useCallback(() => {
    if (statusRef.current === 'running') {
      pauseSimulation();
    }

    const maxN = arraySizeRef.current;
    const stepSize = Math.max(1, Math.round(maxN / 50));
    const nextN = Math.min(currentNRef.current + stepSize, maxN);

    setCurrentN(nextN);
    currentNRef.current = nextN;

    if (nextN >= maxN) {
      setStatus('finished');
    } else {
      setStatus('paused');
    }
  }, [pauseSimulation]);

  useEffect(() => {
    if (status === 'idle') {
      setCurrentN(0);
      currentNRef.current = 0;
    }
  }, [arraySize, status]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const activeMetrics: Record<string, Metrics> = {};
  const roundedN = Math.round(currentN);
  const activeAlgos = ALGORITHMS.filter((algo) => selectedAlgoIds.includes(algo.id));

  for (const algo of activeAlgos) {
    activeMetrics[algo.id] = algo.getMetrics(roundedN, wasmModule);
  }

  return {
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
  };
}
