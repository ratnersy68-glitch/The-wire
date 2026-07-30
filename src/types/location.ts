export type District =
  | 'Harbor East'
  | 'West Terrace'
  | 'Franklin Row'
  | 'Old Market'
  | 'North Point'
  | 'Docklands'
  | 'Ashland Heights'
  | 'Central Business District'

export type LocationType =
  | 'corner'
  | 'apartment'
  | 'restaurant'
  | 'convenience_store'
  | 'vacant_house'
  | 'police_hq'
  | 'courthouse'
  | 'school'
  | 'warehouse'
  | 'nightclub'
  | 'auto_shop'
  | 'church'
  | 'waterfront'

export interface Location {
  id: string
  name: string
  district: District
  type: LocationType
  x: number
  y: number
  description: string
  discovered: boolean
  linkedSuspectIds: string[]
  heatLevel: number
  raided: boolean
}
