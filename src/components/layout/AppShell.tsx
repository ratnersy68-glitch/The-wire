import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Map,
  Pin,
  Radio,
  Users,
  User,
  UserCog,
  Landmark,
  Gavel,
  ShieldAlert,
  FileText,
  NotebookPen,
  DoorOpen,
  Volume2,
  VolumeX,
  Save,
} from 'lucide-react'
import { useGame } from '../../game/GameContext'
import { ResourceBar } from './ResourceBar'
import type { ScreenId } from '../../types'
import { CHAPTER_TITLES } from '../../data/objectives'
import { saveGame, saveMuted } from '../../systems/saveSystem'

const NAV_ITEMS: { screen: ScreenId; label: string; icon: typeof Map }[] = [
  { screen: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { screen: 'city_map', label: 'City Map', icon: Map },
  { screen: 'evidence_board', label: 'Evidence Board', icon: Pin },
  { screen: 'wiretap_terminal', label: 'Wiretap', icon: Radio },
  { screen: 'suspect_profile', label: 'Suspects', icon: User },
  { screen: 'officer_assignment', label: 'Officers', icon: UserCog },
  { screen: 'informant_management', label: 'Informants', icon: Users },
  { screen: 'budget_resources', label: 'Budget', icon: Landmark },
  { screen: 'warrant_request', label: 'Warrants', icon: Gavel },
  { screen: 'raid_planning', label: 'Raid', icon: ShieldAlert },
  { screen: 'surveillance_report', label: 'Reports', icon: FileText },
  { screen: 'notes', label: 'Notes', icon: NotebookPen },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame()

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-beige-200">
      <header className="border-b border-charcoal-700 bg-navy-900 px-3 py-2.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-serif text-lg tracking-wide text-beige-200">THE DETAIL</span>
            <span className="text-xs text-beige-400 font-mono hidden sm:inline">{state.unitName}</span>
            <span className="text-xs text-beige-400/50 hidden sm:inline">&middot;</span>
            <span className="text-xs text-beige-300 font-mono">{CHAPTER_TITLES[state.chapter]}</span>
            <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border border-charcoal-600 text-beige-300">
              Day {state.day}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-charcoal-600 hover:bg-charcoal-700 transition-colors text-[11px] font-mono text-beige-300"
              title={state.muted ? 'Unmute sound effects' : 'Mute sound effects'}
              onClick={() => {
                saveMuted(!state.muted)
                dispatch({ type: 'TOGGLE_MUTE' })
              }}
            >
              {state.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span className="hidden md:inline">{state.muted ? 'Muted' : 'Sound'}</span>
            </button>
            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-charcoal-600 hover:bg-charcoal-700 transition-colors text-[11px] font-mono text-beige-300"
              title="Save the case file now"
              onClick={() => saveGame(state, state.saveSlot)}
            >
              <Save size={14} />
              <span className="hidden md:inline">Save</span>
            </button>
            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-charcoal-600 hover:bg-muted-redDark transition-colors text-[11px] font-mono text-beige-300"
              title="Return to the main menu"
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'main_menu' })}
            >
              <DoorOpen size={14} />
              <span className="hidden md:inline">Menu</span>
            </button>
          </div>
        </div>
        <ResourceBar />
        <nav className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-widest text-beige-400/70 font-mono hidden sm:inline">
            Go To
          </span>
          <div className="flex flex-wrap gap-1">
            {NAV_ITEMS.map(({ screen, label, icon: Icon }) => (
              <button
                key={screen}
                onClick={() => dispatch({ type: 'NAVIGATE', screen })}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-colors ${
                  state.screen === screen
                    ? 'bg-termGreen-600/20 border-termGreen-500 text-termGreen-400'
                    : 'border-charcoal-600 hover:bg-charcoal-700 text-beige-300'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
