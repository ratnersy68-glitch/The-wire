import { useGame } from '../game/GameContext'
import { CityMapSVG } from '../components/map/CityMapSVG'
import { suspectsAtLocation, shortName } from '../utils/suspectHelpers'
import { UserCog } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  corner: 'Street Corner',
  apartment: 'Apartment Building',
  restaurant: 'Restaurant',
  convenience_store: 'Convenience Store',
  vacant_house: 'Vacant House',
  police_hq: 'Police Headquarters',
  courthouse: 'Courthouse',
  school: 'School',
  warehouse: 'Warehouse',
  nightclub: 'Nightclub',
  auto_shop: 'Auto Shop',
  church: 'Church',
  waterfront: 'Waterfront Property',
}

export function CityMapPage() {
  const { state, dispatch } = useGame()
  const selected = state.locations.find((l) => l.id === state.selectedLocationId)
  const linkedSuspects = selected ? suspectsAtLocation(state.suspects, selected.id).filter((s) => s.knownAlias) : []

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">Port Mercy — City Map</h2>
      <p className="text-sm text-beige-400 mb-4">
        Click a known location to view details. Undiscovered locations stay dark until surveillance, follows, or
        financial work turns them up.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex flex-col gap-2">
          <div className="aspect-[4/3]">
            <CityMapSVG
              locations={state.locations}
              selectedId={state.selectedLocationId}
              onSelect={(id) => dispatch({ type: 'SELECT_LOCATION', id })}
            />
          </div>
          <div className="panel px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-mono text-beige-400">
            <span className="uppercase tracking-wider text-beige-400/70">Map Key:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" /> Police / Courthouse
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#e5e5e0' }} /> High Activity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#b8b8b3' }} /> Routine Stop
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-muted-red inline-block" /> Heat Level 8+
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-charcoal-600 inline-block" /> Not Yet Discovered
            </span>
          </div>
        </div>

        <div className="panel p-4 flex flex-col">
          <div className="flex-1">
            {selected ? (
              <>
                <h3 className="font-serif text-lg text-beige-200">{selected.name}</h3>
                <p className="text-xs text-beige-400 mb-2">
                  {TYPE_LABEL[selected.type]} &middot; {selected.district}
                </p>
                <p className="text-sm text-beige-300 mb-3">{selected.description}</p>
                <div className="text-[9px] uppercase tracking-wider text-beige-400/70 font-mono mb-0.5">
                  Heat Level (0&ndash;10)
                </div>
                <p className="text-xs font-mono text-beige-300 mb-3">
                  {selected.heatLevel} {selected.heatLevel >= 8 ? '— drawing attention' : ''}
                </p>

                {linkedSuspects.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] uppercase tracking-wider text-termGreen-500 font-mono mb-1">
                      Known People Tied Here
                    </p>
                    <ul className="text-xs text-beige-300 list-disc list-inside">
                      {linkedSuspects.map((s) => (
                        <li key={s.id}>{shortName(s)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.raided && <p className="text-xs text-muted-red mb-3">This location has already been raided.</p>}

                <button
                  onClick={() => dispatch({ type: 'NAVIGATE', screen: 'officer_assignment' })}
                  className="btn-primary w-full px-3 py-2 text-xs"
                >
                  <UserCog size={14} /> Assign Surveillance Here
                </button>
              </>
            ) : (
              <p className="text-sm text-beige-400 italic">Select a location on the map to see details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
