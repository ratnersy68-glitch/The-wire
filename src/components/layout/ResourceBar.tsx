import type { ElementType } from 'react'
import { DollarSign, Clock, Users, Landmark, Scale, HeartHandshake, EyeOff, FileSearch, Gauge } from 'lucide-react'
import { useGame } from '../../game/GameContext'

function Stat({
  icon: Icon,
  label,
  value,
  suffix,
  warn,
}: {
  icon: ElementType
  label: string
  value: number
  suffix?: string
  warn?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-charcoal-600/60 bg-navy-900/60" title={label}>
      <Icon size={14} className={warn ? 'text-muted-red' : 'text-beige-300'} />
      <span className={`text-xs font-mono ${warn ? 'text-muted-red' : 'text-beige-200'}`}>
        {value}
        {suffix ?? ''}
      </span>
    </div>
  )
}

export function ResourceBar() {
  const { state } = useGame()
  const r = state.resources

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <Stat icon={DollarSign} label="Department Budget" value={r.budget} />
      <Stat icon={Clock} label="Overtime Hours" value={r.overtimeHours} suffix="h" />
      <Stat icon={Users} label="Informant Funds" value={r.informantFunds} />
      <Stat icon={Landmark} label="Political Support" value={r.politicalSupport} suffix="%" warn={r.politicalSupport < 25} />
      <Stat icon={Scale} label="Prosecutor Confidence" value={r.prosecutorConfidence} suffix="%" warn={r.prosecutorConfidence < 25} />
      <Stat icon={HeartHandshake} label="Community Trust" value={r.communityTrust} suffix="%" warn={r.communityTrust < 25} />
      <Stat icon={EyeOff} label="Secrecy" value={r.secrecy} suffix="%" warn={r.secrecy < 25} />
      <Stat icon={FileSearch} label="Evidence Strength" value={r.evidenceStrength} suffix="%" />
      <Stat icon={Gauge} label="Organization Alert" value={r.alertLevel} suffix="%" warn={r.alertLevel > 60} />
    </div>
  )
}
