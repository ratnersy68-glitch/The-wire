import { useState } from 'react'
import { BookOpen, X, CheckCircle2, Circle } from 'lucide-react'
import { useGame } from '../../game/GameContext'
import { useSound } from '../../hooks/useSound'
import { currentChapterObjectives } from '../../systems/investigationSystem'
import { SCREEN_INSTRUCTIONS } from '../../data/instructions'
import { CHAPTER_TITLES } from '../../data/objectives'

export function InstructionsDrawer() {
  const { state } = useGame()
  const play = useSound()
  const [open, setOpen] = useState(false)

  const objectives = currentChapterObjectives(state)
  const screenInfo = SCREEN_INSTRUCTIONS[state.screen]

  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 flex transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'translate-x-[calc(100%-2.25rem)]'
      }`}
      style={{ width: 'min(380px, 92vw)' }}
    >
      <button
        onClick={() => {
          play(open ? 'click' : 'notify')
          setOpen((o) => !o)
        }}
        className="w-9 shrink-0 bg-navy-900 border-y border-l border-charcoal-600 flex items-center justify-center hover:bg-charcoal-700 transition-colors"
        title="How to play today"
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-mono tracking-[0.2em] text-beige-300 flex items-center gap-2 py-3">
          <BookOpen size={14} />
          INSTRUCTIONS
        </span>
      </button>

      <div className="flex-1 bg-navy-900 border-l border-charcoal-600 overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-700 sticky top-0 bg-navy-900 z-10">
          <h3 className="font-serif text-lg">Field Manual</h3>
          <button onClick={() => setOpen(false)} className="text-beige-400 hover:text-beige-200">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-5">
          <div>
            <p className="section-label mb-2">
              Today &mdash; {CHAPTER_TITLES[state.chapter]}, Day {state.day}
            </p>
            <div className="panel-flat p-3 flex flex-col gap-2">
              {objectives.map((obj) => (
                <div key={obj.id} className="flex items-start gap-2 text-xs">
                  {obj.completed ? (
                    <CheckCircle2 size={14} className="text-beige-200 mt-0.5 shrink-0" />
                  ) : (
                    <Circle size={14} className="text-beige-400 mt-0.5 shrink-0" />
                  )}
                  <span className={obj.completed ? 'line-through text-beige-400' : 'text-beige-200'}>{obj.text}</span>
                </div>
              ))}
              {objectives.length === 0 && <p className="text-xs text-beige-400 italic">No open objectives right now.</p>}
            </div>
          </div>

          {screenInfo && (
            <div>
              <p className="section-label mb-2">On This Screen &mdash; {screenInfo.title}</p>
              <ol className="flex flex-col gap-2.5">
                {screenInfo.steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-beige-300 leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full border border-charcoal-600 flex items-center justify-center text-[10px] font-mono text-beige-400 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="panel-flat p-3">
            <p className="section-label mb-1">Stuck?</p>
            <p className="text-xs text-beige-300 leading-relaxed">
              If you haven't done anything for about a minute, a hint button will appear in the bottom-right corner.
              You get {state.maxHintsPerDay} hints per day &mdash; {Math.max(0, state.maxHintsPerDay - state.hintsUsedToday)} left today.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
