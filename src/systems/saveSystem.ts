import type { GameState, SaveSlotMeta } from '../types'

const SAVE_KEY_PREFIX = 'the-detail-save-'
export const SAVE_SLOT_COUNT = 3

function keyFor(slot: number): string {
  return `${SAVE_KEY_PREFIX}${slot}`
}

export function saveGame(state: GameState, slot: number): void {
  try {
    localStorage.setItem(keyFor(slot), JSON.stringify({ ...state, savedAt: Date.now() }))
  } catch (err) {
    console.error('Failed to save game', err)
  }
}

export function loadGame(slot: number): GameState | null {
  try {
    const raw = localStorage.getItem(keyFor(slot))
    if (!raw) return null
    return JSON.parse(raw) as GameState
  } catch (err) {
    console.error('Failed to load game', err)
    return null
  }
}

export function deleteSave(slot: number): void {
  localStorage.removeItem(keyFor(slot))
}

export function listSaveSlots(): SaveSlotMeta[] {
  const slots: SaveSlotMeta[] = []
  for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot++) {
    const raw = localStorage.getItem(keyFor(slot))
    if (!raw) {
      slots.push({ slot, unitName: '', chapter: 0, day: 0, updatedAt: 0, exists: false })
      continue
    }
    try {
      const parsed = JSON.parse(raw) as GameState & { savedAt?: number }
      slots.push({
        slot,
        unitName: parsed.unitName,
        chapter: parsed.chapter,
        day: parsed.day,
        updatedAt: parsed.savedAt ?? 0,
        exists: true,
      })
    } catch {
      slots.push({ slot, unitName: '', chapter: 0, day: 0, updatedAt: 0, exists: false })
    }
  }
  return slots
}

const MUTE_KEY = 'the-detail-muted'

export function loadMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === 'true'
}

export function saveMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, String(muted))
}
