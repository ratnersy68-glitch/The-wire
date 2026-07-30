export type WarrantType = 'wiretap' | 'search'

export type WarrantStatus = 'pending' | 'approved' | 'denied'

export interface WarrantRequest {
  id: string
  type: WarrantType
  targetSuspectId?: string
  targetLocationId?: string
  justification: string
  status: WarrantStatus
  dayRequested: number
  dayDecided?: number
}
