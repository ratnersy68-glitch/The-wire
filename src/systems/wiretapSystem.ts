import { CALL_TEMPLATES } from '../data/calls'
import type { DailyReport, GameState, PhoneCall } from '../types'
import { nextId } from '../utils/id'
import { adjustResource } from './resourceSystem'

export const WIRETAP_EVIDENCE_THRESHOLD = 25
export const CODE_TERM_DISCOVERY_THRESHOLD = 3

export function isWiretapEligible(state: GameState): boolean {
  return state.resources.evidenceStrength >= WIRETAP_EVIDENCE_THRESHOLD && state.resources.prosecutorConfidence >= 30
}

function timeLabel(rand: () => number): string {
  const hour = Math.floor(rand() * 14) + 7 // 7am - 8pm
  const minute = Math.floor(rand() * 60)
  const period = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${h12}:${minute.toString().padStart(2, '0')} ${period}`
}

export interface WiretapDayResult {
  state: GameState
  reports: DailyReport[]
}

export function interceptCallsForDay(state: GameState, rand: () => number): WiretapDayResult {
  if (!state.wiretapActive) return { state, reports: [] }

  const usedIds = new Set(state.calls.map((c) => c.id))
  const available = CALL_TEMPLATES.filter((c) => !usedIds.has(c.id))
  if (available.length === 0) return { state, reports: [] }

  const countToday = 1 + (rand() < 0.5 ? 1 : 0)
  const chosen: PhoneCall[] = []
  const pool = [...available]
  for (let i = 0; i < countToday && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length)
    const template = pool.splice(idx, 1)[0]
    chosen.push({
      ...template,
      day: state.day,
      timestamp: timeLabel(rand),
    })
  }

  const reports: DailyReport[] = chosen.map((call) => ({
    id: nextId('rep'),
    day: state.day,
    title: 'Wiretap — New Intercept',
    body: `A new call was intercepted at ${call.timestamp}. Review it in the Wiretap Terminal.`,
    kind: 'wiretap',
  }))

  let next: GameState = { ...state, calls: [...state.calls, ...chosen] }
  next = adjustResource(next, 'evidenceStrength', chosen.length * 2)

  return { state: next, reports }
}

export function reviewCall(state: GameState, callId: string): GameState {
  const call = state.calls.find((c) => c.id === callId)
  if (!call || call.heard) return state

  let exposure = { ...state.codeTermExposure }
  for (const term of call.codeWordsUsed) {
    exposure[term] = (exposure[term] ?? 0) + 1
  }

  const codeTerms = state.codeTerms.map((t) => {
    if (t.discovered) return t
    const count = exposure[t.term] ?? 0
    return count >= CODE_TERM_DISCOVERY_THRESHOLD ? { ...t, discovered: true } : t
  })

  const calls = state.calls.map((c) => (c.id === callId ? { ...c, heard: true } : c))

  return { ...state, calls, codeTerms, codeTermExposure: exposure }
}

export function markCallAddedToBoard(state: GameState, callId: string): GameState {
  return { ...state, calls: state.calls.map((c) => (c.id === callId ? { ...c, addedToBoard: true } : c)) }
}
