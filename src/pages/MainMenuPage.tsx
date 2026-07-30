import { Play, FolderOpen, RotateCcw } from 'lucide-react'
import { useGame } from '../game/GameContext'
import { listSaveSlots } from '../systems/saveSystem'

export function MainMenuPage() {
  const { dispatch } = useGame()
  const slots = listSaveSlots()
  const hasAnySave = slots.some((s) => s.exists)

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #4ade80 0, #4ade80 1px, transparent 1px, transparent 40px)',
      }} />
      <div className="relative z-10 max-w-md w-full mx-4 border border-charcoal-600 bg-navy-900/90 rounded p-8 shadow-2xl">
        <h1 className="font-serif text-4xl text-center text-beige-200 tracking-wide mb-1">THE DETAIL</h1>
        <p className="text-center text-xs font-mono text-termGreen-500 mb-8 terminal-glow">
          PORT MERCY POLICE DEPARTMENT &mdash; CASE FILE OPEN
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'new_game' })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-termGreen-600/20 border border-termGreen-500 text-termGreen-400 rounded hover:bg-termGreen-600/30 transition-colors font-mono text-sm"
          >
            <Play size={16} /> New Investigation
          </button>
          <button
            disabled={!hasAnySave}
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'new_game' })}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-charcoal-600 rounded hover:bg-charcoal-700 transition-colors font-mono text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FolderOpen size={16} /> Continue Investigation
          </button>
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'new_game' })}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-charcoal-600 rounded hover:bg-charcoal-700 transition-colors font-mono text-sm text-beige-400"
          >
            <RotateCcw size={16} /> Manage Save Slots
          </button>
        </div>

        <p className="text-center text-[11px] text-beige-400/70 mt-8 leading-relaxed">
          A fictional city. A fictional crew. Somewhere between a cork board and a wiretap,
          you'll build a case &mdash; or watch it fall apart.
        </p>
      </div>
    </div>
  )
}
