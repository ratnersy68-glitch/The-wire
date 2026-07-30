import type { CautionLevel, Suspect } from '../types'

export const CAUTION_VALUE: Record<CautionLevel, number> = {
  reckless: 0,
  casual: 1,
  careful: 2,
  paranoid: 3,
}

export function displayName(suspect: Suspect): string {
  if (suspect.knownRealName) return `${suspect.realName} ("${suspect.alias}")`
  if (suspect.knownAlias) return `"${suspect.alias}"`
  return 'Unidentified Male/Female'
}

export function shortName(suspect: Suspect): string {
  if (suspect.knownRealName) return suspect.realName
  if (suspect.knownAlias) return `"${suspect.alias}"`
  return `Unknown (${suspect.id.slice(-4)})`
}

export function suspectsAtLocation(suspects: Suspect[], locationId: string): Suspect[] {
  return suspects.filter((s) => s.schedule.some((b) => b.locationId === locationId) && !s.arrested)
}
