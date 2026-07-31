import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from './shared/mpTypes.js'
import { registerHandlers, pushEndedIfNeeded, pushViews } from './socket/handlers.js'
import { allActiveMatches, forfeitedMatches, removeMatch } from './rooms.js'
import { tick } from './game/engine.js'

const PORT = Number(process.env.PORT) || 4000
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const app = express()
app.use(cors({ origin: allowedOrigins }))
app.get('/', (_req, res) => res.json({ ok: true, service: 'the-detail-multiplayer' }))
app.get('/health', (_req, res) => res.json({ ok: true, matches: allActiveMatches().length }))

const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: allowedOrigins },
})

io.on('connection', (socket) => {
  registerHandlers(io, socket)
})

setInterval(() => {
  for (const match of allActiveMatches()) {
    const wasActive = match.phase === 'active'
    if (wasActive) tick(match)
    pushViews(io, match)
    if (wasActive && match.phase === 'ended') pushEndedIfNeeded(io, match)
  }
  for (const { match } of forfeitedMatches()) {
    pushViews(io, match)
    pushEndedIfNeeded(io, match)
  }
  // Sweep long-ended matches out of memory.
  const now = Date.now()
  for (const match of allActiveMatches()) {
    if (match.phase === 'ended' && now - match.startedAt > 6 * 60 * 60 * 1000) removeMatch(match.roomCode)
  }
}, 4000)

httpServer.listen(PORT, () => {
  console.log(`The Detail multiplayer server listening on :${PORT}`)
  console.log(`Allowed client origins: ${allowedOrigins.join(', ')}`)
})
