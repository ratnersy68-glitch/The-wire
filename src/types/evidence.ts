export type EvidenceType =
  | 'photograph'
  | 'call_transcript'
  | 'financial_record'
  | 'witness_statement'
  | 'physical'
  | 'surveillance_note'
  | 'arrest_record'

export type EvidenceSource =
  | 'surveillance'
  | 'wiretap'
  | 'informant'
  | 'interview'
  | 'financial_investigation'
  | 'raid'
  | 'controlled_buy'

export interface EvidenceItem {
  id: string
  type: EvidenceType
  title: string
  description: string
  source: EvidenceSource
  dateAdded: number
  relatedSuspectIds: string[]
  relatedLocationIds: string[]
  reliability: number
  legality: number
  corroborated: boolean
  chainOfCustody: string[]
  admissible: boolean
  x: number
  y: number
}

export type EvidenceConnectionKind =
  | 'called'
  | 'met_with'
  | 'works_for'
  | 'supplies'
  | 'lives_at'
  | 'owns'
  | 'paid'
  | 'threatened'
  | 'related_to'

export type ConnectionStatus = 'confirmed' | 'suspected' | 'disproved'

export interface BoardConnection {
  id: string
  fromId: string
  toId: string
  kind: EvidenceConnectionKind
  status: ConnectionStatus
}

export interface BoardNode {
  id: string
  kind: 'suspect' | 'location' | 'evidence'
  refId: string
  x: number
  y: number
}
