export interface Informant {
  id: string
  codename: string
  relatedSuspectId?: string
  trust: number
  fear: number
  honesty: number
  motivation: string
  relationshipToOrg: string
  exposed: boolean
  active: boolean
  weeklyCost: number
  reliabilityHistory: number
}

export interface InterviewSubject {
  id: string
  name: string
  role: 'witness' | 'arrestee' | 'resident' | 'informant'
  trust: number
  fear: number
  honesty: number
  motivation: string
  relationshipToOrg: string
  interviewed: boolean
}
