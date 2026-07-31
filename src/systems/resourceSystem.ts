import type { GameState, Resources } from '../types'
import { clamp } from '../utils/rng'

export const DEFAULT_RESOURCES: Resources = {
  budget: 48000,
  overtimeHours: 40,
  maxOvertimeHours: 40,
  informantFunds: 2500,
  politicalSupport: 60,
  prosecutorConfidence: 55,
  communityTrust: 60,
  secrecy: 82,
  evidenceStrength: 4,
  alertLevel: 6,
}

export function adjustResource(state: GameState, key: keyof Resources, delta: number): GameState {
  const current = state.resources[key]
  let next = current + delta
  if (key === 'alertLevel' || key === 'secrecy' || key === 'evidenceStrength' ||
      key === 'politicalSupport' || key === 'prosecutorConfidence' || key === 'communityTrust') {
    next = clamp(next, 0, 100)
  } else {
    next = Math.max(0, next)
  }
  return {
    ...state,
    resources: { ...state.resources, [key]: next },
  }
}

export function canAfford(state: GameState, cost: Partial<Record<keyof Resources, number>>): boolean {
  return Object.entries(cost).every(([key, amount]) => {
    const k = key as keyof Resources
    if (amount === undefined) return true
    return state.resources[k] >= amount
  })
}

export function spendResources(state: GameState, cost: Partial<Record<keyof Resources, number>>): GameState {
  let next = state
  for (const [key, amount] of Object.entries(cost)) {
    if (amount === undefined) continue
    next = adjustResource(next, key as keyof Resources, -amount)
  }
  return next
}

export function dailyUpkeep(state: GameState): GameState {
  let next = state
  const informantUpkeep = state.informants.filter((i) => i.active).reduce((sum, i) => sum + i.weeklyCost / 7, 0)
  next = adjustResource(next, 'budget', -Math.round(200 + informantUpkeep))
  next = adjustResource(next, 'overtimeHours', next.resources.overtimeHours < next.resources.maxOvertimeHours
    ? Math.round(next.resources.maxOvertimeHours * 0.2)
    : 0)
  return next
}
