import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { useGame } from '../game/GameContext'
import { CHAPTER_BRIEFS, CHAPTER_TITLES } from '../data/objectives'
import { currentChapterObjectives } from '../systems/investigationSystem'

export function MorningBriefingPage() {
  const { state, dispatch } = useGame()
  const objectives = currentChapterObjectives(state)
  const latestLog = state.logs[0]

  return (
    <div className="min-h-screen bg-navy-950 text-beige-200 p-6 flex justify-center">
      <div className="max-w-2xl w-full">
        <p className="text-xs font-mono text-termGreen-500 mb-1">
          {state.unitName} &mdash; Day {state.day}
        </p>
        <h2 className="font-serif text-3xl mb-4">{CHAPTER_TITLES[state.chapter]}</h2>

        <div className="border border-charcoal-600 bg-navy-900 rounded p-4 mb-4 paper-texture">
          <p className="text-sm leading-relaxed text-beige-200">{CHAPTER_BRIEFS[state.chapter]}</p>
        </div>

        {state.day === 1 && latestLog && (
          <div className="border-l-2 border-termGreen-600 bg-navy-900/60 rounded p-3 mb-4 text-sm text-beige-300 italic">
            {latestLog.text}
          </div>
        )}

        <h3 className="font-serif text-lg mb-2">Chapter Objectives</h3>
        <div className="border border-charcoal-600 bg-navy-900 rounded p-3 mb-6 flex flex-col gap-2">
          {objectives.map((obj) => (
            <div key={obj.id} className="flex items-start gap-2 text-sm">
              {obj.completed ? (
                <CheckCircle2 size={16} className="text-termGreen-500 mt-0.5 shrink-0" />
              ) : (
                <Circle size={16} className="text-beige-400 mt-0.5 shrink-0" />
              )}
              <div>
                <span className={obj.completed ? 'line-through text-beige-400' : 'text-beige-200'}>{obj.text}</span>
                {!obj.completed && obj.hint && <div className="text-xs text-beige-400 mt-0.5">{obj.hint}</div>}
              </div>
            </div>
          ))}
        </div>

        {state.reports.length > 0 && (
          <>
            <h3 className="font-serif text-lg mb-2">Overnight Notes</h3>
            <div className="border border-charcoal-600 bg-navy-900 rounded p-3 mb-6 max-h-40 overflow-y-auto flex flex-col gap-2">
              {state.reports.slice(0, 3).map((r) => (
                <div key={r.id} className="text-xs text-beige-300">
                  <span className="text-termGreen-500 font-mono">[{r.title}]</span> {r.body}
                </div>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'dashboard' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-termGreen-600/20 border border-termGreen-500 text-termGreen-400 rounded hover:bg-termGreen-600/30 font-mono text-sm"
        >
          Begin the Day <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
