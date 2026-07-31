import { useState } from 'react'
import { useGame } from '../game/GameContext'
import { UserPlus, ShieldAlert } from 'lucide-react'

export function InformantManagementPage() {
  const { state, dispatch } = useGame()
  const [codenameDrafts, setCodenameDrafts] = useState<Record<string, string>>({})

  const recruitable = state.interviewSubjects.filter((s) => s.interviewed && s.trust >= 45)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">Informant Management</h2>
      <p className="text-sm text-beige-400 mb-6">Informants cost money to maintain and carry real risk of exposure. Use them carefully.</p>

      <h3 className="font-serif text-lg mb-2">Active Informants</h3>
      <div className="flex flex-col gap-2 mb-6">
        {state.informants.length === 0 && <p className="text-sm text-beige-400 italic">No active informants.</p>}
        {state.informants.map((i) => (
          <div key={i.id} className={`panel p-3 ${i.exposed ? '!border-muted-redDark bg-muted-redDark/10' : ''}`}>
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-beige-200">{i.codename}</h4>
              {i.exposed && <span className="text-xs text-muted-red flex items-center gap-1"><ShieldAlert size={12} /> Exposed</span>}
            </div>
            <p className="text-xs text-beige-400 mb-2">{i.relationshipToOrg}</p>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-beige-400 mb-1">
              <span>Trust {i.trust}%</span>
              <span>Fear {i.fear}%</span>
              <span>Honesty {i.honesty}%</span>
            </div>
            <p className="text-xs text-beige-400">Motivation: {i.motivation}</p>
            <p className="text-xs text-beige-400">Weekly cost: ${i.weeklyCost}</p>
          </div>
        ))}
      </div>

      <h3 className="font-serif text-lg mb-2">Potential Recruits</h3>
      <p className="text-xs text-beige-400 mb-3">People you've interviewed who trust your unit enough to consider talking regularly.</p>
      <div className="flex flex-col gap-2">
        {recruitable.length === 0 && (
          <p className="text-sm text-beige-400 italic">Nobody qualifies yet. Build trust through interviews first.</p>
        )}
        {recruitable.map((s) => (
          <div key={s.id} className="panel p-3 flex flex-wrap items-center gap-2 justify-between">
            <div>
              <h4 className="text-sm text-beige-200">{s.name}</h4>
              <p className="text-xs text-beige-400">{s.relationshipToOrg}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder="Codename"
                value={codenameDrafts[s.id] ?? ''}
                onChange={(e) => setCodenameDrafts((d) => ({ ...d, [s.id]: e.target.value }))}
                className="field px-2 py-1 text-xs w-28"
              />
              <button
                onClick={() => dispatch({ type: 'RECRUIT_INFORMANT', subjectId: s.id, codename: codenameDrafts[s.id] || 'Confidential Source' })}
                className="btn-primary px-3 py-1.5 text-xs"
              >
                <UserPlus size={12} /> Recruit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
