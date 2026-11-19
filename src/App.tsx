import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { HexWorld } from './platform/HexWorld'
import { Lighting } from './platform/Lighting'
import { BuildBayScene } from './platform/BuildBayScene'
import { FloatingPanels } from './panels/FloatingPanels'
import { useBuildBayLocal } from './panels/BuildBayPanel'

export type AppView = 'city' | 'buildbay'

export default function App() {
  const [view, setView] = useState<AppView>('city')
  const bay = useBuildBayLocal()

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
        pointerEvents: 'none', textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
          HEXLAB<span style={{ color: '#06b6d4' }}>.SOMACOSF.COM</span>
        </div>
        <div style={{ fontSize: 10, opacity: 0.55, fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>
          {view === 'city'
            ? 'MODULAR TRI-AXIAL MARINE CITY · HEX TUBE CELLS · VERTEX TOWERS'
            : 'BUILD BAY · INFRA KIT · SECTION / CELL / TOWER / MATRIX'}
        </div>
      </div>

      <div style={{
        position: 'absolute', top: 52, left: '50%', transform: 'translateX(-50%)', zIndex: 25,
        display: 'flex', gap: 6, pointerEvents: 'auto',
      }}>
        <button
          onClick={() => setView('city')}
          style={{
            fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700,
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
            border: `1px solid ${view === 'city' ? '#06b6d4' : '#1e293b'}`,
            color: view === 'city' ? '#06b6d4' : '#94a3b8',
            background: view === 'city' ? '#06b6d418' : '#0a1018cc',
          }}
        >
          CITY ARRAY
        </button>
        <button
          onClick={() => setView('buildbay')}
          style={{
            fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700,
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
            border: `1px solid ${view === 'buildbay' ? '#f59e0b' : '#1e293b'}`,
            color: view === 'buildbay' ? '#f59e0b' : '#94a3b8',
            background: view === 'buildbay' ? '#f59e0b18' : '#0a1018cc',
          }}
        >
          BUILD BAY
        </button>
      </div>

      <Canvas
        camera={{ position: view === 'buildbay' ? [6, 7, 6] : [18, 20, 18], fov: 40 }}
        style={{ position: 'absolute', inset: 0 }}
        shadows
        gl={{ antialias: true, toneMapping: 3 }}
      >
        <color attach="background" args={['#0a1220']} />
        <fog attach="fog" args={['#0a1220', 32, 70]} />
        <Lighting />
        {view === 'city' ? <HexWorld /> : <BuildBayScene bay={bay} />}
        <Grid
          args={[80, 80]}
          cellSize={1}
          cellThickness={0.25}
          sectionSize={4}
          sectionThickness={0.7}
          sectionColor="#1e3a5f"
          cellColor="#132033"
          fadeDistance={50}
          position={[0, -0.02, 0]}
        />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={3} maxDistance={60} />
      </Canvas>

      <FloatingPanels view={view} bay={bay} />
    </div>
  )
}
