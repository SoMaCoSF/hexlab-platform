import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { HexWorld } from './platform/HexWorld'
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
          MODULAR TRI-AXIAL MARINE ARCHITECTURE · ANYMACHINE REV 4.2
        </div>
      </div>

      <Canvas
        camera={{ position: [16, 18, 16], fov: 42 }}
        style={{ position: 'absolute', inset: 0 }}
        shadows
      >
        <color attach="background" args={['#070B12']} />
        <fog attach="fog" args={['#070B12', 28, 60]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[14, 24, 10]} intensity={1.2} castShadow />
        <HexWorld />
        <Grid
          args={[60, 60]}
          cellSize={1}
          cellThickness={0.3}
          sectionSize={3}
          sectionThickness={0.85}
          fadeDistance={40}
          position={[0, -0.02, 0]}
        />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={8} maxDistance={50} />
      </Canvas>

      <FloatingPanels />
    </div>
  )
}
