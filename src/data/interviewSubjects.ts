import type { InterviewSubject } from '../types'

export const INTERVIEW_SUBJECTS: InterviewSubject[] = [
  {
    id: 'wit_whitmore',
    name: 'Gloria Whitmore',
    role: 'witness',
    trust: 30,
    fear: 60,
    honesty: 70,
    motivation: 'Wants the corner outside her window shut down but is scared of retaliation.',
    relationshipToOrg: 'Lives above Fenwick & 9th. Sees everything, says little.',
    interviewed: false,
  },
  {
    id: 'wit_suggs',
    name: 'Ray Suggs',
    role: 'witness',
    trust: 45,
    fear: 35,
    honesty: 55,
    motivation: 'Store clerk who\'d rather not get involved but resents being used as a stash point.',
    relationshipToOrg: 'Works the register at the Quick Stop. Knows more than he lets on.',
    interviewed: false,
  },
  {
    id: 'wit_odell',
    name: 'Odell Marsh',
    role: 'resident',
    trust: 50,
    fear: 20,
    honesty: 80,
    motivation: 'Retired longshoreman, fed up with vacant houses being used as stash spots.',
    relationshipToOrg: 'Lives near the Poole Street rowhouse. Keeps a mental log of comings and goings.',
    interviewed: false,
  },
]
