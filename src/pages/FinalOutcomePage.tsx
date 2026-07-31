import { useGame } from '../game/GameContext'

export function FinalOutcomePage() {
  const { state, dispatch } = useGame()
  const ending = state.ending
  const leaders = state.suspects.filter((s) => s.level === 'leadership')
  const leadersConvicted = leaders.filter((s) => s.arrested)

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 p-6">
      <div className="max-w-2xl w-full panel p-8">
        <p className="text-xs font-mono text-termGreen-500 mb-2 text-center">CASE CLOSED</p>
        <h2 className="font-serif text-3xl text-center mb-2">{ending?.title ?? 'Case Closed'}</h2>
        <p className="text-center text-sm text-beige-400 font-mono mb-6">Final Case Score: {ending?.score ?? 0} / 100</p>

        <p className="text-sm leading-relaxed text-beige-200 mb-6">{ending?.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-center">
          <div className="panel-flat p-3">
            <p className="text-xl font-mono tabular-nums">{leadersConvicted.length} / {leaders.length}</p>
            <p className="section-label mt-0.5">Leadership Convicted</p>
          </div>
          <div className="panel-flat p-3">
            <p className="text-xl font-mono tabular-nums">{state.suspects.filter((s) => s.arrested).length}</p>
            <p className="section-label mt-0.5">Total Arrests</p>
          </div>
          <div className="panel-flat p-3">
            <p className="text-xl font-mono tabular-nums">${state.assetsSeized.toLocaleString()}</p>
            <p className="section-label mt-0.5">Assets Seized</p>
          </div>
          <div className="panel-flat p-3">
            <p className="text-xl font-mono tabular-nums">{state.resources.communityTrust}%</p>
            <p className="section-label mt-0.5">Community Trust</p>
          </div>
          <div className="panel-flat p-3">
            <p className="text-xl font-mono tabular-nums">{state.informantsBurned}</p>
            <p className="section-label mt-0.5">Informants Burned</p>
          </div>
          <div className="panel-flat p-3">
            <p className="text-xl font-mono tabular-nums">{state.innocentsHarmed}</p>
            <p className="section-label mt-0.5">Innocents Harmed</p>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'main_menu' })}
          className="btn-primary w-full px-4 py-3 text-sm"
        >
          Return to Main Menu
        </button>
      </div>
    </div>
  )
}
