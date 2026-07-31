import { MultiplayerProvider, useMultiplayer } from './MultiplayerContext'
import { MultiplayerLobby } from './MultiplayerLobby'
import { MatchEndedScreen } from './MatchEndedScreen'
import { PoliceView } from './PoliceView'
import { OrgView } from './OrgView'

function MultiplayerScreen() {
  const { state } = useMultiplayer()

  if (state.phase === 'ended') return <MatchEndedScreen />
  if (state.phase === 'in_match' && state.view) {
    return state.view.role === 'police' ? <PoliceView view={state.view} /> : <OrgView view={state.view} />
  }
  return <MultiplayerLobby />
}

export function MultiplayerRoot() {
  return (
    <MultiplayerProvider>
      <div className="min-h-screen bg-navy-950">
        <MultiplayerScreen />
      </div>
    </MultiplayerProvider>
  )
}
