import type { DailyReport, EvidenceItem, GameState, Suspect } from '../types'
import { clamp } from '../utils/rng'
import { CAUTION_VALUE, shortName, suspectsAtLocation } from '../utils/suspectHelpers'
import { nextId } from '../utils/id'
import { adjustResource } from './resourceSystem'

export interface SurveillanceOutcome {
  state: GameState
  report: DailyReport
}

function makeEvidence(
  partial: Omit<EvidenceItem, 'id' | 'dateAdded' | 'x' | 'y' | 'admissible' | 'chainOfCustody' | 'corroborated'> &
    Partial<Pick<EvidenceItem, 'corroborated' | 'chainOfCustody'>>,
  day: number,
): EvidenceItem {
  return {
    id: nextId('ev'),
    dateAdded: day,
    x: 40 + Math.random() * 400,
    y: 40 + Math.random() * 300,
    admissible: partial.legality >= 60 && partial.reliability >= 50,
    chainOfCustody: partial.chainOfCustody ?? ['Filed by assigned detective'],
    corroborated: partial.corroborated ?? false,
    ...partial,
  }
}

export function resolveSurveillance(
  state: GameState,
  officerId: string,
  locationId: string,
  rand: () => number,
): SurveillanceOutcome {
  const officer = state.officers.find((o) => o.id === officerId)
  const location = state.locations.find((l) => l.id === locationId)
  if (!officer || !location) {
    throw new Error('Invalid surveillance assignment')
  }

  const present = suspectsAtLocation(state.suspects, locationId)
  const avgCaution = present.length
    ? present.reduce((sum, s) => sum + CAUTION_VALUE[s.caution], 0) / present.length
    : 1

  const skillScore =
    officer.skills.surveillance * 4 -
    (officer.fatigue > 60 ? 15 : officer.fatigue > 30 ? 5 : 0) -
    location.heatLevel -
    avgCaution * 8 -
    state.resources.alertLevel * 0.3

  const roll = rand() * 100 + skillScore

  let next = state
  let title = 'Surveillance Report'
  let body = ''
  let outcome:
    | 'spotted'
    | 'lose_target'
    | 'innocent_event'
    | 'identify_suspect'
    | 'discover_vehicle'
    | 'photograph_meeting'
    | 'discover_location' = 'innocent_event'

  if (present.length === 0) {
    outcome = rand() < 0.5 ? 'innocent_event' : 'lose_target'
  } else if (roll < 20) {
    outcome = 'spotted'
  } else if (roll < 40) {
    outcome = 'lose_target'
  } else if (roll < 65) {
    outcome = 'identify_suspect'
  } else if (roll < 82) {
    outcome = present.some((s) => !s.knownVehicle && s.vehicle) ? 'discover_vehicle' : 'identify_suspect'
  } else if (roll < 95 && present.length >= 2) {
    outcome = 'photograph_meeting'
  } else {
    outcome = 'discover_location'
  }

  switch (outcome) {
    case 'spotted': {
      title = 'Detail Made'
      body = `${officer.name} was spotted watching ${location.name}. Word travels fast on a corner like that.`
      for (const s of present) {
        next = updateSuspect(next, s.id, (sus) => ({
          ...sus,
          suspicionOfPolice: clamp(sus.suspicionOfPolice + 15, 0, 100),
        }))
      }
      next = adjustResource(next, 'secrecy', -6)
      next = adjustResource(next, 'alertLevel', 4)
      next = updateOfficer(next, officerId, (o) => ({ ...o, fatigue: clamp(o.fatigue + 20, 0, 100) }))
      break
    }
    case 'lose_target': {
      title = 'Surveillance — Target Lost'
      body = `${officer.name} lost track of the subject in foot traffic near ${location.name}. No usable information gathered.`
      next = updateOfficer(next, officerId, (o) => ({ ...o, fatigue: clamp(o.fatigue + 12, 0, 100) }))
      break
    }
    case 'innocent_event': {
      title = 'Surveillance — Nothing of Note'
      body = `${officer.name} watched ${location.name} for the shift. Deliveries, foot traffic, nothing tied to the case.`
      next = updateOfficer(next, officerId, (o) => ({ ...o, fatigue: clamp(o.fatigue + 10, 0, 100) }))
      break
    }
    case 'identify_suspect': {
      const target = present.find((s) => !s.knownAlias) ?? present[0]
      const revealReal = rand() < 0.4
      next = updateSuspect(next, target.id, (sus) => ({
        ...sus,
        known: true,
        knownAlias: true,
        knownRealName: sus.knownRealName || revealReal,
      }))
      title = 'Surveillance — Subject Identified'
      body = `${officer.name} got a clean look at a subject working ${location.name}. Street name: "${target.alias}".${
        revealReal ? ` DMV photo match confirms real identity: ${target.realName}.` : ''
      }`
      const ev = makeEvidence(
        {
          type: 'surveillance_note',
          title: `Subject identified at ${location.name}`,
          description: body,
          source: 'surveillance',
          relatedSuspectIds: [target.id],
          relatedLocationIds: [location.id],
          reliability: 70,
          legality: 90,
        },
        state.day,
      )
      next = { ...next, evidence: [...next.evidence, ev] }
      next = updateOfficer(next, officerId, (o) => ({ ...o, fatigue: clamp(o.fatigue + 14, 0, 100) }))
      break
    }
    case 'discover_vehicle': {
      const target = present.find((s) => !s.knownVehicle && s.vehicle) ?? present[0]
      next = updateSuspect(next, target.id, (sus) => ({ ...sus, knownVehicle: true, known: true }))
      title = 'Surveillance — Vehicle Identified'
      body = `${officer.name} logged a vehicle associated with ${shortName(target)} at ${location.name}: ${target.vehicle}.`
      const ev = makeEvidence(
        {
          type: 'physical',
          title: `Vehicle linked to ${shortName(target)}`,
          description: body,
          source: 'surveillance',
          relatedSuspectIds: [target.id],
          relatedLocationIds: [location.id],
          reliability: 75,
          legality: 95,
        },
        state.day,
      )
      next = { ...next, evidence: [...next.evidence, ev] }
      break
    }
    case 'photograph_meeting': {
      const [a, b] = present
      next = updateSuspect(next, a.id, (sus) => ({ ...sus, known: true, knownAlias: true, photographed: true }))
      next = updateSuspect(next, b.id, (sus) => ({ ...sus, known: true, knownAlias: true, photographed: true }))
      title = 'Surveillance — Meeting Photographed'
      body = `${officer.name} photographed "${a.alias}" and "${b.alias}" meeting at ${location.name}.`
      const ev = makeEvidence(
        {
          type: 'photograph',
          title: `Meeting at ${location.name}`,
          description: body,
          source: 'surveillance',
          relatedSuspectIds: [a.id, b.id],
          relatedLocationIds: [location.id],
          reliability: 85,
          legality: 95,
        },
        state.day,
      )
      next = { ...next, evidence: [...next.evidence, ev] }
      const existing = next.relationships.find(
        (r) => (r.fromId === a.id && r.toId === b.id) || (r.fromId === b.id && r.toId === a.id),
      )
      if (existing) {
        next = {
          ...next,
          relationships: next.relationships.map((r) => (r === existing ? { ...r, discovered: true } : r)),
        }
      } else {
        next = {
          ...next,
          relationships: [
            ...next.relationships,
            { fromId: a.id, toId: b.id, type: 'met_with', status: 'suspected', discovered: true },
          ],
        }
      }
      next = adjustResource(next, 'evidenceStrength', 3)
      break
    }
    case 'discover_location': {
      const known = present.find((s) => s.known) ?? present[0]
      const undiscoveredLoc = known.schedule
        .map((b) => next.locations.find((l) => l.id === b.locationId))
        .find((l) => l && !l.discovered)
      if (undiscoveredLoc) {
        next = {
          ...next,
          locations: next.locations.map((l) => (l.id === undiscoveredLoc.id ? { ...l, discovered: true } : l)),
        }
        title = 'Surveillance — New Location Found'
        body = `Following patterns from ${location.name}, ${officer.name} identified another location tied to "${known.alias}": ${undiscoveredLoc.name} in ${undiscoveredLoc.district}.`
      } else {
        title = 'Surveillance — Quiet Shift'
        body = `${officer.name} watched ${location.name} closely but turned up nothing new today.`
      }
      break
    }
  }

  const report: DailyReport = {
    id: nextId('rep'),
    day: state.day,
    title,
    body,
    kind: 'surveillance',
    relatedLocationId: locationId,
  }

  next = adjustResource(next, 'evidenceStrength', outcome === 'identify_suspect' || outcome === 'discover_vehicle' ? 1 : 0)

  return { state: next, report }
}

function updateSuspect(state: GameState, id: string, fn: (s: Suspect) => Suspect): GameState {
  return { ...state, suspects: state.suspects.map((s) => (s.id === id ? fn(s) : s)) }
}

function updateOfficer(state: GameState, id: string, fn: (o: GameState['officers'][number]) => GameState['officers'][number]): GameState {
  return { ...state, officers: state.officers.map((o) => (o.id === id ? fn(o) : o)) }
}
