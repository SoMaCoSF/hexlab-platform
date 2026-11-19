import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { HexWorld } from './platform/HexWorld'
import { FloatingPanels } from './panels/FloatingPanels'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* FULL-SCREEN PLATFORM */}
      <Canvas
        camera={{ position: [14, 16, 14], fov: 42 }}
        style={{ position: 'absolute', inset: 0 }}
        onPointerMissed={() => {
          // deselect handled inside HexWorld group click
        }}
      >
        <color attach="background" args={['#070B12']} />
        <fog attach="fog" args={['#070B12', 25, 55]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[12, 22, 8]} intensity={1.15} castShadow />
        <HexWorld />
        <Grid
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.35}
          sectionSize={3}
          sectionThickness={0.9}
          fadeDistance={35}
          position={[0, -0.02, 0]}
        />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={6} maxDistance={40} />
      </Canvas>

      {/* FLOATING PANELS over the platform */}
      <FloatingPanels />
    </div>
  )
}
