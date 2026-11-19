import { create } from 'zustand'

export type ModuleKind = 'harbor' | 'module' | 'corner' | 'drydock'

export interface HexCell {
  id: string
  q: number
  r: number
  kind: ModuleKind
  /** 0 = shut, 1 = fully open/raised */
  gateOpen: number
  /** 0 = full, 1 = drained */
  ballastDrain: number
  stacked: number
  selected?: boolean
}

function cellId(q: number, r: number) {
  return `${q},${r}`
}

function seedCells(): HexCell[] {
  const cells: HexCell[] = [
    { id: '0,0', q: 0, r: 0, kind: 'harbor', gateOpen: 0, ballastDrain: 0, stacked: 0 },
  ]
  const dirs = [
    [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1],
  ]
  for (const [dq, dr] of dirs) {
    cells.push({
      id: cellId(dq, dr),
      q: dq,
      r: dr,
      kind: 'module',
      gateOpen: 0,
      ballastDrain: 0,
      stacked: 0,
    })
  }
  for (const [dq, dr] of dirs) {
    cells.push({
      id: cellId(dq * 2, dr * 2),
      q: dq * 2,
      r: dr * 2,
      kind: 'corner',
      gateOpen: 0,
      ballastDrain: 0,
      stacked: 0,
    })
  }
  return cells
}

interface PlatformState {
  cells: HexCell[]
  selectedId: string | null
  select: (id: string | null) => void
  setGate: (id: string, value: number) => void
  setBallast: (id: string, value: number) => void
  addStack: (id: string) => void
  addHex: (q: number, r: number, kind?: ModuleKind) => void
  getSelected: () => HexCell | null
}

export const usePlatform = create<PlatformState>((set, get) => ({
  cells: seedCells(),
  selectedId: null,

  select: (id) => set({ selectedId: id }),

  setGate: (id, value) =>
    set((s) => ({
      cells: s.cells.map((c) =>
        c.id === id ? { ...c, gateOpen: Math.max(0, Math.min(1, value)) } : c
      ),
    })),

  setBallast: (id, value) =>
    set((s) => ({
      cells: s.cells.map((c) =>
        c.id === id ? { ...c, ballastDrain: Math.max(0, Math.min(1, value)) } : c
      ),
    })),

  addStack: (id) =>
    set((s) => ({
      cells: s.cells.map((c) =>
        c.id === id ? { ...c, stacked: c.stacked + 1 } : c
      ),
    })),

  addHex: (q, r, kind = 'module') => {
    const id = cellId(q, r)
    if (get().cells.some((c) => c.id === id)) return
    set((s) => ({
      cells: [
        ...s.cells,
        { id, q, r, kind, gateOpen: 0, ballastDrain: 0, stacked: 0 },
      ],
    }))
  },

  getSelected: () => {
    const { cells, selectedId } = get()
    return cells.find((c) => c.id === selectedId) ?? null
  },
}))
