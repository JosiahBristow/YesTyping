export type Finger =
  | 'lp'
  | 'lr'
  | 'lm'
  | 'li'
  | 'ri'
  | 'rm'
  | 'rr'
  | 'rp'
  | 'th'

export const FINGERS: Finger[] = ['lp', 'lr', 'lm', 'li', 'ri', 'rm', 'rr', 'rp', 'th']

export const FINGER_BY_KEY: Record<string, Finger> = {
  '`': 'lp', '1': 'lp',
  '2': 'lr',
  '3': 'lm',
  '4': 'li', '5': 'li',
  '6': 'ri', '7': 'ri',
  '8': 'rm',
  '9': 'rr',
  '0': 'rp', '-': 'rp', '=': 'rp',
  q: 'lp', w: 'lr', e: 'lm', r: 'li', t: 'li',
  y: 'ri', u: 'ri', i: 'rm', o: 'rr', p: 'rp',
  '[': 'rp', ']': 'rp', '\\': 'rp',
  a: 'lp', s: 'lr', d: 'lm', f: 'li', g: 'li',
  h: 'ri', j: 'ri', k: 'rm', l: 'rr',
  ';': 'rp', "'": 'rp',
  z: 'lp', x: 'lr', c: 'lm', v: 'li', b: 'li',
  n: 'ri', m: 'ri',
  ',': 'rm', '.': 'rr', '/': 'rp',
  ' ': 'th',
}

export const KEYBOARD_ROWS: string[][] = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
]