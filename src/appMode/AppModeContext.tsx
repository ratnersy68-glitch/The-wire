import { createContext, useContext, useState, type ReactNode } from 'react'
import { getStoredSession } from '../multiplayer/socketClient'

export type AppMode = 'single' | 'multiplayer'

interface AppModeContextValue {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

const AppModeContext = createContext<AppModeContextValue | null>(null)

export function AppModeProvider({ children }: { children: ReactNode }) {
  // A page reload should land back in an in-progress multiplayer match
  // rather than dropping the player at the single-player main menu.
  const [mode, setMode] = useState<AppMode>(() => (getStoredSession() ? 'multiplayer' : 'single'))
  return <AppModeContext.Provider value={{ mode, setMode }}>{children}</AppModeContext.Provider>
}

export function useAppMode() {
  const ctx = useContext(AppModeContext)
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider')
  return ctx
}
