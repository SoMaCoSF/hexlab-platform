import { create } from 'zustand'

export type ModuleType = 'core' | 'flight' | 'drydock' | 'subhub'

export interface HexModule {
  id: string
  q: number
  r: number
  type: ModuleType
}

function key(q: number, r: number) {
  return `${q},${r}`
}

function carrierPreset(): HexModule[] {
  const mods: HexModule[] = [{ id: '0,0', q: 0, r: 0, type: 'subhub' }]
  ;[
    [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1],
  ].forEach(([q, r]) => mods.push({ id: key(q, r), q, r, type: 'core' }))
  const ring2: { q: number; r: number; type: ModuleType }[] = [
    { q: 2, r: 0, type: 'flight' },
    { q: 1, r: 1, type: 'core' },
    { q: 0, r: 2, type: 'flight' },
    { q: -1, r: 2, type: 'drydock' },
    { q: -2, r: 2, type: 'flight' },
    { q: -2, r: 1, type: 'core' },
    { q: -2, r: 0, type: 'flight' },
    { q: -1, r: -1, type: 'core' },
    { q: 0, r: -2, type: 'flight' },
    { q: 1, r: -2, type: 'drydock' },
    { q: 2, r: -2, type: 'flight' },
    { q: 2, r: -1, type: 'core' },
  ]
  ring2.forEach((m) => mods.push({ id: key(m.q, m.r), ...m }))
  return mods
}

function reconPreset(): HexModule[] {
  return [
    { id: '0,0', q: 0, r: 0, type: 'subhub' },
    { id: '1,0', q: 1, r: 0, type: 'flight' },
    { id: '0,1', q: 0, r: 1, type: 'core' },
    { id: '-1,1', q: -1, r: 1, type: 'drydock' },
    { id: '-1,0', q: -1, r: 0, type: 'flight' },
    { id: '0,-1', q: 0, r: -1, type: 'core' },
    { id: '1,-1', q: 1, r: -1, type: 'core' },
  ]
}

interface PlatformState {
  modules: HexModule[]
  selectedId: string | null
  activeTool: ModuleType | 'erase'
  gateOpen: number
  ballast: number
  showThrusters: boolean
  showInterlocks: boolean
  showStack: boolean
  showWaves: boolean
  preset: 'carrier' | 'recon' | 'sandbox'

  select: (id: string | null) => void
  setTool: (t: ModuleType | 'erase') => void
  place: (q: number, r: number) => void
  setGate: (v: number) => void
  setBallast: (v: number) => void
  setToggle: (k: 'showThrusters' | 'showInterlocks' | 'showStack' | 'showWaves', v: boolean) => void
  loadPreset: (name: 'carrier' | 'recon' | 'sandbox') => void
  getSelected: () => HexModule | null
  counts: () => { core: number; flight: number; drydock: number; subhub: number; total: number }
}

export const usePlatform = create<PlatformState>((set, get) => ({
  modules: carrierPreset(),
  selectedId: null,
  activeTool: 'core',
  gateOpen: 0.75,
  ballast: 0,
  showThrusters: true,
  showInterlocks: true,
  showStack: true,
  showWaves: true,
  preset: 'carrier',

  select: (id) => set({ selectedId: id }),
  setTool: (t) => set({ activeTool: t }),

  place: (q, r) => {
    const id = key(q, r)
    const { activeTool, modules } = get()
    if (activeTool === 'erase') {
      set({ modules: modules.filter((m) => m.id !== id), selectedId: null })
      return
    }
    const next = modules.filter((m) => m.id !== id)
    next.push({ id, q, r, type: activeTool })
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
    return {
      core: modules.filter((m) => m.type === 'core').length,
      flight: modules.filter((m) => m.type === 'flight').length,
      drydock: modules.filter((m) => m.type === 'drydock').length,
      subhub: modules.filter((m) => m.type === 'subhub').length,
      total: modules.length,
    }
  },
}))

export const HEX_SIZE = 1.55

export function axialToWorld(q: number, r: number, size = HEX_SIZE) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r)
  const z = size * ((3 / 2) * r)
  return [x, 0, z] as [number, number, number]
}
