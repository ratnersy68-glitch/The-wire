// Deterministic PRNG so a match's procedural roster can be regenerated from
// its seed if ever needed (debugging, replay). mulberry32 — small, fast,
// good-enough distribution for flavor generation, not cryptography.
export function mulberry32(seed: number) {
  let a = seed
  return function rand() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRng(seed: number) {
  const rand = mulberry32(seed)
  return {
    next: rand,
    int(min: number, max: number) {
      return Math.floor(rand() * (max - min + 1)) + min
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(rand() * arr.length)]
    },
    shuffle<T>(arr: T[]): T[] {
      const copy = arr.slice()
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    },
  }
}
