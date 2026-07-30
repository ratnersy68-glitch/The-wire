export interface CallLine {
  speakerId: string
  text: string
}

export interface PhoneCall {
  id: string
  day: number
  timestamp: string
  participantIds: string[]
  lines: CallLine[]
  codeWordsUsed: string[]
  decoded: boolean
  significance: 'low' | 'medium' | 'high'
  summary: string
  heard: boolean
  addedToBoard: boolean
}

export interface CodeTerm {
  term: string
  meaning: string
  discovered: boolean
  context: string
}
