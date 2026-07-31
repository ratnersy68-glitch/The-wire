import type { OrgView, PoliceView } from '../shared/mpTypes.js'
import { DEADLINE_HOURS } from '../shared/mpTypes.js'
import type { MatchState } from './state.js'
import { gameHour } from './state.js'

export function policeView(match: MatchState): PoliceView {
  const hour = gameHour(match)
  const knownMembers = match.members.filter((m) => match.discoveredMemberIds.has(m.id))
  const knownLocations = match.locations.filter((l) => match.discoveredLocationIds.has(l.id))
  return {
    role: 'police',
    gameHour: hour,
    deadlineHours: DEADLINE_HOURS,
    phase: match.phase,
    budget: match.policeBudget,
    manpower: match.policeManpower,
    manpowerCap: match.policeManpowerCap,
    evidenceStrength: match.evidenceStrength,
    knownMembers: knownMembers.map((m) => ({
      ...m,
      // Role is only meaningful to the police once identified; hide it otherwise.
      role: m.identifiedByPolice ? m.role : 'dealer',
      // Paranoia is the org's own read on how spooked a member is — the
      // police have no way of knowing that number, only its consequences.
      paranoia: 0,
    })),
    knownLocations,
    evidence: match.evidence,
    warrants: match.warrants,
    activeOps: match.activeOps,
    log: match.policeLog.slice(-40),
    opponentConnected: match.seats.org.connected,
    arrestedCount: match.arrestedCount,
    totalMembersEverKnown: knownMembers.length,
  }
}

export function orgView(match: MatchState): OrgView {
  const hour = gameHour(match)
  return {
    role: 'org',
    gameHour: hour,
    deadlineHours: DEADLINE_HOURS,
    phase: match.phase,
    cash: match.orgCash,
    heat: match.orgHeat,
    networkSize: match.members.filter((m) => m.status === 'active').length,
    members: match.members,
    locations: match.locations,
    phones: match.phones,
    codedLanguageActive: match.codedLanguageActive,
    layingLow: match.layingLow,
    lookoutReports: match.lookoutReports.slice(-40),
    opponentConnected: match.seats.police.connected,
  }
}
