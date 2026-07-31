import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/mpTypes'

export const SERVER_URL_KEY = 'the-detail-mp-server-url'
export const SESSION_KEY = 'the-detail-mp-session'

export function getStoredServerUrl(): string {
  return localStorage.getItem(SERVER_URL_KEY) ?? (import.meta.env.VITE_MP_SERVER_URL as string | undefined) ?? ''
}

export function setStoredServerUrl(url: string) {
  localStorage.setItem(SERVER_URL_KEY, url)
}

export interface StoredSession {
  roomCode: string
  playerToken: string
  serverUrl: string
}

export function getStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export function setStoredSession(session: StoredSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

export type MPSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export function createSocket(url: string): MPSocket {
  return io(url, { transports: ['websocket', 'polling'], autoConnect: true, reconnection: true })
}
