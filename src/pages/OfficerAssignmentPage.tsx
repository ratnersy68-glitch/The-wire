import { useState } from 'react'
import { useGame } from '../game/GameContext'
import type { AssignmentType, OfficerAssignment } from '../types'
import { ASSIGNMENT_LABELS, describeAssignment } from '../utils/assignmentHelpers'
import { shortName } from '../utils/suspectHelpers'
import { Check } from 'lucide-react'

const TYPE_ORDER: AssignmentType[] = [
  'surveillance',
  'followSuspect',
  'financialInvestigation',
  'interview',
  'controlledBuy',
  'wiretapMonitor',
  'rest',
]

export function OfficerAssignmentPage() {
  const { state, dispatch } = useGame()
  const [officerId, setOfficerId] = useState(state.officers[0]?.id ?? '')
  const [type, setType] = useState<AssignmentType>('surveillance')
  const [locationId, setLocationId] = useState(state.selectedLocationId ?? '')
  const [suspectId, setSuspectId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [informantId, setInformantId] = useState('')

  const officer = state.officers.find((o) => o.id === officerId)
  const knownSuspects = state.suspects.filter((s) => s.knownAlias && !s.arrested)
  const discoveredLocations = state.locations.filter((l) => l.discovered)
  const activeInformants = state.informants.filter((i) => i.active)

  function assign() {
    if (!officer) return
    let assignment: OfficerAssignment | null = null
    if (type === 'surveillance' && locationId) assignment = { type, locationId }
    else if (type === 'followSuspect' && suspectId) assignment = { type, targetId: suspectId }
    else if (type === 'financialInvestigation' && suspectId) assignment = { type, targetId: suspectId }
    else if (type === 'interview' && subjectId) assignment = { type, targetId: subjectId }
    else if (type === 'controlledBuy' && suspectId && informantId) assignment = { type, targetId: suspectId, informantId }
    else if (type === 'wiretapMonitor' || type === 'rest') assignment = { type }
    else return

    dispatch({ type: 'ASSIGN_OFFICER', officerId: officer.id, assignment })
    if (type === 'surveillance') dispatch({ type: 'MARK_TUTORIAL_STEP', step: 'assigned_surveillance' })
  }

  function clear() {
    if (!officer) return
    dispatch({ type: 'ASSIGN_OFFICER', officerId: officer.id, assignment: null })
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">Officer Assignment</h2>
      <p className="text-sm text-beige-400 mb-6">Assign each detective one task for today. Assignments resolve when you end the day.</p>

      <div className="grid md:grid-cols-3 gap-2 mb-6">
        {state.officers.map((o) => (
          <button
            key={o.id}
            onClick={() => setOfficerId(o.id)}
            disabled={!o.available}
            className={`text-left panel p-3 transition-colors ${
              officerId === o.id ? '!border-beige-300 bg-white/10' : ''
            } disabled:opacity-40`}
          >
            <div className="text-sm text-beige-200 flex items-center gap-1">
              {o.name}
              {o.assignment && <Check size={12} className="text-termGreen-500" />}
            </div>
            <div className="text-[11px] text-beige-400">
              {o.assignment ? describeAssignment(state, o.assignment) : o.available ? 'Unassigned' : 'Unavailable'}
            </div>
          </button>
        ))}
      </div>

      {officer && officer.available && (
        <div className="panel p-4">
          <h3 className="font-serif text-lg mb-1">{officer.name}</h3>
          <p className="text-xs text-beige-400 mb-3">{officer.personality}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {TYPE_ORDER.filter((t) => t !== 'wiretapMonitor' || state.wiretapActive).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={type === t ? 'btn-primary px-3 py-1.5 text-xs' : 'btn-secondary px-3 py-1.5 text-xs'}
              >
                {ASSIGNMENT_LABELS[t]}
              </button>
            ))}
          </div>

          {type === 'surveillance' && (
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="field px-3 py-2 text-sm mb-3">
              <option value="">Select a location...</option>
              {discoveredLocations.map((l) => (
                <option key={l.id} value={l.id}>{l.name} — {l.district}</option>
              ))}
            </select>
          )}

          {(type === 'followSuspect' || type === 'financialInvestigation' || type === 'controlledBuy') && (
            <select value={suspectId} onChange={(e) => setSuspectId(e.target.value)} className="field px-3 py-2 text-sm mb-3">
              <option value="">Select a suspect...</option>
              {knownSuspects.map((s) => (
                <option key={s.id} value={s.id}>{shortName(s)} — {s.knownRole ? s.roleLabel : 'role unknown'}</option>
              ))}
            </select>
          )}

          {type === 'controlledBuy' && (
            <select value={informantId} onChange={(e) => setInformantId(e.target.value)} className="field px-3 py-2 text-sm mb-3">
              <option value="">Select an informant...</option>
              {activeInformants.map((i) => (
                <option key={i.id} value={i.id}>{i.codename}</option>
              ))}
            </select>
          )}

          {type === 'interview' && (
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="field px-3 py-2 text-sm mb-3">
              <option value="">Select a person to interview...</option>
              {state.interviewSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          )}

          {knownSuspects.length === 0 && (type === 'followSuspect' || type === 'financialInvestigation' || type === 'controlledBuy') && (
            <p className="text-xs text-muted-red mb-3">No identified suspects yet. Run surveillance first.</p>
          )}
          {activeInformants.length === 0 && type === 'controlledBuy' && (
            <p className="text-xs text-muted-red mb-3">No active informants. Recruit one from Informant Management.</p>
          )}
          {discoveredLocations.length === 0 && type === 'surveillance' && (
            <p className="text-xs text-muted-red mb-3">No known locations yet. Check the City Map.</p>
          )}

          <div className="flex gap-2">
            <button onClick={assign} className="flex-1 px-4 py-2 btn-primary font-mono text-sm">
              Confirm Assignment
            </button>
            {officer.assignment && (
              <button onClick={clear} className="btn-secondary px-4 py-2 text-sm">
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
