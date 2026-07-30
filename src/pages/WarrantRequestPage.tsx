import { useState } from 'react'
import { useGame } from '../game/GameContext'
import { Gavel } from 'lucide-react'
import { isWiretapEligible, WIRETAP_EVIDENCE_THRESHOLD } from '../systems/wiretapSystem'
import { SEARCH_WARRANT_EVIDENCE_THRESHOLD } from '../systems/investigationSystem'
import { shortName } from '../utils/suspectHelpers'

export function WarrantRequestPage() {
  const { state, dispatch } = useGame()
  const [type, setType] = useState<'wiretap' | 'search'>(state.wiretapActive ? 'search' : 'wiretap')
  const [targetSuspectId, setTargetSuspectId] = useState('')
  const [targetLocationId, setTargetLocationId] = useState('')
  const [justification, setJustification] = useState('')

  const wiretapReady = isWiretapEligible(state)
  const searchReady = state.resources.evidenceStrength >= SEARCH_WARRANT_EVIDENCE_THRESHOLD && state.resources.prosecutorConfidence >= 35

  const knownSuspects = state.suspects.filter((s) => s.knownAlias)
  const discoveredLocations = state.locations.filter((l) => l.discovered)

  function submit() {
    dispatch({
      type: 'REQUEST_WARRANT',
      warrantType: type,
      targetSuspectId: targetSuspectId || undefined,
      targetLocationId: type === 'search' ? targetLocationId || undefined : undefined,
      justification: justification || 'Standard request based on accumulated evidence.',
    })
    setJustification('')
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h2 className="font-serif text-2xl mb-1 flex items-center gap-2"><Gavel size={22} /> Warrant Request</h2>
      <p className="text-sm text-beige-400 mb-6">Warrants cost budget and overtime, and a denial damages prosecutor confidence. Don't ask before you're ready.</p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType('wiretap')}
          className={`flex-1 px-4 py-2 rounded border font-mono text-sm ${type === 'wiretap' ? 'border-termGreen-500 bg-termGreen-600/10 text-termGreen-400' : 'border-charcoal-600'}`}
        >
          Wiretap {state.wiretapActive && '(Active)'}
        </button>
        <button
          onClick={() => setType('search')}
          className={`flex-1 px-4 py-2 rounded border font-mono text-sm ${type === 'search' ? 'border-termGreen-500 bg-termGreen-600/10 text-termGreen-400' : 'border-charcoal-600'}`}
        >
          Search Warrant
        </button>
      </div>

      <div className="border border-charcoal-600 bg-navy-900 rounded p-4 mb-4">
        <p className="text-xs font-mono text-beige-400 mb-2">
          {type === 'wiretap'
            ? `Requires Evidence Strength ≥ ${WIRETAP_EVIDENCE_THRESHOLD}% and Prosecutor Confidence ≥ 30%.`
            : `Requires Evidence Strength ≥ ${SEARCH_WARRANT_EVIDENCE_THRESHOLD}% and Prosecutor Confidence ≥ 35%.`}
        </p>
        <p className={`text-sm font-mono ${type === 'wiretap' ? (wiretapReady ? 'text-termGreen-500' : 'text-muted-red') : (searchReady ? 'text-termGreen-500' : 'text-muted-red')}`}>
          Current standing: Evidence {state.resources.evidenceStrength}% / Prosecutor Confidence {state.resources.prosecutorConfidence}%
          {' — '}
          {(type === 'wiretap' ? wiretapReady : searchReady) ? 'Likely to be approved' : 'Likely to be denied'}
        </p>
      </div>

      {type === 'wiretap' && !state.wiretapActive && (
        <select value={targetSuspectId} onChange={(e) => setTargetSuspectId(e.target.value)} className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-sm mb-3">
          <option value="">Primary target (optional)...</option>
          {knownSuspects.map((s) => <option key={s.id} value={s.id}>{shortName(s)}</option>)}
        </select>
      )}

      {type === 'search' && (
        <select value={targetLocationId} onChange={(e) => setTargetLocationId(e.target.value)} className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-sm mb-3">
          <option value="">Select a location to raid...</option>
          {discoveredLocations.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.district}</option>)}
        </select>
      )}

      <textarea
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        placeholder="Justification for the judge (optional, for your case file)..."
        className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-sm mb-4 h-20"
      />

      <button
        disabled={type === 'wiretap' && state.wiretapActive}
        onClick={submit}
        className="w-full px-4 py-3 bg-termGreen-600/20 border border-termGreen-500 text-termGreen-400 rounded font-mono text-sm hover:bg-termGreen-600/30 disabled:opacity-40"
      >
        Submit Request
      </button>

      <h3 className="font-serif text-lg mt-6 mb-2">Warrant History</h3>
      <div className="flex flex-col gap-2">
        {state.warrants.length === 0 && <p className="text-sm text-beige-400 italic">No warrants requested yet.</p>}
        {state.warrants.slice().reverse().map((w) => (
          <div key={w.id} className="border border-charcoal-600 bg-navy-900 rounded p-2 text-xs flex justify-between">
            <span className="capitalize">{w.type} warrant &mdash; Day {w.dayRequested}</span>
            <span className={w.status === 'approved' ? 'text-termGreen-500' : w.status === 'denied' ? 'text-muted-red' : 'text-beige-400'}>
              {w.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
