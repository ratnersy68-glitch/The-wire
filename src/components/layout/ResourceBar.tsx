import type { ElementType } from 'react'
import { DollarSign, Clock, Users, Landmark, Scale, HeartHandshake, EyeOff, FileSearch, Gauge } from 'lucide-react'
import { useGame } from '../../game/GameContext'

function ValueChip({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-charcoal-600/60 bg-navy-900/60 min-w-[104px]">
      <Icon size={14} className="text-beige-400 shrink-0" />
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] uppercase tracking-wider text-beige-400 font-mono">{label}</span>
        <span className="text-sm font-mono text-beige-200">{value}</span>
      </div>
    </div>
  )
}

function MeterChip({
  icon: Icon,
  label,
  value,
  warn,
}: {
  icon: ElementType
  label: string
  value: number
  warn?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 px-2.5 py-1.5 rounded border border-charcoal-600/60 bg-navy-900/60 min-w-[104px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon size={12} className={`shrink-0 ${warn ? 'text-muted-red' : 'text-beige-400'}`} />
          <span className={`text-[9px] uppercase tracking-wider font-mono truncate ${warn ? 'text-muted-red' : 'text-beige-400'}`}>
            {label}
          </span>
        </div>
        <span className={`text-xs font-mono shrink-0 ${warn ? 'text-muted-red' : 'text-beige-200'}`}>{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-charcoal-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${warn ? 'bg-muted-red' : 'bg-termGreen-500'}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

export function ResourceBar() {
  const { state } = useGame()
  const r = state.resources

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] uppercase tracking-widest text-beige-400/70 font-mono mr-0.5 hidden sm:inline">
          Resources
        </span>
        <ValueChip icon={DollarSign} label="Budget" value={`$${r.budget.toLocaleString()}`} />
        <ValueChip icon={Clock} label="Overtime" value={`${r.overtimeHours}h`} />
        <ValueChip icon={Users} label="Informants" value={`$${r.informantFunds.toLocaleString()}`} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] uppercase tracking-widest text-beige-400/70 font-mono mr-0.5 hidden sm:inline">
          Case Standing
        </span>
        <MeterChip icon={Landmark} label="Political" value={r.politicalSupport} warn={r.politicalSupport < 25} />
        <MeterChip icon={Scale} label="Prosecutor" value={r.prosecutorConfidence} warn={r.prosecutorConfidence < 25} />
        <MeterChip icon={HeartHandshake} label="Community" value={r.communityTrust} warn={r.communityTrust < 25} />
        <MeterChip icon={EyeOff} label="Secrecy" value={r.secrecy} warn={r.secrecy < 25} />
        <MeterChip icon={FileSearch} label="Evidence" value={r.evidenceStrength} />
        <MeterChip icon={Gauge} label="Org. Alert" value={r.alertLevel} warn={r.alertLevel > 60} />
      </div>
    </div>
  )
}
