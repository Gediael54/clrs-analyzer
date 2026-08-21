import { BarChart2 } from 'lucide-react'

export interface Metrics {
  comparisons: number
  assignments: number
  time_microseconds: number
}

interface ScoreBoardProps {
  metrics: Metrics | null
}

export default function ScoreBoard({ metrics }: ScoreBoardProps) {
  return (
    <div
      style={{
        background: '#1e293b',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid #334155'
      }}
    >
      <h2
        style={{
          fontSize: '1.1rem',
          marginTop: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <BarChart2 color="#38bdf8" /> Métricas do Insertion Sort ($O(n^2)$)
      </h2>

      {metrics ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginTop: '1.5rem'
          }}
        >
          <div
            style={{
              background: '#0f172a',
              padding: '1.2rem',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}
          >
            <small style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Comparações
            </small>
            <p
              style={{
                fontSize: '1.6rem',
                margin: '0.5rem 0 0 0',
                fontWeight: 'bold',
                color: '#f43f5e'
              }}
            >
              {metrics.comparisons.toLocaleString()}
            </p>
          </div>
          <div
            style={{
              background: '#0f172a',
              padding: '1.2rem',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}
          >
            <small style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {' '}
              Atribuições
            </small>
            <p
              style={{
                fontSize: '1.6rem',
                margin: '0.5rem 0 0 0',
                fontWeight: 'bold',
                color: '#fbbf24'
              }}
            >
              {metrics.assignments.toLocaleString()}
            </p>
          </div>
          <div
            style={{
              background: '#0f172a',
              padding: '1.2rem',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}
          >
            <small
              style={{
                color: '#94a3b8',
                fontSize: '0.85rem'
              }}
            >
              Tempo de CPU
            </small>
            <p
              style={{
                fontSize: '1.6rem',
                margin: '0.5rem 0 0 0',
                fontWeight: 'bold',
                color: '#34d399'
              }}
            >
              {(metrics.time_microseconds / 1000).toFixed(2)} ms
            </p>
          </div>
        </div>
      ) : (
        <p style={{ color: '#94a3b8', marginTop: '2rem' }}>
          Ajuste a entrada e clique em 'Rodar Simulação' para medir a execução
          do C++.
        </p>
      )}
      
    </div>
  )
}
