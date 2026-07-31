import { useState } from 'react'
import { Camera, DollarSign, Eye, Fingerprint, Gavel, Phone, ShieldAlert, UserSearch, Users } from 'lucide-react'
import type { PoliceView as PoliceViewType } from '../../shared/mpTypes'
import { useMultiplayer } from './MultiplayerContext'
import { MatchHeader } from './MatchHeader'

const ROLE_LABEL: Record<string, string> = { leader: 'Leader', lieutenant: 'Lieutenant', dealer: 'Dealer', courier: 'Courier' }

export function PoliceView({ view }: { view: PoliceViewType }) {
  const { state, sendAction } = useMultiplayer()
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function act(key: string, action: Parameters<typeof sendAction>[0]) {
    setBusyKey(key)
    const res = await sendAction(action)
    setBusyKey(null)
    setMessage(res.ok ? null : res.error)
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <MatchHeader view={view} roomCode={state.roomCode} />

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div className="panel px-3 py-2">
          <p className="section-label">Budget</p>
          <p className="font-mono text-lg text-beige-100">${view.budget.toLocaleString()}</p>
        </div>
        <div className="panel px-3 py-2">
          <p className="section-label">Manpower</p>
          <p className="font-mono text-lg text-beige-100">{view.manpower} / {view.manpowerCap}</p>
        </div>
        <div className="panel px-3 py-2">
          <p className="section-label">Evidence Strength</p>
          <p className="font-mono text-lg text-beige-100">{view.evidenceStrength}%</p>
        </div>
        <div className="panel px-3 py-2">
          <p className="section-label">Arrests Made</p>
          <p className="font-mono text-lg text-beige-100">{view.arrestedCount}</p>
        </div>
      </div>

      {message && <div className="mb-4 px-3 py-2 border border-muted-red rounded text-xs text-muted-red font-mono">{message}</div>}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="panel p-4">
            <h3 className="font-serif text-lg mb-3 flex items-center gap-2"><UserSearch size={18} /> Suspects on the Board</h3>
            {view.knownMembers.length === 0 && <p className="text-sm text-beige-400 italic">Nothing yet — watch a known corner to find a face.</p>}
            <div className="flex flex-col gap-2">
              {view.knownMembers.map((m) => {
                const hasWiretapWarrant = view.warrants.some((w) => w.type === 'wiretap' && w.targetId === m.id && w.status === 'approved')
                const wiretapActive = view.activeOps.some((o) => o.type === 'wiretap' && o.targetId === m.id)
                return (
                  <div key={m.id} className="border border-charcoal-700 rounded px-3 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-beige-100 font-mono">{m.codename}</span>{' '}
                        <span className="text-[10px] uppercase tracking-wider text-beige-400">
                          {m.identifiedByPolice ? ROLE_LABEL[m.role] : 'Unidentified role'}
                        </span>
                      </div>
                      <span className={`chip ${m.status === 'arrested' ? 'text-muted-red' : 'text-termGreen-500'}`}>{m.status}</span>
                    </div>
                    {m.status === 'active' && (
                      <div className="flex flex-wrap gap-1.5">
                        <ActionButton icon={Eye} label="Follow" busy={busyKey === `follow_${m.id}`} onClick={() => act(`follow_${m.id}`, { type: 'follow_suspect', targetMemberId: m.id })} />
                        {!hasWiretapWarrant && (
                          <ActionButton icon={Gavel} label="Wiretap Warrant" busy={busyKey === `warrant_wire_${m.id}`} onClick={() => act(`warrant_wire_${m.id}`, { type: 'request_warrant', warrantType: 'wiretap', targetId: m.id })} />
                        )}
                        {hasWiretapWarrant && !wiretapActive && (
                          <ActionButton icon={Phone} label="Install Wiretap" busy={busyKey === `wiretap_${m.id}`} onClick={() => act(`wiretap_${m.id}`, { type: 'install_wiretap', targetMemberId: m.id })} />
                        )}
                        <ActionButton icon={DollarSign} label="Use Informant" busy={busyKey === `ci_${m.id}`} onClick={() => act(`ci_${m.id}`, { type: 'use_informant', targetMemberId: m.id })} />
                        <ActionButton icon={DollarSign} label="Track Finances" busy={busyKey === `fin_${m.id}`} onClick={() => act(`fin_${m.id}`, { type: 'track_finances', targetMemberId: m.id })} />
                        {!m.identifiedByPolice && (
                          <ActionButton icon={Fingerprint} label="Identify" busy={busyKey === `id_${m.id}`} onClick={() => act(`id_${m.id}`, { type: 'identify_member', targetMemberId: m.id })} />
                        )}
                        <ActionButton
                          icon={ShieldAlert}
                          label="Arrest"
                          danger
                          busy={busyKey === `arrest_${m.id}`}
                          onClick={() => act(`arrest_${m.id}`, { type: 'arrest_suspect', targetMemberId: m.id })}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="font-serif text-lg mb-3 flex items-center gap-2"><Users size={18} /> Known Locations</h3>
            <div className="flex flex-col gap-2">
              {view.knownLocations.map((l) => {
                const hasSearchWarrant = view.warrants.some((w) => w.type === 'search' && w.targetId === l.id && w.status === 'approved')
                const beingWatched = view.activeOps.some((o) => o.type === 'watch_location' && o.targetId === l.id)
                return (
                  <div key={l.id} className="border border-charcoal-700 rounded px-3 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-beige-100">{l.name}</span>{' '}
                        <span className="text-[10px] uppercase tracking-wider text-beige-400">{l.district} &middot; {l.type.replace('_', ' ')}</span>
                      </div>
                      {!l.active && <span className="chip text-muted-red">abandoned</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {!beingWatched && <ActionButton icon={Eye} label="Watch" busy={busyKey === `watch_${l.id}`} onClick={() => act(`watch_${l.id}`, { type: 'watch_location', targetLocationId: l.id })} />}
                      {beingWatched && <ActionButton icon={Camera} label="Photograph" busy={busyKey === `photo_${l.id}`} onClick={() => act(`photo_${l.id}`, { type: 'take_photograph', targetLocationId: l.id })} />}
                      {!hasSearchWarrant && (
                        <ActionButton icon={Gavel} label="Search Warrant" busy={busyKey === `warrant_search_${l.id}`} onClick={() => act(`warrant_search_${l.id}`, { type: 'request_warrant', warrantType: 'search', targetId: l.id })} />
                      )}
                      {hasSearchWarrant && l.active && (
                        <ActionButton icon={ShieldAlert} label="Raid" danger busy={busyKey === `raid_${l.id}`} onClick={() => act(`raid_${l.id}`, { type: 'raid_location', targetLocationId: l.id })} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="panel p-4">
            <h3 className="section-label mb-2">Active Operations</h3>
            {view.activeOps.length === 0 && <p className="text-xs text-beige-400 italic">None running.</p>}
            <div className="flex flex-col gap-1.5">
              {view.activeOps.map((op) => (
                <div key={op.id} className="flex items-center justify-between text-xs font-mono">
                  <span className="capitalize text-beige-300">{op.type.replace('_', ' ')}</span>
                  <button onClick={() => act(`stop_${op.id}`, { type: 'stop_operation', opId: op.id })} className="btn-ghost px-2 py-0.5 text-[10px]">
                    Stand Down
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="section-label mb-2">Evidence Locker ({view.evidence.length})</h3>
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
              {view.evidence.slice().reverse().map((e) => (
                <div key={e.id} className="text-[11px] border-l-2 border-charcoal-600 pl-2">
                  <span className={e.admissible ? 'text-termGreen-500' : 'text-muted-red'}>{e.admissible ? 'Admissible' : 'Weak'}</span>
                  <span className="text-beige-300"> &middot; {e.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="section-label mb-2">Investigation Log</h3>
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto text-[11px] font-mono text-beige-400">
              {view.log.slice().reverse().map((l) => (
                <div key={l.id}>
                  <span className="text-beige-500">h{l.atHour.toFixed(1)}</span> {l.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  busy,
  danger,
}: {
  icon: typeof Eye
  label: string
  onClick: () => void
  busy: boolean
  danger?: boolean
}) {
  return (
    <button
      disabled={busy}
      onClick={onClick}
      className={`${danger ? 'btn-danger' : 'btn-secondary'} px-2.5 py-1.5 text-[11px] disabled:opacity-40`}
    >
      <Icon size={12} /> {label}
    </button>
  )
}
