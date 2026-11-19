import { useState, useRef, useCallback, useEffect } from 'react'
import { usePlatform, ModuleType } from '../state/platformStore'

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
  const onPointerUp = useCallback(() => { dragging.current = false }, [])
  return { pos, onPointerDown, onPointerMove, onPointerUp }
}

function Panel({ title, children, initial, wide }: {
  title: string; children: React.ReactNode; initial: { x: number; y: number }; wide?: boolean
}) {
  const { pos, onPointerDown, onPointerMove, onPointerUp } = useDrag(initial)
  return (
    <div
      className="panel"
      style={{ left: pos.x, top: pos.y, maxWidth: wide ? 380 : 320, minWidth: wide ? 300 : 260 }}
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

const TOOLS: { id: ModuleType | 'erase'; code: string; name: string; tag: string; desc: string; color: string }[] = [
  { id: 'core', code: 'H1', name: 'Core Infra-Module', tag: 'STRUCTURAL', desc: 'Buoyant hull, corner interlocks, stackable deck.', color: '#06b6d4' },
  { id: 'flight', code: 'FH', name: 'Flight-Harbor', tag: 'UAV / VTOL', desc: 'Swing/raise/lower face gate for aircraft ops.', color: '#f59e0b' },
  { id: 'drydock', code: 'DD', name: 'Drainable Dry-Dock', tag: 'BALLAST BAY', desc: 'Submersible cradle for USV inspection & repair.', color: '#10b981' },
  { id: 'subhub', code: 'SH', name: 'Sub-Launching Harbor', tag: 'MOONPOOL', desc: 'Protected moonpool for UUV/AUV deploy/recover.', color: '#a855f7' },
  { id: 'erase', code: 'RM', name: 'Decommission', tag: 'REMOVE', desc: 'Clear a hex cell from the array.', color: '#f43f5e' },
]

function Palette() {
  const activeTool = usePlatform((s) => s.activeTool)
  const setTool = usePlatform((s) => s.setTool)
  const loadPreset = usePlatform((s) => s.loadPreset)
  const preset = usePlatform((s) => s.preset)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
        {(['recon', 'carrier', 'sandbox'] as const).map((p) => (
          <button
            key={p}
            onClick={() => loadPreset(p)}
            style={{
              borderColor: preset === p ? '#06b6d4' : undefined,
              color: preset === p ? '#06b6d4' : undefined,
            }}
          >
            {p === 'recon' ? '7-HEX RECON' : p === 'carrier' ? '19-HEX CARRIER' : 'SANDBOX'}
          </button>
        ))}
      </div>
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            textAlign: 'left',
            width: '100%',
            borderColor: activeTool === t.id ? t.color : undefined,
            background: activeTool === t.id ? `${t.color}18` : undefined,
          }}
        >
          <span style={{
            width: 28, height: 28, borderRadius: 4, border: `1px solid ${t.color}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: t.color, flexShrink: 0,
          }}>{t.code}</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
              <span>{t.name}</span>
              <span style={{ color: t.color, fontSize: 10, fontFamily: 'monospace' }}>{t.tag}</span>
            </span>
            <span style={{ fontSize: 11, opacity: 0.65, display: 'block', marginTop: 2 }}>{t.desc}</span>
          </span>
        </button>
      ))}
      <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>Click empty grid slots to place · click module to select</p>
    </div>
  )
}

function Kinematics() {
  const gateOpen = usePlatform((s) => s.gateOpen)
  const ballast = usePlatform((s) => s.ballast)
  const setGate = usePlatform((s) => s.setGate)
  const setBallast = usePlatform((s) => s.setBallast)
  const showThrusters = usePlatform((s) => s.showThrusters)
  const showInterlocks = usePlatform((s) => s.showInterlocks)
  const showStack = usePlatform((s) => s.showStack)
  const showWaves = usePlatform((s) => s.showWaves)
  const setToggle = usePlatform((s) => s.setToggle)

  const deg = Math.round(gateOpen * 90)
  const gateLabel = deg > 75 ? 'LAUNCH RAMP' : deg > 15 ? 'OPEN' : 'SEALED'
  const balPct = Math.round(ballast * 100)
  const balLabel = balPct === 0 ? 'DRAINED' : balPct === 100 ? 'FLOODED' : `BALLASTING`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
          <span>FLIGHT-HARBOR GATE</span>
          <span style={{ color: '#f59e0b' }}>{gateLabel} ({deg}°)</span>
        </span>
        <input type="range" min={0} max={1} step={0.01} value={gateOpen} onChange={(e) => setGate(+e.target.value)} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
          <span>DRY-DOCK BALLAST</span>
          <span style={{ color: '#10b981' }}>{balLabel} ({balPct}%)</span>
        </span>
        <input type="range" min={0} max={1} step={0.01} value={ballast} onChange={(e) => setBallast(+e.target.value)} />
      </label>
      {([
        ['showThrusters', 'Tuck Swivel Propellers', showThrusters],
        ['showInterlocks', 'Corner Interlocks & Vertex Ties', showInterlocks],
        ['showStack', 'Upper Platform Deck Stack', showStack],
        ['showWaves', 'Sea State 4 Hydro-Sim', showWaves],
      ] as const).map(([k, label, val]) => (
        <label key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, cursor: 'pointer' }}>
          <span>{label}</span>
          <input type="checkbox" checked={val} onChange={(e) => setToggle(k, e.target.checked)} />
        </label>
      ))}
    </div>
  )
}

function Telemetry() {
  const modules = usePlatform((s) => s.modules)
  const showStack = usePlatform((s) => s.showStack)
  const showThrusters = usePlatform((s) => s.showThrusters)
  const counts = usePlatform((s) => s.counts)()

  const vertexMap = new Map<string, number>()
  modules.forEach((m) => {
    const size = 1.55
    const x = size * (Math.sqrt(3) * m.q + (Math.sqrt(3) / 2) * m.r)
    const z = size * ((3 / 2) * m.r)
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6
      const k = `${(x + size * 0.94 * Math.cos(a)).toFixed(2)},${(z + size * 0.94 * Math.sin(a)).toFixed(2)}`
      vertexMap.set(k, (vertexMap.get(k) || 0) + 1)
    }
  })
  let intersections = 0
  vertexMap.forEach((c) => { if (c >= 2) intersections++ })

  const total = counts.total
  const baseArea = total * 886
  const stackArea = showStack ? counts.core * 680 : 0
  const area = baseArea + stackArea
  const thrusters = showThrusters ? intersections : 0
  const displacement = total * 2200 + (showStack ? counts.core * 380 : 0)
  const stability = total === 0 ? 0 : Math.min(99.4, 84 + (intersections / Math.max(1, total)) * 8.5)

  const cells = [
    { label: 'ACTIVE HEX', value: String(total), sub: '32m F-F' },
    { label: 'DECK AREA', value: `${area.toLocaleString()} m²`, sub: showStack ? `+${counts.core} TIER-2` : 'SINGLE TIER' },
    { label: 'INTERLOCK NODES', value: String(vertexMap.size), sub: '120° Y-JOINTS' },
    { label: 'SWIVEL THRUSTERS', value: String(thrusters), sub: '360° AZIMUTH' },
    { label: 'DISPLACEMENT', value: `${displacement.toLocaleString()} t`, sub: 'VARIABLE BALLAST' },
    { label: 'AUTONOMOUS BAYS', value: String(counts.flight + counts.drydock + counts.subhub), sub: `${counts.flight} FH / ${counts.drydock} DD / ${counts.subhub} SH` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {cells.map((c) => (
          <div key={c.label} style={{ background: '#0a1018', border: '1px solid #1e293b', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 10, opacity: 0.55 }}>{c.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{c.value}</div>
            <div style={{ fontSize: 10, color: '#06b6d4', marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ opacity: 0.6 }}>TRI-AXIAL WAVE DISSIPATION</span>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>{stability.toFixed(1)}%</span>
        </div>
        <div style={{ height: 6, background: '#0a1018', borderRadius: 3, overflow: 'hidden', border: '1px solid #1e293b' }}>
          <div style={{ height: '100%', width: `${stability}%`, background: 'linear-gradient(90deg,#06b6d4,#10b981)', transition: 'width .3s' }} />
        </div>
      </div>
      <div style={{ fontSize: 11, opacity: 0.75, lineHeight: 1.6 }}>
        H1 {counts.core} · FH {counts.flight} · DD {counts.drydock} · SH {counts.subhub}
      </div>
    </div>
  )
}

function ExportBrief() {
  const counts = usePlatform((s) => s.counts)()
  const modules = usePlatform((s) => s.modules)
  const showStack = usePlatform((s) => s.showStack)
  const showThrusters = usePlatform((s) => s.showThrusters)
  const [copied, setCopied] = useState(false)
  const [fmt, setFmt] = useState<'x' | 'spec'>('x')

  const vertexMap = new Map<string, number>()
  modules.forEach((m) => {
    const size = 1.55
    const x = size * (Math.sqrt(3) * m.q + (Math.sqrt(3) / 2) * m.r)
    const z = size * ((3 / 2) * m.r)
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6
      const k = `${(x + size * 0.94 * Math.cos(a)).toFixed(2)},${(z + size * 0.94 * Math.sin(a)).toFixed(2)}`
      vertexMap.set(k, (vertexMap.get(k) || 0) + 1)
    }
  })
  let intersections = 0
  vertexMap.forEach((c) => { if (c >= 2) intersections++ })
  const thrusters = showThrusters ? intersections : 0
  const area = counts.total * 886 + (showStack ? counts.core * 680 : 0)

  const xText = `@PalmerLuckey Why deselect Hexagons? Rectangular hulls concentrate 4-corner shear in cross-seas, whereas 120° hexagonal tessellation distributes wave loads tri-axially and unlocks discrete inframodules:

1/ Each hex unit is an independent functional bay:
• ${counts.flight}x Flight-Harbor bays with articulating swing/raise/lower face gates for UAV/VTOL ops
• ${counts.drydock}x Ballast-controlled drainable dry-docks for USV maintenance
• ${counts.subhub}x Protected central moonpool sub-launching harbor for UUVs

2/ Structural & Station-Keeping Advantage:
• ${vertexMap.size} solid floating corner interlocks + vertex mooring ties
• ${thrusters} retractable tuck swivel propellers at the 120° 3-way intersections for omni-directional dynamic positioning
• Stackable Tier-2 upper decks (${counts.total} active hexes / ${area.toLocaleString()} m² total deck footprint)

Interactive CAD configurator live at hexlab.somacosf.com (SoMaCoSF anymachine).`

  const specText = `HEXLAB.SOMACOSF.COM // MODULAR HEXAGONAL MARINE ARCHITECTURE BRIEF
ENGINE: SoMaCoSF Anymachine Tri-Axial Configurator

1. ARRAY CONFIGURATION
   - Total Modular Hex Units : ${counts.total} (32m Flat-to-Flat)
   - Aggregate Deck Footprint: ${area.toLocaleString()} m²
   - Corner Interlock Nodes  : ${vertexMap.size}
   - Intersection Thrusters  : ${thrusters}

2. INFRAMODULE MANIFEST
   - [H1] Core Structural     : ${counts.core}
   - [FH] Flight-Harbors      : ${counts.flight}
   - [DD] Drainable Dry-Docks : ${counts.drydock}
   - [SH] Sub-Launch Moonpools: ${counts.subhub}

3. ADVANTAGES VS RECTANGULAR BARGES
   - Tri-axial wave load dissipation at 120° intersections
   - Zero-tug station keeping via tuck swivel propellers
   - Isolated ballast dry-docking without compromising flight ops
   - Multi-tier vertical scale via corner interlock columns`

  const text = fmt === 'x' ? xText : specText

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setFmt('x')} style={{ borderColor: fmt === 'x' ? '#06b6d4' : undefined, color: fmt === 'x' ? '#06b6d4' : undefined }}>X REPLY</button>
        <button onClick={() => setFmt('spec')} style={{ borderColor: fmt === 'spec' ? '#06b6d4' : undefined, color: fmt === 'spec' ? '#06b6d4' : undefined }}>SPEC SHEET</button>
      </div>
      <textarea
        readOnly
        value={text}
        rows={10}
        style={{
          width: '100%', background: '#070b12', border: '1px solid #1e293b', borderRadius: 6,
          color: '#e2e8f0', fontFamily: 'ui-monospace, monospace', fontSize: 11, padding: 8, resize: 'vertical',
        }}
      />
      <button onClick={copy} style={{ background: '#f59e0b', color: '#0a0a0a', fontWeight: 700, border: 'none' }}>
        {copied ? '✓ COPIED' : 'COPY TO CLIPBOARD'}
      </button>
    </div>
  )
}

export function FloatingPanels() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null
  const right = typeof window !== 'undefined' ? Math.max(24, window.innerWidth - 340) : 900

  return (
    <>
      <Panel title="01 // HEX-MODULE PALETTE" initial={{ x: 16, y: 16 }}>
        <Palette />
      </Panel>
      <Panel title="02 // KINEMATIC CONTROLS" initial={{ x: 16, y: 420 }}>
        <Kinematics />
      </Panel>
      <Panel title="03 // LIVE ARRAY TELEMETRY" initial={{ x: right, y: 16 }}>
        <Telemetry />
      </Panel>
      <Panel title="04 // EXPORT X REPLY / BRIEF" initial={{ x: right, y: 360 }} wide>
        <ExportBrief />
      </Panel>
    </>
  )
}
