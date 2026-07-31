import type { GameState, OfficerAssignment, ScreenId, EvidenceConnectionKind, ConnectionStatus, WarrantType } from '../types'
import { createInitialState } from './initialState'
import {
  addConnection,
  computeFinalScore,
  endDay,
  executeRaid,
  requestWarrant,
  reviewCall,
  markCallAddedToBoard,
  updateConnectionStatus,
} from '../systems'
import { nextId } from '../utils/id'

export type GameAction =
  | { type: 'NAVIGATE'; screen: ScreenId }
  | { type: 'NEW_GAME'; unitName: string; slot: number; seed: number }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'ASSIGN_OFFICER'; officerId: string; assignment: OfficerAssignment | null }
  | { type: 'END_DAY' }
  | { type: 'ACK_CHAPTER_SUMMARY' }
  | { type: 'REQUEST_WARRANT'; warrantType: WarrantType; targetSuspectId?: string; targetLocationId?: string; justification: string }
  | { type: 'EXECUTE_RAID'; locationId: string; officerIds: string[] }
  | { type: 'ADD_CONNECTION'; fromId: string; toId: string; kind: EvidenceConnectionKind; status?: ConnectionStatus }
  | { type: 'UPDATE_CONNECTION_STATUS'; connectionId: string; status: ConnectionStatus }
  | { type: 'REVIEW_CALL'; callId: string }
  | { type: 'MARK_CALL_BOARD'; callId: string }
  | { type: 'SELECT_SUSPECT'; id: string | null }
  | { type: 'SELECT_LOCATION'; id: string | null }
  | { type: 'MARK_TUTORIAL_STEP'; step: string }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'RECRUIT_INFORMANT'; subjectId: string; codename: string }
  | { type: 'FINALIZE_CASE'; arrestSuspectIds: string[] }
  | { type: 'ADD_NOTE_PAGE' }
  | { type: 'UPDATE_NOTE_PAGE'; id: string; body: string }
  | { type: 'RENAME_NOTE_PAGE'; id: string; title: string }
  | { type: 'DELETE_NOTE_PAGE'; id: string }
  | { type: 'SELECT_NOTE_PAGE'; id: string }
  | { type: 'USE_HINT' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, previousScreen: state.screen, screen: action.screen }

    case 'NEW_GAME':
      return createInitialState(action.unitName, action.slot, action.seed)

    case 'LOAD_STATE':
      return action.state

    case 'ASSIGN_OFFICER':
      return {
        ...state,
        officers: state.officers.map((o) => (o.id === action.officerId ? { ...o, assignment: action.assignment } : o)),
      }

    case 'END_DAY': {
      const result = endDay(state)
      return {
        ...result.state,
        screen: result.chapterAdvanced ? 'chapter_summary' : 'end_of_day',
        previousScreen: state.screen,
      }
    }

    case 'ACK_CHAPTER_SUMMARY':
      return { ...state, screen: 'morning_briefing', previousScreen: state.screen }

    case 'REQUEST_WARRANT': {
      const { state: next, report } = requestWarrant(
        state,
        action.warrantType,
        action.targetSuspectId,
        action.targetLocationId,
        action.justification,
      )
      return { ...next, reports: [report, ...next.reports] }
    }

    case 'EXECUTE_RAID': {
      const rand = () => Math.random()
      const { state: next, report } = executeRaid(state, action.locationId, action.officerIds, rand)
      return { ...next, reports: [report, ...next.reports], screen: 'end_of_day' }
    }

    case 'ADD_CONNECTION':
      return addConnection(state, action.fromId, action.toId, action.kind, action.status ?? 'suspected')

    case 'UPDATE_CONNECTION_STATUS':
      return updateConnectionStatus(state, action.connectionId, action.status)

    case 'REVIEW_CALL':
      return reviewCall(state, action.callId)

    case 'MARK_CALL_BOARD':
      return markCallAddedToBoard(state, action.callId)

    case 'SELECT_SUSPECT':
      return { ...state, selectedSuspectId: action.id }

    case 'SELECT_LOCATION':
      return { ...state, selectedLocationId: action.id }

    case 'MARK_TUTORIAL_STEP':
      return { ...state, hasSeenTutorialStep: { ...state.hasSeenTutorialStep, [action.step]: true } }

    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted }

    case 'RECRUIT_INFORMANT': {
      const subject = state.interviewSubjects.find((s) => s.id === action.subjectId)
      if (!subject) return state
      const informant = {
        id: nextId('inf'),
        codename: action.codename,
        trust: subject.trust,
        fear: subject.fear,
        honesty: subject.honesty,
        motivation: subject.motivation,
        relationshipToOrg: subject.relationshipToOrg,
        exposed: false,
        active: true,
        weeklyCost: 350,
        reliabilityHistory: 50,
      }
      return { ...state, informants: [...state.informants, informant] }
    }

    case 'FINALIZE_CASE': {
      const suspects = state.suspects.map((s) =>
        action.arrestSuspectIds.includes(s.id) ? { ...s, arrested: true, known: true, knownRealName: true } : s,
      )
      const leadersConvicted = suspects.filter((s) => s.level === 'leadership' && s.arrested).length
      const withArrests: GameState = { ...state, suspects, leadersConvicted, gameOver: true }
      const ending = computeFinalScore(withArrests)
      return { ...withArrests, ending, screen: 'final_outcome' }
    }

    case 'ADD_NOTE_PAGE': {
      const page = { id: nextId('note'), title: `Day ${state.day} Notes`, day: state.day, body: '' }
      return { ...state, notePages: [...state.notePages, page], selectedNotePageId: page.id }
    }

    case 'UPDATE_NOTE_PAGE':
      return {
        ...state,
        notePages: state.notePages.map((p) => (p.id === action.id ? { ...p, body: action.body } : p)),
      }

    case 'RENAME_NOTE_PAGE':
      return {
        ...state,
        notePages: state.notePages.map((p) => (p.id === action.id ? { ...p, title: action.title } : p)),
      }

    case 'DELETE_NOTE_PAGE': {
      const remaining = state.notePages.filter((p) => p.id !== action.id)
      const selectedNotePageId =
        state.selectedNotePageId === action.id ? (remaining[0]?.id ?? null) : state.selectedNotePageId
      return { ...state, notePages: remaining, selectedNotePageId }
    }

    case 'SELECT_NOTE_PAGE':
      return { ...state, selectedNotePageId: action.id }

    case 'USE_HINT':
      if (state.hintsUsedToday >= state.maxHintsPerDay) return state
      return { ...state, hintsUsedToday: state.hintsUsedToday + 1 }

    default:
      return state
  }
}
