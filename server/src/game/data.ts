import type { LocationType, OrgLocation, OrgMember, OrgRole, PhoneLine } from '../shared/mpTypes.js'
import { STARTING_NETWORK_SIZE } from '../shared/mpTypes.js'
import { makeRng } from './rng.js'

const DISTRICTS = ['Old Market', 'Docklands', 'The Row', 'Eights', 'West Terrace', 'Fenwick', 'Central Business District']

const CODENAMES = [
  'Ghost', 'Prophet', 'Trace', 'Wire', 'Rook', 'Marlowe', 'Cutlass', 'Vega',
  'Lowtide', 'Slim', 'Hollis', 'Rooster', 'Tanner', 'Bishop', 'Crow', 'Duke',
  'Fenn', 'Gable', 'Harlan', 'Jinx', 'Kite', 'Lace', 'Moss', 'Nash',
]

const STASH_NAMES = ['a boarded rowhouse', 'a self-storage unit', 'a vacant apartment', 'a garage off the alley', 'a back room at a laundromat']
const CORNER_NAMES = ['Fenwick & 9th', 'Lombard Court', 'Quick Stop lot', 'the underpass', 'North Point strip']
const MEETING_NAMES = ['a diner booth', 'a barbershop back room', 'a church parking lot', 'a pool hall', 'a car wash bay']
const FRONT_NAMES = ['a corner store', 'a tow lot', 'a nail salon', 'a used-tire shop', 'a vending route office']

function locationName(type: LocationType, rand: () => number, pick: <T>(a: T[]) => T) {
  switch (type) {
    case 'stash_house': return pick(STASH_NAMES)
    case 'corner': return pick(CORNER_NAMES)
    case 'meeting_spot': return pick(MEETING_NAMES)
    case 'front_business': return pick(FRONT_NAMES)
  }
}

export interface GeneratedRoster {
  members: OrgMember[]
  locations: OrgLocation[]
  phones: PhoneLine[]
}

export function generateRoster(seed: number): GeneratedRoster {
  const rng = makeRng(seed)
  const locations: OrgLocation[] = []
  const locTypes: LocationType[] = ['stash_house', 'stash_house', 'corner', 'corner', 'corner', 'meeting_spot', 'meeting_spot', 'front_business']
  locTypes.forEach((type, i) => {
    locations.push({
      id: `loc_${i}`,
      name: locationName(type, rng.next, (a) => rng.pick(a)),
      district: rng.pick(DISTRICTS),
      type,
      active: true,
      localHeat: rng.int(0, 10),
    })
  })

  const stashLocations = locations.filter((l) => l.type === 'stash_house')
  const meetingLocations = locations.filter((l) => l.type === 'meeting_spot')
  const cornerLocations = locations.filter((l) => l.type === 'corner')

  const names = rng.shuffle(CODENAMES).slice(0, STARTING_NETWORK_SIZE)
  const members: OrgMember[] = []
  const phones: PhoneLine[] = []

  const roleForIndex = (i: number): OrgRole => {
    if (i === 0) return 'leader'
    if (i <= 2) return 'lieutenant'
    if (i <= 5) return 'courier'
    return 'dealer'
  }

  names.forEach((codename, i) => {
    const role = roleForIndex(i)
    const base =
      role === 'leader' || role === 'lieutenant'
        ? rng.pick(meetingLocations).id
        : role === 'courier'
          ? rng.pick(stashLocations).id
          : rng.pick(cornerLocations).id
    const phoneId = `phone_${i}`
    phones.push({ id: phoneId, ownerId: `member_${i}`, active: true })
    members.push({
      id: `member_${i}`,
      codename,
      role,
      status: 'active',
      phoneId,
      baseLocationId: base,
      paranoia: rng.int(0, 15),
      identifiedByPolice: false,
    })
  })

  return { members, locations, phones }
}
