import { DEADLINE_HOURS, ORG_SURVIVAL_FLOOR, POLICE_WIN_ARREST_FRACTION, POLICE_WIN_EVIDENCE_THRESHOLD, STARTING_NETWORK_SIZE } from '../../../shared/mpTypes.js'
import type { MatchState } from './state.js'
import { gameHour, nextId } from './state.js'
import { clamp } from './actions/common.js'
import { OP_DURATION_HOURS } from './actions/police.js'
import { makeRng } from './rng.js'

function findMember(match: MatchState, id: string) {
  return match.members.find((m) => m.id === id)
}
function findLocation(match: MatchState, id: string) {
  return match.locations.find((l) => l.id === id)
}

function pushLookout(match: MatchState, text: string, severity: 'low' | 'medium' | 'high') {
  match.lookoutReports.push({ id: nextId('lookout'), atHour: gameHour(match), text, severity })
  if (match.lookoutReports.length > 40) match.lookoutReports.shift()
}

/** Advance derived state: expire timed ops/effects, resolve ongoing intel
 * rolls, decay heat/paranoia, surface lookout reports, check for a winner.
 * Called on a fixed server interval for every active match. */
export function tick(match: MatchState) {
  if (match.phase === 'ended') return
  const hour = gameHour(match)
  const rng = makeRng(Math.floor(Date.now() / 4000) ^ Math.floor(hour * 97))

  if (match.codedLanguageActive && hour >= match.codedLanguageUntilHour) match.codedLanguageActive = false
  if (match.layingLow && hour >= match.layingLowUntilHour) match.layingLow = false

  const stillRunning: typeof match.activeOps = []
  for (const op of match.activeOps) {
    const duration = OP_DURATION_HOURS[op.type] ?? 3
    const expired = duration !== Infinity && hour - op.startedAtHour >= duration
    if (expired) {
      match.policeManpower = clamp(match.policeManpower + 1, 0, match.policeManpowerCap)
      continue
    }
    stillRunning.push(op)

    const codedPenalty = match.codedLanguageActive ? 0.5 : 1
    const layLowPenalty = match.layingLow ? 0.4 : 1
    const rollChance = 0.1 * codedPenalty * layLowPenalty

    if (op.type === 'wiretap' && rng.next() < rollChance) {
      const member = findMember(match, op.targetId)
      if (member && member.status === 'active') {
        match.discoveredMemberIds.add(member.id)
        match.discoveredLocationIds.add(member.baseLocationId)
        const reliability = match.codedLanguageActive ? 30 : 55
        match.evidence.push({
          id: nextId('ev'),
          type: 'wiretap_intercept',
          targetMemberId: member.id,
          targetLocationId: null,
          description: `Intercepted call referencing ${member.codename}${match.codedLanguageActive ? ' (guarded, coded language used)' : ''}.`,
          reliability,
          admissible: reliability >= 40,
          createdAtHour: hour,
        })
        match.evidenceStrength = clamp(match.evidenceStrength + Math.round(reliability / 14), 0, 100)
        match.policeLog.push({ id: nextId('log'), atHour: hour, text: `Wiretap picked up a call involving ${member.codename}.` })
        member.paranoia = clamp(member.paranoia + 6, 0, 100)
      }
    }
    if (op.type === 'watch_location' && rng.next() < rollChance) {
      const loc = findLocation(match, op.targetId)
      if (loc) {
        const present = match.members.filter((m) => m.status === 'active' && m.baseLocationId === loc.id)
        if (present.length) {
          const subject = present[Math.floor(rng.next() * present.length)]
          match.discoveredMemberIds.add(subject.id)
          match.policeLog.push({ id: nextId('log'), atHour: hour, text: `Surveillance logged activity at ${loc.name}.` })
          subject.paranoia = clamp(subject.paranoia + 4, 0, 100)
        }
      }
    }
    if (op.type === 'financial' && rng.next() < rollChance * 0.7) {
      const member = findMember(match, op.targetId)
      if (member) {
        match.evidence.push({
          id: nextId('ev'),
          type: 'financial_record',
          targetMemberId: member.id,
          targetLocationId: null,
          description: `Financial records tie ${member.codename} to unexplained cash flow.`,
          reliability: 60,
          admissible: true,
          createdAtHour: hour,
        })
        match.evidenceStrength = clamp(match.evidenceStrength + 5, 0, 100)
        match.policeLog.push({ id: nextId('log'), atHour: hour, text: `Financial trace produced a record tied to ${member.codename}.` })
      }
    }
  }
  match.activeOps = stillRunning

  // Heat/paranoia drift: rises from active police attention already applied
  // above; otherwise decays slowly, faster while laying low.
  const decay = match.layingLow ? 1.2 : 0.4
  match.orgHeat = clamp(match.orgHeat - decay, 0, 100)
  match.members.forEach((m) => {
    if (m.status !== 'active') return
    m.paranoia = clamp(m.paranoia - decay, 0, 100)
  })

  // Dynamic intelligence: paranoid members / hot locations occasionally tip
  // the org off, in vague terms, without revealing what police actually did.
  match.members.forEach((m) => {
    if (m.status !== 'active' || m.paranoia < 45) return
    if (onLookoutCooldown(match, `member_${m.id}`, hour)) return
    if (rng.next() < 0.35) {
      pushLookout(match, `${m.codename} thinks the same face has turned up twice this week.`, m.paranoia >= 75 ? 'high' : 'medium')
      setLookoutCooldown(match, `member_${m.id}`, hour, 3)
    }
  })
  match.locations.forEach((l) => {
    if (!l.active || l.localHeat < 45) return
    if (onLookoutCooldown(match, `loc_${l.id}`, hour)) return
    if (rng.next() < 0.3) {
      pushLookout(match, `A lookout near ${l.name} clocked unfamiliar parked cars.`, l.localHeat >= 75 ? 'high' : 'medium')
      setLookoutCooldown(match, `loc_${l.id}`, hour, 3)
    }
  })
  // Location heat tracks whether police are actively watching it.
  match.locations.forEach((l) => {
    const watched = match.activeOps.some((o) => o.type === 'watch_location' && o.targetId === l.id)
    l.localHeat = clamp(l.localHeat + (watched ? 6 : -1.5), 0, 100)
  })

  checkWinConditions(match, hour)
}

function onLookoutCooldown(match: MatchState, key: string, hour: number) {
  const ready = match.actionCooldowns.org[`lookout_${key}`]
  return ready !== undefined && hour < ready
}
function setLookoutCooldown(match: MatchState, key: string, hour: number, hours: number) {
  match.actionCooldowns.org[`lookout_${key}`] = hour + hours
}

function checkWinConditions(match: MatchState, hour: number) {
  const activeNonLeader = match.members.filter((m) => m.status === 'active' && m.role !== 'leader').length
  const leaderArrested = match.members.some((m) => m.role === 'leader' && m.status === 'arrested')
  const requiredArrests = Math.ceil(STARTING_NETWORK_SIZE * POLICE_WIN_ARREST_FRACTION)

  if (leaderArrested || (match.evidenceStrength >= POLICE_WIN_EVIDENCE_THRESHOLD && match.arrestedCount >= requiredArrests)) {
    match.phase = 'ended'
    match.winner = 'police'
    match.endReason = leaderArrested
      ? 'The organization was decapitated — its leader is in custody.'
      : 'The case was built and enough of the organization was taken down.'
    return
  }
  if (activeNonLeader === 0 && !leaderArrested) {
    match.phase = 'ended'
    match.winner = 'police'
    match.endReason = 'The network was dismantled member by member.'
    return
  }
  if (hour >= DEADLINE_HOURS) {
    match.phase = 'ended'
    if (!leaderArrested && activeNonLeader >= ORG_SURVIVAL_FLOOR) {
      match.winner = 'org'
      match.endReason = 'The investigation deadline passed. The organization kept operating.'
    } else {
      match.winner = 'police'
      match.endReason = 'The investigation deadline passed with the organization crippled.'
    }
  }
}
