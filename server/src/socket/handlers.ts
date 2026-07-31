import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, MatchAction, Role, ServerToClientEvents } from '../../../shared/mpTypes.js'
import { ORG_ACTION_TYPES, POLICE_ACTION_TYPES } from '../../../shared/mpTypes.js'
import {
  cancelPendingRoom,
  createDirectMatch,
  createPendingRoom,
  findSeatByToken,
  getMatch,
  joinPendingRoom,
  markDisconnected,
  reattachSeat,
} from '../rooms.js'
import { dequeue, enqueue, tryPair } from '../matchmaking.js'
import { applyPoliceAction } from '../game/actions/police.js'
import { applyOrgAction } from '../game/actions/org.js'
import { orgView, policeView } from '../game/view.js'
import type { MatchState } from '../game/state.js'

type IO = Server<ClientToServerEvents, ServerToClientEvents>
type Sock = Socket<ClientToServerEvents, ServerToClientEvents>

interface SocketData {
  roomCode?: string
  role?: Role
}

function socketData(socket: Sock): SocketData {
  return socket.data as SocketData
}

export function pushViews(io: IO, match: MatchState) {
  const police = match.seats.police
  const org = match.seats.org
  if (police.socketId && police.connected) io.to(police.socketId).emit('match:view', policeView(match))
  if (org.socketId && org.connected) io.to(org.socketId).emit('match:view', orgView(match))
}

export function pushEndedIfNeeded(io: IO, match: MatchState) {
  if (match.phase !== 'ended') return
  const payload = { winner: match.winner, reason: match.endReason ?? '' }
  if (match.seats.police.socketId) io.to(match.seats.police.socketId).emit('match:ended', payload)
  if (match.seats.org.socketId) io.to(match.seats.org.socketId).emit('match:ended', payload)
}

export function registerHandlers(io: IO, socket: Sock) {
  socket.on('lobby:create', ({ role }, cb) => {
    if (role !== 'police' && role !== 'org') return cb({ ok: false, error: 'Invalid role.' })
    const room = createPendingRoom(role, socket.id)
    socketData(socket).roomCode = room.roomCode
    socketData(socket).role = role
    socket.join(room.roomCode)
    cb({ ok: true, roomCode: room.roomCode, playerToken: room.hostToken })
    socket.emit('lobby:waiting', { roomCode: room.roomCode })
  })

  socket.on('lobby:join', ({ roomCode, role }, cb) => {
    const result = joinPendingRoom(roomCode, socket.id, role)
    if (!result.ok) return cb({ ok: false, error: result.error })
    const { match, joinerRole, joinerToken } = result
    socketData(socket).roomCode = match.roomCode
    socketData(socket).role = joinerRole
    socket.join(match.roomCode)
    cb({ ok: true, playerToken: joinerToken, role: joinerRole })

    // Each seat gets its own individually-addressed event with its own role
    // — never broadcast to the room, since the two seats' payloads differ.
    const hostRole: Role = joinerRole === 'police' ? 'org' : 'police'
    const hostSocketId = match.seats[hostRole].socketId
    socket.emit('match:started', { roomCode: match.roomCode, role: joinerRole, playerToken: joinerToken, deadlineHours: 48 })
    if (hostSocketId) {
      io.to(hostSocketId).emit('match:started', {
        roomCode: match.roomCode,
        role: hostRole,
        playerToken: match.seats[hostRole].playerToken,
        deadlineHours: 48,
      })
    }
    pushViews(io, match)
  })

  socket.on('lobby:quickplay', (cb) => {
    enqueue(socket.id)
    cb({ ok: true })
    const pair = tryPair()
    if (!pair) {
      socket.emit('quickplay:waiting')
      return
    }
    const match = createDirectMatch(pair.policeSocketId, pair.orgSocketId)
    for (const role of ['police', 'org'] as Role[]) {
      const seatSocketId = match.seats[role].socketId
      if (!seatSocketId) continue
      const seatSocket = io.sockets.sockets.get(seatSocketId)
      if (seatSocket) {
        socketData(seatSocket as Sock).roomCode = match.roomCode
        socketData(seatSocket as Sock).role = role
        seatSocket.join(match.roomCode)
      }
      io.to(seatSocketId).emit('match:started', {
        roomCode: match.roomCode,
        role,
        playerToken: match.seats[role].playerToken,
        deadlineHours: 48,
      })
    }
    pushViews(io, match)
  })

  socket.on('lobby:cancelQuickplay', (cb) => {
    dequeue(socket.id)
    cb({ ok: true })
  })

  socket.on('match:rejoin', ({ roomCode, playerToken }, cb) => {
    const match = getMatch(roomCode.toUpperCase())
    if (!match) return cb({ ok: false, error: 'Match not found (it may have ended).' })
    const role = findSeatByToken(match, playerToken)
    if (!role) return cb({ ok: false, error: 'Invalid session token.' })
    reattachSeat(match, role, socket.id)
    socketData(socket).roomCode = match.roomCode
    socketData(socket).role = role
    socket.join(match.roomCode)
    cb({ ok: true })
    socket.emit('match:started', { roomCode: match.roomCode, role, playerToken, deadlineHours: 48 })
    pushViews(io, match)
    if (match.phase === 'ended') pushEndedIfNeeded(io, match)
  })

  socket.on('match:action', ({ action }, cb) => {
    const data = socketData(socket)
    if (!data.roomCode || !data.role) return cb({ ok: false, error: 'Not in a match.' })
    const match = getMatch(data.roomCode)
    if (!match) return cb({ ok: false, error: 'Match not found.' })
    if (match.phase !== 'active') return cb({ ok: false, error: 'Match is not active.' })

    const validTypes: readonly string[] = data.role === 'police' ? POLICE_ACTION_TYPES : ORG_ACTION_TYPES
    if (!action || typeof action.type !== 'string' || !validTypes.includes(action.type)) {
      return cb({ ok: false, error: 'Invalid action for your role.' })
    }

    const result =
      data.role === 'police'
        ? applyPoliceAction(match, action as Extract<MatchAction, { type: (typeof POLICE_ACTION_TYPES)[number] }>)
        : applyOrgAction(match, action as Extract<MatchAction, { type: (typeof ORG_ACTION_TYPES)[number] }>)

    cb(result)
    pushViews(io, match)
    pushEndedIfNeeded(io, match)
  })

  socket.on('match:leave', () => {
    const data = socketData(socket)
    if (data.roomCode) cancelPendingRoom(data.roomCode)
    dequeue(socket.id)
  })

  socket.on('disconnect', () => {
    dequeue(socket.id)
    const data = socketData(socket)
    if (!data.roomCode || !data.role) return
    const match = getMatch(data.roomCode)
    if (!match) {
      cancelPendingRoom(data.roomCode)
      return
    }
    markDisconnected(match, data.role)
    pushViews(io, match)
  })
}
