import { useState } from 'react'
import {
  Building2, Eye, EyeOff, Flame, MessageSquareOff, PhoneOff, ShieldOff,
  TrendingUp, Trash2, UserMinus, UserPlus, Users,
} from 'lucide-react'
import type { OrgView as OrgViewType } from '../../shared/mpTypes'
import { useMultiplayer } from './MultiplayerContext'
import { MatchHeader } from './MatchHeader'

const ROLE_LABEL: Record<string, string> = { leader: 'Leader', lieutenant: 'Lieutenant', dealer: 'Dealer', courier: 'Courier' }

export function OrgView({ view }: { view: OrgViewType }) {
  const { state, sendAction } = useMultiplayer()
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [moveFrom, setMoveFrom] = useState('')
  const [moveTo, setMoveTo] = useState('')

  async function act(key: string, action: Parameters<typeof sendAction>[0]) {
    setBusyKey(key)
    const res = await sendAction(action)
    setBusyKey(null)
    setMessage(res.ok ? null : res.error)
  }

  const activeMembers = view.members.filter((m) => m.status === 'active')
  const arrestedMembers = view.members.filter((m) => m.status === 'arrested')
  const activeLocations = view.locations.filter((l) => l.active)
  const inactiveLocations = view.locations.filter((l) => !l.active)
  const locationName = (id: string) => view.locations.find((l) => l.id === id)?.name ?? 'unknown'

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <MatchHeader view={view} roomCode={state.roomCode} />

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div className="panel px-3 py-2">
          <p className="section-label">Cash</p>
          <p className="font-mono text-lg text-beige-100">${view.cash.toLocaleString()}</p>
        </div>
        <div className="panel px-3 py-2">
          <p className="section-label flex items-center gap-1"><Flame size={11} /> Heat</p>
          <p className={`font-mono text-lg ${view.heat >= 60 ? 'text-muted-red' : 'text-beige-100'}`}>{Math.round(view.heat)}%</p>
        </div>
        <div className="panel px-3 py-2">
          <p className="section-label">Network Size</p>
          <p className="font-mono text-lg text-beige-100">{view.networkSize}</p>
        </div>
        <div className="panel px-3 py-2 flex flex-col justify-center gap-1">
          {view.codedLanguageActive && <span className="chip text-termGreen-500 w-fit">Coded language active</span>}
          {view.layingLow && <span className="chip text-termGreen-500 w-fit">Laying low</span>}
          {!view.codedLanguageActive && !view.layingLow && <span className="text-[11px] text-beige-400 italic">Business as usual</span>}
        </div>
      </div>

      {message && <div className="mb-4 px-3 py-2 border border-muted-red rounded text-xs text-muted-red font-mono">{message}</div>}

      <div className="panel p-3 mb-4 flex flex-wrap gap-2">
        <ActionButton icon={MessageSquareOff} label="Use Coded Language ($1,000)" busy={busyKey === 'coded'} onClick={() => act('coded', { type: 'use_coded_language' })} />
        <ActionButton icon={EyeOff} label="Lay Low" busy={busyKey === 'laylow'} onClick={() => act('laylow', { type: 'lay_low' })} />
        <ActionButton icon={ShieldOff} label="Pay for Counter-Intel ($2,000)" busy={busyKey === 'ci'} onClick={() => act('ci', { type: 'pay_informant' })} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="panel p-4">
            <h3 className="font-serif text-lg mb-3 flex items-center gap-2"><Users size={18} /> Network ({activeMembers.length} active)</h3>
            <div className="flex flex-col gap-2">
              {activeMembers.map((m) => (
                <div key={m.id} className="border border-charcoal-700 rounded px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-beige-100 font-mono">{m.codename}</span>{' '}
                      <span className="text-[10px] uppercase tracking-wider text-beige-400">{ROLE_LABEL[m.role]}</span>{' '}
                      <span className="text-[10px] text-beige-500">@ {locationName(m.baseLocationId)}</span>
                    </div>
                    <span className={`chip ${m.paranoia >= 50 ? 'text-muted-red' : 'text-beige-400'}`}>paranoia {Math.round(m.paranoia)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <select
                      className="field px-1.5 py-1 text-[11px]"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) act(`meet_${m.id}`, { type: 'change_meeting', memberId: m.id, newLocationId: e.target.value })
                      }}
                    >
                      <option value="">Move to…</option>
                      {view.locations.filter((l) => l.id !== m.baseLocationId).map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                    <ActionButton icon={PhoneOff} label="Drop Phone" busy={busyKey === `drop_${m.id}`} onClick={() => act(`drop_${m.id}`, { type: 'drop_phone', memberId: m.id })} />
                    <ActionButton icon={Trash2} label="Bribe Witness" busy={busyKey === `bribe_${m.id}`} onClick={() => act(`bribe_${m.id}`, { type: 'bribe_witness', memberId: m.id })} />
                  </div>
                </div>
              ))}
            </div>

            {arrestedMembers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-charcoal-700">
                <p className="section-label mb-2">Arrested — Replace to Refill the Crew</p>
                <div className="flex flex-col gap-1.5">
                  {arrestedMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-beige-400 font-mono">{m.codename} ({ROLE_LABEL[m.role]})</span>
                      <ActionButton icon={UserPlus} label="Replace ($4,000)" busy={busyKey === `replace_${m.id}`} onClick={() => act(`replace_${m.id}`, { type: 'replace_member', arrestedMemberId: m.id })} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="panel p-4">
            <h3 className="font-serif text-lg mb-3 flex items-center gap-2"><Building2 size={18} /> Locations</h3>
            <div className="flex flex-col gap-2">
              {activeLocations.map((l) => (
                <div key={l.id} className="border border-charcoal-700 rounded px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-beige-100">{l.name}</span>{' '}
                      <span className="text-[10px] uppercase tracking-wider text-beige-400">{l.district} &middot; {l.type.replace('_', ' ')}</span>
                    </div>
                    <span className={`chip ${l.localHeat >= 50 ? 'text-muted-red' : 'text-beige-400'}`}>heat {Math.round(l.localHeat)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {l.type === 'stash_house' && (
                      <ActionButton icon={Eye} label="Move Stash Here / From" busy={busyKey === `move_${l.id}`} onClick={() => setMoveFrom(l.id)} />
                    )}
                    {l.type === 'corner' && (
                      <ActionButton icon={UserPlus} label="Recruit Dealer ($1,500)" busy={busyKey === `recruit_${l.id}`} onClick={() => act(`recruit_${l.id}`, { type: 'recruit_dealer', locationId: l.id })} />
                    )}
                    <ActionButton icon={Trash2} label="Destroy Evidence ($3,000)" busy={busyKey === `destroy_${l.id}`} onClick={() => act(`destroy_${l.id}`, { type: 'destroy_evidence', locationId: l.id })} />
                  </div>
                </div>
              ))}
            </div>

            {inactiveLocations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-charcoal-700">
                <p className="section-label mb-2">Unused Ground</p>
                <div className="flex flex-col gap-1.5">
                  {inactiveLocations.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-xs">
                      <span className="text-beige-400">{l.name} &middot; {l.district}</span>
                      <ActionButton icon={TrendingUp} label="Expand Here ($2,500)" busy={busyKey === `expand_${l.id}`} onClick={() => act(`expand_${l.id}`, { type: 'expand_territory', locationId: l.id })} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {moveFrom && (
            <div className="panel p-4">
              <p className="section-label mb-2">Move stash from {locationName(moveFrom)} to…</p>
              <div className="flex gap-2">
                <select className="field px-2 py-1.5 text-xs flex-1" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
                  <option value="">Select destination…</option>
                  {view.locations.filter((l) => l.id !== moveFrom).map((l) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.district})</option>
                  ))}
                </select>
                <button
                  disabled={!moveTo}
                  onClick={async () => {
                    await act('move_stash', { type: 'move_stash', fromLocationId: moveFrom, toLocationId: moveTo })
                    setMoveFrom('')
                    setMoveTo('')
                  }}
                  className="btn-primary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  Confirm Move
                </button>
                <button onClick={() => { setMoveFrom(''); setMoveTo('') }} className="btn-ghost px-2 py-1.5 text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="panel p-4">
            <h3 className="section-label mb-2 flex items-center gap-1"><UserMinus size={12} /> Lookout Reports</h3>
            {view.lookoutReports.length === 0 && <p className="text-xs text-beige-400 italic">Nothing to report. So far.</p>}
            <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto">
              {view.lookoutReports.slice().reverse().map((r) => (
                <div key={r.id} className={`text-[11px] border-l-2 pl-2 ${r.severity === 'high' ? 'border-muted-red' : r.severity === 'medium' ? 'border-beige-300' : 'border-charcoal-600'}`}>
                  <span className="text-beige-500 font-mono">h{r.atHour.toFixed(1)}</span>{' '}
                  <span className="text-beige-300">{r.text}</span>
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
}: {
  icon: typeof Eye
  label: string
  onClick: () => void
  busy: boolean
}) {
  return (
    <button disabled={busy} onClick={onClick} className="btn-secondary px-2.5 py-1.5 text-[11px] disabled:opacity-40">
      <Icon size={12} /> {label}
    </button>
  )
}
