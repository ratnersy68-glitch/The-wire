// Procedurally generated sound effects via Web Audio API — no audio files,
// no copyrighted material. Every effect is synthesized on demand.

let sharedCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!sharedCtx) sharedCtx = new AC()
  if (sharedCtx.state === 'suspended') void sharedCtx.resume()
  return sharedCtx
}

function tone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  gainPeak: number,
  startAt = 0,
  glideTo?: number,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt)
  if (glideTo) {
    osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + startAt + duration)
  }
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt)
  gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + startAt + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime + startAt)
  osc.stop(ctx.currentTime + startAt + duration + 0.02)
}

function noiseBurst(ctx: AudioContext, duration: number, gainPeak: number, startAt = 0, highpass = 800) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = highpass
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(gainPeak, ctx.currentTime + startAt)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration)

  src.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  src.start(ctx.currentTime + startAt)
  src.stop(ctx.currentTime + startAt + duration + 0.02)
}

export type SoundKind =
  | 'nav'
  | 'click'
  | 'success'
  | 'error'
  | 'shutter'
  | 'pin'
  | 'stamp'
  | 'phone'
  | 'type'
  | 'notify'
  | 'toggleOn'

export function playSound(kind: SoundKind, muted: boolean): void {
  if (muted) return
  const ctx = getContext()
  if (!ctx) return

  try {
    switch (kind) {
      case 'nav':
        tone(ctx, 520, 0.06, 'triangle', 0.05)
        break
      case 'click':
        tone(ctx, 700, 0.04, 'square', 0.035)
        break
      case 'success':
        tone(ctx, 440, 0.09, 'triangle', 0.06)
        tone(ctx, 660, 0.14, 'triangle', 0.06, 0.09)
        break
      case 'error':
        tone(ctx, 220, 0.18, 'sawtooth', 0.05, 0, 130)
        break
      case 'shutter':
        noiseBurst(ctx, 0.03, 0.18, 0, 2000)
        tone(ctx, 180, 0.05, 'square', 0.05, 0.03)
        break
      case 'pin':
        tone(ctx, 1400, 0.03, 'square', 0.04)
        tone(ctx, 900, 0.03, 'square', 0.03, 0.02)
        break
      case 'stamp':
        tone(ctx, 90, 0.12, 'square', 0.08)
        noiseBurst(ctx, 0.05, 0.06, 0, 400)
        break
      case 'phone':
        tone(ctx, 480, 0.12, 'sine', 0.05)
        tone(ctx, 480, 0.12, 'sine', 0.05, 0.22)
        break
      case 'type':
        tone(ctx, 1800 + Math.random() * 400, 0.015, 'square', 0.02)
        break
      case 'notify':
        tone(ctx, 800, 0.05, 'sine', 0.05)
        tone(ctx, 1100, 0.08, 'sine', 0.05, 0.06)
        break
      case 'toggleOn':
        tone(ctx, 600, 0.05, 'sine', 0.05)
        tone(ctx, 900, 0.06, 'sine', 0.05, 0.05)
        break
    }
  } catch {
    // Audio can fail silently (autoplay policy, unsupported browser) — never break gameplay over it.
  }
}
