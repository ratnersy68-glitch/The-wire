import { useState } from 'react'
import { CalendarCheck, UserCog, Gavel, FileText, Flag } from 'lucide-react'
import { useGame } from '../game/GameContext'
import { ASSIGNMENT_LABELS, describeAssignment } from '../utils/assignmentHelpers'
import { shortName } from '../utils/suspectHelpers'
import { MiniBar } from '../components/ui/MiniBar'

const ROLE_LABEL: Record<string, string> = {
  commander: 'Unit Commander',
  homicide: 'Homicide Detective',
  surveillance: 'Surveillance Specialist',
  financial: 'Financial Investigator',
  patrol: 'Patrol Officer',
  wiretap: 'Wiretap Analyst',
}

export function DashboardPage() {
  const { state, dispatch } = useGame()
  const assignedCount = state.officers.filter((o) => o.assignment && o.available).length
  const availableCount = state.officers.filter((o) => o.available).length
  const [takedownIds, setTakedownIds] = useState<string[]>(state.suspects.filter((s) => s.arrested).map((s) => s.id))
  const knownSuspects = state.suspects.filter((s) => s.knownAlias)

  function toggleTakedown(id: string) {
    setTakedownIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">Operations Dashboard</h2>
      <p className="text-sm text-beige-400 mb-6">
        {assignedCount} of {availableCount} available detectives assigned today.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {state.officers.map((o) => (
          <div key={o.id} className={`border rounded p-3 bg-navy-900 ${o.available ? 'border-charcoal-600' : 'border-muted-redDark opacity-60'}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-full bg-charcoal-700 flex items-center justify-center text-xs font-mono text-beige-200 border border-charcoal-600">
                  {o.portraitInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-beige-200 truncate">{o.name}</div>
                  <div className="text-[11px] text-beige-400 truncate">{ROLE_LABEL[o.role] ?? o.role}</div>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <MiniBar label="Fatigue" value={o.fatigue} invert />
                <MiniBar label="Morale" value={o.morale} />
              </div>
            </div>
            <div className="text-[9px] uppercase tracking-wider text-beige-400/70 font-mono mb-0.5">
              Today's Assignment
            </div>
            <div className="text-xs text-beige-300 min-h-[2.5rem]">
              {!o.available ? (
                <span className="text-muted-red">Unavailable today.</span>
              ) : o.assignment ? (
                <span>
                  <span className="text-termGreen-500">{ASSIGNMENT_LABELS[o.assignment.type]}</span>
                  {' — '}
                  {describeAssignment(state, o.assignment)}
                </span>
              ) : (
                <span className="text-beige-400 italic">No assignment yet.</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-[9px] uppercase tracking-widest text-beige-400/70 font-mono mb-1.5">Quick Actions</div>
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'officer_assignment' })}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-charcoal-600 rounded hover:bg-charcoal-700 font-mono text-sm"
        >
          <UserCog size={16} /> Assign Detectives
        </button>
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'warrant_request' })}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-charcoal-600 rounded hover:bg-charcoal-700 font-mono text-sm"
        >
          <Gavel size={16} /> Request Warrant
        </button>
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'surveillance_report' })}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-charcoal-600 rounded hover:bg-charcoal-700 font-mono text-sm"
        >
          <FileText size={16} /> Case Reports
        </button>
      </div>

      <button
        onClick={() => dispatch({ type: 'END_DAY' })}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-termGreen-600/20 border border-termGreen-500 text-termGreen-400 rounded hover:bg-termGreen-600/30 font-mono text-sm"
      >
        <CalendarCheck size={16} /> End the Day
      </button>
      <p className="text-[11px] text-beige-400 mt-1.5 text-center">
        Resolves every detective's assignment, checks the wiretap, and advances to tomorrow.
      </p>

      {state.chapter >= 5 && (
        <div className="mt-6 border border-muted-red rounded p-4 bg-muted-redDark/10">
          <h3 className="font-serif text-lg mb-1 flex items-center gap-2"><Flag size={18} /> The Takedown</h3>
          <p className="text-xs text-beige-300 mb-3">
            Choose who to formally charge and close the case. This is final — once you close the case, the investigation ends
            and your result is scored based on the evidence you've built.
          </p>
          <div className="grid md:grid-cols-2 gap-1 mb-3 max-h-48 overflow-y-auto">
            {knownSuspects.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-charcoal-700">
                <input type="checkbox" checked={takedownIds.includes(s.id)} onChange={() => toggleTakedown(s.id)} />
                {shortName(s)} <span className="text-beige-400">({s.level})</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => dispatch({ type: 'FINALIZE_CASE', arrestSuspectIds: takedownIds })}
            className="w-full px-4 py-2.5 bg-muted-redDark/50 border border-muted-red rounded font-mono text-sm hover:bg-muted-redDark/70"
          >
            Close the Case
          </button>
        </div>
      )}
    </div>
  )
}
