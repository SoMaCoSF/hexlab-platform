import { useMemo, useRef } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import {
  usePlatform, HexModule, axialToWorld, sizeToScene, SizeClass,
} from '../state/platformStore'
import {
  CoreModule, FlightModule, DryDockModule, SubHarborModule, IndustrialBay,
} from './modules'

function Inframodule({ mod }: { mod: HexModule }) {
  const select = usePlatform((s) => s.select)
  const selectedId = usePlatform((s) => s.selectedId)
  const gateOpen = usePlatform((s) => s.gateOpen)
  const ballast = usePlatform((s) => s.ballast)
  const showStack = usePlatform((s) => s.showStack)
  const selected = selectedId === mod.id
  const [x, , z] = axialToWorld(mod.q, mod.r, mod.size)
  const R = sizeToScene(mod.size)
  const outward = Math.atan2(z, x)

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    select(selected ? null : mod.id)
  }

  return (
    <group position={[x, 0, z]} onClick={onClick}>
      {mod.type === 'core' && <CoreModule size={mod.size} showStack={showStack} />}
      {mod.type === 'flight' && (
        <FlightModule size={mod.size} gateOpen={gateOpen} outwardAngle={outward} />
      )}
      {mod.type === 'drydock' && <DryDockModule size={mod.size} ballast={ballast} />}
      {mod.type === 'subhub' && <SubHarborModule size={mod.size} />}
      {(mod.type === 'refinery' || mod.type === 'desal' || mod.type === 'lab' || mod.type === 'power') && (
        <IndustrialBay size={mod.size} kind={mod.type} />
      )}
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[R * 0.95, R * 1.08, 6]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

function PlacementGrid() {
  const place = usePlatform((s) => s.place)
  const modules = usePlatform((s) => s.modules)
  const activeSize = usePlatform((s) => s.activeSize)
  const occupied = useMemo(() => new Set(modules.map((m) => m.id)), [modules])

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

  const R = sizeToScene(activeSize)

  return (
    <group>
      {slots.map(({ q, r }) => {
        const id = `${q},${r}`
        if (occupied.has(id)) return null
        const [x, , z] = axialToWorld(q, r, activeSize)
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
            <circleGeometry args={[R * 0.85, 6]} />
            <meshBasicMaterial color="#0e7490" transparent opacity={0.14} />
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
      const [x, , z] = axialToWorld(m.q, m.r, m.size)
      const R = sizeToScene(m.size)
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        const vx = x + R * 0.94 * Math.cos(a)
        const vz = z + R * 0.94 * Math.sin(a)
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
              <mesh position={[v.x, 0.4, v.z]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 0.25, 8]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          )
        }
        if (showThrusters && v.count >= 2) {
          return (
            <group key={`p${idx}`} position={[v.x, -0.15, v.z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.24, 0.2, 0.35, 12]} />
                <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.26, 0.04, 8, 16]} />
                <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.35} />
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
      group.current.position.y = Math.sin(t * 1.4) * 0.04
      group.current.rotation.z = Math.sin(t * 1.1) * 0.006
      group.current.rotation.x = Math.cos(t * 0.9) * 0.006
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
