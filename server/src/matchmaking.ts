const queue: string[] = [] // socket ids waiting for quick play

export function enqueue(socketId: string) {
  if (!queue.includes(socketId)) queue.push(socketId)
}

export function dequeue(socketId: string) {
  const idx = queue.indexOf(socketId)
  if (idx !== -1) queue.splice(idx, 1)
}

/** Pops a pair off the queue if available, randomly assigning roles. */
export function tryPair(): { policeSocketId: string; orgSocketId: string } | null {
  if (queue.length < 2) return null
  const a = queue.shift()!
  const b = queue.shift()!
  return Math.random() < 0.5 ? { policeSocketId: a, orgSocketId: b } : { policeSocketId: b, orgSocketId: a }
}
