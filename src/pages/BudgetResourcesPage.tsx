import { useGame } from '../game/GameContext'

function Bar({ label, value, max = 100, description }: { label: string; value: number; max?: number; description: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-beige-200">{label}</span>
        <span className="text-beige-400">{value}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="h-2 rounded bg-charcoal-800 overflow-hidden">
        <div className="h-full bg-termGreen-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-beige-400 mt-1">{description}</p>
    </div>
  )
}

export function BudgetResourcesPage() {
  const { state } = useGame()
  const r = state.resources

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">Budget &amp; Resources</h2>
      <p className="text-sm text-beige-400 mb-6">Everything the unit spends comes out of a finite pool. Spend carefully.</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="panel p-4">
          <p className="section-label mb-1">Department Budget</p>
          <p className="text-2xl font-mono text-beige-200 mb-1 tabular-nums">${r.budget.toLocaleString()}</p>
          <p className="text-[11px] text-beige-400">Covers warrants, raids, equipment, and daily upkeep.</p>
        </div>

        <div className="panel p-4">
          <p className="section-label mb-1">Informant Funds</p>
          <p className="text-2xl font-mono text-beige-200 mb-1 tabular-nums">${r.informantFunds.toLocaleString()}</p>
          <p className="text-[11px] text-beige-400">Pays for controlled buys and informant demands.</p>
        </div>

        <div className="panel p-4">
          <p className="section-label mb-1">Overtime Hours</p>
          <p className="text-2xl font-mono text-beige-200 mb-1 tabular-nums">{r.overtimeHours}h / {r.maxOvertimeHours}h</p>
          <p className="text-[11px] text-beige-400">Consumed by warrants and raids. Regenerates gradually.</p>
        </div>
      </div>

      <div className="panel p-4">
        <Bar label="Political Support" value={r.politicalSupport} description="Falls if the case drags on with no results, or if there's a scandal." />
        <Bar label="Prosecutor Confidence" value={r.prosecutorConfidence} description="Determines whether warrants get approved." />
        <Bar label="Community Trust" value={r.communityTrust} description="Damaged by bad raids and informant losses; helped by visible results." />
        <Bar label="Investigation Secrecy" value={r.secrecy} description="Falls when officers are spotted or the case leaks." />
        <Bar label="Evidence Strength" value={r.evidenceStrength} description="The overall strength of the case so far." />
        <Bar label="Organization Alert Level" value={r.alertLevel} description="How aware the Harbor Street Crew is that they're being watched." />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="panel p-3">
          <p className="text-2xl font-mono text-beige-200 tabular-nums">{state.raidsCompleted}</p>
          <p className="section-label mt-0.5">Raids Completed</p>
        </div>
        <div className="panel p-3">
          <p className="text-2xl font-mono text-beige-200 tabular-nums">${state.assetsSeized.toLocaleString()}</p>
          <p className="section-label mt-0.5">Assets Seized</p>
        </div>
        <div className="panel p-3">
          <p className="text-2xl font-mono text-beige-200 tabular-nums">{state.suspects.filter((s) => s.arrested).length}</p>
          <p className="section-label mt-0.5">Total Arrests</p>
        </div>
      </div>
    </div>
  )
}
