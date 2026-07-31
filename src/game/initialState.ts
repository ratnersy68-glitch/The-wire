import { CALL_TEMPLATES, CODE_TERMS, INTERVIEW_SUBJECTS, LOCATIONS, OBJECTIVES, OFFICERS, RELATIONSHIPS, SUSPECTS } from '../data'
import type { GameState } from '../types'
import { DEFAULT_RESOURCES } from '../systems'

export function createInitialState(unitName: string, saveSlot: number, seed: number): GameState {
  return {
    screen: 'morning_briefing',
    previousScreen: null,
    saveSlot,
    unitName: unitName || 'Unnamed Detail',
    chapter: 1,
    day: 1,
    seed,
    rngCounter: 0,

    resources: { ...DEFAULT_RESOURCES },
    officers: OFFICERS.map((o) => ({ ...o, assignment: null })),
    suspects: SUSPECTS.map((s) => ({ ...s })),
    relationships: RELATIONSHIPS.map((r) => ({ ...r })),
    locations: LOCATIONS.map((l) => ({ ...l })),
    evidence: [],
    connections: [],
    boardNodes: [],
    calls: [],
    codeTerms: CODE_TERMS.map((c) => ({ ...c })),
    informants: [],
    interviewSubjects: INTERVIEW_SUBJECTS.map((i) => ({ ...i })),
    warrants: [],
    reports: [],
    logs: [
      {
        id: 'log_start',
        day: 1,
        category: 'briefing',
        text: `${unitName || 'The unit'} has been stood up to look at drug activity tied to a handful of corners in West Terrace, Franklin Row, and Old Market. Command is calling it a short-term detail. Nobody expects it to stay that way.`,
      },
    ],
    objectives: OBJECTIVES.map((o) => ({ ...o })),
    notePages: [
      {
        id: 'note_1',
        title: 'Day One',
        day: 1,
        body: '',
      },
    ],
    selectedNotePageId: 'note_1',

    codeTermExposure: {},
    wiretapActive: false,
    hasSeenTutorialStep: {},
    selectedSuspectId: null,
    selectedLocationId: null,
    raidsCompleted: 0,
    informantsBurned: 0,
    officersInjured: 0,
    innocentsHarmed: 0,
    assetsSeized: 0,
    leadersConvicted: 0,
    corruptionExposed: false,
    gameOver: false,
    ending: null,
    dayInChapter: 0,
    muted: false,
    hintsUsedToday: 0,
    maxHintsPerDay: 2,
  }
}

export const CALL_POOL_SIZE = CALL_TEMPLATES.length
