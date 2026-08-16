export type EngineMode = 'lesson' | 'timed'

export interface EngineResult {
  mode: EngineMode
  wpm: number
  cpm: number
  accuracy: number
  consistency: number
  correctChars: number
  wrongChars: number
  elapsedSec: number
  samples: number[]
  maxCombo: number
  keyErrors: Record<string, number>
}

export function wpm(correctChars: number, seconds: number): number {
  if (seconds <= 0) return 0
  return Math.round(correctChars / 5 / (seconds / 60))
}

export function cpm(correctChars: number, seconds: number): number {
  if (seconds <= 0) return 0
  return Math.round(correctChars / (seconds / 60))
}

export function accuracy(correct: number, wrong: number): number {
  const typed = correct + wrong
  if (typed <= 0) return 0
  return Math.round((correct / typed) * 100)
}

export function consistencyOf(samples: number[]): number {
  const vals = samples.filter((s) => s > 0)
  if (vals.length < 2) return 100
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length
  const cv = Math.sqrt(variance) / mean
  return Math.max(0, Math.round(100 - cv * 100))
}

export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = Math.round(totalSec % 60)
  if (m === 0) return `${s}s`
  if (m >= 60) return `${(m / 60).toFixed(1)}h`
  return `${m}m ${s}s`
}

export function formatClock(seconds: number): string {
  const s = Math.floor(seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}