import type { ScreenId } from '../types'

export interface ScreenInstructions {
  title: string
  steps: string[]
}

export const SCREEN_INSTRUCTIONS: Partial<Record<ScreenId, ScreenInstructions>> = {
  dashboard: {
    title: 'Operations Dashboard',
    steps: [
      'Check each detective\'s Fatigue and Morale before assigning them — a detective above ~70% Fatigue works worse and recovers faster if you Rest them instead.',
      'Click "Assign Detectives" to send each available officer out for the day. Officers with no assignment do nothing and slowly recover.',
      'Use Quick Actions to jump straight to Warrant Request or Case Reports without losing your place.',
      'When every detective you want to use has an assignment, click "End the Day" — this resolves every assignment, checks the wiretap, applies random events, and advances the clock.',
    ],
  },
  city_map: {
    title: 'City Map',
    steps: [
      'Only lit-up pins are known locations. Dark gray pins exist but haven\'t been discovered yet — surveillance, follows, and financial digging reveal them.',
      'Click a pin to see its details, including anyone known to be tied to that address.',
      'Use the zoom controls in the top-right of the map to get a closer look at a crowded district, and drag to pan while zoomed in.',
      'Selecting a location here and then heading to Officer Assignment pre-fills it as a Surveillance target — a fast way to plan tomorrow\'s watch.',
    ],
  },
  evidence_board: {
    title: 'Evidence Board',
    steps: [
      'Every known suspect, discovered location, and piece of evidence appears here as a pin. Drag pins to organize the board however makes sense to you.',
      'Click a pin to see its details in the side panel — click "Connect," then click a second pin to draw a relationship between them.',
      'When you draw a connection, choose how confident you are: Confirmed (solid line), Suspected (dashed), or Disproved (dotted). You can upgrade a suspected link later once you have better evidence.',
      'Building out relationships here is what eventually reveals the organization\'s chain of command.',
    ],
  },
  wiretap_terminal: {
    title: 'Wiretap Terminal',
    steps: [
      'This screen only lights up once a wiretap warrant is approved. Build Evidence Strength and keep Prosecutor Confidence up to get there.',
      'New intercepts appear after you end a day. Nobody says what they mean directly — read between the lines.',
      'Click "Mark Reviewed" on a call to help decode any coded terms it uses. Reviewing 2-3 calls that share a term is usually enough to crack it.',
      'File important calls to the Case Board so they show up as evidence you can connect to suspects.',
    ],
  },
  suspect_profile: {
    title: 'Suspect Profiles',
    steps: [
      'Nobody starts identified. Surveillance, follows, interviews, and financial digging progressively reveal alias, real name, role, vehicle, phone, and home address.',
      'Click a name on the left to pull up everything currently known about them.',
      'Watch the Suspicion of Police stat — a suspect who gets suspicious may switch to a burner phone or relocate, making them harder to track.',
      'Known Relationships here mirror what you\'ve connected on the Evidence Board.',
    ],
  },
  officer_assignment: {
    title: 'Officer Assignment',
    steps: [
      'Pick a detective on the left, then choose one task for them today: Surveillance, Follow a Suspect, Financial Investigation, Interview, Controlled Buy, Wiretap Monitor, or Rest.',
      'Each task needs a target — a location, a known suspect, an informant, or an interview subject — chosen from the dropdown that appears.',
      'Match the task to the detective: a Financial Investigator does much better tracing money than a Patrol Officer would.',
      'You can only assign one task per detective per day, and it resolves when you End the Day from the Dashboard.',
    ],
  },
  informant_management: {
    title: 'Informant Management',
    steps: [
      'People you\'ve interviewed with enough trust show up under "Potential Recruits" — give them a codename and recruit them.',
      'Active informants cost a weekly fee from your Informant Funds, and can be used for Controlled Buy assignments.',
      'A controlled buy that goes wrong can expose your informant permanently — weigh the risk before sending one after a paranoid target.',
    ],
  },
  budget_resources: {
    title: 'Budget & Resources',
    steps: [
      'This is a read-only summary — track it before committing to warrants or raids, both of which cost real money and overtime.',
      'Watch Political Support and Prosecutor Confidence especially: let either fall too far and warrants start getting denied or the case gets shut down entirely.',
      'Organization Alert rises when detectives get spotted or evidence is mishandled, and it makes the crew more careful the higher it climbs.',
    ],
  },
  warrant_request: {
    title: 'Warrant Request',
    steps: [
      'A Wiretap warrant needs Evidence Strength ≥ 25% and Prosecutor Confidence ≥ 30%. A Search warrant needs ≥ 45% and ≥ 35%.',
      'Check "Current standing" before you submit — a denial costs you Prosecutor Confidence, so don\'t ask before the odds favor you.',
      'An approved search warrant unlocks that location on the Raid Planning screen.',
    ],
  },
  raid_planning: {
    title: 'Raid Planning',
    steps: [
      'You can only raid a location with an approved search warrant. Get one from Warrant Request first.',
      'Assign every detective you want on the raid — more evidence tied to that location and higher overall Evidence Strength both improve the outcome.',
      'Raiding too early usually only nets low-level arrests and puts leadership on alert. Patience tends to pay off here.',
    ],
  },
  surveillance_report: {
    title: 'Case Reports',
    steps: [
      'Every report your detail has ever filed lives here — surveillance, wiretap, financial, interviews, buys, raids, and random events.',
      'Use the filter chips to narrow down to one category, useful when you\'re trying to remember what a specific detective turned up.',
    ],
  },
  notes: {
    title: 'Case Notes',
    steps: [
      'This is entirely yours — nothing here affects the game. Use it to track your own theories, names, and leads across days.',
      'Add a new page any time; each is stamped with the day you created it, so you can look back at what you knew when.',
    ],
  },
}
