/** Marine tactical lighting — key + fill + rim + soft ambient, no pure black */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.45} color="#a8c0d8" />
      {/* Key — low sun, slightly warm */}
      <directionalLight
        position={[18, 28, 12]}
        intensity={1.35}
        color="#fff4e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      {/* Fill — cool ocean bounce */}
      <directionalLight position={[-14, 10, -8]} intensity={0.55} color="#7dd3fc" />
      {/* Rim / back */}
      <directionalLight position={[0, 8, -20]} intensity={0.35} color="#e0f2fe" />
      {/* Hemisphere sky / sea */}
      <hemisphereLight args={['#bfdbfe', '#0c4a6e', 0.4]} />
      {/* Soft point near center for module readability */}
      <pointLight position={[0, 12, 0]} intensity={0.4} color="#e2e8f0" distance={40} decay={2} />
    </>
  )
}
