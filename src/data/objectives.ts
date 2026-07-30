import type { Objective } from '../types'

export const OBJECTIVES: Objective[] = [
  // Chapter 1 — Street Corners (tutorial integrated)
  {
    id: 'obj_c1_assign_surveillance',
    chapter: 1,
    text: 'Assign a detective to surveil a known corner.',
    completed: false,
    hint: 'Open Operations Dashboard, pick a detective, and assign them to Surveillance at a corner on the City Map.',
  },
  {
    id: 'obj_c1_identify_dealer',
    chapter: 1,
    text: 'Identify at least one street-level dealer.',
    completed: false,
    hint: 'Surveillance reports will name suspects once a detective gets a clean look at them.',
  },
  {
    id: 'obj_c1_add_evidence',
    chapter: 1,
    text: 'Add a piece of evidence to the case board.',
    completed: false,
    hint: 'Open the Evidence Board and add a report or photograph from your daily reports.',
  },
  {
    id: 'obj_c1_connect_suspects',
    chapter: 1,
    text: 'Draw a connection between two suspects on the evidence board.',
    completed: false,
    hint: 'On the Evidence Board, select two nodes and choose a relationship to connect them.',
  },
  {
    id: 'obj_c1_wiretap_warrant',
    chapter: 1,
    text: 'Build probable cause and get a wiretap warrant approved.',
    completed: false,
    hint: 'Evidence strength needs to be high enough before a prosecutor will support a wiretap request.',
  },

  // Chapter 2 — The Phones
  {
    id: 'obj_c2_decode_terms',
    chapter: 2,
    text: 'Decode at least three coded terms from intercepted calls.',
    completed: false,
  },
  {
    id: 'obj_c2_identify_midlevel',
    chapter: 2,
    text: 'Identify at least one mid-level member of the organization.',
    completed: false,
  },
  {
    id: 'obj_c2_discover_stash',
    chapter: 2,
    text: 'Discover a stash house or storage location.',
    completed: false,
  },

  // Chapter 3 — The Supply Line
  {
    id: 'obj_c3_identify_supplier',
    chapter: 3,
    text: 'Identify the organization\'s main supplier.',
    completed: false,
  },
  {
    id: 'obj_c3_discover_vehicle',
    chapter: 3,
    text: 'Discover a vehicle used to move product.',
    completed: false,
  },
  {
    id: 'obj_c3_follow_shipment',
    chapter: 3,
    text: 'Follow a suspect to a shipment location.',
    completed: false,
  },

  // Chapter 4 — Money and Influence
  {
    id: 'obj_c4_financial_investigation',
    chapter: 4,
    text: 'Launch a financial investigation into the organization.',
    completed: false,
  },
  {
    id: 'obj_c4_discover_front',
    chapter: 4,
    text: 'Discover a front business used to launder money.',
    completed: false,
  },
  {
    id: 'obj_c4_identify_money_manager',
    chapter: 4,
    text: 'Identify the organization\'s money manager.',
    completed: false,
  },

  // Chapter 5 — The Takedown
  {
    id: 'obj_c5_search_warrant',
    chapter: 5,
    text: 'Secure a search warrant for a key location.',
    completed: false,
  },
  {
    id: 'obj_c5_raid',
    chapter: 5,
    text: 'Conduct a raid.',
    completed: false,
  },
  {
    id: 'obj_c5_takedown',
    chapter: 5,
    text: 'Decide who to arrest and close the case.',
    completed: false,
  },
]

export const CHAPTER_TITLES: Record<number, string> = {
  1: 'Chapter 1: Street Corners',
  2: 'Chapter 2: The Phones',
  3: 'Chapter 3: The Supply Line',
  4: 'Chapter 4: Money and Influence',
  5: 'Chapter 5: The Takedown',
}

export const CHAPTER_BRIEFS: Record<number, string> = {
  1: 'Corners are moving product in West Terrace, Franklin Row, and Old Market. Nobody upstairs knows who\'s running it yet. Start watching.',
  2: 'A judge signed off on the wire. Every call is a puzzle — nobody says what they mean. Listen close.',
  3: 'The product has to come from somewhere. Vehicles, warehouses, and a supply line are starting to take shape.',
  4: 'Follow the money and it stops being about drugs. Front businesses, donations, and favors owed all lead somewhere.',
  5: 'The case is as strong as it\'s going to get. Now it\'s about when to move, and who\'s worth moving on.',
}
