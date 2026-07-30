import { GameProvider, useGame } from './game/GameContext'
import { AppShell } from './components/layout/AppShell'
import {
  MainMenuPage,
  NewGameSetupPage,
  MorningBriefingPage,
  DashboardPage,
  CityMapPage,
  EvidenceBoardPage,
  WiretapTerminalPage,
  SurveillanceReportPage,
  SuspectProfilePage,
  OfficerAssignmentPage,
  InformantManagementPage,
  BudgetResourcesPage,
  WarrantRequestPage,
  RaidPlanningPage,
  EndOfDayReportPage,
  ChapterSummaryPage,
  FinalOutcomePage,
} from './pages'

const BARE_SCREENS = new Set(['main_menu', 'new_game', 'morning_briefing', 'chapter_summary', 'final_outcome'])

function Screen() {
  const { state } = useGame()

  switch (state.screen) {
    case 'main_menu':
      return <MainMenuPage />
    case 'new_game':
      return <NewGameSetupPage />
    case 'morning_briefing':
      return <MorningBriefingPage />
    case 'dashboard':
      return <DashboardPage />
    case 'city_map':
      return <CityMapPage />
    case 'evidence_board':
      return <EvidenceBoardPage />
    case 'wiretap_terminal':
      return <WiretapTerminalPage />
    case 'surveillance_report':
      return <SurveillanceReportPage />
    case 'suspect_profile':
      return <SuspectProfilePage />
    case 'officer_assignment':
      return <OfficerAssignmentPage />
    case 'informant_management':
      return <InformantManagementPage />
    case 'budget_resources':
      return <BudgetResourcesPage />
    case 'warrant_request':
      return <WarrantRequestPage />
    case 'raid_planning':
      return <RaidPlanningPage />
    case 'end_of_day':
      return <EndOfDayReportPage />
    case 'chapter_summary':
      return <ChapterSummaryPage />
    case 'final_outcome':
      return <FinalOutcomePage />
    default:
      return <MainMenuPage />
  }
}

function GameShell() {
  const { state } = useGame()
  const content = <Screen />
  if (BARE_SCREENS.has(state.screen)) return content
  return <AppShell>{content}</AppShell>
}

function App() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  )
}

export default App
