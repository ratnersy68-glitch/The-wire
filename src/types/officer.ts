export type OfficerRole =
  | 'commander'
  | 'homicide'
  | 'surveillance'
  | 'financial'
  | 'patrol'
  | 'wiretap'

export interface OfficerSkills {
  surveillance: number
  interrogation: number
  financial: number
  wiretapAnalysis: number
  streetCraft: number
  discretion: number
}

export type AssignmentType =
  | 'surveillance'
  | 'wiretapMonitor'
  | 'followSuspect'
  | 'controlledBuy'
  | 'interview'
  | 'financialInvestigation'
  | 'rest'

export interface OfficerAssignment {
  type: AssignmentType
  targetId?: string
  locationId?: string
  informantId?: string
}

export interface Officer {
  id: string
  name: string
  alias?: string
  role: OfficerRole
  age: number
  personality: string
  strengths: string[]
  weaknesses: string[]
  skills: OfficerSkills
  fatigue: number
  morale: number
  relationship: number
  personalConflict?: string
  assignment: OfficerAssignment | null
  available: boolean
  portraitInitials: string
}
