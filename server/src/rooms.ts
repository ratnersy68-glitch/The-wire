import { randomUUID } from 'node:crypto'
import type { Role } from '../../shared/mpTypes.js'
import { RECONNECT_GRACE_MS } from '../../shared/mpTypes.js'
import { createMatchState, type MatchState } from './game/state.js'

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return code
}

export interface PendingRoom {
  roomCode: string
  hostRole: Role
  hostToken: string
  hostSocketId: string
  createdAt: number
}

const pendingRooms = new Map<string, PendingRoom>()
const activeMatches = new Map<string, MatchState>()

export function createPendingRoom(hostRole: Role, hostSocketId: string): PendingRoom {
  let roomCode = generateRoomCode()
  while (pendingRooms.has(roomCode) || activeMatches.has(roomCode)) roomCode = generateRoomCode()
  const room: PendingRoom = { roomCode, hostRole, hostToken: randomUUID(), hostSocketId, createdAt: Date.now() }
  pendingRooms.set(roomCode, room)
  return room
}

export function cancelPendingRoom(roomCode: string) {
  pendingRooms.delete(roomCode)
}

export function getPendingRoom(roomCode: string): PendingRoom | undefined {
  return pendingRooms.get(roomCode)
}

export function joinPendingRoom(
  roomCode: string,
  joinerSocketId: string,
  requestedRole: Role | undefined,
): { ok: true; match: MatchState; joinerRole: Role; joinerToken: string } | { ok: false; error: string } {
  const room = pendingRooms.get(roomCode.toUpperCase())
  if (!room) return { ok: false, error: 'Room not found.' }
  const joinerRole: Role = requestedRole ?? (room.hostRole === 'police' ? 'org' : 'police')
  if (joinerRole === room.hostRole) return { ok: false, error: 'That role is already taken in this room.' }

  const policeToken = room.hostRole === 'police' ? room.hostToken : randomUUID()
  const orgToken = room.hostRole === 'org' ? room.hostToken : randomUUID()
  const joinerToken = joinerRole === 'police' ? policeToken : orgToken

  const match = createMatchState(room.roomCode, policeToken, orgToken)
  match.seats[room.hostRole].socketId = room.hostSocketId
  match.seats[room.hostRole].connected = true
  match.seats[joinerRole].socketId = joinerSocketId
  match.seats[joinerRole].connected = true

  pendingRooms.delete(roomCode)
  activeMatches.set(match.roomCode, match)
  return { ok: true, match, joinerRole, joinerToken }
}

export function createDirectMatch(policeSocketId: string, orgSocketId: string): MatchState {
  let roomCode = generateRoomCode()
  while (pendingRooms.has(roomCode) || activeMatches.has(roomCode)) roomCode = generateRoomCode()
  const policeToken = randomUUID()
  const orgToken = randomUUID()
  const match = createMatchState(roomCode, policeToken, orgToken)
  match.seats.police.socketId = policeSocketId
  match.seats.police.connected = true
  match.seats.org.socketId = orgSocketId
  match.seats.org.connected = true
  activeMatches.set(roomCode, match)
  return match
}

export function getMatch(roomCode: string): MatchState | undefined {
  return activeMatches.get(roomCode)
}

export function allActiveMatches(): MatchState[] {
  return Array.from(activeMatches.values())
}

export function removeMatch(roomCode: string) {
  activeMatches.delete(roomCode)
}

export function markDisconnected(match: MatchState, role: Role) {
  match.seats[role].connected = false
  match.seats[role].disconnectedAt = Date.now()
}

export function reattachSeat(match: MatchState, role: Role, socketId: string) {
  match.seats[role].socketId = socketId
  match.seats[role].connected = true
  match.seats[role].disconnectedAt = null
}

export function findSeatByToken(match: MatchState, playerToken: string): Role | null {
  if (match.seats.police.playerToken === playerToken) return 'police'
  if (match.seats.org.playerToken === playerToken) return 'org'
  return null
}

export function forfeitedMatches(): { match: MatchState; winner: Role }[] {
  const results: { match: MatchState; winner: Role }[] = []
  const now = Date.now()
  for (const match of activeMatches.values()) {
    if (match.phase !== 'active') continue
    for (const role of ['police', 'org'] as Role[]) {
      const seat = match.seats[role]
      if (!seat.connected && seat.disconnectedAt !== null && now - seat.disconnectedAt > RECONNECT_GRACE_MS) {
        const winner: Role = role === 'police' ? 'org' : 'police'
        match.phase = 'ended'
        match.winner = winner
        match.endReason = `${role === 'police' ? 'The detective' : 'The organization leader'} never reconnected.`
        results.push({ match, winner })
      }
    }
  }
  return results
}
