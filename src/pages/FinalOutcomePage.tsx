import { useGame } from '../game/GameContext'

export function FinalOutcomePage() {
  const { state, dispatch } = useGame()
  const ending = state.ending
  const leaders = state.suspects.filter((s) => s.level === 'leadership')
  const leadersConvicted = leaders.filter((s) => s.arrested)

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 p-6">
      <div className="max-w-2xl w-full border border-charcoal-600 bg-navy-900 rounded p-8">
        <p className="text-xs font-mono text-termGreen-500 mb-2 text-center">CASE CLOSED</p>
        <h2 className="font-serif text-3xl text-center mb-2">{ending?.title ?? 'Case Closed'}</h2>
        <p className="text-center text-sm text-beige-400 font-mono mb-6">Final Case Score: {ending?.score ?? 0} / 100</p>

        <p className="text-sm leading-relaxed text-beige-200 mb-6">{ending?.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-center">
          <div className="border border-charcoal-600 rounded p-3">
            <p className="text-xl font-mono">{leadersConvicted.length} / {leaders.length}</p>
            <p className="text-[11px] text-beige-400">Leadership Convicted</p>
          </div>
          <div className="border border-charcoal-600 rounded p-3">
            <p className="text-xl font-mono">{state.suspects.filter((s) => s.arrested).length}</p>
            <p className="text-[11px] text-beige-400">Total Arrests</p>
          </div>
          <div className="border border-charcoal-600 rounded p-3">
            <p className="text-xl font-mono">${state.assetsSeized.toLocaleString()}</p>
            <p className="text-[11px] text-beige-400">Assets Seized</p>
          </div>
          <div className="border border-charcoal-600 rounded p-3">
            <p className="text-xl font-mono">{state.resources.communityTrust}%</p>
            <p className="text-[11px] text-beige-400">Community Trust</p>
          </div>
          <div className="border border-charcoal-600 rounded p-3">
            <p className="text-xl font-mono">{state.informantsBurned}</p>
            <p className="text-[11px] text-beige-400">Informants Burned</p>
          </div>
          <div className="border border-charcoal-600 rounded p-3">
            <p className="text-xl font-mono">{state.innocentsHarmed}</p>
            <p className="text-[11px] text-beige-400">Innocents Harmed</p>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'main_menu' })}
          className="w-full px-4 py-3 border border-termGreen-500 text-termGreen-400 rounded font-mono text-sm hover:bg-termGreen-600/10"
        >
          Return to Main Menu
        </button>
      </div>
    </div>
  )
}
