import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { HexWorld } from './platform/HexWorld'
import { Lighting } from './platform/Lighting'
import { FloatingPanels } from './panels/FloatingPanels'

export default function App() {
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
          MODULAR TRI-AXIAL MARINE ARCHITECTURE · ANYMACHINE / ANYKIT CONSTRUCTION SET
        </div>
      </div>

      <Canvas
        camera={{ position: [18, 20, 18], fov: 40 }}
        style={{ position: 'absolute', inset: 0 }}
        shadows
        gl={{ antialias: true, toneMapping: 3 }}
      >
        <color attach="background" args={['#0a1220']} />
        <fog attach="fog" args={['#0a1220', 32, 70]} />
        <Lighting />
        <HexWorld />
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
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={6} maxDistance={60} />
      </Canvas>

      <FloatingPanels />
    </div>
  )
}
