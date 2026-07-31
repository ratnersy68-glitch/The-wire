import { useMemo, useState } from 'react'
import { useGame } from '../game/GameContext'
import {
  EvidenceBoardCanvas,
  evidenceNode,
  locationNode,
  suspectNode,
  type BoardNodeView,
} from '../components/board/EvidenceBoardCanvas'
import { CONNECTION_LABELS } from '../systems/evidenceSystem'
import type { ConnectionStatus, EvidenceConnectionKind } from '../types'
import { shortName } from '../utils/suspectHelpers'
import { X } from 'lucide-react'
import { useSound } from '../hooks/useSound'

const KIND_OPTIONS: EvidenceConnectionKind[] = [
  'called', 'met_with', 'works_for', 'supplies', 'lives_at', 'owns', 'paid', 'threatened', 'related_to',
]
const STATUS_OPTIONS: ConnectionStatus[] = ['suspected', 'confirmed', 'disproved']

export function EvidenceBoardPage() {
  const { state, dispatch } = useGame()
  const play = useSound()
  const [selection, setSelection] = useState<string | null>(null)
  const [pendingFrom, setPendingFrom] = useState<string | null>(null)
  const [kind, setKind] = useState<EvidenceConnectionKind>('met_with')
  const [status, setStatus] = useState<ConnectionStatus>('suspected')

  const nodes: BoardNodeView[] = useMemo(() => {
    const suspects = state.suspects.filter((s) => s.knownAlias).map(suspectNode)
    const locations = state.locations.filter((l) => l.discovered).map(locationNode)
    const evidence = state.evidence.map(evidenceNode)
    return [...suspects, ...locations, ...evidence]
  }, [state.suspects, state.locations, state.evidence])

  const selectedNode = nodes.find((n) => n.id === selection)

  function handleSelect(id: string) {
    if (pendingFrom && pendingFrom !== id) {
      // waiting on connect confirm — do nothing, handled by overlay
      return
    }
    play('click')
    setSelection(id)
  }

  function startConnect() {
    if (selection) setPendingFrom(selection)
  }

  function confirmConnect(toId: string) {
    if (!pendingFrom) return
    play('pin')
    dispatch({ type: 'ADD_CONNECTION', fromId: pendingFrom, toId, kind, status })
    setPendingFrom(null)
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">Evidence Board</h2>
      <p className="text-sm text-beige-400 mb-4">
        Drag pins to rearrange the board. Select a pin, click "Connect," then click a second pin to link them.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <EvidenceBoardCanvas
            nodes={nodes}
            connections={state.connections}
            selectedId={pendingFrom ?? selection}
            onSelectNode={pendingFrom ? confirmConnect : handleSelect}
          />
          {pendingFrom && (
            <div className="absolute top-2 left-2 right-2 bg-navy-950/95 border border-beige-300 rounded-md p-2 flex flex-wrap items-center gap-2 text-xs shadow-xl">
              <span className="text-beige-200 font-mono">Connecting from selected pin — click target pin</span>
              <select value={kind} onChange={(e) => setKind(e.target.value as EvidenceConnectionKind)} className="field px-1.5 py-1 text-xs">
                {KIND_OPTIONS.map((k) => <option key={k} value={k}>{CONNECTION_LABELS[k]}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value as ConnectionStatus)} className="field px-1.5 py-1 text-xs">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => setPendingFrom(null)} className="btn-ghost ml-auto p-1"><X size={14} /></button>
            </div>
          )}
        </div>

        <div className="panel p-4 max-h-[560px] overflow-y-auto">
          {selectedNode ? (
            <NodeDetail node={selectedNode} onConnect={startConnect} onOpenProfile={() => {
              if (selectedNode.kind === 'suspect') {
                dispatch({ type: 'SELECT_SUSPECT', id: selectedNode.id })
                dispatch({ type: 'NAVIGATE', screen: 'suspect_profile' })
              }
            }} />
          ) : (
            <p className="text-sm text-beige-400 italic">Select a pin to see details.</p>
          )}

          <div className="mt-4 pt-3 border-t border-charcoal-700">
            <p className="section-label mb-2">Connection Key</p>
            <div className="text-[11px] flex flex-col gap-1">
              <div><span className="text-beige-100">&mdash;</span> Confirmed connection</div>
              <div><span className="text-beige-300">- - -</span> Suspected connection</div>
              <div><span className="text-muted-red">····</span> Disproved connection</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NodeDetail({ node, onConnect, onOpenProfile }: { node: BoardNodeView; onConnect: () => void; onOpenProfile: () => void }) {
  if (node.kind === 'suspect') {
    const s = node.ref as import('../types').Suspect
    return (
      <div>
        <h3 className="font-serif text-lg">{shortName(s)}</h3>
        <p className="text-xs text-beige-400 mb-2">{s.knownRole ? s.roleLabel : 'Role unknown'}</p>
        {s.knownVehicle && s.vehicle && <p className="text-xs text-beige-300 mb-1">Vehicle: {s.vehicle}</p>}
        {s.knownPhone && <p className="text-xs text-beige-300 mb-1">Phone: {s.phoneNumber}</p>}
        <div className="flex gap-2 mt-3">
          <button onClick={onConnect} className="btn-secondary px-3 py-1.5 text-xs">Connect</button>
          <button onClick={onOpenProfile} className="btn-primary px-3 py-1.5 text-xs">Full Profile</button>
        </div>
      </div>
    )
  }
  if (node.kind === 'location') {
    const l = node.ref as import('../types').Location
    return (
      <div>
        <h3 className="font-serif text-lg">{l.name}</h3>
        <p className="text-xs text-beige-400 mb-2">{l.district}</p>
        <p className="text-sm text-beige-300 mb-3">{l.description}</p>
        <button onClick={onConnect} className="px-3 py-1.5 border border-charcoal-600 rounded text-xs hover:bg-charcoal-700">Connect</button>
      </div>
    )
  }
  const e = node.ref as import('../types').EvidenceItem
  return (
    <div>
      <h3 className="font-serif text-lg">{e.title}</h3>
      <p className="text-xs text-beige-400 mb-2 capitalize">{e.type.replace('_', ' ')} &middot; via {e.source.replace('_', ' ')}</p>
      <p className="text-sm text-beige-300 mb-3">{e.description}</p>
      <div className="text-[11px] font-mono text-beige-400 flex flex-col gap-0.5 mb-3">
        <span>Reliability: {e.reliability}%</span>
        <span>Legality: {e.legality}%</span>
        <span>Corroborated: {e.corroborated ? 'Yes' : 'No'}</span>
        <span className={e.admissible ? 'text-termGreen-500' : 'text-muted-red'}>
          {e.admissible ? 'Admissible in court' : 'Not currently admissible'}
        </span>
      </div>
      <button onClick={onConnect} className="px-3 py-1.5 border border-charcoal-600 rounded text-xs hover:bg-charcoal-700">Connect</button>
    </div>
  )
}
