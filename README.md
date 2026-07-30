# The Detail

A browser-based police-investigation strategy game inspired by the structure and street-level
realism of prestige crime drama — original characters, an original city, and an original criminal
organization. You run a small investigative unit trying to identify and dismantle **the Harbor
Street Crew** in the fictional city of **Port Mercy**, across five chapters that escalate from
street corners to phones, supply lines, money and political influence, and finally the takedown.

This is not a shooter. The game is about surveillance, wiretaps, informants, evidence, warrants,
and the hard trade-offs of running a long-term investigation with limited people, time, and money.

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`) in your browser.

To build a production bundle and preview it:

```bash
npm run build
npm run preview
```

No backend, no API keys, and no paid services are required. Progress is saved to
`localStorage` in the browser.

## Controls

The game is entirely mouse/pointer driven:

- **Main Menu** — start a new investigation or continue/manage save slots.
- **Top navigation bar** (visible during play) — jump between Dashboard, City Map, Evidence
  Board, Wiretap Terminal, Suspects, Officers, Informants, Budget, Warrants, Raid, and Reports.
- **Evidence Board** — click a pin to select it, drag pins to rearrange the board, click
  "Connect" then click a second pin to draw a relationship line between them.
- **Officer Assignment** — pick a detective, pick an assignment type, pick a target (location,
  suspect, informant, or interview subject), then confirm. Assignments resolve when you end the day.
- **End the Day** (Dashboard) — resolves all assignments, intercepts new wiretap calls, applies
  organization reactions and random events, and advances to the next morning.

## Design Overview

### The City — Port Mercy

Eight fictional districts (Harbor East, West Terrace, Franklin Row, Old Market, North Point,
Docklands, Ashland Heights, and the Central Business District) hold street corners, apartment
buildings, restaurants, a convenience store, a vacant rowhouse, a school, warehouses, a nightclub,
an auto shop, a church, and a waterfront pier — rendered as a stylized SVG city map with no
external mapping dependency.

### The Organization — Harbor Street Crew

Eighteen original characters spread across three tiers:

- **Leadership (4):** an organization leader, a strategic adviser, a main supplier, and a money
  manager.
- **Mid-level (8):** two territory managers, two enforcers, two shipment coordinators, and two
  money collectors.
- **Street-level (6):** two corner supervisors, two lookouts, a dealer, and a driver.

At the start of the game almost everyone is unknown. Real names, aliases, roles, vehicles,
addresses, and relationships are uncovered gradually through surveillance, wiretaps, interviews,
follows, and financial digging — never handed to the player up front.

### The Unit

Six original detectives (a commander, a veteran homicide detective, a surveillance specialist,
a financial-crimes investigator, a young patrol officer, and a technical wiretap analyst), each
with distinct skills, strengths, weaknesses, fatigue, morale, and personal friction. Tired or
mismatched officers produce worse results.

### Core Systems (`src/systems`)

| System | Responsibility |
| --- | --- |
| `resourceSystem` | Budget, overtime, informant funds, political/prosecutor/community meters, secrecy, evidence strength, organization alert level. |
| `surveillanceSystem` | Resolves surveillance assignments into one of several outcomes (identify a suspect, photograph a meeting, discover a vehicle, get spotted, lose the target, discover a new location, or nothing at all). |
| `wiretapSystem` | Gates wiretap eligibility on probable cause, intercepts calls once a warrant is approved, and gradually decodes coded language ("tickets," "concert," "blue shirts," "twenty chairs," and more) as the player reviews enough calls. |
| `evidenceSystem` | Manages connections on the evidence board (confirmed / suspected / disproved) between suspects, locations, and evidence. |
| `organizationAI` | The Harbor Street Crew reacts to the investigation: burner phones, quieter corners, leadership going dark, or relocating entirely at high alert levels. |
| `eventSystem` | Twelve procedural random events (sick detectives, informant demands, rejected warrants, leaked files, community meetings, and more), seeded and reproducible. |
| `courtSystem` | Tracks evidence admissibility and computes one of eight possible endings from the final case state. |
| `investigationSystem` | Orchestrates warrants, follows, financial investigations, controlled buys, interviews, raids, objective tracking, chapter transitions, and the full end-of-day resolution. |
| `saveSystem` | Multi-slot `localStorage` save/load, plus a persisted mute preference. |

All randomness runs through a seeded PRNG (`src/utils/rng.ts`, mulberry32) keyed off each save's
seed and a running counter, so a given save's events are reproducible for testing.

### Screens (`src/pages`)

Main Menu, New Game Setup, Morning Briefing, Operations Dashboard, City Map, Evidence Board,
Wiretap Terminal, Case Reports (surveillance/wiretap/financial/interview/buy/raid/event log),
Suspect Profiles, Officer Assignment, Informant Management, Budget & Resources, Warrant Request,
Raid Planning, End of Day Report, Chapter Summary, and Final Case Outcome.

### The Five Chapters

1. **Street Corners** — learn the core loop (assign detectives, run surveillance, build the
   evidence board, connect suspects) and identify the first low-level dealers. This chapter is
   also the game's tutorial — hints appear directly in the Morning Briefing's objective list
   instead of a separate instructional screen.
2. **The Phones** — earn a wiretap warrant and start decoding coded communications.
3. **The Supply Line** — vehicles, stash locations, and the organization's supplier come into view.
4. **Money and Influence** — front businesses, financial crimes, and political pressure.
5. **The Takedown** — decide who to arrest and close the case. This is final: once you close the
   case, your result is scored and one of eight endings is assigned (from a clean complete
   conviction down through leadership escaping, the case collapsing in court, a political
   shutdown, corruption exposed, or the organization simply being replaced by a new crew).

## Project Structure

```
src/
  components/   Reusable UI (layout/nav/resource bar, evidence board canvas, city map SVG)
  data/         Static game data — suspects, officers, locations, calls, code terms, objectives
  game/         GameContext (React context + reducer), initial state factory
  pages/        The 17 top-level screens
  systems/      Pure game logic systems (see table above)
  types/        Shared TypeScript interfaces
  utils/        RNG, id generation, suspect/assignment helpers, board layout hashing
```

## Known Limitations

- Interviews currently target civilian witnesses/residents rather than arrested crew members;
  interrogating an arrested suspect directly is a natural extension but isn't wired up yet.
- The evidence board lays pins out with a deterministic hash and free dragging, rather than a
  persisted custom layout saved between sessions — dragged positions reset when you navigate away.
- Chapters 2–5 reuse the same screens and systems as Chapter 1 with new objectives and thresholds
  rather than introducing chapter-specific UI, matching the spec's phased-build guidance (get one
  full chapter working, then expand).
- Audio is limited to a mute toggle and a quiet visual/terminal aesthetic — no generated sound
  effects are wired up yet.
- There is one continuous investigation per save slot; there's no way to branch/replay a single
  chapter in isolation.
