import { create } from 'zustand'

/** Module function types — HexLab inframodule set */
export type ModuleType =
  | 'core'
  | 'flight'
  | 'drydock'
  | 'subhub'
  | 'refinery'
  | 'desal'
  | 'lab'
  | 'power'

/** Physical scale class — flat-to-flat metres (concept scale) */
export type SizeClass = 'scout' | 'standard' | 'industrial' | 'capital'

export const SIZE_METERS: Record<SizeClass, number> = {
  scout: 16,
  standard: 32,
  industrial: 64,
  capital: 128,
}

/** Scene units per real metre so standard ≈ 1.55 scene units */
export const SCENE_PER_METER = 1.55 / 32

export function sizeToScene(size: SizeClass) {
  return SIZE_METERS[size] * SCENE_PER_METER
}

export interface HexModule {
  id: string
  q: number
  r: number
  type: ModuleType
  size: SizeClass
}

function key(q: number, r: number) {
  return `${q},${r}`
}

function carrierPreset(): HexModule[] {
  const s: SizeClass = 'standard'
  const mods: HexModule[] = [{ id: '0,0', q: 0, r: 0, type: 'subhub', size: s }]
  ;[
    [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1],
  ].forEach(([q, r]) => mods.push({ id: key(q, r), q, r, type: 'core', size: s }))
  const ring2: { q: number; r: number; type: ModuleType }[] = [
    { q: 2, r: 0, type: 'flight' },
    { q: 1, r: 1, type: 'core' },
    { q: 0, r: 2, type: 'flight' },
    { q: -1, r: 2, type: 'drydock' },
    { q: -2, r: 2, type: 'flight' },
    { q: -2, r: 1, type: 'refinery' },
    { q: -2, r: 0, type: 'flight' },
    { q: -1, r: -1, type: 'desal' },
    { q: 0, r: -2, type: 'flight' },
    { q: 1, r: -2, type: 'drydock' },
    { q: 2, r: -2, type: 'flight' },
    { q: 2, r: -1, type: 'lab' },
  ]
  ring2.forEach((m) => mods.push({ id: key(m.q, m.r), ...m, size: s }))
  return mods
}

function reconPreset(): HexModule[] {
  const s: SizeClass = 'scout'
  return [
    { id: '0,0', q: 0, r: 0, type: 'subhub', size: s },
    { id: '1,0', q: 1, r: 0, type: 'flight', size: s },
    { id: '0,1', q: 0, r: 1, type: 'core', size: s },
    { id: '-1,1', q: -1, r: 1, type: 'drydock', size: s },
    { id: '-1,0', q: -1, r: 0, type: 'flight', size: s },
    { id: '0,-1', q: 0, r: -1, type: 'power', size: s },
    { id: '1,-1', q: 1, r: -1, type: 'core', size: s },
  ]
}

interface PlatformState {
  modules: HexModule[]
  selectedId: string | null
  activeTool: ModuleType | 'erase'
  activeSize: SizeClass
  gateOpen: number
  ballast: number
  showThrusters: boolean
  showInterlocks: boolean
  showStack: boolean
  showWaves: boolean
  preset: 'carrier' | 'recon' | 'sandbox'

  select: (id: string | null) => void
  setTool: (t: ModuleType | 'erase') => void
  setSize: (s: SizeClass) => void
  place: (q: number, r: number) => void
  setGate: (v: number) => void
  setBallast: (v: number) => void
  setToggle: (k: 'showThrusters' | 'showInterlocks' | 'showStack' | 'showWaves', v: boolean) => void
  loadPreset: (name: 'carrier' | 'recon' | 'sandbox') => void
  getSelected: () => HexModule | null
  counts: () => Record<ModuleType | 'total', number>
}

export const usePlatform = create<PlatformState>((set, get) => ({
  modules: carrierPreset(),
  selectedId: null,
  activeTool: 'core',
  activeSize: 'standard',
  gateOpen: 0.75,
  ballast: 0,
  showThrusters: true,
  showInterlocks: true,
  showStack: true,
  showWaves: true,
  preset: 'carrier',

  select: (id) => set({ selectedId: id }),
  setTool: (t) => set({ activeTool: t }),
  setSize: (s) => set({ activeSize: s }),

  place: (q, r) => {
    const id = key(q, r)
    const { activeTool, activeSize, modules } = get()
    if (activeTool === 'erase') {
      set({ modules: modules.filter((m) => m.id !== id), selectedId: null })
      return
    }
    const next = modules.filter((m) => m.id !== id)
    next.push({ id, q, r, type: activeTool, size: activeSize })
    set({ modules: next, selectedId: id })
  },

  setGate: (v) => set({ gateOpen: Math.max(0, Math.min(1, v)) }),
  setBallast: (v) => set({ ballast: Math.max(0, Math.min(1, v)) }),
  setToggle: (k, v) => set({ [k]: v } as Partial<PlatformState>),

  loadPreset: (name) => {
    if (name === 'carrier') set({ modules: carrierPreset(), preset: 'carrier', selectedId: null })
    else if (name === 'recon') set({ modules: reconPreset(), preset: 'recon', selectedId: null })
    else set({ modules: [], preset: 'sandbox', selectedId: null })
  },

  getSelected: () => {
    const { modules, selectedId } = get()
    return modules.find((m) => m.id === selectedId) ?? null
  },

  counts: () => {
    const modules = get().modules
    const base: Record<ModuleType | 'total', number> = {
      core: 0, flight: 0, drydock: 0, subhub: 0,
      refinery: 0, desal: 0, lab: 0, power: 0, total: modules.length,
    }
    modules.forEach((m) => { base[m.type]++ })
    return base
  },
}))

/** Axial → world using the module's own size class */
export function axialToWorld(q: number, r: number, sizeClass: SizeClass = 'standard') {
  const size = sizeToScene(sizeClass)
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r)
  const z = size * ((3 / 2) * r)
  return [x, 0, z] as [number, number, number]
}
