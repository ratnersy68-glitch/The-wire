import { Shield, Users, Wifi, WifiOff } from 'lucide-react'
import type { MatchView } from '../../shared/mpTypes'

export function MatchHeader({ view, roomCode }: { view: MatchView; roomCode: string | null }) {
  const pct = Math.min(100, (view.gameHour / view.deadlineHours) * 100)
  const hoursLeft = Math.max(0, view.deadlineHours - view.gameHour)
  return (
    <div className="panel px-4 py-3 mb-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-beige-200 font-serif text-lg">
        {view.role === 'police' ? <Shield size={18} /> : <Users size={18} />}
        {view.role === 'police' ? 'Police Detective' : 'Organization Leader'}
      </div>
      <div className="flex-1 min-w-[160px]">
        <div className="flex justify-between text-[10px] font-mono text-beige-400 mb-1">
          <span>Investigation Clock</span>
          <span>{hoursLeft.toFixed(1)}h remaining</span>
        </div>
        <div className="h-1.5 bg-charcoal-800 rounded overflow-hidden">
          <div className="h-full bg-beige-300 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="chip text-beige-400">Room {roomCode}</span>
      <span className={`chip flex items-center gap-1 ${view.opponentConnected ? 'text-termGreen-500' : 'text-muted-red'}`}>
        {view.opponentConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
        Opponent {view.opponentConnected ? 'connected' : 'disconnected'}
      </span>
    </div>
  )
}
