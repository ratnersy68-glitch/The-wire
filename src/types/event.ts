export type RandomEventId =
  | 'suspect_changes_phone'
  | 'detective_sick'
  | 'informant_demands_money'
  | 'prosecutor_rejects_warrant'
  | 'commander_demands_arrests'
  | 'witness_disappears'
  | 'equipment_fails'
  | 'rival_crew_violence'
  | 'newspaper_reports'
  | 'suspect_arrested_other_unit'
  | 'file_leaked'
  | 'community_meeting'

export interface RandomEventDef {
  id: RandomEventId
  title: string
  minChapter: number
  weight: number
}

export interface LogEntry {
  id: string
  day: number
  category: 'briefing' | 'report' | 'call' | 'event' | 'decision' | 'system'
  text: string
}
