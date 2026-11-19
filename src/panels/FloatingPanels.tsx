import { useState, useRef, useCallback, useEffect } from 'react'
import { usePlatform, ModuleType, SizeClass, SIZE_METERS } from '../state/platformStore'

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
      style={{ left: pos.x, top: pos.y, maxWidth: wide ? 400 : 340, minWidth: wide ? 300 : 270 }}
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
  { id: 'core', code: 'H1', name: 'Core Infra', tag: 'STRUCTURAL', desc: 'Hull, interlocks, Tier-2 stack.', color: '#06b6d4' },
  { id: 'flight', code: 'FH', name: 'Flight-Harbor', tag: 'UAV/VTOL', desc: 'Swing face-gate + deck UAV.', color: '#f59e0b' },
  { id: 'drydock', code: 'DD', name: 'Dry-Dock', tag: 'BALLAST', desc: 'Drainable cradle for USV.', color: '#10b981' },
  { id: 'subhub', code: 'SH', name: 'Sub-Harbor', tag: 'MOONPOOL', desc: 'UUV/AUV launch recovery.', color: '#a855f7' },
  { id: 'refinery', code: 'RF', name: 'Refinery Bay', tag: 'SLAB IND', desc: 'Oil / chemical process towers.', color: '#f97316' },
  { id: 'desal', code: 'DS', name: 'Desalination', tag: 'SLAB IND', desc: 'Freshwater plant module.', color: '#22d3ee' },
  { id: 'lab', code: 'LB', name: 'Med / R&D Lab', tag: 'SLAB IND', desc: 'Medical research bay.', color: '#a3e635' },
  { id: 'power', code: 'PW', name: 'Power Node', tag: 'SLAB IND', desc: 'Generation / distribution.', color: '#fbbf24' },
  { id: 'erase', code: 'RM', name: 'Decommission', tag: 'REMOVE', desc: 'Clear hex cell.', color: '#f43f5e' },
]

const SIZES: { id: SizeClass; label: string }[] = [
  { id: 'scout', label: '16m SCOUT' },
  { id: 'standard', label: '32m STD' },
  { id: 'industrial', label: '64m IND' },
  { id: 'capital', label: '128m CAP' },
]

function Palette() {
  const activeTool = usePlatform((s) => s.activeTool)
  const setTool = usePlatform((s) => s.setTool)
  const activeSize = usePlatform((s) => s.activeSize)
  const setSize = usePlatform((s) => s.setSize)
  const loadPreset = usePlatform((s) => s.loadPreset)
  const preset = usePlatform((s) => s.preset)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {(['recon', 'carrier', 'sandbox'] as const).map((p) => (
          <button key={p} onClick={() => loadPreset(p)}
            style={{ borderColor: preset === p ? '#06b6d4' : undefined, color: preset === p ? '#06b6d4' : undefined }}>
            {p === 'recon' ? '7-HEX RECON' : p === 'carrier' ? '19-HEX CARRIER' : 'SANDBOX'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {SIZES.map((s) => (
          <button key={s.id} onClick={() => setSize(s.id)}
            style={{ borderColor: activeSize === s.id ? '#f59e0b' : undefined, color: activeSize === s.id ? '#f59e0b' : undefined, fontSize: 11 }}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }}>
        ACTIVE SIZE · {SIZE_METERS[activeSize]}m flat-to-flat
      </div>
      {TOOLS.map((t) => (
        <button key={t.id} onClick={() => setTool(t.id)}
          style={{
            display: 'flex', gap: 8, alignItems: 'flex-start', textAlign: 'left', width: '100%',
            borderColor: activeTool === t.id ? t.color : undefined,
            background: activeTool === t.id ? `${t.color}18` : undefined,
          }}>
          <span style={{
            width: 26, height: 26, borderRadius: 4, border: `1px solid ${t.color}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: t.color, flexShrink: 0,
          }}>{t.code}</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
              <span>{t.name}</span>
              <span style={{ color: t.color, fontSize: 9, fontFamily: 'monospace' }}>{t.tag}</span>
            </span>
            <span style={{ fontSize: 10, opacity: 0.6, display: 'block', marginTop: 1 }}>{t.desc}</span>
          </span>
        </button>
      ))}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          <span style={{ color: '#10b981' }}>{balPct === 0 ? 'DRAINED' : balPct === 100 ? 'FLOODED' : 'BALLASTING'} ({balPct}%)</span>
        </span>
        <input type="range" min={0} max={1} step={0.01} value={ballast} onChange={(e) => setBallast(+e.target.value)} />
      </label>
      {([
        ['showThrusters', 'Tuck Swivel Propellers', showThrusters],
        ['showInterlocks', 'Corner Interlocks', showInterlocks],
        ['showStack', 'Upper Platform Stack', showStack],
        ['showWaves', 'Sea State Hydro-Sim', showWaves],
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

  let area = 0
  modules.forEach((m) => {
    const m2 = SIZE_METERS[m.size]
    // regular hex area = (3√3/2) * side²; side = F-F / √3
    const side = m2 / Math.sqrt(3)
    area += (3 * Math.sqrt(3) / 2) * side * side
  })
  if (showStack) area += counts.core * 680

  const vertexMap = new Map<string, number>()
  modules.forEach((m) => {
    // approximate with standard spacing for node count
    const size = 1.55 * (SIZE_METERS[m.size] / 32)
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
  const displacement = modules.reduce((n, m) => n + SIZE_METERS[m.size] * 70, 0)
  const stability = counts.total === 0 ? 0 : Math.min(99.4, 84 + (intersections / Math.max(1, counts.total)) * 8.5)
  const bays = counts.flight + counts.drydock + counts.subhub + counts.refinery + counts.desal + counts.lab + counts.power

  const cells = [
    { label: 'ACTIVE HEX', value: String(counts.total), sub: 'MIXED SIZES' },
    { label: 'DECK AREA', value: `${Math.round(area).toLocaleString()} m²`, sub: showStack ? '+TIER-2' : 'SINGLE' },
    { label: 'NODES', value: String(vertexMap.size), sub: '120° Y-JOINTS' },
    { label: 'THRUSTERS', value: String(thrusters), sub: 'AZIMUTH' },
    { label: 'DISPLACEMENT', value: `${Math.round(displacement).toLocaleString()} t`, sub: 'EST.' },
    { label: 'FUNCTION BAYS', value: String(bays), sub: `FH ${counts.flight} · IND ${counts.refinery + counts.desal + counts.lab + counts.power}` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {cells.map((c) => (
          <div key={c.label} style={{ background: '#0a1018', border: '1px solid #1e293b', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 10, opacity: 0.55 }}>{c.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{c.value}</div>
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
          <div style={{ height: '100%', width: `${stability}%`, background: 'linear-gradient(90deg,#06b6d4,#10b981)' }} />
        </div>
      </div>
    </div>
  )
}

function ExportBrief() {
  const counts = usePlatform((s) => s.counts)()
  const modules = usePlatform((s) => s.modules)
  const [copied, setCopied] = useState(false)
  const [fmt, setFmt] = useState<'x' | 'spec'>('x')

  const area = modules.reduce((n, m) => {
    const m2 = SIZE_METERS[m.size]
    const side = m2 / Math.sqrt(3)
    return n + (3 * Math.sqrt(3) / 2) * side * side
  }, 0)

  const xText = `@PalmerLuckey Why deselect Hexagons? Rectangular hulls concentrate 4-corner shear in cross-seas. 120° hexagonal tessellation distributes wave loads tri-axially and unlocks discrete inframodules aligned to SLAB's industrial brief:

1/ Functional bays (live array):
• ${counts.flight}× Flight-Harbor (swing/raise/lower gates, UAV/VTOL)
• ${counts.drydock}× Drainable dry-docks (USV service)
• ${counts.subhub}× Moonpool sub-launch harbors
• ${counts.refinery + counts.desal + counts.lab + counts.power}× SLAB industrial nodes (refinery / desal / lab / power)

2/ Scale classes: 16m scout · 32m standard · 64m industrial · 128m capital — mix in one array
3/ ${counts.total} hexes · ~${Math.round(area).toLocaleString()} m² deck · vertex ties + tuck swivel DP thrusters

CAD: hexlab.somacosf.com — SoMaCoSF anymachine / anykit construction set`

  const specText = `HEXLAB.SOMACOSF.COM // SLAB-ALIGNED HEX CONSTRUCTION SET

ARRAY: ${counts.total} modules · ~${Math.round(area).toLocaleString()} m²
H1 core ${counts.core} · FH ${counts.flight} · DD ${counts.drydock} · SH ${counts.subhub}
RF ${counts.refinery} · DS ${counts.desal} · LB ${counts.lab} · PW ${counts.power}

SIZE CLASSES (flat-to-flat): 16 / 32 / 64 / 128 m
DESIGN DRIVERS (from public SLAB statements):
- 1,000-year design life ambition
- Cheaper than land; relief valve for state/local industrial constraints
- Target industries: metal processing, medical R&D, desalination, oil refining, chemical engineering
- ~3 nmi offshore for state waters boundary (CA example)
- Not a pure AI datacenter — industrial seastead first

HEX vs RECT: tri-axial load share, discrete drainable/swing bays, intersection thrusters, stackable decks.`

  const text = fmt === 'x' ? xText : specText
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* */ }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setFmt('x')} style={{ borderColor: fmt === 'x' ? '#06b6d4' : undefined, color: fmt === 'x' ? '#06b6d4' : undefined }}>X REPLY</button>
        <button onClick={() => setFmt('spec')} style={{ borderColor: fmt === 'spec' ? '#06b6d4' : undefined, color: fmt === 'spec' ? '#06b6d4' : undefined }}>SPEC / SLAB</button>
      </div>
      <textarea readOnly value={text} rows={11} style={{
        width: '100%', background: '#070b12', border: '1px solid #1e293b', borderRadius: 6,
        color: '#e2e8f0', fontFamily: 'ui-monospace, monospace', fontSize: 11, padding: 8, resize: 'vertical',
      }} />
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
  const right = typeof window !== 'undefined' ? Math.max(24, window.innerWidth - 360) : 900

  return (
    <>
      <Panel title="01 // CONSTRUCTION SET" initial={{ x: 16, y: 16 }}>
        <Palette />
      </Panel>
      <Panel title="02 // KINEMATICS" initial={{ x: 16, y: 480 }}>
        <Kinematics />
      </Panel>
      <Panel title="03 // TELEMETRY" initial={{ x: right, y: 16 }}>
        <Telemetry />
      </Panel>
      <Panel title="04 // EXPORT / SLAB BRIEF" initial={{ x: right, y: 340 }} wide>
        <ExportBrief />
      </Panel>
    </>
  )
}
