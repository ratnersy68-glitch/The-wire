import { useState } from 'react'
import { Plus, Trash2, NotebookPen } from 'lucide-react'
import { useGame } from '../game/GameContext'

const LINE_HEIGHT = 30

export function NotesPage() {
  const { state, dispatch } = useGame()
  const [titleDraft, setTitleDraft] = useState<string | null>(null)

  const pages = state.notePages
  const selected = pages.find((p) => p.id === state.selectedNotePageId) ?? pages[0]

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h2 className="font-serif text-2xl mb-1 flex items-center gap-2">
        <NotebookPen size={22} /> Case Notes
      </h2>
      <p className="text-sm text-beige-400 mb-4">
        Your own running notes on the case. Nothing here is graded or tracked &mdash; write down whatever you've
        pieced together.
      </p>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="panel p-2 md:max-h-[640px] overflow-y-auto">
          <button
            onClick={() => dispatch({ type: 'ADD_NOTE_PAGE' })}
            className="btn-secondary w-full px-2 py-2 mb-2 text-xs"
          >
            <Plus size={14} /> New Page
          </button>
          {pages.map((p) => (
            <div
              key={p.id}
              className={`group flex items-center gap-1 rounded mb-1 ${
                selected?.id === p.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <button
                onClick={() => dispatch({ type: 'SELECT_NOTE_PAGE', id: p.id })}
                className="flex-1 text-left px-2 py-1.5 text-xs truncate"
              >
                <div className={selected?.id === p.id ? 'text-beige-200' : 'text-beige-300'}>{p.title}</div>
                <div className="text-beige-400 text-[10px]">Day {p.day}</div>
              </button>
              {pages.length > 1 && (
                <button
                  onClick={() => dispatch({ type: 'DELETE_NOTE_PAGE', id: p.id })}
                  className="opacity-0 group-hover:opacity-100 p-1 mr-1 text-beige-400 hover:text-muted-red"
                  title="Delete page"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="md:col-span-3">
          {selected && (
            <div className="border border-charcoal-600 bg-[#e9e6da] rounded shadow-2xl overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b border-black/10 bg-[#e2ded0]">
                <input
                  value={titleDraft ?? selected.title}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onFocus={() => setTitleDraft(selected.title)}
                  onBlur={() => {
                    if (titleDraft !== null) dispatch({ type: 'RENAME_NOTE_PAGE', id: selected.id, title: titleDraft || 'Untitled' })
                    setTitleDraft(null)
                  }}
                  className="w-full bg-transparent text-charcoal-900 font-handwritten text-2xl focus:outline-none"
                />
                <p className="text-[11px] text-charcoal-700/70 font-mono mt-0.5">Day {selected.day}</p>
              </div>
              <div className="relative pl-14 pr-6" style={{ background: 'repeating-linear-gradient(#e9e6da 0, #e9e6da ' + (LINE_HEIGHT - 1) + 'px, #b9b3a0 ' + (LINE_HEIGHT - 1) + 'px, #b9b3a0 ' + LINE_HEIGHT + 'px)' }}>
                <div className="absolute top-0 bottom-0 left-9 w-px bg-muted-red/50" />
                <textarea
                  value={selected.body}
                  onChange={(e) => dispatch({ type: 'UPDATE_NOTE_PAGE', id: selected.id, body: e.target.value })}
                  placeholder="Write down what you've figured out..."
                  className="w-full min-h-[560px] bg-transparent resize-none focus:outline-none text-charcoal-900 font-handwritten text-xl"
                  style={{ lineHeight: `${LINE_HEIGHT}px`, paddingTop: '2px' }}
                  spellCheck={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
