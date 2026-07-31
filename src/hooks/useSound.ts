import { useCallback } from 'react'
import { useGame } from '../game/GameContext'
import { playSound, type SoundKind } from '../utils/sound'

export function useSound() {
  const { state } = useGame()
  return useCallback((kind: SoundKind) => playSound(kind, state.muted), [state.muted])
}
