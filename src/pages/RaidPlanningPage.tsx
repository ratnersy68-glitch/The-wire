import { useState } from 'react'
import { useGame } from '../game/GameContext'
import { ShieldAlert } from 'lucide-react'

export function RaidPlanningPage() {
  const { state, dispatch } = useGame()
  const [locationId, setLocationId] = useState('')
  const [officerIds, setOfficerIds] = useState<string[]>([])

  const raidableLocationIds = new Set(
    state.warrants.filter((w) => w.type === 'search' && w.status === 'approved' && w.targetLocationId).map((w) => w.targetLocationId as string),
  )
  const raidableLocations = state.locations.filter((l) => raidableLocationIds.has(l.id) && !l.raided)
  const availableOfficers = state.officers.filter((o) => o.available && !o.assignment)

  function toggleOfficer(id: string) {
    setOfficerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function launch() {
    if (!locationId || officerIds.length === 0) return
    dispatch({ type: 'EXECUTE_RAID', locationId, officerIds })
    setLocationId('')
    setOfficerIds([])
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h2 className="font-serif text-2xl mb-1 flex items-center gap-2"><ShieldAlert size={22} /> Raid Planning</h2>
      <p className="text-sm text-beige-400 mb-6">
        Raiding too early nets low-level arrests and warns leadership. Raiding too late risks the organization moving first.
        A search warrant is required before a location can be raided.
      </p>

      {raidableLocations.length === 0 ? (
        <div className="panel p-4 text-sm text-beige-400 italic">
          No approved search warrants yet. Request one from the Warrant Request screen once you have a strong location lead.
        </div>
      ) : (
        <>
          <label className="section-label block mb-1">Target Location</label>
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="field px-3 py-2 text-sm mb-4">
            <option value="">Select location...</option>
            {raidableLocations.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.district}</option>)}
          </select>

          <label className="section-label block mb-2">Assign Officers</label>
          <div className="grid md:grid-cols-2 gap-2 mb-4">
            {availableOfficers.map((o) => (
              <button
                key={o.id}
                onClick={() => toggleOfficer(o.id)}
                className={officerIds.includes(o.id) ? 'text-left btn-primary px-3 py-2 text-xs justify-start' : 'text-left btn-secondary px-3 py-2 text-xs justify-start'}
              >
                {o.name} <span className="text-beige-400">({o.role})</span>
              </button>
            ))}
            {availableOfficers.length === 0 && <p className="text-xs text-beige-400 italic">No officers free — check assignments.</p>}
          </div>

          <div className="panel p-3 mb-4 text-xs font-mono text-beige-400">
            Current Evidence Strength: {state.resources.evidenceStrength}% &middot; Organization Alert: {state.resources.alertLevel}%
            <br />
            Cost: $1,500 and 6 overtime hours.
          </div>

          <button
            disabled={!locationId || officerIds.length === 0}
            onClick={launch}
            className="btn-danger w-full px-4 py-3 text-sm"
          >
            Launch Raid
          </button>
        </>
      )}
    </div>
  )
}
