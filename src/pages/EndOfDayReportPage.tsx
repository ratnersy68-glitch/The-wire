import { useGame } from '../game/GameContext'
import { ArrowRight } from 'lucide-react'

export function EndOfDayReportPage() {
  const { state, dispatch } = useGame()
  const lastDay = state.day - 1
  const todaysReports = state.reports.filter((r) => r.day === lastDay)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h2 className="font-serif text-2xl mb-1">End of Day — Day {lastDay}</h2>
      <p className="text-sm text-beige-400 mb-6">Here's everything that came back from today's assignments.</p>

      <div className="flex flex-col gap-2 mb-6">
        {todaysReports.length === 0 && (
          <p className="text-sm text-beige-400 italic">No new reports today. Consider giving detectives an assignment tomorrow.</p>
        )}
        {todaysReports.map((r) => (
          <div key={r.id} className="panel p-3">
            <h4 className="text-sm text-beige-200 mb-1">{r.title}</h4>
            <p className="text-sm text-beige-300">{r.body}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => dispatch({ type: 'NAVIGATE', screen: 'morning_briefing' })}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 btn-primary font-mono text-sm"
      >
        Continue to Tomorrow <ArrowRight size={16} />
      </button>
    </div>
  )
}
