import { useState } from 'react';
import type { Metrics } from '../types/simulation';
import { ALGORITHMS } from '../domain/algorithms';
import { formatCompactNumber, formatInteger, formatExecutionTime } from '../utils/mathFormat';
import { Activity, ChevronDown, ChevronUp, Layers, Award } from 'lucide-react';

interface FloatingScoreboardProps {
  currentN: number;
  status: string;
  selectedAlgoIds: string[];
  activeMetrics: Record<string, Metrics>;
}

export default function FloatingScoreboard({
  currentN,
  status,
  selectedAlgoIds,
  activeMetrics,
}: FloatingScoreboardProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const roundedN = Math.round(currentN);
  const activeAlgos = ALGORITHMS.filter((algo) => selectedAlgoIds.includes(algo.id));

  // Ordena os algoritmos do mais eficiente (menos operações) para o menos eficiente
  const rankedAlgos = activeAlgos
    .map((algo) => {
      const m = activeMetrics[algo.id] || {
        comparisons: 0,
        assignments: 0,
        time_microseconds: 0,
        totalOps: 0,
      };
      return { algo, metrics: m };
    })
    .sort((a, b) => a.metrics.totalOps - b.metrics.totalOps);

  const best = rankedAlgos[0];
  const worst = rankedAlgos[rankedAlgos.length - 1];
  const ratio = best && worst && best.metrics.totalOps > 0
    ? (worst.metrics.totalOps / Math.max(1, best.metrics.totalOps)).toFixed(1)
    : '1.0';

  return (
    <div
      style={{
        position: 'fixed',
        top: '76px',
        right: '24px',
        width: isMinimized ? 'auto' : '360px',
        maxHeight: isMinimized ? 'auto' : 'calc(100vh - 170px)',
        overflowY: 'auto',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(51, 65, 85, 0.7)',
        borderRadius: '16px',
        padding: isMinimized ? '10px 16px' : '14px 18px',
        color: '#f8fafc',
        zIndex: 25,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
            Métricas em Tempo Real
          </span>
        </div>

        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {!isMinimized && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Amostra N Atual */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '10px',
              padding: '8px 12px',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={15} color="#38bdf8" />
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Amostra (N):</span>
            </div>
            <span
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#38bdf8',
              }}
            >
              {formatInteger(roundedN)}
            </span>
          </div>

          {/* Destaque de Vantagem / Razão Assintótica */}
          {rankedAlgos.length > 1 && roundedN > 10 && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(56, 189, 248, 0.05))',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '10px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={18} color="#4ade80" />
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.3' }}>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>
                  {best.algo.name} é {ratio}x mais eficiente
                </span>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem' }}>
                  Razão f₁(n)/f₂(n) cresce com N proporcionalmente à complexidade assintótica.
                </span>
              </div>
            </div>
          )}

          {/* Lista de Algoritmos Classificados */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rankedAlgos.map(({ algo, metrics }) => (
              <div
                key={algo.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${algo.color}40`,
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: algo.color,
                        boxShadow: `0 0 6px ${algo.color}`,
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                      {algo.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: algo.color,
                    }}
                  >
                    {algo.complexityLabel}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Operações Totais:</span>
                    <div
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: algo.color,
                      }}
                    >
                      {formatCompactNumber(metrics.totalOps)}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'right' }}>
                    <div>Tempo: <span style={{ color: '#e2e8f0' }}>{formatExecutionTime(metrics.time_microseconds)}</span></div>
                    <div>Comp: <span style={{ color: '#e2e8f0' }}>{formatCompactNumber(metrics.comparisons)}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {status === 'idle' && (
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
              Pressione Executar na barra inferior para iniciar a simulação.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
