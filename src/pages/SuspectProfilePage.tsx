import { useGame } from '../game/GameContext'
import { shortName } from '../utils/suspectHelpers'
import type { Suspect } from '../types'

const LEVEL_LABEL: Record<Suspect['level'], string> = {
  leadership: 'Leadership',
  mid: 'Mid-Level',
  street: 'Street-Level',
}

export function SuspectProfilePage() {
  const { state, dispatch } = useGame()
  const known = state.suspects.filter((s) => s.knownAlias)
  const selected = state.suspects.find((s) => s.id === state.selectedSuspectId) ?? known[0]

  const relationships = state.relationships.filter(
    (r) => selected && r.discovered && (r.fromId === selected.id || r.toId === selected.id),
  )

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">Suspect Profiles</h2>
      <p className="text-sm text-beige-400 mb-4">{known.length} of 18 organization members identified so far.</p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="panel p-2 max-h-[560px] overflow-y-auto">
          {(['leadership', 'mid', 'street'] as const).map((level) => (
            <div key={level} className="mb-2">
              <p className="section-label px-2 pt-2">{LEVEL_LABEL[level]}</p>
              {known.filter((s) => s.level === level).map((s) => (
                <button
                  key={s.id}
                  onClick={() => dispatch({ type: 'SELECT_SUSPECT', id: s.id })}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs mb-0.5 ${
                    selected?.id === s.id ? 'bg-termGreen-600/10 text-termGreen-400' : 'hover:bg-charcoal-700 text-beige-300'
                  }`}
                >
                  {shortName(s)}
                </button>
              ))}
              {known.filter((s) => s.level === level).length === 0 && (
                <p className="text-xs text-beige-400 italic px-2">None identified yet.</p>
              )}
            </div>
          ))}
        </div>

        <div className="md:col-span-2 panel p-4">
          {selected ? (
            <>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif text-2xl">{selected.knownRealName ? selected.realName : `"${selected.alias}"`}</h3>
                  <p className="text-xs text-beige-400">
                    {selected.knownRealName && `alias "${selected.alias}" · `}
                    {selected.knownRole ? selected.roleLabel : 'Role unknown'}
                    {selected.arrested && ' · ARRESTED'}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-charcoal-700 border border-charcoal-600 flex items-center justify-center font-mono text-lg">
                  {selected.alias.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-beige-400 mb-4">
                <div>Age: {selected.knownRealName ? selected.age : 'Unknown'}</div>
                <div>Level: {LEVEL_LABEL[selected.level]}</div>
                <div>Caution: {selected.caution}</div>
                <div>Loyalty: {selected.loyalty}%</div>
                <div>Phone: {selected.knownPhone ? selected.phoneNumber : 'Unknown'}</div>
                <div>Vehicle: {selected.knownVehicle ? selected.vehicle : 'Unknown'}</div>
                <div>Home: {selected.knownHome ? state.locations.find((l) => l.id === selected.homeLocationId)?.name ?? 'Unknown' : 'Unknown'}</div>
                <div>Suspicion of Police: {selected.suspicionOfPolice}%</div>
              </div>

              <p className="text-sm text-beige-300 mb-3">{selected.personality}</p>

              {selected.knownRole && (
                <>
                  <p className="section-label mb-1">Reaction to Pressure</p>
                  <p className="text-sm text-beige-300 mb-3">{selected.reactionToPressure}</p>
                </>
              )}

              {selected.knownRealName && selected.criminalHistory.length > 0 && (
                <>
                  <p className="section-label mb-1">Criminal History</p>
                  <ul className="text-sm text-beige-300 list-disc list-inside mb-3">
                    {selected.criminalHistory.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </>
              )}

              {relationships.length > 0 && (
                <>
                  <p className="section-label mb-1">Known Relationships</p>
                  <ul className="text-sm text-beige-300 list-disc list-inside mb-3">
                    {relationships.map((r, i) => {
                      const otherId = r.fromId === selected.id ? r.toId : r.fromId
                      const other = state.suspects.find((s) => s.id === otherId)
                      return (
                        <li key={i}>
                          {r.type.replace('_', ' ')} {other ? shortName(other) : 'unknown'}{' '}
                          <span className="text-[11px] text-beige-400">({r.status})</span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}

              {selected.usingBurner && (
                <p className="text-xs text-muted-red italic">Believed to be using a new, unlisted phone.</p>
              )}
              {selected.relocated && (
                <p className="text-xs text-muted-red italic">Has likely relocated in response to police pressure.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-beige-400 italic">No suspects identified yet. Run surveillance to start building the picture.</p>
          )}
        </div>
      </div>
    </div>
  )
}
