import { useMemo, useRef } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlatform, HexCell } from '../state/platformStore'

const HEX_SIZE = 1.5

export function axialToWorld(q: number, r: number, size = HEX_SIZE) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r)
  const z = size * ((3 / 2) * r)
  return [x, 0, z] as [number, number, number]
}

function hexShape(size = HEX_SIZE) {
  const s = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    const px = size * Math.cos(angle)
    const py = size * Math.sin(angle)
    if (i === 0) s.moveTo(px, py)
    else s.lineTo(px, py)
  }
  s.closePath()
  return s
}

function kindColor(kind: HexCell['kind'], selected: boolean) {
  if (selected) return '#f59e0b'
  if (kind === 'harbor') return '#06b6d4'
  if (kind === 'corner') return '#334155'
  if (kind === 'drydock') return '#0f766e'
  return '#0e7490'
}

function Inframodule({ cell }: { cell: HexCell }) {
  const select = usePlatform((s) => s.select)
  const selectedId = usePlatform((s) => s.selectedId)
  const selected = selectedId === cell.id
  const [x, , z] = axialToWorld(cell.q, cell.r)

  const baseHeight = cell.kind === 'harbor' ? 0.25 : cell.kind === 'corner' ? 0.55 : 0.4
  const stackExtra = cell.stacked * 0.35
  const height = baseHeight + stackExtra

  const shape = useMemo(() => hexShape(), [])
  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [shape, height])

  // Gate panels — six faces that raise with gateOpen
  const gateRefs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(() => {
    const open = cell.gateOpen
    gateRefs.current.forEach((m, i) => {
      if (!m) return
      // swing up around outer edge
      m.rotation.x = -open * (Math.PI / 2.4)
      m.position.y = height + open * 0.15
    })
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    select(selected ? null : cell.id)
  }

  const color = kindColor(cell.kind, selected)

  // ballast water surface inside (lowers as drained)
  const waterY = 0.08 + (1 - cell.ballastDrain) * (height * 0.35)

  return (
    <group position={[x, 0, z]}>
      <mesh
        position={[0, height / 2, 0]}
        geometry={geom}
        onClick={onClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.5} />
      </mesh>

      {/* selection ring */}
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.92, HEX_SIZE * 1.05, 6]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.85} />
        </mesh>
      )}

      {/* ballast water */}
      {(cell.kind === 'module' || cell.kind === 'drydock' || cell.kind === 'harbor') && (
        <mesh position={[0, waterY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[HEX_SIZE * 0.7, 6]} />
          <meshStandardMaterial
            color="#0ea5e9"
            transparent
            opacity={0.45 + (1 - cell.ballastDrain) * 0.35}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* six gate flaps on perimeter */}
      {cell.kind !== 'corner' &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 6
          const gx = Math.cos(angle) * HEX_SIZE * 0.88
          const gz = Math.sin(angle) * HEX_SIZE * 0.88
          return (
            <mesh
              key={i}
              ref={(el) => { gateRefs.current[i] = el }}
              position={[gx, height, gz]}
              rotation={[0, -angle + Math.PI / 2, 0]}
            >
              <boxGeometry args={[HEX_SIZE * 0.85, 0.06, 0.22]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.35} />
            </mesh>
          )
        })}

      {/* stack decks */}
      {cell.stacked > 0 &&
        Array.from({ length: cell.stacked }).map((_, i) => (
          <mesh key={i} position={[0, baseHeight + (i + 0.5) * 0.35, 0]}>
            <cylinderGeometry args={[HEX_SIZE * 0.55, HEX_SIZE * 0.55, 0.12, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.45} />
          </mesh>
        ))}
    </group>
  )
}

export function HexWorld() {
  const cells = usePlatform((s) => s.cells)
  const select = usePlatform((s) => s.select)

  return (
    <group onClick={() => select(null)}>
      {cells.map((cell) => (
        <Inframodule key={cell.id} cell={cell} />
      ))}
    </group>
  )
}
