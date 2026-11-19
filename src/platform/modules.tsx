import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SizeClass, sizeToScene } from '../state/platformStore'

function hexShape(radius: number) {
  const s = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    const x = radius * Math.cos(a)
    const y = radius * Math.sin(a)
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return s
}

export function HexPrism({
  radius, height, color, y = 0, metalness = 0.5, roughness = 0.45,
}: {
  radius: number; height: number; color: string; y?: number; metalness?: number; roughness?: number
}) {
  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(hexShape(radius), { depth: height, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [radius, height])
  return (
    <mesh position={[0, y + height / 2, 0]} geometry={geom} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  )
}

const H = 0.55

export function CoreModule({ size, showStack }: { size: SizeClass; showStack: boolean }) {
  const R = sizeToScene(size)
  return (
    <group>
      <HexPrism radius={R * 0.92} height={H} color="#334155" y={0.05} metalness={0.55} roughness={0.4} />
      <HexPrism radius={R * 0.72} height={0.08} color="#1e293b" y={0.5} metalness={0.3} roughness={0.65} />
      {showStack && (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (Math.PI / 3) * i - Math.PI / 6
            return (
              <mesh key={i} position={[(R * 0.74) * Math.cos(a), 1.1, (R * 0.74) * Math.sin(a)]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 1.15, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.75} />
              </mesh>
            )
          })}
          <HexPrism radius={R * 0.84} height={0.22} color="#475569" y={1.6} />
          <mesh position={[0, 1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[R * 0.35, R * 0.44, 24]} />
            <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  )
}

export function FlightModule({ size, gateOpen, outwardAngle }: {
  size: SizeClass; gateOpen: number; outwardAngle: number
}) {
  const R = sizeToScene(size)
  const hinge = useRef<THREE.Group>(null)
  const snapped = Math.round(outwardAngle / (Math.PI / 3)) * (Math.PI / 3)
  const faceDist = R * 0.88 * Math.cos(Math.PI / 6)

  useFrame(() => {
    if (hinge.current) hinge.current.rotation.z = -(gateOpen * (Math.PI / 2))
  })

  return (
    <group>
      <HexPrism radius={R * 0.92} height={H} color="#334155" y={0.05} />
      <HexPrism radius={R * 0.82} height={0.08} color="#1e293b" y={0.5} />
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.22, 0.09, R * 1.35]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.4} />
      </mesh>
      <group rotation={[0, -snapped, 0]}>
        <group position={[faceDist, 0.55, 0]}>
          <group ref={hinge}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[0.14, 0.85, R * 0.92]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.55} roughness={0.3} />
            </mesh>
          </group>
        </group>
      </group>
      <group position={[0, 0.68, 0]} rotation={[0, -snapped, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]} castShadow>
          <coneGeometry args={[0.16, 0.75, 4]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.7} />
        </mesh>
        <mesh position={[-0.05, 0, 0]}>
          <boxGeometry args={[0.22, 0.03, 1.05]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>
    </group>
  )
}

export function DryDockModule({ size, ballast }: { size: SizeClass; ballast: number }) {
  const R = sizeToScene(size)
  const waterY = 0.43 + ballast * 0.22
  return (
    <group>
      <HexPrism radius={R * 0.92} height={H} color="#334155" y={0} />
      <HexPrism radius={R * 0.74} height={0.14} color="#0f172a" y={0.35} roughness={0.75} />
      <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R * 0.72, R * 0.88, 6]} />
        <meshStandardMaterial color="#10b981" side={THREE.DoubleSide} metalness={0.4} />
      </mesh>
      {ballast > 0.03 && (
        <HexPrism radius={R * 0.73} height={0.06} color="#0ea5e9" y={waterY - 0.03} metalness={0.15} roughness={0.15} />
      )}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[R * 0.7, 0.24, R * 0.28]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
      </mesh>
    </group>
  )
}

export function SubHarborModule({ size }: { size: SizeClass }) {
  const R = sizeToScene(size)
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (Math.PI / 3) * i
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.18, R * 0.64]} castShadow>
              <boxGeometry args={[R * 0.86, H * 1.05, 0.55]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.58, R * 0.42]}>
              <boxGeometry args={[R * 0.82, 0.08, 0.12]} />
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[R * 0.58, 0.07, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#c084fc" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, R * 0.85, 12]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

/** SLAB-aligned industrial bays */
export function IndustrialBay({ size, kind }: {
  size: SizeClass
  kind: 'refinery' | 'desal' | 'lab' | 'power'
}) {
  const R = sizeToScene(size)
  const accent =
    kind === 'refinery' ? '#f97316' :
    kind === 'desal' ? '#22d3ee' :
    kind === 'lab' ? '#a3e635' :
    '#fbbf24'

  return (
    <group>
      <HexPrism radius={R * 0.92} height={H} color="#334155" y={0.05} />
      <HexPrism radius={R * 0.78} height={0.1} color="#1e293b" y={0.52} />
      {/* process towers / stacks */}
      {[0.25, -0.3].map((ox, i) => (
        <mesh key={i} position={[ox * R, 1.2, 0.15 * R]} castShadow>
          <cylinderGeometry args={[0.12 + i * 0.04, 0.14, 1.4 + i * 0.3, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0.1 * R, 1.95, 0.15 * R]}>
        <cylinderGeometry args={[0.06, 0.08, 0.35, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} />
      </mesh>
      {/* equipment block */}
      <mesh position={[-0.25 * R, 0.75, -0.2 * R]} castShadow>
        <boxGeometry args={[R * 0.45, 0.4, R * 0.35]} />
        <meshStandardMaterial color="#475569" metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R * 0.55, R * 0.62, 6]} />
        <meshBasicMaterial color={accent} side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}
