import { FINGER_BY_KEY, type Finger } from './fingerMap'

export type LayoutId = 'qwerty' | 'dvorak' | 'colemak'

export const LAYOUTS: LayoutId[] = ['qwerty', 'dvorak', 'colemak']

const DVORAK: Record<string, string> = {
  '-': '[',
  '=': ']',
  '[': '/',
  ']': '=',
  q: "'",
  w: ',',
  e: '.',
  r: 'p',
  t: 'y',
  y: 'f',
  u: 'g',
  i: 'c',
  o: 'r',
  p: 'l',
  a: 'a',
  s: 'o',
  d: 'e',
  f: 'u',
  g: 'i',
  h: 'd',
  j: 'h',
  k: 't',
  l: 'n',
  ';': 's',
  "'": '-',
  z: ';',
  x: 'q',
  c: 'j',
  v: 'k',
  b: 'x',
  n: 'b',
  m: 'm',
  ',': 'w',
  '.': 'v',
  '/': 'z',
}

const COLEMAK: Record<string, string> = {
  q: 'q',
  w: 'w',
  e: 'f',
  r: 'p',
  t: 'g',
  y: 'j',
  u: 'l',
  i: 'u',
  o: 'y',
  p: ';',
  a: 'a',
  s: 'r',
  d: 's',
  f: 't',
  g: 'd',
  h: 'h',
  j: 'n',
  k: 'e',
  l: 'i',
  ';': 'o',
  z: 'z',
  x: 'x',
  c: 'c',
  v: 'v',
  b: 'b',
  n: 'k',
  m: 'm',
}

const SHIFT_KEYS: Record<string, string> = {
  '!': '1',
  '@': '2',
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  _: '-',
  '+': '=',
  '{': '[',
  '}': ']',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
}

const LAYOUT_MAP: Record<Exclude<LayoutId, 'qwerty'>, Record<string, string>> = {
  dvorak: DVORAK,
  colemak: COLEMAK,
}

const LAYOUT_REVERSE: Record<Exclude<LayoutId, 'qwerty'>, Record<string, string>> = {
  dvorak: Object.fromEntries(Object.entries(DVORAK).map(([k, v]) => [v, k])),
  colemak: Object.fromEntries(Object.entries(COLEMAK).map(([k, v]) => [v, k])),
}

export function charAtKey(key: string, layout: LayoutId): string {
  const map = LAYOUT_MAP[layout as Exclude<LayoutId, 'qwerty'>]
  return map?.[key] ?? key
}

export function keyForChar(ch: string, layout: LayoutId = 'qwerty'): string {
  if (ch === ' ') return 'space'
  const lower = ch.toLowerCase()
  const base = SHIFT_KEYS[ch] ?? lower
  if (layout === 'qwerty') return base
  return LAYOUT_REVERSE[layout][base] ?? base
}

export function fingerForChar(ch: string, layout: LayoutId = 'qwerty'): Finger | null {
  return FINGER_BY_KEY[keyForChar(ch, layout)] ?? null
}