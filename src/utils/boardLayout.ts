export function hashPosition(id: string, seedSalt: number): { x: number; y: number } {
  let h1 = 2166136261 ^ seedSalt
  let h2 = 2166136261 ^ (seedSalt + 7)
  for (let i = 0; i < id.length; i++) {
    h1 = Math.imul(h1 ^ id.charCodeAt(i), 16777619)
    h2 = Math.imul(h2 ^ id.charCodeAt(i), 2166136261)
  }
  const x = 8 + (Math.abs(h1) % 84)
  const y = 10 + (Math.abs(h2) % 80)
  return { x, y }
}
