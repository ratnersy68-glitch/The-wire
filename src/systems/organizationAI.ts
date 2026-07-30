import type { GameState } from '../types'
import { clamp } from '../utils/rng'
import { adjustResource } from './resourceSystem'

export interface OrgReactionResult {
  state: GameState
  notes: string[]
}

export function applyOrganizationReactions(state: GameState, rand: () => number): OrgReactionResult {
  const alert = state.resources.alertLevel
  const notes: string[] = []
  let next = state

  // Baseline decay — the crew relaxes slightly if the heat isn't renewed.
  next = adjustResource(next, 'alertLevel', -1)

  if (alert > 20) {
    next = {
      ...next,
      suspects: next.suspects.map((s) => {
        if (!s.usingBurner && s.suspicionOfPolice > 35 && rand() < 0.3) {
          return { ...s, usingBurner: true }
        }
        return s
      }),
    }
    if (next.suspects.some((s) => s.usingBurner) && !state.suspects.some((s) => s.usingBurner)) {
      notes.push('Word on the street is some players have started switching phones.')
    }
  }

  if (alert > 45) {
    let cooled = false
    next = {
      ...next,
      locations: next.locations.map((l) => {
        if (l.type === 'corner' && l.heatLevel > 4 && rand() < 0.3) {
          cooled = true
          return { ...l, heatLevel: Math.max(0, l.heatLevel - 3) }
        }
        return l
      }),
    }
    if (cooled) notes.push('Street-level activity has quieted down — the organization is being more careful.')
  }

  if (alert > 65) {
    next = adjustResource(next, 'evidenceStrength', -2)
    if (rand() < 0.25) {
      notes.push('Leadership has gone dark. No calls, no meetings, nothing traceable for days at a time.')
    }
  }

  if (alert > 80 && rand() < 0.15) {
    next = {
      ...next,
      suspects: next.suspects.map((s) =>
        s.level === 'leadership' ? { ...s, caution: 'paranoid' as const, relocated: true } : s,
      ),
    }
    notes.push('Leadership appears to have relocated. This case just got harder.')
  }

  return { state: next, notes }
}
