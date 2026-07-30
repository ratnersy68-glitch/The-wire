import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import type { GameState } from '../types'
import { gameReducer, type GameAction } from './gameReducer'
import { createInitialState } from './initialState'
import { loadGame, loadMuted, saveGame } from '../systems/saveSystem'

const BLANK_STATE = createInitialState('', 1, 1)

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, { ...BLANK_STATE, screen: 'main_menu', muted: loadMuted() })

  useEffect(() => {
    if (state.screen === 'main_menu' || state.screen === 'new_game') return
    saveGame(state, state.saveSlot)
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}

export function loadGameIntoState(slot: number): GameState | null {
  return loadGame(slot)
}
