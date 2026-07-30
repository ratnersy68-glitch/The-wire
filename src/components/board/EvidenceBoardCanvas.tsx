import { useRef, useState } from 'react'
import { Camera, FileText, MapPin, User, DollarSign, Gavel } from 'lucide-react'
import type { BoardConnection, ConnectionStatus, EvidenceItem, Location, Suspect } from '../../types'
import { hashPosition } from '../../utils/boardLayout'
import { shortName } from '../../utils/suspectHelpers'

export interface BoardNodeView {
  id: string
  kind: 'suspect' | 'location' | 'evidence'
  label: string
  sublabel: string
  ref: Suspect | Location | EvidenceItem
}

const CONNECTION_STYLE: Record<ConnectionStatus, { stroke: string; dash?: string }> = {
  confirmed: { stroke: '#f0f0ec' },
  suspected: { stroke: '#9a9a94', dash: '4 3' },
  disproved: { stroke: '#a13d3d', dash: '1 3' },
}

const EVIDENCE_ICON: Record<EvidenceItem['type'], typeof Camera> = {
  photograph: Camera,
  call_transcript: FileText,
  financial_record: DollarSign,
  witness_statement: FileText,
  physical: FileText,
  surveillance_note: FileText,
  arrest_record: Gavel,
}

export function EvidenceBoardCanvas({
  nodes,
  connections,
  selectedId,
  onSelectNode,
}: {
  nodes: BoardNodeView[]
  connections: BoardConnection[]
  selectedId: string | null
  onSelectNode: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const dragRef = useRef<{ id: string; pointerId: number } | null>(null)

  function getPos(id: string, salt: number) {
    return positions[id] ?? hashPosition(id, salt)
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    dragRef.current = { id, pointerId: e.pointerId }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.min(96, Math.max(2, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(94, Math.max(4, ((e.clientY - rect.top) / rect.height) * 100))
    setPositions((p) => ({ ...p, [dragRef.current!.id]: { x, y } }))
  }

  function onPointerUp() {
    dragRef.current = null
  }

  const nodePos = new Map(nodes.map((n, i) => [n.id, getPos(n.id, i)]))

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[560px] cork-texture rounded border-4 border-cork-800 overflow-hidden select-none"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map((c) => {
          const from = nodePos.get(c.fromId)
          const to = nodePos.get(c.toId)
          if (!from || !to) return null
          const style = CONNECTION_STYLE[c.status]
          return (
            <line
              key={c.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={style.stroke}
              strokeWidth={0.4}
              strokeDasharray={style.dash}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>

      {nodes.map((n) => {
        const pos = nodePos.get(n.id)!
        const isSelected = selectedId === n.id
        return (
          <button
            key={n.id}
            onPointerDown={(e) => onPointerDown(e, n.id)}
            onClick={() => onSelectNode(n.id)}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group animate-pin-drop touch-none`}
          >
            <div
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center bg-beige-200 shadow-lg ${
                isSelected ? 'border-termGreen-500 ring-2 ring-termGreen-500/50' : 'border-charcoal-900'
              }`}
            >
              {n.kind === 'suspect' && <User size={18} className="text-charcoal-900" />}
              {n.kind === 'location' && <MapPin size={18} className="text-charcoal-900" />}
              {n.kind === 'evidence' && (() => {
                const Icon = EVIDENCE_ICON[(n.ref as EvidenceItem).type]
                return <Icon size={18} className="text-charcoal-900" />
              })()}
            </div>
            <div className="px-1.5 py-0.5 bg-navy-950/90 rounded text-[10px] font-mono text-beige-200 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis">
              {n.label}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function suspectNode(s: Suspect): BoardNodeView {
  return { id: s.id, kind: 'suspect', label: shortName(s), sublabel: s.knownRole ? s.roleLabel : 'Role unknown', ref: s }
}
export function locationNode(l: Location): BoardNodeView {
  return { id: l.id, kind: 'location', label: l.name, sublabel: l.district, ref: l }
}
export function evidenceNode(e: EvidenceItem): BoardNodeView {
  return { id: e.id, kind: 'evidence', label: e.title, sublabel: e.type, ref: e }
}
