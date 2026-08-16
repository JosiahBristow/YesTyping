export const WORD_POOL: string[] = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'am', 'are', 'was', 'were', 'been', 'had', 'has', 'did', 'does', 'should',
  'may', 'might', 'must', 'shall', 'text', 'learn', 'type', 'key', 'keyboard', 'finger',
  'practice', 'speed', 'word', 'letter', 'hand', 'left', 'right', 'screen', 'lesson', 'course',
  'slow', 'fast', 'careful', 'accurate', 'rhythm', 'muscle', 'memory', 'focus', 'patience', 'progress',
  'record', 'score', 'touch', 'tap', 'press', 'reach', 'stretch', 'home', 'row', 'shift',
  'space', 'enter', 'tab', 'quick', 'brown', 'fox', 'jumps', 'lazy', 'dog', 'five',
  'boxing', 'wizards', 'quickly', 'sphinx', 'quartz', 'judge', 'vow', 'pack', 'dozen', 'liquor',
  'jugs', 'nice', 'meet', 'small', 'town', 'reading', 'writing', 'modern', 'valuable', 'skill',
  'world', 'heart', 'start', 'accuracy', 'extension', 'hands', 'today', 'thank', 'much', 'please',
]

export function generateWords(count: number): string {
  const pool = [...WORD_POOL]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = pool[i]
    pool[i] = pool[j]
    pool[j] = tmp
  }
  const words: string[] = []
  while (words.length < count) {
    for (const w of pool) {
      words.push(w)
      if (words.length >= count) break
    }
  }
  return words.join(' ')
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministic word list shared by all players in a race room. */
export function generateSeededWords(count: number, seed: number): string {
  const rand = mulberry32(seed)
  const pool = [...WORD_POOL]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = pool[i]
    pool[i] = pool[j]
    pool[j] = tmp
  }
  const words: string[] = []
  while (words.length < count) {
    for (const w of pool) {
      words.push(w)
      if (words.length >= count) break
    }
  }
  return words.join(' ')
}