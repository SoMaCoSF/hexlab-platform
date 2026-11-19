/** See local hexlab-src - content too large for single MCP arg; use push from clone */
export const INDUSTRIAL_ASSETS: any[] = []
export const FACILITY_BOMS: any[] = []
export const ASSET_BY_ID: Record<string, any> = {}
export function resolveAssetByNoun(_t: string) { return null }
export function getFacilityBom(_id: string) { return null }
export const HF_INDUSTRIAL_BASE = 'https://huggingface.co/datasets/nvidia/USDCraft-10K/tree/main/rigid/industrial_warehouse_construction_energy'
export function assetHfUrl(a: { path: string }) { return `${HF_INDUSTRIAL_BASE}/${a.path}` }
export type FacilityId = string
export type CraftAsset = any
export type FacilityBom = any
export type BomLine = any
export function expandBomLines(lines: any[]) { return lines }
