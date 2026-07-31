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
import { useSound } from '../../hooks/useSound'
import { playSound } from '../../utils/sound'
import { InstructionsDrawer } from '../help/InstructionsDrawer'
import { HintButton } from '../help/HintButton'

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
  const play = useSound()

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-beige-200">
      <header className="border-b border-charcoal-700 bg-navy-900 px-3 py-2.5 flex flex-col gap-2.5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-serif text-lg tracking-wide text-beige-200">THE DETAIL</span>
            <span className="text-xs text-beige-400 font-mono hidden sm:inline">{state.unitName}</span>
            <span className="text-xs text-beige-400/50 hidden sm:inline">&middot;</span>
            <span className="text-xs text-beige-300 font-mono">{CHAPTER_TITLES[state.chapter]}</span>
            <span className="chip text-beige-300">Day {state.day}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className="btn-secondary px-2 py-1.5 text-[11px]"
              title={state.muted ? 'Unmute sound effects' : 'Mute sound effects'}
              onClick={() => {
                const nowMuted = !state.muted
                saveMuted(nowMuted)
                dispatch({ type: 'TOGGLE_MUTE' })
                if (!nowMuted) playSound('toggleOn', false)
              }}
            >
              {state.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span className="hidden md:inline">{state.muted ? 'Muted' : 'Sound'}</span>
            </button>
            <button
              className="btn-secondary px-2 py-1.5 text-[11px]"
              title="Save the case file now"
              onClick={() => {
                saveGame(state, state.saveSlot)
                play('click')
              }}
            >
              <Save size={14} />
              <span className="hidden md:inline">Save</span>
            </button>
            <button
              className="btn-secondary px-2 py-1.5 text-[11px] hover:!border-muted-red hover:!bg-muted-redDark/30"
              title="Return to the main menu"
              onClick={() => {
                play('click')
                dispatch({ type: 'NAVIGATE', screen: 'main_menu' })
              }}
            >
              <DoorOpen size={14} />
              <span className="hidden md:inline">Menu</span>
            </button>
          </div>
        </div>
        <ResourceBar />
        <nav className="flex flex-col gap-1">
          <span className="section-label hidden sm:inline">Go To</span>
          <div className="flex flex-wrap gap-1">
            {NAV_ITEMS.map(({ screen, label, icon: Icon }) => {
              const active = state.screen === screen
              return (
                <button
                  key={screen}
                  onClick={() => {
                    if (!active) play('nav')
                    dispatch({ type: 'NAVIGATE', screen })
                  }}
                  className={
                    active
                      ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border border-beige-300 bg-white/10 text-beige-200 shadow-[0_2px_8px_-2px_rgba(255,255,255,0.15)]'
                      : 'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border border-transparent text-beige-400 hover:bg-white/5 hover:text-beige-200 transition-colors'
                  }
                >
                  <Icon size={14} />
                  {label}
                </button>
              )
            })}
          </div>
        </nav>
      </header>
      <main key={state.screen} className="flex-1 overflow-auto animate-fade-in">
        {children}
      </main>
      <InstructionsDrawer />
      <HintButton />
    </div>
  )
}
