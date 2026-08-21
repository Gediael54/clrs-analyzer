import { Play } from "lucide-react"

interface SidePanelProps {
  arraySize: number
  setArraySize: (size: number) => void
  runSimulation: () => void
  isWasmLoaded: boolean
}
export default function SidePanel({
  arraySize,
  setArraySize,
  runSimulation,
  isWasmLoaded
}: SidePanelProps) {
  return (
    <div
      style={{
        background: '#1e293b',
        padding: '1.5rem',
        borderRadius: '16',
        border: '1px solid #334155'
      }}
    >
      <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>Controles da Entrada</h2>

      <label style={{ display: 'block', marginBottom: '1.5rem' }}>
        Tamanho da Entrada ($n$):{' '}
        <strong style={{ color: '#38bdf8' }}>{arraySize}</strong>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={arraySize}
          onChange={(e) => setArraySize(Number(e.target.value))}
          style={{ width: '100%', marginTop: '0.5rem', accentColor: '#38bdf8' }}
        />
      </label>

      <button
        onClick={runSimulation}
        disabled={!isWasmLoaded}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: 'none',
          background: isWasmLoaded ? '#0284c7' : '#475569',
          color: '#fff',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: isWasmLoaded ? 'pointer' : 'not-allowed'
        }}
      >
        <Play size={18} />{' '}
        {isWasmLoaded ? 'Rodar Simulação' : 'Carregando WASM...'}
      </button>
    </div>
  )
}
