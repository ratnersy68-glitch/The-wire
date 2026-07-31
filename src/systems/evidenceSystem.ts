import type { BoardConnection, ConnectionStatus, EvidenceConnectionKind, GameState } from '../types'
import { nextId } from '../utils/id'
import { adjustResource } from './resourceSystem'

export function addConnection(
  state: GameState,
  fromId: string,
  toId: string,
  kind: EvidenceConnectionKind,
  status: ConnectionStatus = 'suspected',
): GameState {
  const existing = state.connections.find(
    (c) => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId),
  )
  if (existing) {
    return updateConnectionStatus(state, existing.id, status)
  }
  const connection: BoardConnection = { id: nextId('conn'), fromId, toId, kind, status }
  let next: GameState = { ...state, connections: [...state.connections, connection] }
  if (status === 'confirmed') {
    next = adjustResource(next, 'evidenceStrength', 2)
  }
  return next
}

export function updateConnectionStatus(state: GameState, connectionId: string, status: ConnectionStatus): GameState {
  const wasConfirmed = state.connections.find((c) => c.id === connectionId)?.status === 'confirmed'
  const next = {
    ...state,
    connections: state.connections.map((c) => (c.id === connectionId ? { ...c, status } : c)),
  }
  if (!wasConfirmed && status === 'confirmed') {
    return adjustResource(next, 'evidenceStrength', 2)
  }
  return next
}

export function removeConnection(state: GameState, connectionId: string): GameState {
  return { ...state, connections: state.connections.filter((c) => c.id !== connectionId) }
}

export const CONNECTION_LABELS: Record<EvidenceConnectionKind, string> = {
  called: 'Called',
  met_with: 'Met With',
  works_for: 'Works For',
  supplies: 'Supplies',
  lives_at: 'Lives At',
  owns: 'Owns',
  paid: 'Paid',
  threatened: 'Threatened',
  related_to: 'Related To',
}
