import type { PoliceAction } from '../../shared/mpTypes.js'
import type { MatchState } from '../state.js'
import { gameHour, nextId } from '../state.js'
import { clamp, onCooldown, setCooldown, type ActionResult } from './common.js'
import { makeRng } from '../rng.js'

export const OP_DURATION_HOURS: Record<string, number> = {
  follow: 3,
  watch_location: 4,
  financial: 5,
  informant: 1,
  wiretap: Infinity, // persists until dropped/stopped
}

function log(match: MatchState, text: string) {
  match.policeLog.push({ id: nextId('log'), atHour: gameHour(match), text })
  if (match.policeLog.length > 60) match.policeLog.shift()
}

function findMember(match: MatchState, id: string) {
  return match.members.find((m) => m.id === id)
}
function findLocation(match: MatchState, id: string) {
  return match.locations.find((l) => l.id === id)
}

function addEvidence(
  match: MatchState,
  opts: { type: import('../../shared/mpTypes.js').EvidenceType; targetMemberId?: string; targetLocationId?: string; description: string; reliability: number },
) {
  const item = {
    id: nextId('ev'),
    type: opts.type,
    targetMemberId: opts.targetMemberId ?? null,
    targetLocationId: opts.targetLocationId ?? null,
    description: opts.description,
    reliability: opts.reliability,
    admissible: opts.reliability >= 40,
    createdAtHour: gameHour(match),
  }
  match.evidence.push(item)
  match.evidenceStrength = clamp(match.evidenceStrength + Math.round(opts.reliability / 12), 0, 100)
  return item
}

function startOp(match: MatchState, type: 'follow' | 'wiretap' | 'watch_location' | 'informant' | 'financial', targetId: string) {
  const op = { id: nextId('op'), type, targetId, startedAtHour: gameHour(match) }
  match.activeOps.push(op)
  return op
}

export function applyPoliceAction(match: MatchState, action: PoliceAction): ActionResult {
  const hour = gameHour(match)
  const rng = makeRng(Date.now() ^ hour * 1000)

  switch (action.type) {
    case 'follow_suspect': {
      const member = findMember(match, action.targetMemberId)
      if (!member) return { ok: false, error: 'Unknown target.' }
      if (match.policeManpower <= 0) return { ok: false, error: 'No manpower available.' }
      if (onCooldown(match, 'police', `follow_${member.id}`)) return { ok: false, error: 'That target was followed too recently.' }
      match.policeManpower -= 1
      startOp(match, 'follow', member.id)
      match.discoveredMemberIds.add(member.id)
      match.discoveredLocationIds.add(member.baseLocationId)
      member.paranoia = clamp(member.paranoia + 8, 0, 100)
      setCooldown(match, 'police', `follow_${member.id}`, 2)
      log(match, `Detail followed ${member.codename} to a known location.`)
      return { ok: true }
    }
    case 'install_wiretap': {
      const member = findMember(match, action.targetMemberId)
      if (!member) return { ok: false, error: 'Unknown target.' }
      const warrant = match.warrants.find((w) => w.type === 'wiretap' && w.targetId === member.id && w.status === 'approved')
      if (!warrant) return { ok: false, error: 'No approved wiretap warrant for this target.' }
      if (match.policeManpower <= 0) return { ok: false, error: 'No manpower available.' }
      if (match.activeOps.some((o) => o.type === 'wiretap' && o.targetId === member.id)) return { ok: false, error: 'Wiretap already active on this line.' }
      match.policeManpower -= 1
      startOp(match, 'wiretap', member.id)
      log(match, `Wiretap installed on ${member.codename}'s line.`)
      return { ok: true }
    }
    case 'watch_location': {
      const loc = findLocation(match, action.targetLocationId)
      if (!loc) return { ok: false, error: 'Unknown location.' }
      if (!match.discoveredLocationIds.has(loc.id)) return { ok: false, error: 'Location not yet discovered.' }
      if (match.policeManpower <= 0) return { ok: false, error: 'No manpower available.' }
      if (onCooldown(match, 'police', `watch_${loc.id}`)) return { ok: false, error: 'Stakeout on that address too recent.' }
      match.policeManpower -= 1
      startOp(match, 'watch_location', loc.id)
      setCooldown(match, 'police', `watch_${loc.id}`, 4)
      log(match, `Stakeout began at ${loc.name}.`)
      return { ok: true }
    }
    case 'use_informant': {
      const member = findMember(match, action.targetMemberId)
      if (!member) return { ok: false, error: 'Unknown target.' }
      if (match.policeBudget < 3000) return { ok: false, error: 'Insufficient budget ($3,000 required).' }
      if (onCooldown(match, 'police', `ci_${member.id}`)) return { ok: false, error: 'That informant lead is still cooling off.' }
      match.policeBudget -= 3000
      setCooldown(match, 'police', `ci_${member.id}`, 8)
      const success = rng.next() < 0.7
      if (success) {
        match.discoveredMemberIds.add(member.id)
        match.discoveredLocationIds.add(member.baseLocationId)
        addEvidence(match, { type: 'informant_tip', targetMemberId: member.id, description: `A confidential informant placed ${member.codename} at a known location.`, reliability: 45 })
        log(match, `Informant tip received on ${member.codename}.`)
      } else {
        log(match, 'Informant produced nothing usable this time.')
      }
      if (rng.next() < 0.2) {
        member.paranoia = clamp(member.paranoia + 15, 0, 100)
      }
      return { ok: true }
    }
    case 'take_photograph': {
      const loc = findLocation(match, action.targetLocationId)
      if (!loc) return { ok: false, error: 'Unknown location.' }
      const hasWatch = match.activeOps.some((o) => o.type === 'watch_location' && o.targetId === loc.id)
      if (!hasWatch) return { ok: false, error: 'No active stakeout at that location.' }
      if (onCooldown(match, 'police', `photo_${loc.id}`)) return { ok: false, error: 'Too soon for another photograph there.' }
      setCooldown(match, 'police', `photo_${loc.id}`, 2)
      const present = match.members.filter((m) => m.status === 'active' && m.baseLocationId === loc.id)
      if (present.length === 0) {
        log(match, `Photographs taken at ${loc.name} — nothing conclusive.`)
        return { ok: true }
      }
      const subject = rng.pick(present)
      match.discoveredMemberIds.add(subject.id)
      addEvidence(match, { type: 'photograph', targetMemberId: subject.id, targetLocationId: loc.id, description: `Photograph places ${subject.codename} at ${loc.name}.`, reliability: 55 })
      log(match, `Photograph taken of ${subject.codename} at ${loc.name}.`)
      return { ok: true }
    }
    case 'track_finances': {
      const member = findMember(match, action.targetMemberId)
      if (!member) return { ok: false, error: 'Unknown target.' }
      if (!match.discoveredMemberIds.has(member.id)) return { ok: false, error: 'Target not yet identified.' }
      if (match.policeManpower <= 0) return { ok: false, error: 'No manpower available.' }
      if (onCooldown(match, 'police', `fin_${member.id}`)) return { ok: false, error: 'Financial trace already underway.' }
      match.policeManpower -= 1
      startOp(match, 'financial', member.id)
      setCooldown(match, 'police', `fin_${member.id}`, 5)
      log(match, `Financial trace opened on ${member.codename}.`)
      return { ok: true }
    }
    case 'identify_member': {
      const member = findMember(match, action.targetMemberId)
      if (!member) return { ok: false, error: 'Unknown target.' }
      if (!match.discoveredMemberIds.has(member.id)) return { ok: false, error: 'Target not yet discovered.' }
      if (member.identifiedByPolice) return { ok: false, error: 'Already identified.' }
      if (match.policeBudget < 1500) return { ok: false, error: 'Insufficient budget ($1,500 required).' }
      if (onCooldown(match, 'police', `id_${member.id}`)) return { ok: false, error: 'Too soon to re-attempt identification.' }
      match.policeBudget -= 1500
      setCooldown(match, 'police', `id_${member.id}`, 4)
      const relatedEvidence = match.evidence.filter((e) => e.targetMemberId === member.id).length
      const chance = clamp(0.4 + relatedEvidence * 0.1, 0.1, 0.95)
      if (rng.next() < chance) {
        member.identifiedByPolice = true
        log(match, `${member.codename} identified as ${member.role} in the organization.`)
      } else {
        log(match, `Attempt to identify ${member.codename} was inconclusive.`)
      }
      return { ok: true }
    }
    case 'request_warrant': {
      const threshold = action.warrantType === 'wiretap' ? 20 : 40
      if (match.evidenceStrength < threshold) return { ok: false, error: `Need at least ${threshold}% evidence strength.` }
      if (onCooldown(match, 'police', `warrant_${action.targetId}_${action.warrantType}`)) return { ok: false, error: 'Judge already ruled on this recently.' }
      const approveChance = clamp(match.evidenceStrength / 100 + 0.15, 0.1, 0.95)
      const approved = rng.next() < approveChance
      const warrant = { id: nextId('warrant'), type: action.warrantType, targetId: action.targetId, status: (approved ? 'approved' : 'denied') as 'approved' | 'denied', requestedAtHour: hour }
      match.warrants.push(warrant)
      setCooldown(match, 'police', `warrant_${action.targetId}_${action.warrantType}`, approved ? 0 : 6)
      if (!approved) match.evidenceStrength = clamp(match.evidenceStrength - 3, 0, 100)
      log(match, `${action.warrantType === 'wiretap' ? 'Wiretap' : 'Search'} warrant ${approved ? 'approved' : 'denied'}.`)
      return { ok: true }
    }
    case 'raid_location': {
      const loc = findLocation(match, action.targetLocationId)
      if (!loc) return { ok: false, error: 'Unknown location.' }
      const warrant = match.warrants.find((w) => w.type === 'search' && w.targetId === loc.id && w.status === 'approved')
      if (!warrant) return { ok: false, error: 'No approved search warrant for this address.' }
      if (match.policeBudget < 1500) return { ok: false, error: 'Insufficient budget ($1,500 required).' }
      match.policeBudget -= 1500
      const stillStash = loc.active && match.members.some((m) => m.status === 'active' && m.baseLocationId === loc.id)
      if (stillStash) {
        loc.active = false
        addEvidence(match, { type: 'surveillance_note', targetLocationId: loc.id, description: `Raid on ${loc.name} recovered product and records.`, reliability: 70 })
        match.orgHeat = clamp(match.orgHeat + 20, 0, 100)
        log(match, `Raid on ${loc.name} was productive.`)
      } else {
        match.evidenceStrength = clamp(match.evidenceStrength - 5, 0, 100)
        match.orgHeat = clamp(match.orgHeat + 5, 0, 100)
        log(match, `Raid on ${loc.name} came up empty — the location had already been abandoned.`)
      }
      return { ok: true }
    }
    case 'arrest_suspect': {
      const member = findMember(match, action.targetMemberId)
      if (!member) return { ok: false, error: 'Unknown target.' }
      if (member.status !== 'active') return { ok: false, error: 'Target is not currently active.' }
      const supportingEvidence = match.evidence.filter((e) => e.targetMemberId === member.id && e.admissible).length
      const solidCase = member.identifiedByPolice && supportingEvidence >= 2
      if (solidCase) {
        member.status = 'arrested'
        match.arrestedCount += 1
        match.orgHeat = clamp(match.orgHeat + 10, 0, 100)
        log(match, `${member.codename} arrested. Case held up.`)
      } else {
        member.paranoia = clamp(member.paranoia + 40, 0, 100)
        match.evidenceStrength = clamp(match.evidenceStrength - 8, 0, 100)
        match.orgHeat = clamp(match.orgHeat + 15, 0, 100)
        log(match, `${member.codename} was picked up but had to be released — the case wasn't strong enough yet.`)
      }
      return { ok: true }
    }
    case 'stop_operation': {
      const idx = match.activeOps.findIndex((o) => o.id === action.opId)
      if (idx === -1) return { ok: false, error: 'Operation not found.' }
      match.activeOps.splice(idx, 1)
      match.policeManpower = clamp(match.policeManpower + 1, 0, match.policeManpowerCap)
      log(match, 'Operation stood down.')
      return { ok: true }
    }
  }
}
