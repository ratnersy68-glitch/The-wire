export function MiniBar({
  label,
  value,
  invert,
}: {
  label: string
  value: number
  /** When true, high values read as bad (e.g. Fatigue) and tint the bar red past 70. */
  invert?: boolean
}) {
  const warn = invert ? value >= 70 : value < 30
  return (
    <div className="flex flex-col gap-0.5 min-w-[72px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] uppercase tracking-wider text-beige-400 font-mono">{label}</span>
        <span className={`text-[10px] font-mono ${warn ? 'text-muted-red' : 'text-beige-300'}`}>{value}%</span>
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
