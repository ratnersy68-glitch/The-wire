import { useState } from 'react'
import { ArrowLeft, Play, Trash2, FolderOpen } from 'lucide-react'
import { useGame } from '../game/GameContext'
import { deleteSave, listSaveSlots, loadGame } from '../systems/saveSystem'

export function NewGameSetupPage() {
  const { dispatch } = useGame()
  const [unitName, setUnitName] = useState('Detail Unit 7')
  const [selectedSlot, setSelectedSlot] = useState(1)
  const [slots, setSlots] = useState(listSaveSlots())

  function refresh() {
    setSlots(listSaveSlots())
  }

  function handleStart() {
    const seed = Math.floor(Math.random() * 1_000_000)
    dispatch({ type: 'NEW_GAME', unitName: unitName.trim() || 'Unnamed Detail', slot: selectedSlot, seed })
  }

  function handleLoad(slot: number) {
    const loaded = loadGame(slot)
    if (loaded) dispatch({ type: 'LOAD_STATE', state: loaded })
  }

  function handleDelete(slot: number) {
    deleteSave(slot)
    refresh()
  }

  return (
    <div className="min-h-screen bg-navy-950 text-beige-200 p-6 flex justify-center">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'main_menu' })}
          className="flex items-center gap-1 text-xs font-mono text-beige-400 hover:text-beige-200 mb-6"
        >
          <ArrowLeft size={14} /> Back to Main Menu
        </button>

        <h2 className="font-serif text-2xl mb-1">New Investigation</h2>
        <p className="text-sm text-beige-400 mb-6">
          Name your detail and pick a save slot. Choices you make from here on shape how the case unfolds.
        </p>

        <div className="panel p-4 mb-6">
          <label className="section-label block mb-1">Unit Name</label>
          <input
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            maxLength={40}
            className="field px-3 py-2 text-sm mb-4"
          />

          <label className="section-label block mb-2">Save Slot</label>
          <div className="flex gap-2 mb-4">
            {slots.map((s) => (
              <button
                key={s.slot}
                onClick={() => setSelectedSlot(s.slot)}
                className={
                  selectedSlot === s.slot
                    ? 'flex-1 btn-primary px-3 py-2 text-xs justify-start flex-col items-start'
                    : 'flex-1 btn-secondary px-3 py-2 text-xs justify-start flex-col items-start'
                }
              >
                <div>Slot {s.slot}</div>
                <div className="text-beige-400 font-normal">{s.exists ? `${s.unitName} — Ch.${s.chapter} Day ${s.day}` : 'Empty'}</div>
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="btn-primary w-full px-4 py-2.5 text-sm"
          >
            <Play size={16} /> Begin Investigation
          </button>
        </div>

        <h3 className="font-serif text-lg mb-2">Existing Saves</h3>
        <div className="flex flex-col gap-2">
          {slots.filter((s) => s.exists).length === 0 && (
            <p className="text-xs text-beige-400 font-mono">No saved cases yet.</p>
          )}
          {slots.filter((s) => s.exists).map((s) => (
            <div key={s.slot} className="panel flex items-center justify-between px-3 py-2">
              <div className="text-xs font-mono">
                <div className="text-beige-200">{s.unitName} — Slot {s.slot}</div>
                <div className="text-beige-400">Chapter {s.chapter}, Day {s.day}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleLoad(s.slot)} className="btn-secondary p-1.5" title="Load">
                  <FolderOpen size={14} />
                </button>
                <button onClick={() => handleDelete(s.slot)} className="btn-danger p-1.5" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
