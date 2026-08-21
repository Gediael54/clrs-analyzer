import { useEffect, useState } from 'react'
import { Cpu } from 'lucide-react'
import SidePanel from './components/SidePanel'
import ScoreBoard from './components/ScoreBoard'
import type { Metrics } from './components/ScoreBoard'

export default function App() {
  const [wasmModule, setWasmModule] = useState<any>(null)
  const [arraySize, setArraySize] = useState<number>(1000)
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/wasm/clrs_engine.js'
    script.onload = () => {
      ;(window as any).loadCLRSModule().then((mod: any) => {
        setWasmModule(mod)
      })
    }
    document.body.appendChild(script)
  }, [])

  const runSimulation = () => {
    if (!wasmModule) return

    const vec = new wasmModule.VectorInt();

    for (let i = 0; i < arraySize; i++) {
      vec.push_back(arraySize - i);
    }
    
    const res: Metrics = wasmModule.insertionSort(vec)

    setMetrics(res)
  }

  return (
    <div
      style={{
        background: '#0f172a',
        color: '#f8fafc',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '2rem'
        }}
      >
        <Cpu color="#38bdf8" size={32} />
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          {' '}
          CLRS Asymtotic Engine (C++ / WASM)
        </h1>
      </header>

      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '2rem'
        }}
      >
        <SidePanel
          arraySize={arraySize}
          setArraySize={setArraySize}
          runSimulation={runSimulation}
          isWasmLoaded={!!wasmModule}
        />

        <ScoreBoard metrics={metrics} />
      </main>
    </div>
  )
}
