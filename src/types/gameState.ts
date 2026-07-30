import type { Resources } from './resources'
import type { Officer } from './officer'
import type { Suspect, SuspectRelationship } from './suspect'
import type { Location } from './location'
import type { EvidenceItem, BoardConnection, BoardNode } from './evidence'
import type { PhoneCall, CodeTerm } from './call'
import type { Informant, InterviewSubject } from './informant'
import type { WarrantRequest } from './warrant'
import type { LogEntry } from './event'

export type ScreenId =
  | 'main_menu'
  | 'new_game'
  | 'morning_briefing'
  | 'dashboard'
  | 'city_map'
  | 'evidence_board'
  | 'wiretap_terminal'
  | 'surveillance_report'
  | 'suspect_profile'
  | 'officer_assignment'
  | 'informant_management'
  | 'budget_resources'
  | 'warrant_request'
  | 'raid_planning'
  | 'end_of_day'
  | 'chapter_summary'
  | 'final_outcome'
  | 'notes'

export interface Objective {
  id: string
  chapter: number
  text: string
  completed: boolean
  hint?: string
}

export interface PendingSurveillanceResult {
  officerId: string
  locationId: string
  reportId: string
}

export interface DailyReport {
  id: string
  day: number
  title: string
  body: string
  kind: 'surveillance' | 'wiretap' | 'financial' | 'interview' | 'buy' | 'raid' | 'event'
  relatedSuspectId?: string
  relatedLocationId?: string
}

export interface EndingRecord {
  title: string
  description: string
  score: number
}

export interface NotePage {
  id: string
  title: string
  day: number
  body: string
}

export interface GameState {
  screen: ScreenId
  previousScreen: ScreenId | null
  saveSlot: number
  unitName: string
  chapter: number
  day: number
  seed: number
  rngCounter: number

  resources: Resources
  officers: Officer[]
  suspects: Suspect[]
  relationships: SuspectRelationship[]
  locations: Location[]
  evidence: EvidenceItem[]
  connections: BoardConnection[]
  boardNodes: BoardNode[]
  calls: PhoneCall[]
  codeTerms: CodeTerm[]
  informants: Informant[]
  interviewSubjects: InterviewSubject[]
  warrants: WarrantRequest[]
  reports: DailyReport[]
  logs: LogEntry[]
  objectives: Objective[]
  notePages: NotePage[]
  selectedNotePageId: string | null

  codeTermExposure: Record<string, number>
  wiretapActive: boolean
  hasSeenTutorialStep: Record<string, boolean>
  selectedSuspectId: string | null
  selectedLocationId: string | null
  raidsCompleted: number
  informantsBurned: number
  officersInjured: number
  innocentsHarmed: number
  assetsSeized: number
  leadersConvicted: number
  corruptionExposed: boolean
  gameOver: boolean
  ending: EndingRecord | null
  dayInChapter: number
  muted: boolean
}

export interface SaveSlotMeta {
  slot: number
  unitName: string
  chapter: number
  day: number
  updatedAt: number
  exists: boolean
}
