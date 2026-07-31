import { useState } from 'react'
import { useGame } from '../game/GameContext'
import type { DailyReport } from '../types'

const KIND_LABELS: Record<DailyReport['kind'], string> = {
  surveillance: 'Surveillance',
  wiretap: 'Wiretap',
  financial: 'Financial',
  interview: 'Interview',
  buy: 'Controlled Buy',
  raid: 'Raid',
  event: 'Event',
}

export function SurveillanceReportPage() {
  const { state } = useGame()
  const [filter, setFilter] = useState<DailyReport['kind'] | 'all'>('all')

  const reports = state.reports.filter((r) => filter === 'all' || r.kind === filter)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">Case Reports</h2>
      <p className="text-sm text-beige-400 mb-4">Every report your detail has filed, most recent first.</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(['all', 'surveillance', 'wiretap', 'financial', 'interview', 'buy', 'raid', 'event'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={filter === k ? 'btn-primary px-2.5 py-1 text-xs' : 'btn-secondary px-2.5 py-1 text-xs'}
          >
            {k === 'all' ? 'All' : KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {reports.length === 0 && <p className="text-sm text-beige-400 italic">No reports of this type yet.</p>}
        {reports.map((r) => (
          <div key={r.id} className="panel p-3">
            <div className="flex justify-between text-xs font-mono text-beige-400 mb-1">
              <span>{KIND_LABELS[r.kind]}</span>
              <span>Day {r.day}</span>
            </div>
            <h4 className="text-sm text-beige-200 mb-1">{r.title}</h4>
            <p className="text-sm text-beige-300">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
