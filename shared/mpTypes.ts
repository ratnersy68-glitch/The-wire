// Shared between client (src/multiplayer) and server (server/src). Pure
// types + tuning constants only — no React, no Node built-ins — so the same
// file compiles under both the Vite/bundler client and the Node server.

export type Role = 'police' | 'org'

export const REAL_MS_PER_GAME_HOUR = 45_000
export const DEADLINE_HOURS = 48
export const RECONNECT_GRACE_MS = 120_000
export const STARTING_POLICE_BUDGET = 50_000
export const STARTING_POLICE_MANPOWER = 3
export const STARTING_ORG_CASH = 80_000
export const STARTING_NETWORK_SIZE = 9 // 1 leader + lieutenants + dealers + couriers
export const POLICE_WIN_EVIDENCE_THRESHOLD = 75
export const POLICE_WIN_ARREST_FRACTION = 0.5
export const ORG_SURVIVAL_FLOOR = 3 // active non-leader members needed to still be "operating"

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export type OrgRole = 'leader' | 'lieutenant' | 'dealer' | 'courier'
export type MemberStatus = 'active' | 'laying_low' | 'arrested' | 'replaced'

export interface OrgMember {
  id: string
  codename: string
  role: OrgRole
  status: MemberStatus
  phoneId: string | null
  baseLocationId: string
  paranoia: number // 0-100, org-visible; police infer only qualitatively
  identifiedByPolice: boolean // whether police have unmasked this member's real role
}

export type LocationType = 'stash_house' | 'corner' | 'meeting_spot' | 'front_business'

export interface OrgLocation {
  id: string
  name: string
  district: string
  type: LocationType
  active: boolean // false once abandoned/moved away from
  localHeat: number // 0-100, org-visible always; police-visible only once discovered
}

export interface PhoneLine {
  id: string
  ownerId: string
  active: boolean
}

export type EvidenceType =
  | 'photograph'
  | 'wiretap_intercept'
  | 'informant_tip'
  | 'financial_record'
  | 'surveillance_note'

export interface EvidenceItem {
  id: string
  type: EvidenceType
  targetMemberId: string | null
  targetLocationId: string | null
  description: string
  reliability: number // 0-100
  admissible: boolean
  createdAtHour: number
}

export type WarrantType = 'wiretap' | 'search'
export interface Warrant {
  id: string
  type: WarrantType
  targetId: string
  status: 'pending' | 'approved' | 'denied'
  requestedAtHour: number
}

export type OpType = 'follow' | 'wiretap' | 'watch_location' | 'informant' | 'financial'
export interface ActiveOp {
  id: string
  type: OpType
  targetId: string
  startedAtHour: number
}

export interface LookoutReport {
  id: string
  atHour: number
  text: string
  severity: 'low' | 'medium' | 'high'
}

export interface PoliceLogEntry {
  id: string
  atHour: number
  text: string
}

// ---------------------------------------------------------------------------
// Actions — params only ever reference things that player legitimately knows.
// ---------------------------------------------------------------------------

export type PoliceAction =
  | { type: 'follow_suspect'; targetMemberId: string }
  | { type: 'install_wiretap'; targetMemberId: string }
  | { type: 'watch_location'; targetLocationId: string }
  | { type: 'use_informant'; targetMemberId: string }
  | { type: 'take_photograph'; targetLocationId: string }
  | { type: 'track_finances'; targetMemberId: string }
  | { type: 'identify_member'; targetMemberId: string }
  | { type: 'request_warrant'; warrantType: WarrantType; targetId: string }
  | { type: 'raid_location'; targetLocationId: string }
  | { type: 'arrest_suspect'; targetMemberId: string }
  | { type: 'stop_operation'; opId: string }

export type OrgAction =
  | { type: 'move_stash'; fromLocationId: string; toLocationId: string }
  | { type: 'change_meeting'; memberId: string; newLocationId: string }
  | { type: 'drop_phone'; memberId: string }
  | { type: 'use_coded_language' }
  | { type: 'lay_low' }
  | { type: 'expand_territory'; locationId: string }
  | { type: 'recruit_dealer'; locationId: string }
  | { type: 'replace_member'; arrestedMemberId: string }
  | { type: 'pay_informant' }
  | { type: 'bribe_witness'; memberId: string }
  | { type: 'destroy_evidence'; locationId: string }

export type MatchAction = PoliceAction | OrgAction

// Runtime-checkable action-type sets, used server-side to reject an action
// shaped for the wrong role even though the TS union can't be enforced once
// a payload comes off the wire as plain JSON.
export const POLICE_ACTION_TYPES = [
  'follow_suspect', 'install_wiretap', 'watch_location', 'use_informant',
  'take_photograph', 'track_finances', 'identify_member', 'request_warrant',
  'raid_location', 'arrest_suspect', 'stop_operation',
] as const
export const ORG_ACTION_TYPES = [
  'move_stash', 'change_meeting', 'drop_phone', 'use_coded_language', 'lay_low',
  'expand_territory', 'recruit_dealer', 'replace_member', 'pay_informant',
  'bribe_witness', 'destroy_evidence',
] as const

// ---------------------------------------------------------------------------
// Per-player filtered views (what actually gets sent over the wire)
// ---------------------------------------------------------------------------

export interface PoliceView {
  role: 'police'
  gameHour: number
  deadlineHours: number
  phase: 'active' | 'ended'
  budget: number
  manpower: number
  manpowerCap: number
  evidenceStrength: number
  knownMembers: OrgMember[] // only ones discovered/identified in some way
  knownLocations: OrgLocation[]
  evidence: EvidenceItem[]
  warrants: Warrant[]
  activeOps: ActiveOp[]
  log: PoliceLogEntry[]
  opponentConnected: boolean
  arrestedCount: number
  totalMembersEverKnown: number
}

export interface OrgView {
  role: 'org'
  gameHour: number
  deadlineHours: number
  phase: 'active' | 'ended'
  cash: number
  heat: number
  networkSize: number
  members: OrgMember[] // org sees its whole roster
  locations: OrgLocation[] // org sees its whole roster
  phones: PhoneLine[]
  codedLanguageActive: boolean
  layingLow: boolean
  lookoutReports: LookoutReport[]
  opponentConnected: boolean
}

export type MatchView = PoliceView | OrgView

export interface MatchEndedPayload {
  winner: Role | null
  reason: string
}

// ---------------------------------------------------------------------------
// Socket.IO event contracts
// ---------------------------------------------------------------------------

export interface ServerToClientEvents {
  'match:started': (p: { roomCode: string; role: Role; playerToken: string; deadlineHours: number }) => void
  'match:view': (v: MatchView) => void
  'match:ended': (p: MatchEndedPayload) => void
  'match:error': (p: { message: string }) => void
  'lobby:error': (p: { message: string }) => void
  'lobby:waiting': (p: { roomCode: string }) => void
  'quickplay:waiting': () => void
}

export interface ClientToServerEvents {
  'lobby:create': (p: { role: Role }, cb: (r: { ok: true; roomCode: string; playerToken: string } | { ok: false; error: string }) => void) => void
  'lobby:join': (p: { roomCode: string; role?: Role }, cb: (r: { ok: true; playerToken: string; role: Role } | { ok: false; error: string }) => void) => void
  'lobby:quickplay': (cb: (r: { ok: true } | { ok: false; error: string }) => void) => void
  'lobby:cancelQuickplay': (cb: (r: { ok: true }) => void) => void
  'match:rejoin': (p: { roomCode: string; playerToken: string }, cb: (r: { ok: true } | { ok: false; error: string }) => void) => void
  'match:action': (p: { action: MatchAction }, cb: (r: { ok: true } | { ok: false; error: string }) => void) => void
  'match:leave': () => void
}
