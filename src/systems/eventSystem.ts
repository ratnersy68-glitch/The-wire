import { RANDOM_EVENTS } from '../data/events'
import type { DailyReport, GameState, RandomEventId } from '../types'
import { nextId } from '../utils/id'
import { adjustResource } from './resourceSystem'

export interface EventRollResult {
  state: GameState
  report: DailyReport | null
}

const EVENT_CHANCE = 0.4

export function rollRandomEvent(state: GameState, rand: () => number): EventRollResult {
  if (rand() > EVENT_CHANCE) return { state, report: null }

  const eligible = RANDOM_EVENTS.filter((e) => e.minChapter <= state.chapter)
  if (eligible.length === 0) return { state, report: null }

  const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0)
  let roll = rand() * totalWeight
  let chosenId: RandomEventId = eligible[0].id
  for (const e of eligible) {
    roll -= e.weight
    if (roll <= 0) {
      chosenId = e.id
      break
    }
  }

  return applyEvent(state, chosenId, rand)
}

function applyEvent(state: GameState, id: RandomEventId, rand: () => number): EventRollResult {
  let next = state
  let title = ''
  let body = ''

  switch (id) {
    case 'suspect_changes_phone': {
      const candidates = next.suspects.filter((s) => s.knownPhone && !s.usingBurner)
      const target = candidates[Math.floor(rand() * candidates.length)]
      if (!target) return { state, report: null }
      next = {
        ...next,
        suspects: next.suspects.map((s) => (s.id === target.id ? { ...s, usingBurner: true, knownPhone: false } : s)),
      }
      title = 'Burner Swap'
      body = `A previously known number for "${target.alias}" has gone dead. Looks like a new phone.`
      break
    }
    case 'detective_sick': {
      const candidates = next.officers.filter((o) => o.available)
      const target = candidates[Math.floor(rand() * candidates.length)]
      if (!target) return { state, report: null }
      next = { ...next, officers: next.officers.map((o) => (o.id === target.id ? { ...o, available: false } : o)) }
      title = 'Called In Sick'
      body = `${target.name} called in sick today and won't be available for assignment.`
      break
    }
    case 'informant_demands_money': {
      const active = next.informants.filter((i) => i.active)
      if (active.length === 0) return { state, report: null }
      const target = active[Math.floor(rand() * active.length)]
      const demand = 300 + Math.floor(rand() * 500)
      next = adjustResource(next, 'informantFunds', -demand)
      title = 'Informant Demands More Money'
      body = `${target.codename} is asking for an extra $${demand} to keep talking. Paid out of informant funds.`
      break
    }
    case 'prosecutor_rejects_warrant': {
      const pending = next.warrants.filter((w) => w.status === 'pending')
      if (pending.length === 0) return { state, report: null }
      const target = pending[0]
      next = {
        ...next,
        warrants: next.warrants.map((w) => (w.id === target.id ? { ...w, status: 'denied', dayDecided: state.day } : w)),
      }
      next = adjustResource(next, 'prosecutorConfidence', -8)
      title = 'Warrant Rejected'
      body = 'The prosecutor\'s office rejected a pending warrant request, citing insufficient corroboration.'
      break
    }
    case 'commander_demands_arrests': {
      next = adjustResource(next, 'politicalSupport', -5)
      title = 'Commander Wants Arrests'
      body = 'Commander Falco is under pressure from upstairs and wants to see visible arrests soon.'
      break
    }
    case 'witness_disappears': {
      next = adjustResource(next, 'communityTrust', -6)
      next = adjustResource(next, 'alertLevel', 3)
      title = 'Witness Disappears'
      body = 'A witness who had been cooperating is now unreachable. Nobody in the neighborhood is talking about it.'
      break
    }
    case 'equipment_fails': {
      next = adjustResource(next, 'budget', -800)
      title = 'Equipment Failure'
      body = 'A surveillance camera failed overnight. Replacement and repair costs came out of the budget.'
      break
    }
    case 'rival_crew_violence': {
      next = adjustResource(next, 'communityTrust', -5)
      next = adjustResource(next, 'alertLevel', 5)
      title = 'Rival Crew Violence'
      body = 'A shooting linked to a rival crew has put the whole district on edge, complicating street-level work.'
      break
    }
    case 'newspaper_reports': {
      next = adjustResource(next, 'secrecy', -15)
      next = adjustResource(next, 'politicalSupport', rand() < 0.5 ? 5 : -5)
      title = 'Newspaper Report'
      body = 'The Port Mercy Sentinel ran a piece referencing an "ongoing narcotics investigation." Secrecy took a hit.'
      break
    }
    case 'suspect_arrested_other_unit': {
      const candidates = next.suspects.filter((s) => s.level === 'street' && !s.arrested && s.known)
      const target = candidates[Math.floor(rand() * candidates.length)]
      if (!target) return { state, report: null }
      next = { ...next, suspects: next.suspects.map((s) => (s.id === target.id ? { ...s, arrested: true } : s)) }
      next = adjustResource(next, 'evidenceStrength', -2)
      title = 'Arrested By Another Unit'
      body = `Patrol picked up "${target.alias}" on an unrelated charge. That lead is gone for now.`
      break
    }
    case 'file_leaked': {
      next = adjustResource(next, 'secrecy', -20)
      next = adjustResource(next, 'alertLevel', 10)
      title = 'Confidential File Leaked'
      body = 'Part of the case file surfaced outside the unit. Assume the organization has seen it.'
      break
    }
    case 'community_meeting': {
      next = adjustResource(next, 'communityTrust', 4)
      next = adjustResource(next, 'politicalSupport', -3)
      title = 'Community Meeting'
      body = 'Residents held a meeting demanding visible results. It builds trust but adds pressure to move fast.'
      break
    }
  }

  const report: DailyReport = {
    id: nextId('rep'),
    day: state.day,
    title,
    body,
    kind: 'event',
  }

  return { state: next, report }
}
