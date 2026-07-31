import type { EndingRecord, GameState } from '../types'
import { clamp } from '../utils/rng'

export function evidenceAdmissibilityRatio(state: GameState): number {
  if (state.evidence.length === 0) return 0
  const admissible = state.evidence.filter((e) => e.admissible).length
  return admissible / state.evidence.length
}

export function computeFinalScore(state: GameState): EndingRecord {
  const totalLeaders = state.suspects.filter((s) => s.level === 'leadership').length
  const leadersArrested = state.suspects.filter((s) => s.level === 'leadership' && s.arrested).length
  const admissibleRatio = evidenceAdmissibilityRatio(state)

  let score = 0
  score += state.resources.evidenceStrength * 0.9
  score += (leadersArrested / Math.max(1, totalLeaders)) * 30
  score += state.resources.communityTrust * 0.25
  score += Math.min(20, state.assetsSeized / 2000)
  score += admissibleRatio * 20
  score -= state.innocentsHarmed * 10
  score -= state.officersInjured * 8
  score -= state.informantsBurned * 6
  score = clamp(Math.round(score), 0, 100)

  const title = pickEndingTitle(state, { totalLeaders, leadersArrested, admissibleRatio })
  const description = ENDING_DESCRIPTIONS[title]

  return { title, description, score }
}

function pickEndingTitle(
  state: GameState,
  ctx: { totalLeaders: number; leadersArrested: number; admissibleRatio: number },
): string {
  const { totalLeaders, leadersArrested, admissibleRatio } = ctx
  const { politicalSupport, communityTrust, evidenceStrength } = state.resources

  if (politicalSupport <= 15) return 'Political Shutdown'
  if (leadersArrested === 0) return 'Leadership Escapes'
  if (state.raidsCompleted > 0 && admissibleRatio < 0.35) return 'Case Collapses in Court'
  if (state.corruptionExposed && politicalSupport < 45) return 'Corruption Exposed'
  if (leadersArrested === totalLeaders && admissibleRatio >= 0.6 && communityTrust >= 45) {
    return 'Complete Conviction'
  }
  if (leadersArrested < totalLeaders && leadersArrested > 0 && evidenceStrength < 60) {
    return 'Organization Replaced by a New Crew'
  }
  if (leadersArrested > 0 && leadersArrested < totalLeaders) return 'Partial Success'
  if (evidenceStrength >= 60 && leadersArrested < totalLeaders) return 'Investigation Becomes a Long-Term Federal Case'
  return 'Partial Success'
}

export const ENDING_DESCRIPTIONS: Record<string, string> = {
  'Complete Conviction':
    'Every leader of the Harbor Street Crew is indicted on charges that hold up in court. The evidence is clean, corroborated, and the prosecutor is confident. It won\'t stop the drug trade in Port Mercy, but it dismantles this organization completely.',
  'Leadership Escapes':
    'The case produced arrests, but not the ones that mattered. Terrence Wade and the people around him saw it coming and walked away clean. Someone else will run this in six months.',
  'Case Collapses in Court':
    'The arrests were real. The evidence wasn\'t good enough. Chain-of-custody problems and uncorroborated intercepts gave the defense everything they needed. Charges are reduced or dropped.',
  'Political Shutdown':
    'Pressure from above ended the investigation before it could finish. Budget pulled, unit reassigned, case boxed up and shelved.',
  'Organization Replaced by a New Crew':
    'Some of the Harbor Street Crew went down. Within weeks, someone else was running the same corners with the same customers. The territory doesn\'t stay empty.',
  'Partial Success':
    'Real arrests, real evidence, real damage to the organization — but the case never reached everyone it should have. A qualified win.',
  'Corruption Exposed':
    'The money trail led somewhere nobody wanted it to go. A councilman\'s office, a stack of donations, and a political mess that overshadows the drug case entirely.',
  'Investigation Becomes a Long-Term Federal Case':
    'The evidence outgrew what a city unit could prosecute alone. Federal partners have taken the wiretap and the financial trail. The case continues — just not as this unit\'s to finish.',
}
