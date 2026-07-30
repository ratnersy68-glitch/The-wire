import { useState } from 'react'
import { useGame } from '../game/GameContext'
import { Radio, Pin } from 'lucide-react'
import { shortName } from '../utils/suspectHelpers'

export function WiretapTerminalPage() {
  const { state, dispatch } = useGame()
  const [selectedCallId, setSelectedCallId] = useState<string | null>(state.calls[0]?.id ?? null)
  const selectedCall = state.calls.find((c) => c.id === selectedCallId)

  if (!state.wiretapActive) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center mt-16">
        <Radio size={40} className="mx-auto mb-4 text-beige-400" />
        <h2 className="font-serif text-2xl mb-2">No Active Wiretap</h2>
        <p className="text-sm text-beige-400 mb-4">
          A wiretap requires a court-approved warrant, which in turn requires solid, corroborated evidence.
          Build your case and request one from the Warrant Request screen.
        </p>
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'warrant_request' })}
          className="px-4 py-2 border border-termGreen-500 text-termGreen-400 rounded font-mono text-sm hover:bg-termGreen-600/10"
        >
          Go to Warrant Request
        </button>
      </div>
    )
  }

  const suspectName = (id: string) => {
    const s = state.suspects.find((s) => s.id === id)
    return s ? shortName(s) : 'Unknown'
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h2 className="font-serif text-2xl mb-1 flex items-center gap-2"><Radio size={22} className="text-termGreen-500" /> Wiretap Terminal</h2>
      <p className="text-sm text-beige-400 mb-4">Nobody says what they mean. Read between the lines — and watch for phrases that keep repeating.</p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-charcoal-600 bg-navy-900 rounded p-2 max-h-[500px] overflow-y-auto">
          {state.calls.length === 0 && <p className="text-xs text-beige-400 p-2 italic">No calls intercepted yet. Check back after ending the day.</p>}
          {state.calls.slice().reverse().map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCallId(c.id)}
              className={`w-full text-left p-2 rounded mb-1 border text-xs ${
                selectedCallId === c.id ? 'border-termGreen-500 bg-termGreen-600/10' : 'border-transparent hover:bg-charcoal-700'
              }`}
            >
              <div className="flex justify-between text-beige-300">
                <span>Day {c.day} &middot; {c.timestamp}</span>
                {!c.heard && <span className="text-termGreen-400">NEW</span>}
              </div>
              <div className="text-beige-400">
                {c.participantIds.map(suspectName).join(' & ')}
              </div>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 border border-charcoal-600 bg-navy-950 rounded p-4 font-mono text-sm scanlines relative">
          {selectedCall ? (
            <>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-termGreen-500 terminal-glow">INTERCEPT — DAY {selectedCall.day}, {selectedCall.timestamp}</p>
                  <p className="text-beige-400 text-xs">Participants: {selectedCall.participantIds.map(suspectName).join(', ')}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  selectedCall.significance === 'high' ? 'border-muted-red text-muted-red' :
                  selectedCall.significance === 'medium' ? 'border-beige-300 text-beige-300' : 'border-charcoal-600 text-beige-400'
                }`}>
                  {selectedCall.significance} significance
                </span>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {selectedCall.lines.map((line, i) => (
                  <div key={i}>
                    <span className="text-termGreen-500">{suspectName(line.speakerId)}:</span>{' '}
                    <span className="text-beige-200">{renderLineWithCodeTerms(line.text, state.codeTerms)}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-beige-400 mb-3 italic">Analyst summary: {selectedCall.summary}</div>

              <div className="flex gap-2">
                {!selectedCall.heard && (
                  <button
                    onClick={() => dispatch({ type: 'REVIEW_CALL', callId: selectedCall.id })}
                    className="px-3 py-1.5 border border-termGreen-500 text-termGreen-400 rounded text-xs hover:bg-termGreen-600/10"
                  >
                    Mark Reviewed
                  </button>
                )}
                {!selectedCall.addedToBoard && (
                  <button
                    onClick={() => dispatch({ type: 'MARK_CALL_BOARD', callId: selectedCall.id })}
                    className="flex items-center gap-1 px-3 py-1.5 border border-charcoal-600 rounded text-xs hover:bg-charcoal-700"
                  >
                    <Pin size={12} /> File to Case Board
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-beige-400 italic">Select an intercept from the list.</p>
          )}
        </div>
      </div>

      <div className="mt-4 border border-charcoal-600 bg-navy-900 rounded p-3">
        <p className="text-xs font-mono text-beige-400 mb-2">Decoded Terms</p>
        <div className="flex flex-wrap gap-2">
          {state.codeTerms.filter((t) => t.discovered).map((t) => (
            <span key={t.term} className="text-xs px-2 py-1 rounded border border-termGreen-600/50 bg-termGreen-600/10 text-termGreen-400">
              "{t.term}" = {t.meaning}
            </span>
          ))}
          {state.codeTerms.filter((t) => t.discovered).length === 0 && (
            <span className="text-xs text-beige-400 italic">Nothing decoded yet. Review more calls to spot patterns.</span>
          )}
        </div>
      </div>
    </div>
  )
}

function renderLineWithCodeTerms(text: string, codeTerms: { term: string; discovered: boolean }[]) {
  let result: (string)[] = [text]
  for (const t of codeTerms) {
    if (!t.discovered) continue
    result = result.flatMap((chunk) => {
      if (typeof chunk !== 'string') return [chunk]
      return chunk.split(new RegExp(`(${escapeRegExp(t.term)})`, 'i'))
    })
  }
  return result.map((chunk, i) =>
    codeTerms.some((t) => t.discovered && t.term.toLowerCase() === chunk.toLowerCase()) ? (
      <span key={i} className="text-muted-red underline decoration-dotted">{chunk}</span>
    ) : (
      <span key={i}>{chunk}</span>
    ),
  )
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
