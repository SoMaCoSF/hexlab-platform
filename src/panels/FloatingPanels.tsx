import { useState, useRef, useCallback, useEffect } from 'react'
import { usePlatform } from '../state/platformStore'

function useDrag(initial: { x: number; y: number }) {
  const [pos, setPos] = useState(initial)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
  }, [])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return { pos, onPointerDown, onPointerMove, onPointerUp }
}

function Panel({
  title,
  children,
  initial,
}: {
  title: string
  children: React.ReactNode
  initial: { x: number; y: number }
}) {
  const { pos, onPointerDown, onPointerMove, onPointerUp } = useDrag(initial)

  return (
    <div
      className="panel"
      style={{ left: pos.x, top: pos.y }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="panel-header" onPointerDown={onPointerDown}>
        <span>{title}</span>
        <span style={{ opacity: 0.5, fontSize: 11 }}>⋮</span>
      </div>
      <div className="panel-body">{children}</div>
    </div>
  )
}

function ModuleInspector() {
  const selected = usePlatform((s) => s.getSelected())
  const selectedId = usePlatform((s) => s.selectedId)
  const setGate = usePlatform((s) => s.setGate)
  const setBallast = usePlatform((s) => s.setBallast)
  const addStack = usePlatform((s) => s.addStack)
  // re-render when selection or cell values change
  const cells = usePlatform((s) => s.cells)
  const cell = cells.find((c) => c.id === selectedId) ?? null

  if (!cell) {
    return (
      <p style={{ opacity: 0.65 }}>
        Click a hex on the platform.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, opacity: 0.7 }}>
        {cell.kind.toUpperCase()} · ({cell.q}, {cell.r})
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#06b6d4' }}>Gate open</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={cell.gateOpen}
          onChange={(e) => setGate(cell.id, parseFloat(e.target.value))}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#06b6d4' }}>Ballast drain</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={cell.ballastDrain}
          onChange={(e) => setBallast(cell.id, parseFloat(e.target.value))}
        />
      </label>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={() => setGate(cell.id, 1)}>Raise gates</button>
        <button onClick={() => setGate(cell.id, 0)}>Shut gates</button>
        <button onClick={() => setBallast(cell.id, 1)}>Drain dock</button>
        <button onClick={() => setBallast(cell.id, 0)}>Flood</button>
        <button onClick={() => addStack(cell.id)}>Stack deck (+{cell.stacked})</button>
      </div>
    </div>
  )
}

function HarborStatus() {
  const cells = usePlatform((s) => s.cells)
  const modules = cells.filter((c) => c.kind === 'module' || c.kind === 'drydock')
  const openGates = modules.filter((c) => c.gateOpen > 0.5).length
  const drained = modules.filter((c) => c.ballastDrain > 0.5).length
  const stacks = cells.reduce((n, c) => n + c.stacked, 0)
  const harbor = cells.find((c) => c.kind === 'harbor')

  return (
    <ul style={{ listStyle: 'none', lineHeight: 1.75, margin: 0, padding: 0 }}>
      <li>Central harbor — {harbor && harbor.gateOpen > 0.3 ? 'open' : 'secured'}</li>
      <li>Dry-docks drained — {drained} / {modules.length}</li>
      <li>Flight gates open — {openGates} / {modules.length}</li>
      <li>Stack decks — {stacks}</li>
      <li>Hex count — {cells.length}</li>
    </ul>
  )
}

function Topology() {
  const addHex = usePlatform((s) => s.addHex)
  const cells = usePlatform((s) => s.cells)
  const selected = usePlatform((s) => s.getSelected())

  const addNeighbor = () => {
    if (!selected) return
    const dirs = [
      [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1],
    ]
    for (const [dq, dr] of dirs) {
      const q = selected.q + dq
      const r = selected.r + dr
      if (!cells.some((c) => c.q === q && c.r === r)) {
        addHex(q, r, 'module')
        return
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ opacity: 0.75, margin: 0, fontSize: 12 }}>
        Link · tile · stack · vertex ties
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={addNeighbor} disabled={!selected}>
          + Neighbor hex
        </button>
        <button onClick={() => addHex(3, 0, 'drydock')}>+ Dry-dock</button>
      </div>
    </div>
  )
}

function VoiceConsole() {
  const [log, setLog] = useState<string[]>([])
  const selected = usePlatform((s) => s.getSelected())
  const setGate = usePlatform((s) => s.setGate)
  const setBallast = usePlatform((s) => s.setBallast)
  const addStack = usePlatform((s) => s.addStack)
  const addHex = usePlatform((s) => s.addHex)

  // crude keyword stub — real spoken-world loop later
  const runCommand = (text: string) => {
    const t = text.toLowerCase()
    setLog((l) => [`› ${text}`, ...l].slice(0, 6))
    if (!selected) return
    if (t.includes('raise') || t.includes('open')) setGate(selected.id, 1)
    if (t.includes('shut') || t.includes('close')) setGate(selected.id, 0)
    if (t.includes('drain')) setBallast(selected.id, 1)
    if (t.includes('flood')) setBallast(selected.id, 0)
    if (t.includes('stack')) addStack(selected.id)
    if (t.includes('add') && t.includes('hex')) {
      const dirs = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]] as const
      for (const [dq, dr] of dirs) {
        const q = selected.q + dq
        const r = selected.r + dr
        addHex(q, r)
        break
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: 0, opacity: 0.75, fontSize: 12 }}>
        spoken-world style — keyword stub for now
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Raise gates', 'Shut gates', 'Drain dock', 'Stack deck', 'Add hex'].map((cmd) => (
          <button key={cmd} onClick={() => runCommand(cmd)}>
            {cmd}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, opacity: 0.55, maxHeight: 72, overflow: 'hidden' }}>
        {log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  )
}

export function FloatingPanels() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null

  const right = typeof window !== 'undefined' ? window.innerWidth - 300 : 800

  return (
    <>
      <Panel title="MODULE INSPECTOR" initial={{ x: 24, y: 24 }}>
        <ModuleInspector />
      </Panel>

      <Panel title="VOICE CONSOLE" initial={{ x: 24, y: 280 }}>
        <VoiceConsole />
      </Panel>

      <Panel title="HARBOR STATUS" initial={{ x: right, y: 24 }}>
        <HarborStatus />
      </Panel>

      <Panel title="TOPOLOGY" initial={{ x: right, y: 200 }}>
        <Topology />
      </Panel>
    </>
  )
}
