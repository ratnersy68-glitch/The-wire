import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react'
import type { MatchAction, MatchEndedPayload, MatchView, Role } from '../../shared/mpTypes'
import {
  createSocket,
  getStoredServerUrl,
  getStoredSession,
  setStoredServerUrl,
  setStoredSession,
  type MPSocket,
} from './socketClient'

type Phase = 'disconnected' | 'connecting' | 'lobby' | 'room_waiting' | 'quickplay_waiting' | 'in_match' | 'ended'

interface State {
  serverUrl: string
  phase: Phase
  roomCode: string | null
  role: Role | null
  playerToken: string | null
  view: MatchView | null
  ended: MatchEndedPayload | null
  error: string | null
}

type Action =
  | { type: 'SET_SERVER_URL'; url: string }
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED' }
  | { type: 'DISCONNECTED' }
  | { type: 'ROOM_WAITING'; roomCode: string }
  | { type: 'QUICKPLAY_WAITING' }
  | { type: 'MATCH_STARTED'; roomCode: string; role: Role; playerToken: string }
  | { type: 'VIEW'; view: MatchView }
  | { type: 'ENDED'; payload: MatchEndedPayload }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET_TO_LOBBY' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SERVER_URL':
      return { ...state, serverUrl: action.url }
    case 'CONNECTING':
      return { ...state, phase: 'connecting', error: null }
    case 'CONNECTED':
      return { ...state, phase: state.phase === 'connecting' ? 'lobby' : state.phase }
    case 'DISCONNECTED':
      return { ...state, phase: 'disconnected' }
    case 'ROOM_WAITING':
      return { ...state, phase: 'room_waiting', roomCode: action.roomCode, error: null }
    case 'QUICKPLAY_WAITING':
      return { ...state, phase: 'quickplay_waiting', error: null }
    case 'MATCH_STARTED':
      return { ...state, phase: 'in_match', roomCode: action.roomCode, role: action.role, playerToken: action.playerToken, ended: null, error: null }
    case 'VIEW':
      return { ...state, view: action.view }
    case 'ENDED':
      return { ...state, phase: 'ended', ended: action.payload }
    case 'ERROR':
      return { ...state, error: action.message }
    case 'RESET_TO_LOBBY':
      return { ...state, phase: 'lobby', roomCode: null, role: null, playerToken: null, view: null, ended: null, error: null }
    default:
      return state
  }
}

interface MultiplayerContextValue {
  state: State
  setServerUrl: (url: string) => void
  connect: (url?: string) => void
  createRoom: (role: Role) => Promise<{ ok: true; roomCode: string } | { ok: false; error: string }>
  joinRoom: (roomCode: string, role?: Role) => Promise<{ ok: true } | { ok: false; error: string }>
  quickPlay: () => void
  cancelQuickPlay: () => void
  sendAction: (action: MatchAction) => Promise<{ ok: true } | { ok: false; error: string }>
  leaveMatch: () => void
  returnToLobby: () => void
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null)

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    serverUrl: getStoredServerUrl(),
    phase: 'disconnected',
    roomCode: null,
    role: null,
    playerToken: null,
    view: null,
    ended: null,
    error: null,
  })
  const socketRef = useRef<MPSocket | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const connect = useCallback((url?: string) => {
    const targetUrl = url ?? stateRef.current.serverUrl
    if (!targetUrl) {
      dispatch({ type: 'ERROR', message: 'Enter a server address first.' })
      return
    }
    socketRef.current?.disconnect()
    dispatch({ type: 'CONNECTING' })
    const socket = createSocket(targetUrl)
    socketRef.current = socket

    socket.on('connect', () => {
      dispatch({ type: 'CONNECTED' })
      const stored = getStoredSession()
      if (stored && stored.serverUrl === targetUrl) {
        socket.emit('match:rejoin', { roomCode: stored.roomCode, playerToken: stored.playerToken }, (res) => {
          if (!res.ok) setStoredSession(null)
        })
      }
    })
    socket.on('disconnect', () => dispatch({ type: 'DISCONNECTED' }))
    socket.on('connect_error', (err) => dispatch({ type: 'ERROR', message: `Could not reach server: ${err.message}` }))
    socket.on('lobby:waiting', ({ roomCode }) => dispatch({ type: 'ROOM_WAITING', roomCode }))
    socket.on('lobby:error', ({ message }) => dispatch({ type: 'ERROR', message }))
    socket.on('quickplay:waiting', () => dispatch({ type: 'QUICKPLAY_WAITING' }))
    socket.on('match:started', ({ roomCode, role, playerToken }) => {
      setStoredSession({ roomCode, playerToken, serverUrl: targetUrl })
      dispatch({ type: 'MATCH_STARTED', roomCode, role, playerToken })
    })
    socket.on('match:view', (view) => dispatch({ type: 'VIEW', view }))
    socket.on('match:ended', (payload) => {
      setStoredSession(null)
      dispatch({ type: 'ENDED', payload })
    })
    socket.on('match:error', ({ message }) => dispatch({ type: 'ERROR', message }))
  }, [])

  useEffect(() => {
    // A page reload (or a session resumed later) loses all in-memory state,
    // but if there's a stored match session, reconnect straight into it
    // instead of dropping the player back at the lobby.
    const stored = getStoredSession()
    if (stored) connect(stored.serverUrl)
    return () => {
      socketRef.current?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setServerUrl = useCallback((url: string) => {
    setStoredServerUrl(url)
    dispatch({ type: 'SET_SERVER_URL', url })
  }, [])

  const createRoom = useCallback((role: Role) => {
    return new Promise<{ ok: true; roomCode: string } | { ok: false; error: string }>((resolve) => {
      socketRef.current?.emit('lobby:create', { role }, (res) => {
        if (!res.ok) {
          dispatch({ type: 'ERROR', message: res.error })
          resolve(res)
          return
        }
        resolve({ ok: true, roomCode: res.roomCode })
      })
    })
  }, [])

  const joinRoom = useCallback((roomCode: string, role?: Role) => {
    return new Promise<{ ok: true } | { ok: false; error: string }>((resolve) => {
      socketRef.current?.emit('lobby:join', { roomCode: roomCode.trim().toUpperCase(), role }, (res) => {
        if (!res.ok) dispatch({ type: 'ERROR', message: res.error })
        resolve(res.ok ? { ok: true } : res)
      })
    })
  }, [])

  const quickPlay = useCallback(() => {
    socketRef.current?.emit('lobby:quickplay', (res) => {
      if (!res.ok) dispatch({ type: 'ERROR', message: res.error })
    })
  }, [])

  const cancelQuickPlay = useCallback(() => {
    socketRef.current?.emit('lobby:cancelQuickplay', () => dispatch({ type: 'RESET_TO_LOBBY' }))
  }, [])

  const sendAction = useCallback((action: MatchAction) => {
    return new Promise<{ ok: true } | { ok: false; error: string }>((resolve) => {
      if (!socketRef.current) {
        resolve({ ok: false, error: 'Not connected.' })
        return
      }
      socketRef.current.emit('match:action', { action }, (res) => {
        if (!res.ok) dispatch({ type: 'ERROR', message: res.error })
        resolve(res)
      })
    })
  }, [])

  const leaveMatch = useCallback(() => {
    socketRef.current?.emit('match:leave')
    setStoredSession(null)
    dispatch({ type: 'RESET_TO_LOBBY' })
  }, [])

  const returnToLobby = useCallback(() => {
    setStoredSession(null)
    dispatch({ type: 'RESET_TO_LOBBY' })
  }, [])

  return (
    <MultiplayerContext.Provider
      value={{ state, setServerUrl, connect, createRoom, joinRoom, quickPlay, cancelQuickPlay, sendAction, leaveMatch, returnToLobby }}
    >
      {children}
    </MultiplayerContext.Provider>
  )
}

export function useMultiplayer() {
  const ctx = useContext(MultiplayerContext)
  if (!ctx) throw new Error('useMultiplayer must be used within MultiplayerProvider')
  return ctx
}
