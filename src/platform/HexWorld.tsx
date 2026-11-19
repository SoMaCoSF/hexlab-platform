import { useMemo, useRef } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlatform, HexModule, axialToWorld, HEX_SIZE } from '../state/platformStore'

const HEIGHT = 0.55

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

function HexPrism({ radius, height, color, y = 0, metalness = 0.55, roughness = 0.4 }: {
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

function CoreModule({ showStack }: { showStack: boolean }) {
  return (
    <group>
      <HexPrism radius={HEX_SIZE * 0.92} height={HEIGHT} color="#1e293b" y={0.05} />
      <HexPrism radius={HEX_SIZE * 0.72} height={0.08} color="#0f172a" y={0.5} metalness={0.3} roughness={0.7} />
      {showStack && (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (Math.PI / 3) * i - Math.PI / 6
            return (
              <mesh key={i} position={[(HEX_SIZE * 0.74) * Math.cos(a), 1.1, (HEX_SIZE * 0.74) * Math.sin(a)]}>
                <cylinderGeometry args={[0.07, 0.07, 1.15, 6]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} />
              </mesh>
            )
          })}
          <HexPrism radius={HEX_SIZE * 0.84} height={0.22} color="#334155" y={1.6} />
          <mesh position={[0, 1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.68, 24]} />
            <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  )
}

function FlightModule({ q, r, gateOpen }: { q: number; r: number; gateOpen: number }) {
  const hinge = useRef<THREE.Group>(null)
  const [wx, , wz] = axialToWorld(q, r)
  const outward = Math.atan2(wz, wx)
  const snapped = Math.round(outward / (Math.PI / 3)) * (Math.PI / 3)
  const faceDist = HEX_SIZE * 0.88 * Math.cos(Math.PI / 6)

  useFrame(() => {
    if (hinge.current) hinge.current.rotation.z = -(gateOpen * (Math.PI / 2))
  })

  return (
    <group>
      <HexPrism radius={HEX_SIZE * 0.92} height={HEIGHT} color="#1e293b" y={0.05} />
      <HexPrism radius={HEX_SIZE * 0.82} height={0.08} color="#172033" y={0.5} />
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.22, 0.09, HEX_SIZE * 1.35]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      <group rotation={[0, -snapped, 0]}>
        <group position={[faceDist, 0.55, 0]}>
          <group ref={hinge}>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[0.14, 0.85, HEX_SIZE * 0.92]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.3} />
            </mesh>
          </group>
        </group>
      </group>

      {/* UAV on deck */}
      <group position={[0, 0.68, 0]} rotation={[0, -snapped, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.16, 0.75, 4]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.7} />
        </mesh>
        <mesh position={[-0.05, 0, 0]}>
          <boxGeometry args={[0.22, 0.03, 1.05]} />
          <meshStandardMaterial color="#06b6d4" />
        </mesh>
      </group>
    </group>
  )
}

function DryDockModule({ ballast }: { ballast: number }) {
  const waterY = 0.43 + ballast * 0.22
  return (
    <group>
      <HexPrism radius={HEX_SIZE * 0.92} height={HEIGHT} color="#1e293b" y={0} />
      <HexPrism radius={HEX_SIZE * 0.74} height={0.14} color="#090d16" y={0.35} roughness={0.8} />
      <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[HEX_SIZE * 0.72, HEX_SIZE * 0.88, 6]} />
        <meshStandardMaterial color="#10b981" side={THREE.DoubleSide} />
      </mesh>
      {ballast > 0.03 && (
        <HexPrism radius={HEX_SIZE * 0.73} height={0.06} color="#0284c7" y={waterY - 0.03} metalness={0.2} roughness={0.1} />
      )}
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[1.15, 0.24, 0.42]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
      </mesh>
    </group>
  )
}

function SubHarborModule() {
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (Math.PI / 3) * i
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.18, HEX_SIZE * 0.64]}>
              <boxGeometry args={[HEX_SIZE * 0.86, HEIGHT * 1.05, 0.55]} />
              <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.58, HEX_SIZE * 0.42]}>
              <boxGeometry args={[HEX_SIZE * 0.82, 0.08, 0.12]} />
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.35} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[HEX_SIZE * 0.58, 0.07, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#a855f7" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 1.35, 12]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function Inframodule({ mod }: { mod: HexModule }) {
  const select = usePlatform((s) => s.select)
  const selectedId = usePlatform((s) => s.selectedId)
  const gateOpen = usePlatform((s) => s.gateOpen)
  const ballast = usePlatform((s) => s.ballast)
  const showStack = usePlatform((s) => s.showStack)
  const selected = selectedId === mod.id
  const [x, , z] = axialToWorld(mod.q, mod.r)

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    select(selected ? null : mod.id)
  }

  return (
    <group position={[x, 0, z]} onClick={onClick}>
      {mod.type === 'core' && <CoreModule showStack={showStack} />}
      {mod.type === 'flight' && <FlightModule q={mod.q} r={mod.r} gateOpen={gateOpen} />}
      {mod.type === 'drydock' && <DryDockModule ballast={ballast} />}
      {mod.type === 'subhub' && <SubHarborModule />}
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.95, HEX_SIZE * 1.08, 6]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

function PlacementGrid() {
  const place = usePlatform((s) => s.place)
  const modules = usePlatform((s) => s.modules)
  const occupied = useMemo(() => new Set(modules.map((m) => m.id)), [modules])

  // ring 0..3 axial coords
  const slots = useMemo(() => {
    const list: { q: number; r: number }[] = [{ q: 0, r: 0 }]
    for (let radius = 1; radius <= 3; radius++) {
      let q = radius
      let r = 0
      const dirs = [[0, -1], [-1, 0], [-1, 1], [0, 1], [1, 0], [1, -1]]
      for (const [dq, dr] of dirs) {
        for (let i = 0; i < radius; i++) {
          list.push({ q, r })
          q += dq
          r += dr
        }
      }
    }
    return list
  }, [])

  return (
    <group>
      {slots.map(({ q, r }) => {
        const id = `${q},${r}`
        if (occupied.has(id)) return null
        const [x, , z] = axialToWorld(q, r)
        return (
          <mesh
            key={id}
            position={[x, 0.01, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation()
              place(q, r)
            }}
            onPointerOver={() => { document.body.style.cursor = 'crosshair' }}
            onPointerOut={() => { document.body.style.cursor = 'default' }}
          >
            <circleGeometry args={[HEX_SIZE * 0.85, 6]} />
            <meshBasicMaterial color="#0e7490" transparent opacity={0.12} />
          </mesh>
        )
      })}
    </group>
  )
}

function ThrustersAndTies() {
  const modules = usePlatform((s) => s.modules)
  const showThrusters = usePlatform((s) => s.showThrusters)
  const showInterlocks = usePlatform((s) => s.showInterlocks)
  const blades = useRef<THREE.Mesh[]>([])

  const vertices = useMemo(() => {
    const map = new Map<string, { x: number; z: number; count: number }>()
    modules.forEach((m) => {
      const [x, , z] = axialToWorld(m.q, m.r)
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        const vx = x + HEX_SIZE * 0.94 * Math.cos(a)
        const vz = z + HEX_SIZE * 0.94 * Math.sin(a)
        const k = `${vx.toFixed(2)},${vz.toFixed(2)}`
        const prev = map.get(k)
        if (prev) prev.count++
        else map.set(k, { x: vx, z: vz, count: 1 })
      }
    })
    return [...map.values()]
  }, [modules])

  useFrame((_, dt) => {
    blades.current.forEach((b, i) => {
      if (b) b.rotation.y += dt * 8 + i * 0.01
    })
  })

  blades.current = []

  return (
    <group>
      {vertices.map((v, idx) => {
        if (showInterlocks && v.count === 1) {
          return (
            <group key={`t${idx}`}>
              <mesh position={[v.x, HEIGHT * 0.75, v.z]}>
                <cylinderGeometry args={[0.08, 0.1, 0.25, 8]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
              </mesh>
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([v.x, HEIGHT * 0.75, v.z, v.x * 1.12, -0.3, v.z * 1.12])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#06b6d4" transparent opacity={0.45} />
              </line>
            </group>
          )
        }
        if (showThrusters && v.count >= 2) {
          return (
            <group key={`p${idx}`} position={[v.x, -0.15, v.z]}>
              <mesh>
                <cylinderGeometry args={[0.24, 0.2, 0.35, 12]} />
                <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.26, 0.04, 8, 16]} />
                <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
              </mesh>
              <mesh
                position={[0, -0.14, 0]}
                ref={(el) => { if (el) blades.current.push(el) }}
              >
                <boxGeometry args={[0.42, 0.04, 0.08]} />
                <meshStandardMaterial color="#38bdf8" />
              </mesh>
            </group>
          )
        }
        return null
      })}
    </group>
  )
}

export function HexWorld() {
  const modules = usePlatform((s) => s.modules)
  const select = usePlatform((s) => s.select)
  const showWaves = usePlatform((s) => s.showWaves)
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    if (showWaves) {
      const t = clock.elapsedTime
      group.current.position.y = Math.sin(t * 1.4) * 0.045
      group.current.rotation.z = Math.sin(t * 1.1) * 0.008
      group.current.rotation.x = Math.cos(t * 0.9) * 0.008
    } else {
      group.current.position.y = 0
      group.current.rotation.set(0, 0, 0)
    }
  })

  return (
    <group ref={group} onClick={() => select(null)}>
      <PlacementGrid />
      {modules.map((m) => (
        <Inframodule key={m.id} mod={m} />
      ))}
      <ThrustersAndTies />
    </group>
  )
}
