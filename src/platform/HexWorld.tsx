import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const HEX_SIZE = 1.5

function axialToWorld(q: number, r: number, size = HEX_SIZE) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r)
  const z = size * ((3 / 2) * r)
  return [x, 0, z] as [number, number, number]
}

function HexMesh({ q, r, height = 0.4, color = '#0e7490' }: { q: number; r: number; height?: number; color?: string }) {
  const [x, , z] = axialToWorld(q, r)
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      const px = HEX_SIZE * Math.cos(angle)
      const py = HEX_SIZE * Math.sin(angle)
      if (i === 0) s.moveTo(px, py)
      else s.lineTo(px, py)
    }
    s.closePath()
    return s
  }, [])

  const geom = useMemo(() => {
    const extrude = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
    extrude.rotateX(-Math.PI / 2)
    return extrude
  }, [shape, height])

  return (
    <mesh position={[x, height / 2, z]} geometry={geom}>
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.55} />
    </mesh>
  )
}

/** Simple ring of hexes + center — starter SLAB footprint */
export function HexWorld() {
  const group = useRef<THREE.Group>(null)

  const cells = useMemo(() => {
    const list: { q: number; r: number; kind: string }[] = [{ q: 0, r: 0, kind: 'harbor' }]
    // ring 1
    const dirs = [
      [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1],
    ]
    for (const [dq, dr] of dirs) {
      list.push({ q: dq, r: dr, kind: 'module' })
    }
    // ring 2 partial — corners for interlocks
    for (const [dq, dr] of dirs) {
      list.push({ q: dq * 2, r: dr * 2, kind: 'corner' })
    }
    return list
  }, [])

  useFrame((_, dt) => {
    if (group.current) {
      // gentle idle — keeps the scene alive
      group.current.rotation.y += dt * 0.02
    }
  })

  return (
    <group ref={group}>
      {cells.map(({ q, r, kind }) => {
        const color =
          kind === 'harbor' ? '#06b6d4' :
          kind === 'corner' ? '#334155' :
          '#0e7490'
        const height = kind === 'harbor' ? 0.25 : kind === 'corner' ? 0.55 : 0.4
        return <HexMesh key={`${q},${r}`} q={q} r={r} height={height} color={color} />
      })}
    </group>
  )
}
