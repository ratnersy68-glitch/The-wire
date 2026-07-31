import { useState } from 'react'
import { ArrowLeft, Copy, Radio, Shield, Users } from 'lucide-react'
import type { Role } from '../../shared/mpTypes'
import { useMultiplayer } from './MultiplayerContext'
import { useAppMode } from '../appMode/AppModeContext'

export function MultiplayerLobby() {
  const { state, setServerUrl, connect, createRoom, joinRoom, quickPlay, cancelQuickPlay } = useMultiplayer()
  const { setMode } = useAppMode()
  const [urlDraft, setUrlDraft] = useState(state.serverUrl)
  const [role, setRole] = useState<Role>('police')
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)

  const connected = state.phase !== 'disconnected' && state.phase !== 'connecting'

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden film-grain vignette flex items-center justify-center p-4">
      <div className="relative z-10 max-w-lg w-full">
        <button
          onClick={() => setMode('single')}
          className="btn-ghost px-3 py-1.5 text-xs mb-3"
        >
          <ArrowLeft size={14} /> Back to Main Menu
        </button>

        <div className="panel p-6">
          <h1 className="font-serif text-3xl text-beige-200 mb-1 flex items-center gap-2">
            <Radio size={24} /> Two-Player Investigation
          </h1>
          <p className="text-sm text-beige-400 mb-5">
            One detective. One organization. Neither of you sees the other's screen.
          </p>

          {state.error && (
            <div className="mb-4 px-3 py-2 border border-muted-red rounded text-xs text-muted-red font-mono">{state.error}</div>
          )}

          {!connected && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="section-label block mb-1">Server Address</label>
                <input
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://your-server.onrender.com"
                  className="field px-3 py-2 text-sm"
                />
                <p className="text-[10px] text-beige-400/70 mt-1 font-mono">
                  The multiplayer server runs separately from this site. Paste its address here once it's deployed.
                </p>
              </div>
              <button
                disabled={state.phase === 'connecting' || !urlDraft}
                onClick={() => {
                  setServerUrl(urlDraft)
                  connect(urlDraft)
                }}
                className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40"
              >
                {state.phase === 'connecting' ? 'Connecting…' : 'Connect'}
              </button>
            </div>
          )}

          {state.phase === 'lobby' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="section-label block mb-2">Play As</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRole('police')}
                    className={role === 'police' ? 'flex-1 btn-primary px-3 py-2 text-xs' : 'flex-1 btn-secondary px-3 py-2 text-xs'}
                  >
                    <Shield size={14} /> Police Detective
                  </button>
                  <button
                    onClick={() => setRole('org')}
                    className={role === 'org' ? 'flex-1 btn-primary px-3 py-2 text-xs' : 'flex-1 btn-secondary px-3 py-2 text-xs'}
                  >
                    <Users size={14} /> Organization Leader
                  </button>
                </div>
              </div>

              <button
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  await createRoom(role)
                  setBusy(false)
                }}
                className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40"
              >
                Create Private Lobby
              </button>

              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  maxLength={6}
                  className="field px-3 py-2 text-sm font-mono tracking-widest uppercase flex-1"
                />
                <button
                  disabled={busy || joinCode.length < 4}
                  onClick={async () => {
                    setBusy(true)
                    await joinRoom(joinCode, role)
                    setBusy(false)
                  }}
                  className="btn-secondary px-4 py-2 text-xs disabled:opacity-40"
                >
                  Join
                </button>
              </div>

              <div className="w-full h-px bg-charcoal-600" />

              <button onClick={quickPlay} className="btn-secondary px-4 py-2.5 text-sm">
                Quick Play (random opponent, random role)
              </button>
            </div>
          )}

          {state.phase === 'room_waiting' && state.roomCode && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-xs text-beige-400 uppercase tracking-wider">Share this code with your opponent</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-4xl tracking-[0.3em] text-beige-100">{state.roomCode}</span>
                <button
                  onClick={() => navigator.clipboard?.writeText(state.roomCode ?? '')}
                  className="btn-ghost p-2"
                  title="Copy code"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-xs text-beige-400 animate-flicker">Waiting for the other player to join…</p>
              <button onClick={() => cancelQuickPlay()} className="btn-ghost px-3 py-1.5 text-xs mt-2">
                Cancel
              </button>
            </div>
          )}

          {state.phase === 'quickplay_waiting' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <p className="text-sm text-beige-300 animate-flicker">Searching for an opponent…</p>
              <button onClick={cancelQuickPlay} className="btn-ghost px-3 py-1.5 text-xs">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
