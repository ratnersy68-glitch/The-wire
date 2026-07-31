import type {
  ActiveOp,
  EvidenceItem,
  LookoutReport,
  OrgLocation,
  OrgMember,
  PhoneLine,
  PoliceLogEntry,
  Role,
  Warrant,
} from '../../../shared/mpTypes.js'
import {
  DEADLINE_HOURS,
  REAL_MS_PER_GAME_HOUR,
  STARTING_ORG_CASH,
  STARTING_POLICE_BUDGET,
  STARTING_POLICE_MANPOWER,
} from '../../../shared/mpTypes.js'
import { generateRoster } from './data.js'

export interface PlayerSeat {
  role: Role
  socketId: string | null
  playerToken: string
  connected: boolean
  disconnectedAt: number | null
}

export interface MatchState {
  roomCode: string
  seed: number
  startedAt: number
  phase: 'active' | 'ended'
  winner: Role | null
  endReason: string | null

  seats: Record<Role, PlayerSeat>

  members: OrgMember[]
  locations: OrgLocation[]
  phones: PhoneLine[]

  policeBudget: number
  policeManpower: number
  policeManpowerCap: number
  evidenceStrength: number
  discoveredMemberIds: Set<string>
  discoveredLocationIds: Set<string>
  evidence: EvidenceItem[]
  warrants: Warrant[]
  activeOps: ActiveOp[]
  policeLog: PoliceLogEntry[]
  arrestedCount: number

  orgCash: number
  orgHeat: number
  codedLanguageActive: boolean
  codedLanguageUntilHour: number
  layingLow: boolean
  layingLowUntilHour: number
  lookoutReports: LookoutReport[]

  actionCooldowns: Record<Role, Record<string, number>> // action key -> gameHour it becomes available again
}

let idCounter = 0
export function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}_${idCounter}_${Date.now().toString(36)}`
}

export function createMatchState(roomCode: string, policeToken: string, orgToken: string): MatchState {
  const seed = Math.floor(Math.random() * 2 ** 31)
  const { members, locations, phones } = generateRoster(seed)
  // Street-level corners are public enough that a detail starts with them
  // already on the map — everything else has to be worked up from there.
  const startingLocationIds = new Set(locations.filter((l) => l.type === 'corner').map((l) => l.id))
  return {
    roomCode,
    seed,
    startedAt: Date.now(),
    phase: 'active',
    winner: null,
    endReason: null,
    seats: {
      police: { role: 'police', socketId: null, playerToken: policeToken, connected: false, disconnectedAt: null },
      org: { role: 'org', socketId: null, playerToken: orgToken, connected: false, disconnectedAt: null },
    },
    members,
    locations,
    phones,
    policeBudget: STARTING_POLICE_BUDGET,
    policeManpower: STARTING_POLICE_MANPOWER,
    policeManpowerCap: STARTING_POLICE_MANPOWER,
    evidenceStrength: 0,
    discoveredMemberIds: new Set(),
    discoveredLocationIds: startingLocationIds,
    evidence: [],
    warrants: [],
    activeOps: [],
    policeLog: [{ id: nextId('log'), atHour: 0, text: 'Investigation opened. Detail assigned.' }],
    arrestedCount: 0,
    orgCash: STARTING_ORG_CASH,
    orgHeat: 0,
    codedLanguageActive: false,
    codedLanguageUntilHour: 0,
    layingLow: false,
    layingLowUntilHour: 0,
    lookoutReports: [],
    actionCooldowns: { police: {}, org: {} },
  }
}

export function gameHour(match: MatchState): number {
  const elapsedMs = Date.now() - match.startedAt
  const hour = elapsedMs / REAL_MS_PER_GAME_HOUR
  return Math.min(DEADLINE_HOURS, hour)
}
