// Pure placement logic for the word-rain game (no React), kept separate so
// it can be unit-tested in isolation. Field coordinates are percentages.

export interface PlacedWord {
  word: string
  x: number
  y: number
}

const CHAR_WIDTH_PCT = 1.9
const WORD_GAP_PCT = 1.5
const NEAR_TOP_Y = 28
const SPAWN_X_MIN = 5
const SPAWN_X_MAX = 95

export function wordWidth(word: string): number {
  return word.length * CHAR_WIDTH_PCT + WORD_GAP_PCT
}

/**
 * Pick a center-x (in % of the field width) for `word` that does not overlap
 * any existing word still near the top of the field. All words fall at the
 * same speed, so words far enough apart vertically never collide, and this
 * only needs to guard against words that are still close to the spawn line.
 * Returns null when there is no free slot.
 */
export function pickSpawnX(word: string, existing: PlacedWord[]): number | null {
  const w = wordWidth(word)
  const xMin = SPAWN_X_MIN + w / 2
  const xMax = SPAWN_X_MAX - w / 2
  if (xMax < xMin) return null
  const candidates: number[] = []
  for (let x = xMin; x <= xMax; x += Math.max(2, w / 2)) candidates.push(x)
  for (let i = 0; i < 40; i++) candidates.push(xMin + Math.random() * (xMax - xMin))
  const valid = candidates.filter((x) => {
    const start = x - w / 2
    const end = x + w / 2
    return !existing.some((o) => {
      if (o.y > NEAR_TOP_Y) return false
      const ow = wordWidth(o.word)
      const oStart = o.x - ow / 2
      const oEnd = o.x + ow / 2
      return start < oEnd && end > oStart
    })
  })
  if (valid.length === 0) return null
  return valid[Math.floor(Math.random() * valid.length)]
}