import type { MatchState } from '../state.js'
import { gameHour } from '../state.js'

export type ActionResult = { ok: true } | { ok: false; error: string }

export function onCooldown(match: MatchState, role: 'police' | 'org', key: string): boolean {
  const readyAt = match.actionCooldowns[role][key]
  return readyAt !== undefined && gameHour(match) < readyAt
}

export function setCooldown(match: MatchState, role: 'police' | 'org', key: string, hours: number) {
  match.actionCooldowns[role][key] = gameHour(match) + hours
}

export function lockForever(match: MatchState, role: 'police' | 'org', key: string) {
  match.actionCooldowns[role][key] = Infinity
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
