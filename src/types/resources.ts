export interface Resources {
  budget: number
  overtimeHours: number
  maxOvertimeHours: number
  informantFunds: number
  politicalSupport: number
  prosecutorConfidence: number
  communityTrust: number
  secrecy: number
  evidenceStrength: number
  alertLevel: number
}

export type ResourceKey = keyof Resources
