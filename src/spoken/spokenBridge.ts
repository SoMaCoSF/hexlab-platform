/**
 * Spoken-world style bridge for HexLab — decoupled from estate / GYST.
 * Tier-0 local grammar: instant ops for install + facility BOM + stock.
 *
 * Examples:
 *   "install a band saw"
 *   "install drill press on selected"
 *   "create a bom for a woodshop and stock it"
 *   "stock the machine shop"
 *   "show bom for woodshop"
 */

import {
  resolveAssetByNoun,
  getFacilityBom,
  FACILITY_BOMS,
  ASSET_BY_ID,
  type CraftAsset,
  type FacilityBom,
  type BomLine,
} from '../catalog/usdcraftIndustrial'

export type SpokenOp =
  | { op: 'install'; asset: CraftAsset; target: 'selected' | 'next' }
  | { op: 'bom'; facility: FacilityBom; stock: boolean }
  | { op: 'list_facilities' }
  | { op: 'help' }
  | { op: 'unknown'; raw: string }

export function parseSpoken(input: string): SpokenOp {
  const raw = input.trim()
  const t = raw.toLowerCase().replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim()

  if (!t || /^(help|what can i say|\?)$/.test(t)) {
    return { op: 'help' }
  }

  if (/list (facilities|boms|shops)/.test(t) || t === 'facilities') {
    return { op: 'list_facilities' }
  }

  // "create a bom for a woodshop and stock it" / "bom woodshop stock" / "stock the woodshop"
  const bomMatch =
    t.match(/(?:create|make|generate|build)?\s*(?:a\s+)?(?:bom|bill of materials)\s+(?:for\s+)?(?:a\s+)?(.+?)(?:\s+and\s+(stock(?:\s+it)?)|\s+stock)?$/) ||
    t.match(/stock\s+(?:the\s+)?(.+?)(?:\s+bay|\s+shop|\s+facility)?$/) ||
    t.match(/(?:show|open)\s+(?:the\s+)?bom\s+(?:for\s+)?(?:a\s+)?(.+)$/)

  if (bomMatch) {
    let name = bomMatch[1].replace(/\s+and\s+stock(?:\s+it)?$/, '').trim()
    name = name.replace(/^(a|the)\s+/, '')
    const facility = getFacilityBom(name) || fuzzyFacility(name)
    if (facility) {
      const stock =
        /\bstock\b/.test(t) ||
        /and\s+stock/.test(t) ||
        t.startsWith('stock')
      return { op: 'bom', facility, stock }
    }
  }

  // "install a band saw" / "place drill press" / "add a workbench"
  const installMatch = t.match(
    /(?:install|place|add|put|drop|mount)\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\s+on\s+(selected|this|here|next))?$/,
  )
  if (installMatch) {
    const noun = installMatch[1].replace(/\s+on\s+(selected|this|here|next)$/, '').trim()
    const asset = resolveAssetByNoun(noun)
    if (asset) {
      const target = /selected|this|here/.test(t) ? 'selected' : 'next'
      return { op: 'install', asset, target }
    }
  }

  // bare asset name as install
  const bare = resolveAssetByNoun(t)
  if (bare && t.split(' ').length <= 4) {
    return { op: 'install', asset: bare, target: 'next' }
  }

  return { op: 'unknown', raw }
}

function fuzzyFacility(name: string): FacilityBom | null {
  const n = name.toLowerCase()
  if (/wood|maker|carpentry|joinery/.test(n)) return getFacilityBom('woodshop')
  if (/machine\s*shop|machining|cnc/.test(n)) return getFacilityBom('machineshop')
  if (/fab|weld|metal/.test(n)) return getFacilityBom('fabrication')
  if (/ware|logistics|storage/.test(n)) return getFacilityBom('warehouse')
  if (/process|chemical|desal|refin/.test(n)) return getFacilityBom('process')
  if (/power|energy|solar|gen/.test(n)) return getFacilityBom('power')
  if (/robot|automation|cell/.test(n)) return getFacilityBom('robotics')
  return null
}

export function expandBomLines(lines: BomLine[]) {
  return lines.map((l) => ({
    ...l,
    asset: ASSET_BY_ID[l.assetId],
  })).filter((l) => l.asset)
}

export function helpText(): string {
  const facilities = FACILITY_BOMS.map((f) => f.id).join(', ')
  return [
    'SPOKEN // HEXLAB (decoupled from estate)',
    '',
    'Install a piece:',
    '  "install a band saw"',
    '  "place drill press on selected"',
    '  "add a workbench"',
    '',
    'Facility BOM + stock:',
    '  "create a bom for a woodshop and stock it"',
    '  "stock the machine shop"',
    '  "show bom for fabrication"',
    '',
    `Facilities: ${facilities}`,
    '',
    'Assets map to NVIDIA USDCraft-10K industrial (Apache-2.0).',
  ].join('\n')
}
