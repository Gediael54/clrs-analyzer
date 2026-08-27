import { Cpu, Sparkles, HelpCircle, Layers, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { AVAILABLE_ALGORITHMS } from '../algorithms';
import type { ScaleMode } from '../types/simulation';

interface HeaderHUDProps {
  isWasmLoaded: boolean;
  status: string;
  selectedAlgoIds: string[];
  toggleAlgorithm: (id: string) => void;
  scaleMode: ScaleMode;
  setScaleMode: (mode: ScaleMode) => void;
}

export default function HeaderHUD({
  isWasmLoaded,
  status,
  selectedAlgoIds,
  toggleAlgorithm,
  scaleMode,
  setScaleMode,
}: HeaderHUDProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAlgoSelector, setShowAlgoSelector] = useState(false);

  const activeAlgos = AVAILABLE_ALGORITHMS.filter((algo) => selectedAlgoIds.includes(algo.id));

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '1240px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          borderRadius: '16px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Lado Esquerdo: Identidade do Motor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.05))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cpu color="#38bdf8" size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#f8fafc',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                CLRS Asymptotic Engine
              </h1>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '999px',
                  background: isWasmLoaded ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  border: isWasmLoaded ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(234, 179, 8, 0.4)',
                  color: isWasmLoaded ? '#4ade80' : '#facc15',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isWasmLoaded ? '#4ade80' : '#facc15',
                  }}
                />
                {isWasmLoaded ? 'C++ WASM O3' : 'Analítico'}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.72rem',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{activeAlgos.length} algoritmos ativos</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: scaleMode === 'log10' ? '#c084fc' : '#38bdf8' }}>
                Escala {scaleMode === 'log10' ? 'Logarítmica (log₁₀)' : 'Linear'}
              </span>
            </p>
          </div>
        </div>

        {/* Lado Direito: Badges dos Algoritmos Ativos e Botão de Seleção */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '480px' }}>
            {activeAlgos.slice(0, 4).map((algo) => (
              <div
                key={algo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${algo.color}55`,
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: algo.color,
                    boxShadow: `0 0 6px ${algo.color}`,
                  }}
                />
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{algo.name}</span>
                <span style={{ fontFamily: 'monospace', color: algo.color, fontWeight: 700 }}>
                  {algo.complexityLabel}
                </span>
              </div>
            ))}
            {activeAlgos.length > 4 && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0 4px' }}>
                +{activeAlgos.length - 4}
              </span>
            )}
          </div>

          {/* Botão Selecionar Algoritmos */}
          <button
            onClick={() => setShowAlgoSelector(!showAlgoSelector)}
            title="Selecionar e Comparar Algoritmos"
            style={{
              background: showAlgoSelector ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.8)',
              border: showAlgoSelector ? '1px solid #38bdf8' : '1px solid #334155',
              color: showAlgoSelector ? '#38bdf8' : '#e2e8f0',
              borderRadius: '10px',
              padding: '7px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <Layers size={16} />
            <span>Algoritmos</span>
          </button>

          {/* Botão de Explicação da Lógica Assintótica */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            title="Entenda a Lógica das Curvas e Operações"
            style={{
              background: showExplanation ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.8)',
              border: showExplanation ? '1px solid #38bdf8' : '1px solid #334155',
              color: showExplanation ? '#38bdf8' : '#94a3b8',
              borderRadius: '10px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* Modal Seletor de Algoritmos */}
      {showAlgoSelector && (
        <div
          style={{
            position: 'fixed',
            top: '74px',
            right: '24px',
            width: '380px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            zIndex: 40,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
            color: '#e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} /> Algoritmos Disponíveis
            </h3>
            <button
              onClick={() => setShowAlgoSelector(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Selecione quais algoritmos traçar no plano cartesiano simultaneamente:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {AVAILABLE_ALGORITHMS.map((algo) => {
              const isSelected = selectedAlgoIds.includes(algo.id);
              return (
                <div
                  key={algo.id}
                  onClick={() => toggleAlgorithm(algo.id)}
                  style={{
                    background: isSelected ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.5)',
                    border: isSelected ? `1px solid ${algo.color}` : '1px solid rgba(51, 65, 85, 0.6)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ accentColor: algo.color, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: isSelected ? '#ffffff' : '#94a3b8' }}>
                        {algo.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {algo.description}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: algo.color,
                      background: 'rgba(0,0,0,0.3)',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                  >
                    {algo.complexityLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Explicativo da Lógica Assintótica e das Curvas */}
      {showExplanation && (
        <div
          style={{
            position: 'fixed',
            top: '74px',
            right: '24px',
            maxWidth: '460px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '16px',
            padding: '18px',
            zIndex: 40,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
            color: '#e2e8f0',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} /> Entenda a Lógica do Gráfico CLRS
            </h3>
            <button
              onClick={() => setShowExplanation(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: '1.45' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
              <strong style={{ color: '#38bdf8' }}>1. O que é o Eixo Y (Operações f(n))?</strong>
              <p style={{ margin: '4px 0 0 0', color: '#cbd5e1' }}>
                No modelo de máquina RAM do livro <em>CLRS</em>, a complexidade é medida pelo número de <strong>operações primitivas</strong> (comparações entre chaves e movimentações/atribuições de memória) executadas para uma entrada de tamanho $n$.
              </p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #c084fc' }}>
              <strong style={{ color: '#c084fc' }}>2. Por que o Merge Sort parece "reto/baixo" na Escala Linear?</strong>
              <p style={{ margin: '4px 0 0 0', color: '#cbd5e1' }}>
                Para $N = 3.000$, o Insertion Sort $O(n^2)$ realiza $\approx 13.500.000$ operações, enquanto o Merge Sort $O(n \log n)$ realiza apenas $\approx 86.000$ operações. A diferença é de mais de <strong>150x</strong>! Na escala linear, o valor menor fica comprimido rente ao zero.
              </p>
            </div>

            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #4ade80' }}>
              <strong style={{ color: '#4ade80' }}>3. Dica: Use a Escala Logarítmica (log₁₀)</strong>
              <p style={{ margin: '4px 0 0 0', color: '#cbd5e1' }}>
                Clique no botão de escala no canto superior esquerdo do gráfico para alternar para <strong>log₁₀</strong>. Nela, cada ordem de complexidade ($\mathcal{O}(1)$, $\mathcal{O}(\log n)$, $\mathcal{O}(n)$, $\mathcal{O}(n \log n)$, $\mathcal{O}(n^2)$, $\mathcal{O}(n^3)$) ganha uma inclinação geométrica nítida e visível simultaneamente!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
