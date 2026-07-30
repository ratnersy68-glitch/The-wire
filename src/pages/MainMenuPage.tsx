import { Play, FolderOpen, RotateCcw } from 'lucide-react'
import { useGame } from '../game/GameContext'
import { listSaveSlots } from '../systems/saveSystem'

function caseNumber(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const seq = String((now.getMonth() + 1) * 31 + now.getDate()).padStart(4, '0')
  return `PMPD-${yy}-${seq}`
}

export function MainMenuPage() {
  const { dispatch } = useGame()
  const slots = listSaveSlots()
  const hasAnySave = slots.some((s) => s.exists)

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 relative overflow-hidden film-grain vignette">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #efefec 0, #efefec 1px, transparent 1px, transparent 40px)',
        }}
      />
      <div className="relative z-10 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="chip text-beige-400">{caseNumber()}</span>
          <span className="chip text-beige-400">STATUS: OPEN</span>
        </div>

        <div className="panel p-8 shadow-2xl">
          <h1 className="font-serif text-5xl text-center text-beige-200 tracking-wide mb-2" style={{ textWrap: 'balance' }}>
            THE DETAIL
          </h1>
          <div className="w-16 h-px bg-charcoal-600 mx-auto mb-3" />
          <p className="text-center text-[11px] font-mono text-termGreen-500 mb-8 terminal-glow tracking-widest animate-flicker">
            PORT MERCY POLICE DEPARTMENT &mdash; NARCOTICS DETAIL
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'new_game' })}
              className="btn-primary px-4 py-3 text-sm"
            >
              <Play size={16} /> New Investigation
            </button>
            <button
              disabled={!hasAnySave}
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'new_game' })}
              className="btn-secondary px-4 py-3 text-sm"
            >
              <FolderOpen size={16} /> Continue Investigation
            </button>
            <button
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'new_game' })}
              className="btn-ghost px-4 py-3 text-sm"
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
    </div>
  )
}
