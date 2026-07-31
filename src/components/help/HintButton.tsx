import { useState } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { useGame } from '../../game/GameContext'
import { useIdleTimer } from '../../hooks/useIdleTimer'
import { useSound } from '../../hooks/useSound'
import { currentChapterObjectives } from '../../systems/investigationSystem'

const FALLBACK_HINT =
  'Stuck? Open the City Map and assign a detective to Surveillance at a known corner from the Officer Assignment screen, then end the day to see what comes back.'

export function HintButton() {
  const { state, dispatch } = useGame()
  const play = useSound()
  const idle = useIdleTimer(60_000, state.screen)
  const [revealedText, setRevealedText] = useState<string | null>(null)

  const hintsRemaining = state.maxHintsPerDay - state.hintsUsedToday
  const nextObjectiveHint = currentChapterObjectives(state).find((o) => !o.completed && o.hint)?.hint
  const showPrompt = idle && !revealedText && hintsRemaining > 0

  function requestHint() {
    play('notify')
    setRevealedText(nextObjectiveHint ?? FALLBACK_HINT)
    dispatch({ type: 'USE_HINT' })
  }

  if (!showPrompt && !revealedText) return null

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {revealedText && (
        <div className="panel !border-beige-300 p-3 max-w-xs shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-1">
            <span className="section-label text-beige-200">Hint ({state.hintsUsedToday}/{state.maxHintsPerDay} used today)</span>
            <button onClick={() => setRevealedText(null)} className="text-beige-400 hover:text-beige-200 shrink-0">
              <X size={14} />
            </button>
          </div>
          <p className="text-sm text-beige-200 leading-relaxed">{revealedText}</p>
        </div>
      )}
      {showPrompt && (
        <button
          onClick={requestHint}
          className="btn-primary px-4 py-2.5 text-sm shadow-2xl animate-flicker"
          title="Get a hint (2 available per day)"
        >
          <Lightbulb size={16} /> Need a hint?
        </button>
      )}
    </div>
  )
}
