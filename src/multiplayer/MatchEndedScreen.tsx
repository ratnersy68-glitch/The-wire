import { Shield, Users } from 'lucide-react'
import { useMultiplayer } from './MultiplayerContext'

export function MatchEndedScreen() {
  const { state, returnToLobby } = useMultiplayer()
  if (!state.ended) return null
  const youWon = state.ended.winner === state.role

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden film-grain vignette flex items-center justify-center p-4">
      <div className="relative z-10 max-w-md w-full panel p-8 text-center">
        {state.ended.winner === 'police' ? <Shield size={40} className="mx-auto mb-3 text-beige-200" /> : <Users size={40} className="mx-auto mb-3 text-beige-200" />}
        <h1 className="font-serif text-3xl text-beige-100 mb-2">{youWon ? 'Case Closed — You Won' : 'The Other Side Won'}</h1>
        <p className="text-xs uppercase tracking-widest text-beige-400 mb-4">
          {state.ended.winner === 'police' ? 'Police Victory' : 'Organization Victory'}
        </p>
        <p className="text-sm text-beige-300 mb-6">{state.ended.reason}</p>
        <button onClick={returnToLobby} className="btn-primary w-full px-4 py-2.5 text-sm">
          Back to Lobby
        </button>
      </div>
    </div>
  )
}
