import type { AssignmentType, GameState, OfficerAssignment } from '../types'
import { shortName } from './suspectHelpers'

export const ASSIGNMENT_LABELS: Record<AssignmentType, string> = {
  surveillance: 'Surveillance',
  wiretapMonitor: 'Monitoring Wiretap',
  followSuspect: 'Following Suspect',
  controlledBuy: 'Controlled Buy',
  interview: 'Interview',
  financialInvestigation: 'Financial Investigation',
  rest: 'Resting',
}

export function describeAssignment(state: GameState, assignment: OfficerAssignment): string {
  switch (assignment.type) {
    case 'surveillance': {
      const loc = state.locations.find((l) => l.id === assignment.locationId)
      return loc ? loc.name : 'Unknown location'
    }
    case 'followSuspect': {
      const s = state.suspects.find((s) => s.id === assignment.targetId)
      return s ? shortName(s) : 'Unknown subject'
    }
    case 'financialInvestigation': {
      const s = state.suspects.find((s) => s.id === assignment.targetId)
      return s ? `Tracing ${shortName(s)}'s finances` : 'Financial trail'
    }
    case 'interview': {
      const subj = state.interviewSubjects.find((s) => s.id === assignment.targetId)
      return subj ? subj.name : 'Interview subject'
    }
    case 'controlledBuy': {
      const s = state.suspects.find((s) => s.id === assignment.targetId)
      const inf = state.informants.find((i) => i.id === assignment.informantId)
      return `${inf ? inf.codename : 'Informant'} buying from ${s ? shortName(s) : 'target'}`
    }
    case 'wiretapMonitor':
      return 'Reviewing today\'s intercepts'
    case 'rest':
      return 'Off rotation to recover'
    default:
      return ''
  }
}
