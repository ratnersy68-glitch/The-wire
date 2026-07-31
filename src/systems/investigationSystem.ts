import type {
  DailyReport,
  GameState,
  Officer,
  Suspect,
  WarrantRequest,
} from '../types'
import { createRng, clamp } from '../utils/rng'
import { nextId } from '../utils/id'
import { adjustResource, dailyUpkeep, spendResources } from './resourceSystem'
import { resolveSurveillance } from './surveillanceSystem'
import { interceptCallsForDay, reviewCall, isWiretapEligible } from './wiretapSystem'
import { applyOrganizationReactions } from './organizationAI'
import { rollRandomEvent } from './eventSystem'
import { OBJECTIVES } from '../data/objectives'
import { CAUTION_VALUE, shortName } from '../utils/suspectHelpers'

function updateSuspect(state: GameState, id: string, fn: (s: Suspect) => Suspect): GameState {
  return { ...state, suspects: state.suspects.map((s) => (s.id === id ? fn(s) : s)) }
}
function updateOfficer(state: GameState, id: string, fn: (o: Officer) => Officer): GameState {
  return { ...state, officers: state.officers.map((o) => (o.id === id ? fn(o) : o)) }
}

// ---------------------------------------------------------------------------
// Warrants
// ---------------------------------------------------------------------------

export const SEARCH_WARRANT_EVIDENCE_THRESHOLD = 45

export function requestWarrant(
  state: GameState,
  type: 'wiretap' | 'search',
  targetSuspectId: string | undefined,
  targetLocationId: string | undefined,
  justification: string,
): { state: GameState; report: DailyReport } {
  let next = spendResources(state, { budget: 400, overtimeHours: 2 })
  const eligible = type === 'wiretap' ? isWiretapEligible(next) : next.resources.evidenceStrength >= SEARCH_WARRANT_EVIDENCE_THRESHOLD && next.resources.prosecutorConfidence >= 35

  const warrant: WarrantRequest = {
    id: nextId('warrant'),
    type,
    targetSuspectId,
    targetLocationId,
    justification,
    status: eligible ? 'approved' : 'denied',
    dayRequested: next.day,
    dayDecided: next.day,
  }

  next = { ...next, warrants: [...next.warrants, warrant] }

  if (eligible) {
    next = adjustResource(next, 'prosecutorConfidence', 3)
    if (type === 'wiretap') {
      next = { ...next, wiretapActive: true }
    }
  } else {
    next = adjustResource(next, 'prosecutorConfidence', -4)
  }

  const report: DailyReport = {
    id: nextId('rep'),
    day: next.day,
    title: eligible ? 'Warrant Approved' : 'Warrant Denied',
    body: eligible
      ? `A judge signed off on the ${type === 'wiretap' ? 'wiretap' : 'search warrant'} request. ${justification}`
      : `The ${type === 'wiretap' ? 'wiretap' : 'search warrant'} request was denied. The prosecutor wants stronger, better-corroborated evidence first.`,
    kind: 'event',
  }

  return { state: next, report }
}

// ---------------------------------------------------------------------------
// Follow Suspect
// ---------------------------------------------------------------------------

export function followSuspect(
  state: GameState,
  officerId: string,
  suspectId: string,
  closeness: 'close' | 'medium' | 'far',
  rand: () => number,
): { state: GameState; report: DailyReport } {
  const officer = state.officers.find((o) => o.id === officerId)
  const suspect = state.suspects.find((s) => s.id === suspectId)
  if (!officer || !suspect) throw new Error('Invalid follow assignment')

  const skillScore =
    officer.skills.streetCraft * 4 + officer.skills.discretion * 2 - CAUTION_VALUE[suspect.caution] * 8
  const detectionPenalty = closeness === 'close' ? 30 : closeness === 'medium' ? 12 : 0
  const infoBonus = closeness === 'close' ? 15 : closeness === 'far' ? -20 : 0

  let next = state
  const detectionRoll = rand() * 100 + skillScore - detectionPenalty
  let title = 'Follow — Report'
  let body = ''

  if (detectionRoll < 15) {
    next = updateSuspect(next, suspectId, (s) => ({ ...s, suspicionOfPolice: clamp(s.suspicionOfPolice + 25, 0, 100) }))
    next = adjustResource(next, 'alertLevel', 5)
    next = adjustResource(next, 'secrecy', -5)
    title = 'Follow — Detail Made'
    body = `${officer.name} followed too closely and ${shortName(suspect)} noticed. The tail had to break off.`
  } else {
    const infoRoll = rand() * 100 + skillScore + infoBonus
    if (infoRoll < 30) {
      title = 'Follow — Target Lost'
      body = `${officer.name} lost ${shortName(suspect)} in traffic, following from too far back to keep visual contact.`
    } else {
      const nextStop = suspect.schedule.map((b) => next.locations.find((l) => l.id === b.locationId)).find((l) => l && !l.discovered)
      if (nextStop) {
        next = { ...next, locations: next.locations.map((l) => (l.id === nextStop.id ? { ...l, discovered: true } : l)) }
        title = 'Follow — New Location Found'
        body = `${officer.name} tailed ${shortName(suspect)} to ${nextStop.name} in ${nextStop.district}. Added to the map.`
        next = adjustResource(next, 'evidenceStrength', 2)
      } else {
        title = 'Follow — Route Confirmed'
        body = `${officer.name} confirmed ${shortName(suspect)}'s usual route. Nothing new, but the pattern holds.`
      }
    }
  }

  next = updateOfficer(next, officerId, (o) => ({ ...o, fatigue: clamp(o.fatigue + 16, 0, 100) }))
  return { state: next, report: { id: nextId('rep'), day: state.day, title, body, kind: 'surveillance', relatedSuspectId: suspectId } }
}

// ---------------------------------------------------------------------------
// Financial Investigation
// ---------------------------------------------------------------------------

export function financialInvestigation(
  state: GameState,
  officerId: string,
  suspectId: string,
  rand: () => number,
): { state: GameState; report: DailyReport } {
  const officer = state.officers.find((o) => o.id === officerId)
  const suspect = state.suspects.find((s) => s.id === suspectId)
  if (!officer || !suspect) throw new Error('Invalid financial investigation assignment')

  const relevance = ['money_manager', 'money_collector', 'shipment_coordinator', 'supplier', 'leader'].includes(suspect.role) ? 1 : 0.4
  const skillScore = officer.skills.financial * 4 * relevance - CAUTION_VALUE[suspect.caution] * 5
  const roll = rand() * 100 + skillScore

  let next = state
  let title = 'Financial Investigation'
  let body = ''

  if (roll < 25) {
    body = `${officer.name} pulled records tied to ${shortName(suspect)} but found nothing that ties back to the case.`
  } else if (roll < 55) {
    const front = next.locations.find((l) => ['auto_shop', 'restaurant', 'nightclub', 'church'].includes(l.type) && !l.discovered)
    if (front) {
      next = { ...next, locations: next.locations.map((l) => (l.id === front.id ? { ...l, discovered: true } : l)) }
      title = 'Financial Investigation — Front Business Found'
      body = `${officer.name} traced cash flow from ${shortName(suspect)} to ${front.name}. It may be a front for laundering proceeds.`
      next = adjustResource(next, 'evidenceStrength', 3)
    } else {
      body = `${officer.name} found irregular deposits tied to ${shortName(suspect)}, but nothing conclusive yet.`
    }
  } else if (roll < 82) {
    next = updateSuspect(next, suspectId, (s) => ({ ...s, knownRealName: true, knownHome: true, known: true }))
    title = 'Financial Investigation — Property Records'
    body = `Property and account records confirmed ${suspect.realName}'s real address and financial footprint.`
    next = adjustResource(next, 'evidenceStrength', 4)
  } else {
    if (relevance === 1 && rand() < 0.6) {
      next = { ...next, corruptionExposed: true }
      next = adjustResource(next, 'prosecutorConfidence', 6)
      next = adjustResource(next, 'politicalSupport', -8)
      title = 'Financial Investigation — Political Donations'
      body = `Records show donations routed through ${shortName(suspect)} to a local campaign account. This case just got political.`
      next = adjustResource(next, 'evidenceStrength', 5)
    } else {
      next = updateSuspect(next, suspectId, (s) => ({ ...s, known: true, knownRole: true }))
      title = 'Financial Investigation — Role Confirmed'
      body = `The financial trail makes ${shortName(suspect)}'s role in the organization clear: ${suspect.roleLabel}.`
      next = adjustResource(next, 'evidenceStrength', 4)
    }
  }

  next = updateOfficer(next, officerId, (o) => ({ ...o, fatigue: clamp(o.fatigue + 12, 0, 100) }))
  return { state: next, report: { id: nextId('rep'), day: state.day, title, body, kind: 'financial', relatedSuspectId: suspectId } }
}

// ---------------------------------------------------------------------------
// Controlled Buy
// ---------------------------------------------------------------------------

export function controlledBuy(
  state: GameState,
  informantId: string,
  suspectId: string,
  rand: () => number,
): { state: GameState; report: DailyReport } {
  const informant = state.informants.find((i) => i.id === informantId)
  const suspect = state.suspects.find((s) => s.id === suspectId)
  if (!informant || !suspect) throw new Error('Invalid controlled buy')

  let next = spendResources(state, { informantFunds: 300 })
  const skillScore = informant.trust * 0.4 + informant.honesty * 0.3 - CAUTION_VALUE[suspect.caution] * 10
  const roll = rand() * 100 + skillScore

  let title = 'Controlled Buy'
  let body = ''

  if (roll < 15) {
    next = { ...next, informants: next.informants.map((i) => (i.id === informantId ? { ...i, exposed: true, active: false } : i)) }
    next = updateSuspect(next, suspectId, (s) => ({ ...s, suspicionOfPolice: clamp(s.suspicionOfPolice + 40, 0, 100) }))
    next = adjustResource(next, 'alertLevel', 10)
    title = 'Controlled Buy — Informant Exposed'
    body = `${informant.codename} was made during the buy. They're burned, and the organization now knows someone's talking.`
  } else if (roll < 35) {
    next = spendResources(next, { budget: 300 })
    title = 'Controlled Buy — Lost Money'
    body = `The buy money is gone and ${informant.codename} came back empty-handed. ${shortName(suspect)} never showed.`
  } else if (roll < 50) {
    title = 'Controlled Buy — Target Relocated'
    body = `${shortName(suspect)} changed the meet location at the last minute. No buy today, no exposure either.`
  } else if (roll < 65) {
    const ev = {
      id: nextId('ev'),
      type: 'physical' as const,
      title: `Controlled buy from ${shortName(suspect)}`,
      description: `Narcotics purchased via informant, chain of custody incomplete — informant handled the product alone before handoff.`,
      source: 'controlled_buy' as const,
      dateAdded: next.day,
      relatedSuspectIds: [suspectId],
      relatedLocationIds: [],
      reliability: 55,
      legality: 40,
      corroborated: false,
      chainOfCustody: ['Handled by informant prior to police custody'],
      admissible: false,
      x: 100 + rand() * 300,
      y: 100 + rand() * 200,
    }
    next = { ...next, evidence: [...next.evidence, ev] }
    title = 'Controlled Buy — Evidence Contaminated'
    body = `The buy happened, but the chain of custody is compromised. Prosecutors won't be able to use this cleanly.`
  } else {
    const ev = {
      id: nextId('ev'),
      type: 'physical' as const,
      title: `Controlled buy from ${shortName(suspect)}`,
      description: `Narcotics purchased directly from ${shortName(suspect)} under police observation, properly logged and witnessed.`,
      source: 'controlled_buy' as const,
      dateAdded: next.day,
      relatedSuspectIds: [suspectId],
      relatedLocationIds: [],
      reliability: 90,
      legality: 95,
      corroborated: true,
      chainOfCustody: ['Observed by detective', 'Logged into evidence at HQ'],
      admissible: true,
      x: 100 + rand() * 300,
      y: 100 + rand() * 200,
    }
    next = { ...next, evidence: [...next.evidence, ev] }
    next = { ...next, informants: next.informants.map((i) => (i.id === informantId ? { ...i, reliabilityHistory: clamp(i.reliabilityHistory + 10, 0, 100) } : i)) }
    next = adjustResource(next, 'evidenceStrength', 6)
    title = 'Controlled Buy — Success'
    body = `Clean buy, properly witnessed and logged. This holds up.`
  }

  return { state: next, report: { id: nextId('rep'), day: state.day, title, body, kind: 'buy', relatedSuspectId: suspectId } }
}

// ---------------------------------------------------------------------------
// Interview
// ---------------------------------------------------------------------------

export function interviewSubject(
  state: GameState,
  officerId: string,
  subjectId: string,
  rand: () => number,
): { state: GameState; report: DailyReport } {
  const officer = state.officers.find((o) => o.id === officerId)
  const subject = state.interviewSubjects.find((s) => s.id === subjectId)
  if (!officer || !subject) throw new Error('Invalid interview')

  const skillScore = officer.skills.interrogation * 4 + subject.trust * 0.3 - subject.fear * 0.4
  const roll = rand() * 100 + skillScore

  let next = { ...state, interviewSubjects: state.interviewSubjects.map((s) => (s.id === subjectId ? { ...s, interviewed: true } : s)) }
  let title = 'Interview'
  let body = ''

  if (roll < 25) {
    title = 'Interview — Refused to Talk'
    body = `${subject.name} answered questions but gave nothing usable. Too scared, or too smart.`
  } else if (subject.honesty < 45 && rand() < 0.4) {
    title = 'Interview — Unreliable Statement'
    body = `${subject.name} gave a statement, but details don't line up with what surveillance has shown. Treat this with caution.`
  } else if (roll < 60) {
    const undiscovered = next.suspects.find((s) => !s.knownAlias)
    if (undiscovered) {
      next = updateSuspect(next, undiscovered.id, (s) => ({ ...s, known: true, knownAlias: true }))
      title = 'Interview — Partial Lead'
      body = `${subject.name} mentioned someone who goes by "${undiscovered.alias}" hanging around. Worth a look.`
    } else {
      title = 'Interview — General Corroboration'
      body = `${subject.name} confirmed general patterns of activity without naming specifics.`
    }
    next = { ...next, interviewSubjects: next.interviewSubjects.map((s) => (s.id === subjectId ? { ...s, trust: clamp(s.trust + 5, 0, 100) } : s)) }
  } else {
    const undiscovered = next.suspects.find((s) => !s.knownRealName && s.knownAlias)
    if (undiscovered) {
      next = updateSuspect(next, undiscovered.id, (s) => ({ ...s, knownRealName: true, knownRole: true }))
      title = 'Interview — Strong Lead'
      body = `${subject.name} confirmed the real identity behind "${undiscovered.alias}": ${undiscovered.realName}, ${undiscovered.roleLabel}.`
      next = adjustResource(next, 'evidenceStrength', 4)
    } else {
      title = 'Interview — Detailed Statement'
      body = `${subject.name} gave a detailed, credible statement corroborating existing evidence.`
      next = adjustResource(next, 'evidenceStrength', 3)
    }
    next = { ...next, interviewSubjects: next.interviewSubjects.map((s) => (s.id === subjectId ? { ...s, trust: clamp(s.trust + 10, 0, 100), fear: clamp(s.fear - 5, 0, 100) } : s)) }
  }

  next = updateOfficer(next, officerId, (o) => ({ ...o, fatigue: clamp(o.fatigue + 10, 0, 100) }))
  return { state: next, report: { id: nextId('rep'), day: state.day, title, body, kind: 'interview' } }
}

// ---------------------------------------------------------------------------
// Raid
// ---------------------------------------------------------------------------

export function executeRaid(
  state: GameState,
  locationId: string,
  officerIds: string[],
  rand: () => number,
): { state: GameState; report: DailyReport } {
  const location = state.locations.find((l) => l.id === locationId)
  if (!location) throw new Error('Invalid raid location')

  let next = spendResources(state, { budget: 1500, overtimeHours: 6 })
  const evidenceForLocation = next.evidence.filter((e) => e.relatedLocationIds.includes(locationId)).length
  const presentSuspects = next.suspects.filter(
    (s) => !s.arrested && (s.homeLocationId === locationId || s.schedule.some((b) => b.locationId === locationId)),
  )

  const strength = next.resources.evidenceStrength + evidenceForLocation * 5 - next.resources.alertLevel * 0.5
  const roll = rand() * 100 + strength

  let title = 'Raid Report'
  let body = ''
  let arrested: Suspect[] = []

  if (roll < 25) {
    next = adjustResource(next, 'communityTrust', -5)
    next = { ...next, innocentsHarmed: next.innocentsHarmed + 1 }
    title = 'Raid — Bust'
    body = `The raid on ${location.name} turned up nothing usable. Wrong place, wrong time, or the organization moved first. The neighborhood noticed.`
  } else if (roll < 55) {
    arrested = presentSuspects.filter((s) => s.level === 'street').slice(0, 2)
    title = 'Raid — Low-Level Arrests'
    body = arrested.length
      ? `Officers arrested ${arrested.map((s) => shortName(s)).join(' and ')} at ${location.name}. Small fish. Anyone above them is now on alert.`
      : `The raid produced minor evidence but no arrests worth noting.`
    next = adjustResource(next, 'alertLevel', 15)
  } else if (roll < 82) {
    arrested = presentSuspects.filter((s) => s.level === 'mid' || s.level === 'street').slice(0, 3)
    title = 'Raid — Solid Result'
    body = `The raid on ${location.name} netted ${arrested.length} arrest${arrested.length === 1 ? '' : 's'}: ${arrested.map((s) => shortName(s)).join(', ')}. Real evidence recovered.`
    next = adjustResource(next, 'evidenceStrength', 6)
    next = { ...next, assetsSeized: next.assetsSeized + 15000 }
  } else {
    arrested = presentSuspects
    title = 'Raid — Jackpot'
    body = `Everything came together at ${location.name}. Arrests: ${arrested.map((s) => shortName(s)).join(', ') || 'none present, but the location is seized'}. Cash, records, and product recovered.`
    next = adjustResource(next, 'evidenceStrength', 10)
    next = { ...next, assetsSeized: next.assetsSeized + 45000 }
  }

  next = {
    ...next,
    suspects: next.suspects.map((s) => (arrested.some((a) => a.id === s.id) ? { ...s, arrested: true, known: true, knownRealName: true } : s)),
    locations: next.locations.map((l) => (l.id === locationId ? { ...l, raided: true } : l)),
    raidsCompleted: next.raidsCompleted + 1,
    officers: next.officers.map((o) => (officerIds.includes(o.id) ? { ...o, fatigue: clamp(o.fatigue + 25, 0, 100) } : o)),
  }

  return { state: next, report: { id: nextId('rep'), day: next.day, title, body, kind: 'raid', relatedLocationId: locationId } }
}

// ---------------------------------------------------------------------------
// Objectives & Chapter Progression
// ---------------------------------------------------------------------------

export function checkObjectives(state: GameState): GameState {
  const objectives = state.objectives.map((obj) => {
    if (obj.completed) return obj
    let completed: boolean = obj.completed
    switch (obj.id) {
      case 'obj_c1_assign_surveillance':
        completed = state.hasSeenTutorialStep['assigned_surveillance'] === true
        break
      case 'obj_c1_identify_dealer':
        completed = state.suspects.some((s) => s.level === 'street' && s.knownAlias)
        break
      case 'obj_c1_add_evidence':
        completed = state.evidence.length > 0
        break
      case 'obj_c1_connect_suspects':
        completed = state.connections.length > 0
        break
      case 'obj_c1_wiretap_warrant':
        completed = state.wiretapActive
        break
      case 'obj_c2_decode_terms':
        completed = state.codeTerms.filter((t) => t.discovered).length >= 3
        break
      case 'obj_c2_identify_midlevel':
        completed = state.suspects.some((s) => s.level === 'mid' && s.knownAlias)
        break
      case 'obj_c2_discover_stash':
        completed = state.locations.some((l) => l.type === 'vacant_house' && l.discovered)
        break
      case 'obj_c3_identify_supplier':
        completed = state.suspects.find((s) => s.role === 'supplier')?.knownAlias === true
        break
      case 'obj_c3_discover_vehicle':
        completed = state.suspects.some((s) => s.knownVehicle)
        break
      case 'obj_c3_follow_shipment':
        completed = state.locations.some((l) => l.type === 'warehouse' && l.discovered)
        break
      case 'obj_c4_financial_investigation':
        completed = state.reports.some((r) => r.kind === 'financial')
        break
      case 'obj_c4_discover_front':
        completed = state.locations.some((l) => ['auto_shop', 'restaurant', 'nightclub', 'church'].includes(l.type) && l.discovered)
        break
      case 'obj_c4_identify_money_manager':
        completed = state.suspects.find((s) => s.role === 'money_manager')?.knownAlias === true
        break
      case 'obj_c5_search_warrant':
        completed = state.warrants.some((w) => w.type === 'search' && w.status === 'approved')
        break
      case 'obj_c5_raid':
        completed = state.raidsCompleted > 0
        break
      case 'obj_c5_takedown':
        completed = state.gameOver
        break
    }
    return completed === obj.completed ? obj : { ...obj, completed }
  })
  return { ...state, objectives }
}

export function currentChapterObjectives(state: GameState) {
  return state.objectives.filter((o) => o.chapter === state.chapter)
}

export function checkChapterTransition(state: GameState): { state: GameState; advanced: boolean } {
  const chapterObjs = currentChapterObjectives(state)
  const allDone = chapterObjs.length > 0 && chapterObjs.every((o) => o.completed)
  if (!allDone) return { state, advanced: false }
  if (state.chapter >= 5) return { state, advanced: false }
  return { state: { ...state, chapter: state.chapter + 1, dayInChapter: 0 }, advanced: true }
}

// ---------------------------------------------------------------------------
// End of Day Orchestration
// ---------------------------------------------------------------------------

export interface EndDayResult {
  state: GameState
  reports: DailyReport[]
  chapterAdvanced: boolean
}

export function endDay(state: GameState): EndDayResult {
  const rand = createRng(state.seed, state.rngCounter)
  let next = state
  const reports: DailyReport[] = []

  for (const officer of next.officers) {
    const assignment = officer.assignment
    if (!assignment || !officer.available) continue

    try {
      if (assignment.type === 'surveillance' && assignment.locationId) {
        const res = resolveSurveillance(next, officer.id, assignment.locationId, rand)
        next = res.state
        reports.push(res.report)
      } else if (assignment.type === 'followSuspect' && assignment.targetId) {
        const res = followSuspect(next, officer.id, assignment.targetId, 'medium', rand)
        next = res.state
        reports.push(res.report)
      } else if (assignment.type === 'financialInvestigation' && assignment.targetId) {
        const res = financialInvestigation(next, officer.id, assignment.targetId, rand)
        next = res.state
        reports.push(res.report)
      } else if (assignment.type === 'interview' && assignment.targetId) {
        const res = interviewSubject(next, officer.id, assignment.targetId, rand)
        next = res.state
        reports.push(res.report)
      } else if (assignment.type === 'controlledBuy' && assignment.targetId && assignment.informantId) {
        const res = controlledBuy(next, assignment.informantId, assignment.targetId, rand)
        next = res.state
        reports.push(res.report)
      } else if (assignment.type === 'rest') {
        next = updateOfficer(next, officer.id, (o) => ({ ...o, fatigue: clamp(o.fatigue - 30, 0, 100), morale: clamp(o.morale + 5, 0, 100) }))
      } else if (assignment.type === 'wiretapMonitor') {
        next = updateOfficer(next, officer.id, (o) => ({ ...o, fatigue: clamp(o.fatigue + 8, 0, 100) }))
      }
    } catch {
      // Skip malformed assignments rather than crashing the day.
    }
  }

  // Officers with no assignment recover a little fatigue passively.
  next = {
    ...next,
    officers: next.officers.map((o) => (o.assignment ? o : { ...o, fatigue: clamp(o.fatigue - 10, 0, 100) })),
  }

  const wiretapResult = interceptCallsForDay(next, rand)
  next = wiretapResult.state
  reports.push(...wiretapResult.reports)

  const monitor = next.officers.find((o) => o.assignment?.type === 'wiretapMonitor' && o.available)
  if (monitor) {
    for (const call of next.calls.filter((c) => c.day === next.day && !c.heard)) {
      next = reviewCall(next, call.id)
    }
  }

  const orgResult = applyOrganizationReactions(next, rand)
  next = orgResult.state
  for (const note of orgResult.notes) {
    reports.push({ id: nextId('rep'), day: next.day, title: 'Street Intelligence', body: note, kind: 'event' })
  }

  const eventResult = rollRandomEvent(next, rand)
  next = eventResult.state
  if (eventResult.report) reports.push(eventResult.report)

  next = dailyUpkeep(next)
  next = checkObjectives(next)

  next = {
    ...next,
    reports: [...reports, ...next.reports],
    day: next.day + 1,
    dayInChapter: next.dayInChapter + 1,
    rngCounter: next.rngCounter + 1,
    officers: next.officers.map((o) => ({ ...o, assignment: null, available: o.fatigue < 95 })),
    hintsUsedToday: 0,
  }

  const transition = checkChapterTransition(next)
  next = transition.state

  return { state: next, reports, chapterAdvanced: transition.advanced }
}
