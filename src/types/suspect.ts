export type OrgLevel = 'leadership' | 'mid' | 'street'

export type OrgRole =
  | 'leader'
  | 'adviser'
  | 'supplier'
  | 'money_manager'
  | 'territory_manager'
  | 'enforcer'
  | 'shipment_coordinator'
  | 'money_collector'
  | 'corner_supervisor'
  | 'lookout'
  | 'dealer'
  | 'driver'

export type CautionLevel = 'reckless' | 'casual' | 'careful' | 'paranoid'

export interface ScheduleBlock {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  locationId: string
  activity: string
}

export interface Suspect {
  id: string
  realName: string
  alias: string
  age: number
  personality: string
  level: OrgLevel
  role: OrgRole
  roleLabel: string
  caution: CautionLevel
  loyalty: number
  criminalHistory: string[]
  reactionToPressure: string
  schedule: ScheduleBlock[]
  homeLocationId: string
  phoneNumber: string
  vehicle?: string

  // discovery state — mostly unknown at game start
  known: boolean
  knownRealName: boolean
  knownAlias: boolean
  knownRole: boolean
  knownPhone: boolean
  knownVehicle: boolean
  knownHome: boolean
  photographed: boolean
  arrested: boolean
  suspicionOfPolice: number
  usingBurner: boolean
  relocated: boolean
}

export interface SuspectRelationship {
  fromId: string
  toId: string
  type:
    | 'called'
    | 'met_with'
    | 'works_for'
    | 'supplies'
    | 'lives_at'
    | 'owns'
    | 'paid'
    | 'threatened'
    | 'related_to'
  status: 'confirmed' | 'suspected' | 'disproved'
  discovered: boolean
}
