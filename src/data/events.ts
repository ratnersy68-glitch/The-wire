import type { RandomEventDef } from '../types'

export const RANDOM_EVENTS: RandomEventDef[] = [
  { id: 'suspect_changes_phone', title: 'Burner Swap', minChapter: 2, weight: 10 },
  { id: 'detective_sick', title: 'Called In Sick', minChapter: 1, weight: 8 },
  { id: 'informant_demands_money', title: 'Informant Demands More Money', minChapter: 1, weight: 6 },
  { id: 'prosecutor_rejects_warrant', title: 'Warrant Rejected', minChapter: 1, weight: 5 },
  { id: 'commander_demands_arrests', title: 'Commander Wants Arrests', minChapter: 1, weight: 7 },
  { id: 'witness_disappears', title: 'Witness Disappears', minChapter: 2, weight: 4 },
  { id: 'equipment_fails', title: 'Equipment Failure', minChapter: 1, weight: 6 },
  { id: 'rival_crew_violence', title: 'Rival Crew Violence', minChapter: 2, weight: 5 },
  { id: 'newspaper_reports', title: 'Newspaper Report', minChapter: 2, weight: 5 },
  { id: 'suspect_arrested_other_unit', title: 'Arrested By Another Unit', minChapter: 1, weight: 4 },
  { id: 'file_leaked', title: 'Confidential File Leaked', minChapter: 3, weight: 3 },
  { id: 'community_meeting', title: 'Community Meeting', minChapter: 1, weight: 6 },
]
