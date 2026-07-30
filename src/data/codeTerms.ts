import type { CodeTerm } from '../types'

// Coded language used by the Harbor Street Crew on intercepted calls.
// Not explained to the player up front — meanings surface through context and
// are marked `discovered` once the player has seen enough corroborating calls
// or evidence to reasonably infer them.
export const CODE_TERMS: CodeTerm[] = [
  {
    term: 'tickets',
    meaning: 'Packages of narcotics',
    discovered: false,
    context: 'Used when discussing quantities of product moving between coordinators and corners.',
  },
  {
    term: 'concert',
    meaning: 'An incoming shipment',
    discovered: false,
    context: 'Referenced when a delivery is arriving from the supplier.',
  },
  {
    term: 'blue shirts',
    meaning: 'Police officers',
    discovered: false,
    context: 'Used to warn associates that police are nearby or watching.',
  },
  {
    term: 'lunch',
    meaning: 'An in-person meeting',
    discovered: false,
    context: 'Used to arrange face-to-face meetings without naming a location on the phone.',
  },
  {
    term: 'twenty chairs',
    meaning: 'Twenty units of product',
    discovered: false,
    context: 'A quantity reference, chairs standing in for individual units.',
  },
  {
    term: 'the weather',
    meaning: 'General police activity or heat in an area',
    discovered: false,
    context: 'Used to describe how "hot" a corner or route currently is.',
  },
  {
    term: 'cousin',
    meaning: 'A supplier or supply contact',
    discovered: false,
    context: 'A vague family term used to refer to whoever is bringing product in.',
  },
  {
    term: 'the invoice',
    meaning: 'A debt or payment owed',
    discovered: false,
    context: 'Used when discussing money owed up or down the chain.',
  },
  {
    term: 'getting a haircut',
    meaning: 'Going to meet someone privately, away from the street',
    discovered: false,
    context: 'A euphemism for a private, off-the-record sit-down.',
  },
  {
    term: 'the game',
    meaning: 'The overall drug business',
    discovered: false,
    context: 'A general reference to the organization\'s operations as a whole.',
  },
]
