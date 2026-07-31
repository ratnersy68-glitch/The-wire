import { useGame } from '../game/GameContext'
import { CHAPTER_TITLES } from '../data/objectives'
import { ArrowRight } from 'lucide-react'

export function ChapterSummaryPage() {
  const { state, dispatch } = useGame()
  const completedChapter = state.chapter - 1
  const knownCount = state.suspects.filter((s) => s.knownAlias).length

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 p-6">
      <div className="max-w-xl w-full panel p-8 text-center">
        <p className="text-xs font-mono text-termGreen-500 mb-2">CASE FILE UPDATE</p>
        <h2 className="font-serif text-2xl mb-1">{CHAPTER_TITLES[completedChapter]} — Complete</h2>
        <p className="text-sm text-beige-400 mb-6">
          {knownCount} of 18 organization members identified. Evidence strength at {state.resources.evidenceStrength}%.
          Organization alert at {state.resources.alertLevel}%.
        </p>

        <div className="border-t border-charcoal-700 pt-4 mb-6">
          <h3 className="font-serif text-xl mb-1">Up Next: {CHAPTER_TITLES[state.chapter]}</h3>
        </div>

        <button
          onClick={() => dispatch({ type: 'ACK_CHAPTER_SUMMARY' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 btn-primary font-mono text-sm"
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
