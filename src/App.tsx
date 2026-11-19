import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { HexWorld } from './platform/HexWorld'
import { FloatingPanels } from './panels/FloatingPanels'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* FULL-SCREEN PLATFORM */}
      <Canvas
        camera={{ position: [12, 14, 12], fov: 45 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#070B12']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.1} />
        <HexWorld />
        <Grid
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.4}
          sectionSize={3}
          sectionThickness={1}
          fadeDistance={30}
          position={[0, -0.01, 0]}
        />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} />
      </Canvas>

      {/* FLOATING PANELS */}
      <FloatingPanels />
    </div>
  )
}
