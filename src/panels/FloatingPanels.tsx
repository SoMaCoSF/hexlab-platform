import { useState, useRef, useCallback } from 'react'

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

export function FloatingPanels() {
  return (
    <>
      <Panel title="MODULE INSPECTOR" initial={{ x: 24, y: 24 }}>
        <p style={{ marginBottom: 8, opacity: 0.8 }}>
          Select a hex. Gates, ballast, interlocks appear here.
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button>Raise gate</button>
          <button>Lower gate</button>
          <button>Drain dock</button>
        </div>
      </Panel>

      <Panel title="VOICE CONSOLE" initial={{ x: 24, y: 200 }}>
        <p style={{ marginBottom: 8, opacity: 0.8 }}>
          spoken-world style — hold Space, speak.
        </p>
        <p style={{ fontSize: 11, opacity: 0.55, marginBottom: 8 }}>
          “Add a dry-dock hex here” · “Raise the north gate” · “Stack a sensor deck”
        </p>
        <button style={{ width: '100%' }}>Hold to talk (stub)</button>
      </Panel>

      <Panel title="HARBOR STATUS" initial={{ x: window.innerWidth - 300, y: 24 }}>
        <ul style={{ listStyle: 'none', lineHeight: 1.7, opacity: 0.9 }}>
          <li>Central harbor — open</li>
          <li>Dry-docks — 0 / 6 drained</li>
          <li>Flight gates — all closed</li>
          <li>Stack decks — 0</li>
        </ul>
      </Panel>

      <Panel title="TOPOLOGY" initial={{ x: window.innerWidth - 300, y: 220 }}>
        <p style={{ opacity: 0.8, marginBottom: 8 }}>
          Link · tile · stack · vertex ties
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button>+ Hex</button>
          <button>Link</button>
          <button>Stack</button>
        </div>
      </Panel>
    </>
  )
}
