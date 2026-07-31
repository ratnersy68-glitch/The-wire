import type { OrgAction } from '../../../../shared/mpTypes.js'
import type { MatchState } from '../state.js'
import { gameHour, nextId } from '../state.js'
import { clamp, lockForever, onCooldown, setCooldown, type ActionResult } from './common.js'
import { makeRng } from '../rng.js'

const CODENAME_POOL = [
  'Static', 'Halo', 'Pike', 'Reef', 'Talon', 'Cinder', 'Grit', 'Sable',
  'Onyx', 'Vane', 'Brisk', 'Colt', 'Dune', 'Ember', 'Flint', 'Grove',
]

function findMember(match: MatchState, id: string) {
  return match.members.find((m) => m.id === id)
}
function findLocation(match: MatchState, id: string) {
  return match.locations.find((l) => l.id === id)
}
function usedCodenames(match: MatchState) {
  return new Set(match.members.map((m) => m.codename))
}

export function applyOrgAction(match: MatchState, action: OrgAction): ActionResult {
  const hour = gameHour(match)
  const rng = makeRng(Date.now() ^ (hour * 1000 + 7))

  switch (action.type) {
    case 'move_stash': {
      const from = findLocation(match, action.fromLocationId)
      const to = findLocation(match, action.toLocationId)
      if (!from || !to) return { ok: false, error: 'Unknown location.' }
      if (from.id === to.id) return { ok: false, error: 'Already there.' }
      if (match.orgCash < 2000) return { ok: false, error: 'Not enough cash ($2,000 required).' }
      if (onCooldown(match, 'org', `move_${from.id}`)) return { ok: false, error: 'That stash moved too recently.' }
      match.orgCash -= 2000
      setCooldown(match, 'org', `move_${from.id}`, 3)
      match.members.filter((m) => m.status === 'active' && m.baseLocationId === from.id).forEach((m) => (m.baseLocationId = to.id))
      from.active = false
      to.active = true
      return { ok: true }
    }
    case 'change_meeting': {
      const member = findMember(match, action.memberId)
      const to = findLocation(match, action.newLocationId)
      if (!member || !to) return { ok: false, error: 'Unknown target.' }
      if (member.status !== 'active') return { ok: false, error: 'That member is not active.' }
      if (match.orgCash < 500) return { ok: false, error: 'Not enough cash ($500 required).' }
      if (onCooldown(match, 'org', `meet_${member.id}`)) return { ok: false, error: 'Too soon to move again.' }
      match.orgCash -= 500
      setCooldown(match, 'org', `meet_${member.id}`, 2)
      member.baseLocationId = to.id
      member.paranoia = clamp(member.paranoia - 10, 0, 100)
      return { ok: true }
    }
    case 'drop_phone': {
      const member = findMember(match, action.memberId)
      if (!member) return { ok: false, error: 'Unknown target.' }
      if (match.orgCash < 300) return { ok: false, error: 'Not enough cash ($300 required).' }
      if (onCooldown(match, 'org', `drop_${member.id}`)) return { ok: false, error: 'Already switched phones recently.' }
      match.orgCash -= 300
      setCooldown(match, 'org', `drop_${member.id}`, 3)
      const oldPhone = match.phones.find((p) => p.id === member.phoneId)
      if (oldPhone) oldPhone.active = false
      const newPhone = { id: nextId('phone'), ownerId: member.id, active: true }
      match.phones.push(newPhone)
      member.phoneId = newPhone.id
      const killed = match.activeOps.filter((o) => o.type === 'wiretap' && o.targetId === member.id)
      if (killed.length) {
        match.activeOps = match.activeOps.filter((o) => !(o.type === 'wiretap' && o.targetId === member.id))
        match.policeManpower = clamp(match.policeManpower + killed.length, 0, match.policeManpowerCap)
      }
      member.paranoia = clamp(member.paranoia - 20, 0, 100)
      return { ok: true }
    }
    case 'use_coded_language': {
      if (match.orgCash < 1000) return { ok: false, error: 'Not enough cash ($1,000 required).' }
      if (onCooldown(match, 'org', 'coded')) return { ok: false, error: 'Already in effect / cooling down.' }
      match.orgCash -= 1000
      match.codedLanguageActive = true
      match.codedLanguageUntilHour = hour + 8
      setCooldown(match, 'org', 'coded', 6)
      return { ok: true }
    }
    case 'lay_low': {
      if (onCooldown(match, 'org', 'laylow')) return { ok: false, error: 'Recently laid low already.' }
      match.layingLow = true
      match.layingLowUntilHour = hour + 6
      setCooldown(match, 'org', 'laylow', 10)
      return { ok: true }
    }
    case 'expand_territory': {
      const loc = findLocation(match, action.locationId)
      if (!loc) return { ok: false, error: 'Unknown location.' }
      if (loc.active) return { ok: false, error: 'Already active territory.' }
      if (match.orgCash < 2500) return { ok: false, error: 'Not enough cash ($2,500 required).' }
      match.orgCash -= 2500
      loc.active = true
      match.orgHeat = clamp(match.orgHeat + 5, 0, 100)
      return { ok: true }
    }
    case 'recruit_dealer': {
      const loc = findLocation(match, action.locationId)
      if (!loc) return { ok: false, error: 'Unknown location.' }
      if (!loc.active) return { ok: false, error: 'Territory not active.' }
      if (match.orgCash < 1500) return { ok: false, error: 'Not enough cash ($1,500 required).' }
      if (onCooldown(match, 'org', `recruit_${loc.id}`)) return { ok: false, error: 'Too soon to recruit here again.' }
      match.orgCash -= 1500
      setCooldown(match, 'org', `recruit_${loc.id}`, 4)
      const used = usedCodenames(match)
      const pool = CODENAME_POOL.filter((n) => !used.has(n))
      const codename = pool.length ? rng.pick(pool) : `Runner-${match.members.length}`
      const phoneId = nextId('phone')
      match.phones.push({ id: phoneId, ownerId: '', active: true })
      const member = {
        id: nextId('member'),
        codename,
        role: 'dealer' as const,
        status: 'active' as const,
        phoneId,
        baseLocationId: loc.id,
        paranoia: 5,
        identifiedByPolice: false,
      }
      match.members.push(member)
      match.phones.find((p) => p.id === phoneId)!.ownerId = member.id
      return { ok: true }
    }
    case 'replace_member': {
      const arrested = findMember(match, action.arrestedMemberId)
      if (!arrested) return { ok: false, error: 'Unknown target.' }
      if (arrested.status !== 'arrested') return { ok: false, error: 'That member has not been arrested.' }
      if (onCooldown(match, 'org', `replace_${arrested.id}`)) return { ok: false, error: 'Already replaced.' }
      if (match.orgCash < 4000) return { ok: false, error: 'Not enough cash ($4,000 required).' }
      match.orgCash -= 4000
      lockForever(match, 'org', `replace_${arrested.id}`)
      const used = usedCodenames(match)
      const pool = CODENAME_POOL.filter((n) => !used.has(n))
      const codename = pool.length ? rng.pick(pool) : `New-${match.members.length}`
      const phoneId = nextId('phone')
      const member = {
        id: nextId('member'),
        codename,
        role: arrested.role,
        status: 'active' as const,
        phoneId,
        baseLocationId: arrested.baseLocationId,
        paranoia: 25,
        identifiedByPolice: false,
      }
      match.phones.push({ id: phoneId, ownerId: member.id, active: true })
      match.members.push(member)
      return { ok: true }
    }
    case 'pay_informant': {
      if (match.orgCash < 2000) return { ok: false, error: 'Not enough cash ($2,000 required).' }
      if (onCooldown(match, 'org', 'counterintel')) return { ok: false, error: 'Too soon to try again.' }
      match.orgCash -= 2000
      setCooldown(match, 'org', 'counterintel', 6)
      if (match.activeOps.length > 0 && rng.next() < 0.5) {
        const idx = rng.int(0, match.activeOps.length - 1)
        const [killed] = match.activeOps.splice(idx, 1)
        match.policeManpower = clamp(match.policeManpower + 1, 0, match.policeManpowerCap)
        match.policeLog.push({ id: nextId('log'), atHour: hour, text: 'Operation compromised — a leak inside the department burned the lead.' })
        void killed
      }
      return { ok: true }
    }
    case 'bribe_witness': {
      const member = findMember(match, action.memberId)
      if (!member) return { ok: false, error: 'Unknown target.' }
      if (match.orgCash < 2500) return { ok: false, error: 'Not enough cash ($2,500 required).' }
      if (onCooldown(match, 'org', `bribe_${member.id}`)) return { ok: false, error: 'Too soon to try again on this one.' }
      match.orgCash -= 2500
      setCooldown(match, 'org', `bribe_${member.id}`, 6)
      let weakened = 0
      match.evidence.forEach((e) => {
        if (e.targetMemberId === member.id && rng.next() < 0.5) {
          e.reliability = clamp(e.reliability - 30, 0, 100)
          e.admissible = e.reliability >= 40
          weakened += 1
        }
      })
      if (weakened > 0) {
        match.evidenceStrength = clamp(match.evidenceStrength - weakened * 3, 0, 100)
      }
      return { ok: true }
    }
    case 'destroy_evidence': {
      const loc = findLocation(match, action.locationId)
      if (!loc) return { ok: false, error: 'Unknown location.' }
      if (match.orgCash < 3000) return { ok: false, error: 'Not enough cash ($3,000 required).' }
      if (onCooldown(match, 'org', `destroy_${loc.id}`)) return { ok: false, error: 'Too soon to try again here.' }
      match.orgCash -= 3000
      setCooldown(match, 'org', `destroy_${loc.id}`, 6)
      const before = match.evidence.length
      match.evidence = match.evidence.filter((e) => !(e.targetLocationId === loc.id && rng.next() < 0.5))
      const removed = before - match.evidence.length
      if (removed > 0) match.evidenceStrength = clamp(match.evidenceStrength - removed * 3, 0, 100)
      return { ok: true }
    }
  }
}
