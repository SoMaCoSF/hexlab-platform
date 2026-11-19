/**
 * HexLab city infrastructure kit
 *
 * Horizontal cell = hexagonal tube module (shipping-container modularity, hex section).
 * Vertex tower  = same kit, vertical axis, larger diameter — shared risers at 120° junctions.
 *
 * Cross-section of a cell:
 *   - center corridor (circulation / access spine)
 *   - six radial utility wedges at the flat angles (MEP + life + float)
 *   - face couplings mid-edge (cell-to-cell)
 *   - vertex nodes feed into the vertical tower stack
 */

export type UtilityChannel =
  | 'power'
  | 'freshwater'
  | 'ballast'
  | 'seawater'
  | 'hvac'
  | 'data'
  | 'waste'
  | 'fire'
  | 'fuel'
  | 'life'

export type InterconnectAxis = 'horizontal' | 'vertical'

export interface ChannelSpec {
  id: UtilityChannel
  label: string
  color: string
  /** Wedge index 0–5 around the hex (flat-centered) */
  wedge: number
  description: string
}

/** Six wedges — one primary service per angle of the hex tube */
export const CHANNELS: ChannelSpec[] = [
  { id: 'power',      label: 'Power',       color: '#fbbf24', wedge: 0, description: 'MV/LV bus, switchgear risers' },
  { id: 'freshwater', label: 'Fresh water', color: '#22d3ee', wedge: 1, description: 'Potable + process supply' },
  { id: 'ballast',    label: 'Ballast',     color: '#3b82f6', wedge: 2, description: 'Trim tanks, flood/drain' },
  { id: 'hvac',       label: 'HVAC / air',  color: '#94a3b8', wedge: 3, description: 'Supply / exhaust / purge' },
  { id: 'data',       label: 'Data / fiber', color: '#a855f7', wedge: 4, description: 'Backbone + local loops' },
  { id: 'waste',      label: 'Waste / grey', color: '#78716c', wedge: 5, description: 'Collection, treatment feed' },
]

export const EXTRA_CHANNELS: ChannelSpec[] = [
  { id: 'seawater', label: 'Seawater', color: '#0ea5e9', wedge: 2, description: 'Intake / cooling loop' },
  { id: 'fire',     label: 'Fire main', color: '#ef4444', wedge: 0, description: 'Pressurized fire ring' },
  { id: 'fuel',     label: 'Fuel',      color: '#f97316', wedge: 1, description: 'Bunker / process feedstock' },
  { id: 'life',     label: 'Life support', color: '#10b981', wedge: 3, description: 'O₂, medical gas, alarms' },
]

/** Standard cell lengths — analogous to ISO container lengths, hex envelope */
export type CellLengthClass = '20' | '40' | '45'

export const CELL_LENGTH_M: Record<CellLengthClass, number> = {
  '20': 6.1,
  '40': 12.2,
  '45': 13.7,
}

/**
 * Flat-to-flat of the *horizontal* hex tube for each city size class.
 * Interior corridor is ~0.28 of F-F so people + carts pass the spine.
 */
export const TUBE_FF_M: Record<'scout' | 'standard' | 'industrial' | 'capital', number> = {
  scout: 16,
  standard: 32,
  industrial: 64,
  capital: 128,
}

/**
 * Vertex towers = same module family, vertical, larger diameter.
 * Scale vs the cells that meet at that node.
 */
export const TOWER_FF_FACTOR = 1.35

export interface TubeSectionLayout {
  flatToFlatM: number
  corridorFF: number
  wedgeDepthM: number
  wallM: number
  lengthM: number
  channels: ChannelSpec[]
}

export function layoutForCell(
  size: keyof typeof TUBE_FF_M,
  length: CellLengthClass = '40',
): TubeSectionLayout {
  const ff = TUBE_FF_M[size]
  const corridorFF = ff * 0.28
  const wallM = Math.max(0.25, ff * 0.02)
  return {
    flatToFlatM: ff,
    corridorFF,
    wedgeDepthM: (ff - corridorFF) / 2 - wallM,
    wallM,
    lengthM: CELL_LENGTH_M[length],
    channels: CHANNELS,
  }
}

export function layoutForTower(
  size: keyof typeof TUBE_FF_M,
  stories = 4,
): TubeSectionLayout & { heightM: number; stories: number } {
  const base = layoutForCell(size, '40')
  const ff = base.flatToFlatM * TOWER_FF_FACTOR
  const corridorFF = ff * 0.32
  const wallM = Math.max(0.35, ff * 0.025)
  const storyH = 4.2
  return {
    flatToFlatM: ff,
    corridorFF,
    wedgeDepthM: (ff - corridorFF) / 2 - wallM,
    wallM,
    lengthM: base.lengthM,
    channels: CHANNELS,
    heightM: stories * storyH,
    stories,
  }
}

/** Face coupling: which channels pass cell-to-cell across a shared edge */
export interface FaceCoupling {
  edge: number // 0–5
  channels: UtilityChannel[]
  structural: boolean
  personnel: boolean
}

export const DEFAULT_FACE_COUPLING: UtilityChannel[] = [
  'power', 'freshwater', 'ballast', 'hvac', 'data', 'waste',
]

/**
 * Vertex interconnect matrix — when 2+ cells share a vertex,
 * the vertical tower inherits the union of channels and upsizes.
 */
export interface VertexNode {
  key: string
  x: number
  z: number
  /** How many cell corners meet here */
  degree: number
  channels: UtilityChannel[]
  towerFF: number
  hasThruster: boolean
}

export type BuildBayMode =
  | 'section'      // single tube cross-section
  | 'cell'         // full horizontal module
  | 'tower'        // vertical vertex tower
  | 'matrix'       // interconnect matrix overview
  | 'city'         // array + towers together

export interface BuildBayState {
  mode: BuildBayMode
  size: keyof typeof TUBE_FF_M
  length: CellLengthClass
  towerStories: number
  showCorridor: boolean
  showWedges: boolean
  showFaceCouplings: boolean
  showVertexTowers: boolean
  activeChannel: UtilityChannel | 'all'
  transparentShell: boolean
}
