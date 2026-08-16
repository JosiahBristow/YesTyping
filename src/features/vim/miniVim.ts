export type VimMode = 'normal' | 'insert' | 'visual' | 'command' | 'search'

export type VimOp = 'd' | 'c' | 'y'

export type TextObjectKey = 'iw' | 'aw' | 'i"' | 'a"' | 'i(' | 'a(' | 'it' | 'at'

export interface VimPos {
  row: number
  col: number
}

export type Motion =
  | 'h'
  | 'l'
  | 'j'
  | 'k'
  | 'w'
  | 'b'
  | 'e'
  | 'ge'
  | '0'
  | '$'
  | '^'
  | 'gg'
  | 'G'

export interface Snapshot {
  lines: string[]
  row: number
  col: number
}

export type EditRange =
  | { kind: 'lines'; fromRow: number; toRow: number }
  | { kind: 'chars'; from: VimPos; to: VimPos }

export interface Repeat {
  kind: 'dd' | 'cc' | 'yy' | 'x' | 'X' | 'p' | 'P' | 'delete' | 'change' | 'insert'
  count: number
  motion?: Motion | TextObjectKey
  text?: string
}

export interface VimState {
  lines: string[]
  row: number
  col: number
  mode: VimMode
  pendingDigits: string
  count: number
  op: VimOp | null
  textObjectPrefix: 'i' | 'a' | null
  replaceChar: string | null
  register: string | null
  awaitRegister: boolean
  awaitG: boolean
  visualStart: VimPos | null
  visualLine: boolean
  lastSearch: string | null
  lastSearchBackward: boolean
  cmdInput: string
  searchInput: string
  status: string
  statusIsError: boolean
  undoStack: Snapshot[]
  redoStack: Snapshot[]
  registers: Record<string, string>
  pasteLinewise: boolean
  lastRepeat: Repeat | null
  insertAccum: string
  insertUndoDone: boolean
}

export interface HandleResult {
  state: VimState
  sound: 'key' | 'error'
}

export const DEFAULT_LINES: string[] = [
  'The quick brown fox jumps over the lazy dog.',
  'Pack my box with five dozen liquor jugs.',
  'How vexingly quick daft zebras jump!',
  'Sphinx of black quartz, judge my vow.',
]

const FRESH_BUFFERS: string[][] = [
  ['The quick brown fox jumps over the lazy dog.'],
  [
    'The quick brown fox jumps over the lazy dog.',
    'Pack my box with five dozen liquor jugs.',
    'How vexingly quick daft zebras jump!',
    'Sphinx of black quartz, judge my vow.',
  ],
  [
    'vim is a text editor',
    'h j k l move the cursor around',
    'dd deletes a line, yy yanks it',
    'p pastes, u undoes, . repeats',
    'escape returns to normal mode',
  ],
  [
    'abc def ghi jkl mno pqr stu vwx yz',
    'aaa bbb ccc ddd eee fff ggg hhh',
    'one two three four five six seven',
    'alpha beta gamma delta epsilon zeta',
  ],
]

export function createVimState(initialLines?: string[]): VimState {
  return {
    lines: (initialLines ?? DEFAULT_LINES).slice(),
    row: 0,
    col: 0,
    mode: 'normal',
    pendingDigits: '',
    count: 0,
    op: null,
    textObjectPrefix: null,
    replaceChar: null,
    register: null,
    awaitRegister: false,
    awaitG: false,
    visualStart: null,
    visualLine: false,
    lastSearch: null,
    lastSearchBackward: false,
    cmdInput: '',
    searchInput: '',
    status: '',
    statusIsError: false,
    undoStack: [],
    redoStack: [],
    registers: {},
    pasteLinewise: false,
    lastRepeat: null,
    insertAccum: '',
    insertUndoDone: false,
  }
}

function snapshotOf(state: VimState): Snapshot {
  return { lines: state.lines.slice(), row: state.row, col: state.col }
}

function pushUndo(state: VimState): void {
  state.undoStack.push(snapshotOf(state))
  if (state.undoStack.length > 200) state.undoStack.shift()
}

function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && /[A-Za-z0-9_]/.test(ch)
}

function beep(state: VimState, msg: string): void {
  state.status = msg
  state.statusIsError = true
}

function setMsg(state: VimState, msg: string): void {
  state.status = msg
  state.statusIsError = false
}

function clampCol(state: VimState): void {
  const len = state.lines[state.row].length
  if (state.col > len) state.col = len
  if (state.col < 0) state.col = 0
}

function firstNonBlank(line: string): number {
  let i = 0
  while (i < line.length && line[i] === ' ') i++
  return i
}

/* ---------- word motions ---------- */

function fwdWordStart(lines: string[], row: number, col: number): VimPos {
  let r = row
  let c = col
  const line = lines[r]
  if (c < line.length) {
    const word = isWordChar(line[c])
    while (c < line.length && isWordChar(line[c]) === word) c++
  }
  while (c < line.length && line[c] === ' ') c++
  if (c < line.length) return { row: r, col: c }
  r++
  while (r < lines.length) {
    const l = lines[r]
    let i = 0
    while (i < l.length && l[i] === ' ') i++
    if (i < l.length) return { row: r, col: i }
    r++
  }
  return { row, col }
}

function backWordStart(lines: string[], row: number, col: number): VimPos {
  let r = row
  let c = col
  for (;;) {
    c--
    if (c >= 0) {
      if (lines[r][c] === ' ') continue
      const word = isWordChar(lines[r][c])
      while (c > 0 && isWordChar(lines[r][c - 1]) === word) c--
      return { row: r, col: c }
    }
    r--
    if (r < 0) return { row, col }
    c = lines[r].length
  }
}

function fwdWordEnd(lines: string[], row: number, col: number): VimPos {
  let r = row
  let c = col
  if (c < lines[r].length && lines[r][c] === ' ') {
    while (c < lines[r].length && lines[r][c] === ' ') c++
  }
  if (c >= lines[r].length) {
    r++
    while (r < lines.length) {
      const l = lines[r]
      let i = 0
      while (i < l.length && l[i] === ' ') i++
      if (i < l.length) {
        const word = isWordChar(l[i])
        let j = i
        while (j < l.length && isWordChar(l[j]) === word) j++
        return { row: r, col: j - 1 }
      }
      r++
    }
    return { row, col }
  }
  const word = isWordChar(lines[r][c])
  let j = c
  while (j < lines[r].length && isWordChar(lines[r][j]) === word) j++
  return { row: r, col: j - 1 }
}

function backWordEnd(lines: string[], row: number, col: number): VimPos {
  let r = row
  let c = col
  if (c > 0 && isWordChar(lines[r][c - 1])) {
    while (c > 0 && isWordChar(lines[r][c - 1])) c--
  }
  for (;;) {
    c--
    if (c >= 0) {
      if (lines[r][c] === ' ') continue
      return { row: r, col: c }
    }
    r--
    if (r < 0) return { row, col }
    c = lines[r].length
  }
}

/* ---------- cursor motion ---------- */

function applyMotion(state: VimState, motion: Motion): boolean {
  const { lines, row, col } = state
  switch (motion) {
    case 'h':
      if (col <= 0) return false
      state.col--
      return true
    case 'l':
      if (col >= lines[row].length) return false
      state.col++
      return true
    case 'j': {
      if (row >= lines.length - 1) return false
      state.row++
      clampCol(state)
      return true
    }
    case 'k': {
      if (row <= 0) return false
      state.row--
      clampCol(state)
      return true
    }
    case 'w': {
      const p = fwdWordStart(lines, row, col)
      if (p.row === row && p.col === col) return false
      state.row = p.row
      state.col = p.col
      return true
    }
    case 'b': {
      const p = backWordStart(lines, row, col)
      if (p.row === row && p.col === col) return false
      state.row = p.row
      state.col = p.col
      return true
    }
    case 'e': {
      const p = fwdWordEnd(lines, row, col)
      if (p.row === row && p.col === col) return false
      state.row = p.row
      state.col = p.col
      return true
    }
    case 'ge': {
      const p = backWordEnd(lines, row, col)
      if (p.row === row && p.col === col) return false
      state.row = p.row
      state.col = p.col
      return true
    }
    case '0':
      state.col = 0
      return true
    case '$':
      state.col = lines[row].length
      return true
    case '^':
      state.col = firstNonBlank(lines[row])
      return true
    case 'gg':
      state.row = 0
      state.col = 0
      return true
    case 'G':
      state.row = lines.length - 1
      state.col = 0
      return true
  }
}

function moveWithCount(state: VimState, motion: Motion): boolean {
  const n = Math.max(state.count, 1)
  for (let i = 0; i < n; i++) {
    if (!applyMotion(state, motion)) return false
  }
  return true
}

/* ---------- ranges for operators ---------- */

function textObjectRange(state: VimState, obj: TextObjectKey): EditRange | null {
  const { lines, row, col } = state
  const line = lines[row]
  if (col >= line.length) return null

  switch (obj) {
    case 'iw': {
      const ch = line[col]
      let s = col
      let e = col
      if (isWordChar(ch)) {
        while (s > 0 && isWordChar(line[s - 1])) s--
        while (e < line.length && isWordChar(line[e])) e++
      } else if (ch === ' ') {
        let l = col
        while (l > 0 && line[l] === ' ') l--
        if (l === 0 || !isWordChar(line[l])) return { kind: 'chars', from: { row, col }, to: { row, col: col + 1 } }
        s = l
        e = l
        while (s > 0 && isWordChar(line[s - 1])) s--
        while (e < line.length && isWordChar(line[e])) e++
      } else {
        while (s > 0 && line[s - 1] === ch) s--
        while (e < line.length && line[e] === ch) e++
      }
      return { kind: 'chars', from: { row, col: s }, to: { row, col: e } }
    }
    case 'aw': {
      const base = textObjectRange(state, 'iw')
      if (!base || base.kind !== 'chars') return base
      const r = base.from.row
      let to = base.to.col
      if (to < lines[r].length && lines[r][to] === ' ') to++
      else if (base.from.col > 0 && lines[r][base.from.col - 1] === ' ') {
        return { kind: 'chars', from: { row: r, col: base.from.col - 1 }, to: base.to }
      }
      return { kind: 'chars', from: base.from, to: { row: r, col: to } }
    }
    case 'i"':
    case 'a"': {
      const left = line.lastIndexOf('"', col - 1)
      const right = line.indexOf('"', col + 1)
      if (left === -1 || right === -1) return null
      const fromCol = obj === 'i"' ? left + 1 : left
      const toCol = obj === 'i"' ? right : right + 1
      return { kind: 'chars', from: { row, col: fromCol }, to: { row, col: toCol } }
    }
    case 'i(':
    case 'a(': {
      const left = line.lastIndexOf('(', col - 1)
      const right = line.indexOf(')', col + 1)
      if (left === -1 || right === -1) return null
      const fromCol = obj === 'i(' ? left + 1 : left
      const toCol = obj === 'i(' ? right : right + 1
      return { kind: 'chars', from: { row, col: fromCol }, to: { row, col: toCol } }
    }
    case 'it':
    case 'at': {
      let openIdx = -1
      for (let i = col; i >= 0; i--) {
        if (line[i] === '<') {
          openIdx = i
          break
        }
      }
      if (openIdx === -1) return null
      const close = line.indexOf('>', openIdx)
      if (close === -1 || close >= col) return null
      const m = /^(\w+)/.exec(line.slice(openIdx + 1, close).trim())
      if (!m) return null
      const end = line.indexOf(`</${m[1]}>`, col)
      if (end === -1) return null
      if (obj === 'it') {
        return { kind: 'chars', from: { row, col: close + 1 }, to: { row, col: end } }
      }
      return {
        kind: 'chars',
        from: { row, col: openIdx },
        to: { row, col: end + `</${m[1]}>`.length },
      }
    }
  }
}

function motionEnd(state: VimState, motion: Motion, from: VimPos): VimPos | null {
  const tmp: VimState = {
    ...state,
    lines: state.lines,
    row: from.row,
    col: from.col,
  }
  if (!applyMotion(tmp, motion)) return null
  return { row: tmp.row, col: tmp.col }
}

function opRange(state: VimState, motion: Motion | TextObjectKey, count: number): EditRange | null {
  if (typeof motion === 'string' && /^[ia]/.test(motion)) {
    return textObjectRange(state, motion as TextObjectKey)
  }
  const m = motion as Motion
  const { lines, row, col } = state
  const n = Math.max(count, 1)

  switch (m) {
    case 'h': {
      const fromCol = Math.max(0, col - n)
      if (fromCol === col) return null
      return { kind: 'chars', from: { row, col: fromCol }, to: { row, col } }
    }
    case 'l': {
      const toCol = Math.min(lines[row].length, col + n)
      if (toCol === col) return null
      return { kind: 'chars', from: { row, col }, to: { row, col: toCol } }
    }
    case 'j':
      return { kind: 'lines', fromRow: row, toRow: Math.min(lines.length - 1, row + n) }
    case 'k':
      return { kind: 'lines', fromRow: Math.max(0, row - n), toRow: row }
    case 'gg':
      return { kind: 'chars', from: { row: 0, col: 0 }, to: { row, col } }
    case 'G':
      return {
        kind: 'chars',
        from: { row, col },
        to: { row: lines.length - 1, col: lines[lines.length - 1].length },
      }
    case '0':
      return { kind: 'chars', from: { row, col: 0 }, to: { row, col } }
    case '^':
      return { kind: 'chars', from: { row, col: firstNonBlank(lines[row]) }, to: { row, col } }
    case '$': {
      const toRow = Math.min(lines.length - 1, row + n - 1)
      return { kind: 'chars', from: { row, col }, to: { row: toRow, col: lines[toRow].length } }
    }
    case 'w':
    case 'b':
    case 'e':
    case 'ge': {
      if (m === 'b' || m === 'ge') {
        let cur: VimPos = { row, col }
        const start: VimPos = { row, col }
        let range: EditRange | null = null
        for (let i = 0; i < n; i++) {
          const end = motionEnd(state, m, cur)
          if (!end) break
          range = { kind: 'chars', from: end, to: start }
          cur = end
        }
        return range
      }
      let cur: VimPos = { row, col }
      let range: EditRange | null = null
      for (let i = 0; i < n; i++) {
        const end = motionEnd(state, m, cur)
        if (!end) break
        range = { kind: 'chars', from: cur, to: end }
        cur = end
      }
      return range
    }
  }
}

/* ---------- text editing ---------- */

function sliceRange(state: VimState, range: EditRange): string {
  const { lines } = state
  if (range.kind === 'lines') {
    return lines.slice(range.fromRow, range.toRow + 1).join('\n')
  }
  const { from, to } = range
  if (from.row === to.row) {
    return lines[from.row].slice(from.col, to.col)
  }
  const parts: string[] = []
  parts.push(lines[from.row].slice(from.col))
  for (let r = from.row + 1; r < to.row; r++) parts.push(lines[r])
  parts.push(lines[to.row].slice(0, to.col))
  return parts.join('\n')
}

function deleteRange(state: VimState, range: EditRange): void {
  const { lines } = state
  if (range.kind === 'lines') {
    lines.splice(range.fromRow, range.toRow - range.fromRow + 1)
    if (lines.length === 0) lines.push('')
    state.row = Math.min(range.fromRow, lines.length - 1)
    state.col = 0
    return
  }
  const { from, to } = range
  if (from.row === to.row) {
    const line = lines[from.row]
    lines[from.row] = line.slice(0, from.col) + line.slice(to.col)
    state.row = from.row
    state.col = Math.min(from.col, lines[from.row].length)
    return
  }
  const merged = lines[from.row].slice(0, from.col) + lines[to.row].slice(to.col)
  const next: string[] = []
  for (let r = 0; r < from.row; r++) next.push(lines[r])
  next.push(merged)
  for (let r = to.row + 1; r < lines.length; r++) next.push(lines[r])
  state.lines = next
  state.row = from.row
  state.col = Math.min(from.col, merged.length)
}

function insertTextAt(
  state: VimState,
  text: string,
  row: number,
  col: number,
  linewise: boolean,
  below: boolean,
): void {
  const parts = text.split('\n')
  const { lines } = state
  if (linewise) {
    const insertRow = below ? row + 1 : row
    lines.splice(insertRow, 0, ...parts)
    state.row = insertRow
    state.col = 0
    return
  }
  if (parts.length === 1) {
    const line = lines[row]
    lines[row] = line.slice(0, col) + parts[0] + line.slice(col)
    state.row = row
    state.col = col + parts[0].length
    return
  }
  const head = lines[row].slice(0, col) + parts[0]
  const tail = parts[parts.length - 1] + lines[row].slice(col)
  const middle = parts.slice(1, -1)
  const next: string[] = []
  for (let r = 0; r < row; r++) next.push(lines[r])
  next.push(head, ...middle, tail)
  for (let r = row + 1; r < lines.length; r++) next.push(lines[r])
  state.lines = next
  state.row = row + parts.length - 1
  state.col = parts[parts.length - 1].length
}

function storeToRegister(state: VimState, text: string, linewise: boolean): void {
  state.registers['0'] = text
  if (state.register) state.registers[state.register] = text
  state.pasteLinewise = linewise
}

function paste(state: VimState, below: boolean): void {
  const target = state.register ?? '0'
  const text = state.registers[target]
  if (text === undefined) {
    beep(state, 'E353: Nothing in register ' + (state.register ?? '0'))
    return
  }
  pushUndo(state)
  insertTextAt(state, text, state.row, state.col, state.pasteLinewise, below)
  state.lastRepeat = {
    kind: below ? 'p' : 'P',
    count: 1,
    text,
  }
  state.pendingDigits = ''
  state.count = 0
  state.redoStack.length = 0
}

function applyRepeat(state: VimState, rep: Repeat): void {
  const n = Math.max(rep.count, 1)

  if (rep.kind === 'yy') {
    const toRow = Math.min(state.lines.length - 1, state.row + n - 1)
    const text = state.lines.slice(state.row, toRow + 1).join('\n')
    storeToRegister(state, text, true)
    return
  }

  if (rep.kind === 'dd') {
    pushUndo(state)
    const toRow = Math.min(state.lines.length - 1, state.row + n - 1)
    const text = state.lines.slice(state.row, toRow + 1).join('\n')
    storeToRegister(state, text, true)
    const range: EditRange = { kind: 'lines', fromRow: state.row, toRow }
    deleteRange(state, range)
    state.redoStack.length = 0
    return
  }

  if (rep.kind === 'cc') {
    pushUndo(state)
    const toRow = Math.min(state.lines.length - 1, state.row + n - 1)
    const range: EditRange = { kind: 'lines', fromRow: state.row, toRow }
    deleteRange(state, range)
    if (rep.text !== undefined) {
      const parts = rep.text.split('\n')
      state.lines.splice(state.row, 0, ...parts)
      state.col = parts[0].length
    }
    state.redoStack.length = 0
    return
  }

  if (rep.kind === 'delete' || rep.kind === 'change') {
    if (rep.motion === undefined) return
    const range = opRange(state, rep.motion, n)
    if (!range) {
      beep(state, 'E474: Invalid operand')
      return
    }
    pushUndo(state)
    const text = sliceRange(state, range)
    storeToRegister(state, text, range.kind === 'lines')
    deleteRange(state, range)
    state.redoStack.length = 0
    if (rep.kind === 'change' && rep.text !== undefined && rep.text.length > 0) {
      if (range.kind === 'lines') {
        const parts = rep.text.split('\n')
        state.lines.splice(state.row, 0, ...parts)
        state.col = parts[0].length
      } else {
        insertTextAt(state, rep.text, state.row, state.col, false, true)
      }
    }
    return
  }

  if (rep.kind === 'x' || rep.kind === 'X') {
    pushUndo(state)
    if (rep.kind === 'x') {
      const line = state.lines[state.row]
      if (state.col >= line.length) {
        beep(state, 'E550: Character not found')
        return
      }
      const to = Math.min(line.length, state.col + n)
      const text = line.slice(state.col, to)
      storeToRegister(state, text, false)
      state.lines[state.row] = line.slice(0, state.col) + line.slice(to)
    } else {
      if (state.col <= 0) {
        beep(state, 'E550: Character not found')
        return
      }
      const from = Math.max(0, state.col - n)
      const text = state.lines[state.row].slice(from, state.col)
      storeToRegister(state, text, false)
      state.lines[state.row] =
        state.lines[state.row].slice(0, from) + state.lines[state.row].slice(state.col)
      state.col = from
    }
    state.redoStack.length = 0
    return
  }

  if (rep.kind === 'p' || rep.kind === 'P') {
    paste(state, rep.kind === 'p')
    return
  }

  if (rep.kind === 'insert' && rep.text !== undefined && rep.text.length > 0) {
    pushUndo(state)
    insertTextAt(state, rep.text, state.row, state.col, false, true)
    state.redoStack.length = 0
  }
}

function doUndo(state: VimState): void {
  const snap = state.undoStack.pop()
  if (!snap) {
    beep(state, 'E541: Already at oldest change')
    return
  }
  state.redoStack.push(snapshotOf(state))
  state.lines = snap.lines
  state.row = snap.row
  state.col = snap.col
  clampCol(state)
}

function doRedo(state: VimState): void {
  const snap = state.redoStack.pop()
  if (!snap) {
    beep(state, 'E5: No redo')
    return
  }
  state.undoStack.push(snapshotOf(state))
  state.lines = snap.lines
  state.row = snap.row
  state.col = snap.col
  clampCol(state)
}

/* ---------- operators ---------- */

function applyOp(state: VimState, op: VimOp, motion: Motion | TextObjectKey, count: number): boolean {
  const range = opRange(state, motion, count)
  if (!range) {
    beep(state, `E474: Invalid operand for ${op}${motion}`)
    return false
  }

  if (op === 'y') {
    const text = sliceRange(state, range)
    storeToRegister(state, text, range.kind === 'lines')
    setMsg(state, `${text.split('\n').length} ${text.split('\n').length === 1 ? 'line' : 'lines'} yanked`)
    return true
  }

  pushUndo(state)
  const text = sliceRange(state, range)
  storeToRegister(state, text, range.kind === 'lines')

  if (op === 'd') {
    deleteRange(state, range)
    state.redoStack.length = 0
    state.pendingDigits = ''
    state.count = 0
    state.lastRepeat = {
      kind: range.kind === 'lines' ? 'dd' : 'delete',
      count,
      motion,
      text,
    }
    if (state.row >= state.lines.length) state.row = state.lines.length - 1
    clampCol(state)
    return true
  }

  if (op === 'c') {
    const before = { row: state.row, col: state.col }
    const linewise = range.kind === 'lines'
    deleteRange(state, range)
    state.redoStack.length = 0
    if (linewise) {
      state.lines.splice(state.row, 0, '')
      state.col = 0
    } else {
      state.row = before.row
      state.col = before.col
      if (state.row >= state.lines.length) state.row = state.lines.length - 1
      clampCol(state)
    }
    state.mode = 'insert'
    state.insertAccum = ''
    state.insertUndoDone = true
    if (linewise) {
      state.lastRepeat = { kind: 'cc', count, text: '' }
    } else {
      state.lastRepeat = { kind: 'change', count, motion, text: '' }
    }
    return true
  }
  return true
}

function applyLineOp(state: VimState, op: VimOp, count: number): boolean {
  const n = Math.max(count, 1)
  const toRow = Math.min(state.lines.length - 1, state.row + n - 1)
  const range: EditRange = { kind: 'lines', fromRow: state.row, toRow }

  if (op === 'y') {
    const text = state.lines.slice(state.row, toRow + 1).join('\n')
    storeToRegister(state, text, true)
    setMsg(state, `${n} ${n === 1 ? 'line' : 'lines'} yanked`)
    return true
  }

  pushUndo(state)
  const text = state.lines.slice(state.row, toRow + 1).join('\n')
  storeToRegister(state, text, true)

  if (op === 'd') {
    deleteRange(state, range)
    state.redoStack.length = 0
    state.pendingDigits = ''
    state.count = 0
    state.lastRepeat = { kind: 'dd', count: n, text }
    return true
  }

  if (op === 'c') {
    deleteRange(state, range)
    state.lines.splice(state.row, 0, '')
    state.col = 0
    state.redoStack.length = 0
    state.mode = 'insert'
    state.insertAccum = ''
    state.insertUndoDone = true
    state.lastRepeat = { kind: 'cc', count: n, text: '' }
    return true
  }
  return true
}

function applyChangeInsert(state: VimState): void {
  const rep = state.lastRepeat
  if (!rep) return
  if (rep.kind === 'cc' || rep.kind === 'change' || rep.kind === 'insert') {
    rep.text = state.insertAccum
  }
}

/* ---------- visual ---------- */

export function visualRange(state: VimState): EditRange | null {
  if (!state.visualStart) return null
  const a = state.visualStart
  const b = { row: state.row, col: state.col }
  if (state.visualLine) {
    return {
      kind: 'lines',
      fromRow: Math.min(a.row, b.row),
      toRow: Math.max(a.row, b.row),
    }
  }
  const fromRow = Math.min(a.row, b.row)
  const toRow = Math.max(a.row, b.row)
  if (fromRow === toRow) {
    const fromCol = Math.min(a.col, b.col)
    let toCol = Math.max(a.col, b.col)
    if (toCol === fromCol) toCol++
    return { kind: 'chars', from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } }
  }
  const anchorIsTop = a.row === fromRow
  return {
    kind: 'chars',
    from: { row: fromRow, col: anchorIsTop ? a.col : b.col },
    to: { row: toRow, col: anchorIsTop ? b.col : a.col },
  }
}

export function visualSelectionRows(state: VimState): { start: number; end: number } | null {
  if (!state.visualStart) return null
  const a = state.visualStart
  const b = { row: state.row, col: state.col }
  return { start: Math.min(a.row, b.row), end: Math.max(a.row, b.row) }
}

/* ---------- search ---------- */

function doSearch(state: VimState, backward: boolean): void {
  const pattern = state.searchInput
  if (!pattern) {
    state.mode = 'normal'
    return
  }
  const found = findMatch(state, pattern, backward)
  if (found) {
    state.lastSearch = pattern
    state.lastSearchBackward = backward
    state.row = found.row
    state.col = found.col
    state.mode = 'normal'
    setMsg(state, `/ ${pattern}`)
    return
  }
  beep(state, `E486: Pattern not found: ${pattern}`)
  state.mode = 'normal'
}

function findMatch(state: VimState, pattern: string, backward: boolean): VimPos | null {
  const { lines } = state
  const startRow = state.row
  const startCol = state.col
  if (!backward) {
    for (let r = 0; r < lines.length; r++) {
      const rr = (startRow + r) % lines.length
      const fromCol = rr === startRow ? startCol + 1 : 0
      if (fromCol > lines[rr].length) continue
      const idx = lines[rr].indexOf(pattern, fromCol)
      if (idx !== -1) return { row: rr, col: idx }
    }
    return null
  }
  for (let r = 0; r < lines.length; r++) {
    const rr = (startRow - r + lines.length) % lines.length
    const line = lines[rr]
    const searchUntil = rr === startRow ? startCol - 1 : line.length - 1
    if (searchUntil < 0) continue
    for (let c = searchUntil; c >= 0; c--) {
      if (line.startsWith(pattern, c)) return { row: rr, col: c }
    }
  }
  return null
}

function repeatSearch(state: VimState, forward: boolean): void {
  if (!state.lastSearch) {
    beep(state, 'E486: No previous search')
    return
  }
  const found = findMatch(state, state.lastSearch, !forward)
  if (!found) {
    beep(state, `E486: Pattern not found: ${state.lastSearch}`)
    return
  }
  state.row = found.row
  state.col = found.col
}

/* ---------- command mode ---------- */

function executeCommand(state: VimState): void {
  const cmd = state.cmdInput.trim()
  state.cmdInput = ''
  state.mode = 'normal'
  if (!cmd) return
  const first = cmd.split(/\s+/)[0].toLowerCase()
  switch (first) {
    case 'w':
      setMsg(state, 'written (simulated — this is a sandbox)')
      return
    case 'q':
    case 'q!':
    case 'wq':
    case 'wq!':
    case 'x':
    case 'x!':
      state.lines = FRESH_BUFFERS[Math.floor(Math.random() * FRESH_BUFFERS.length)].slice()
      state.row = 0
      state.col = 0
      setMsg(state, 'exited — fresh buffer loaded')
      return
    case 'split':
      setMsg(state, 'This is a sandbox — :split needs a real window')
      return
    case 'vsplit':
      setMsg(state, 'This is a sandbox — :vsplit needs a real window')
      return
    case 'bn':
      setMsg(state, 'next buffer (simulated)')
      return
    case 'bp':
      setMsg(state, 'previous buffer (simulated)')
      return
    case 'bd':
      setMsg(state, 'buffer deleted (simulated)')
      return
    case 'e':
    case 'edit':
      setMsg(state, 'This is a sandbox — no files to open')
      return
    default:
      beep(state, `Not an editor command: ${first}`)
  }
}

/* ---------- entry point ---------- */

function enterInsert(state: VimState, where: 'before' | 'after' | 'start' | 'end' | 'below' | 'above'): void {
  if (!state.insertUndoDone) {
    pushUndo(state)
    state.insertUndoDone = true
  }
  if (where === 'before') {
    // stays at col
  } else if (where === 'after') {
    if (state.col < state.lines[state.row].length) state.col++
  } else if (where === 'start') {
    state.col = 0
  } else if (where === 'end') {
    state.col = state.lines[state.row].length
  } else if (where === 'below') {
    state.lines.splice(state.row + 1, 0, '')
    state.row++
    state.col = 0
  } else if (where === 'above') {
    state.lines.splice(state.row, 0, '')
    state.col = 0
  }
  state.mode = 'insert'
  state.insertAccum = ''
  state.pendingDigits = ''
  state.count = 0
  state.lastRepeat = { kind: 'insert', count: 1, text: '' }
}

function handleInsertKey(state: VimState, key: string): void {
  if (key === 'Escape') {
    applyChangeInsert(state)
    state.mode = 'normal'
    state.insertAccum = ''
    state.insertUndoDone = false
    clampCol(state)
    return
  }
  if (!state.insertUndoDone) {
    pushUndo(state)
    state.insertUndoDone = true
  }
  if (key === 'Backspace') {
    if (state.col <= 0) {
      beep(state, 'E349: No undoable changes')
      return
    }
    const line = state.lines[state.row]
    const removed = line[state.col - 1]
    state.lines[state.row] = line.slice(0, state.col - 1) + line.slice(state.col)
    state.col--
    if (removed === '\n') return
    state.insertAccum = state.insertAccum.slice(0, -1)
    return
  }
  if (key === 'Enter') {
    const line = state.lines[state.row]
    state.lines[state.row] = line.slice(0, state.col)
    state.lines.splice(state.row + 1, 0, line.slice(state.col))
    state.row++
    state.col = 0
    state.insertAccum += '\n'
    return
  }
  if (key === 'Tab') {
    const line = state.lines[state.row]
    state.lines[state.row] = line.slice(0, state.col) + '  ' + line.slice(state.col)
    state.col += 2
    state.insertAccum += '  '
    return
  }
  if (key.length === 1 && key.charCodeAt(0) >= 32) {
    const line = state.lines[state.row]
    state.lines[state.row] = line.slice(0, state.col) + key + line.slice(state.col)
    state.col++
    state.insertAccum += key
  }
}

function startVisual(state: VimState, linewise: boolean): void {
  state.mode = 'visual'
  state.visualStart = { row: state.row, col: state.col }
  state.visualLine = linewise
  state.pendingDigits = ''
  state.count = 0
  state.op = null
  state.textObjectPrefix = null
}

function handleVisualKey(state: VimState, key: string): HandleResult {
  const isMotion = (k: string): k is Motion =>
    k === 'h' || k === 'l' || k === 'j' || k === 'k' || k === 'w' || k === 'b' || k === 'e' ||
    k === 'ge' || k === '0' || k === '$' || k === '^' || k === 'gg' || k === 'G'

  if (key >= '0' && key <= '9') {
    if (key === '0' && state.pendingDigits.length > 0) state.pendingDigits += '0'
    else if (key === '0' && state.pendingDigits.length === 0) {
      return { state: handleMotionKey(state, '0'), sound: 'key' }
    } else state.pendingDigits += key
    state.count = parseInt(state.pendingDigits, 10)
    return { state, sound: 'key' }
  }
  if (isMotion(key)) {
    const n = Math.max(state.count, 1)
    for (let i = 0; i < n; i++) {
      if (!applyMotion(state, key)) {
        beep(state, 'E550: Character not found')
        break
      }
    }
    state.pendingDigits = ''
    state.count = 0
    return { state, sound: 'key' }
  }
  if (key === 'Escape' || key === 'v') {
    state.mode = 'normal'
    state.visualStart = null
    state.visualLine = false
    return { state, sound: 'key' }
  }
  if (key === 'V') {
    state.visualLine = !state.visualLine
    return { state, sound: 'key' }
  }
  if (key === 'o') {
    const start = state.visualStart
    if (start) {
      state.visualStart = { row: state.row, col: state.col }
      state.row = start.row
      state.col = start.col
    }
    return { state, sound: 'key' }
  }
  if (key === 'y') {
    const range = visualRange(state)
    const start = state.visualStart
    state.mode = 'normal'
    state.visualStart = null
    state.visualLine = false
    state.pendingDigits = ''
    state.count = 0
    if (range) {
      const text = sliceRange(state, range)
      storeToRegister(state, text, range.kind === 'lines')
      setMsg(state, `${range.kind === 'lines' ? 'lines' : 'characters'} yanked`)
    }
    if (start) {
      state.row = start.row
      state.col = start.col
      clampCol(state)
    }
    return { state, sound: 'key' }
  }
  if (key === 'd' || key === 'x') {
    const range = visualRange(state)
    const start = state.visualStart
    state.mode = 'normal'
    state.visualStart = null
    state.visualLine = false
    state.pendingDigits = ''
    state.count = 0
    if (range) {
      pushUndo(state)
      const text = sliceRange(state, range)
      storeToRegister(state, text, range.kind === 'lines')
      deleteRange(state, range)
      state.redoStack.length = 0
      state.lastRepeat = { kind: 'dd', count: 1, text }
      state.op = null
    }
    if (start) {
      state.row = start.row
      state.col = start.col
      if (state.row >= state.lines.length) state.row = state.lines.length - 1
      clampCol(state)
    }
    return { state, sound: 'key' }
  }
  if (key === 'c') {
    const range = visualRange(state)
    const start = state.visualStart
    state.mode = 'normal'
    state.visualStart = null
    state.visualLine = false
    state.pendingDigits = ''
    state.count = 0
    if (range) {
      const linewise = range.kind === 'lines'
      pushUndo(state)
      const text = sliceRange(state, range)
      storeToRegister(state, text, range.kind === 'lines')
      deleteRange(state, range)
      if (linewise) state.lines.splice(state.row, 0, '')
      state.redoStack.length = 0
      state.mode = 'insert'
      state.insertAccum = ''
      state.insertUndoDone = true
      state.lastRepeat = { kind: range.kind === 'lines' ? 'cc' : 'change', count: 1, text: '' }
      state.op = null
    }
    if (start) {
      state.row = start.row
      state.col = start.col
      if (state.row >= state.lines.length) state.row = state.lines.length - 1
      clampCol(state)
    }
    return { state, sound: 'key' }
  }
  return { state, sound: 'error' }
}

function handleMotionKey(state: VimState, key: string): VimState {
  if (!moveWithCount(state, key as Motion)) {
    beep(state, 'E550: Character not found')
  }
  state.pendingDigits = ''
  state.count = 0
  return state
}

const MOTION_KEYS = new Set<Motion>(['h', 'l', 'j', 'k', 'w', 'b', 'e', 'ge', '0', '$', '^', 'gg', 'G'])
const TEXT_OBJECT_TARGETS = new Set(['w', '"', '(', 't'])

function isMotionKey(key: string): key is Motion {
  return MOTION_KEYS.has(key as Motion)
}

export function handleKey(prev: VimState, key: string): HandleResult {
  const state = prev
  state.status = ''
  state.statusIsError = false

  if (state.mode === 'insert') {
    handleInsertKey(state, key)
    return { state, sound: state.statusIsError ? 'error' : 'key' }
  }

  if (state.mode === 'visual') {
    return handleVisualKey(state, key)
  }

  if (state.mode === 'command') {
    if (key === 'Escape') {
      state.mode = 'normal'
      state.cmdInput = ''
      return { state, sound: 'key' }
    }
    if (key === 'Backspace') {
      state.cmdInput = state.cmdInput.slice(0, -1)
      return { state, sound: 'key' }
    }
    if (key === 'Enter') {
      executeCommand(state)
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    }
    if (key.length === 1 && key.charCodeAt(0) >= 32) {
      state.cmdInput += key
      return { state, sound: 'key' }
    }
    return { state, sound: 'error' }
  }

  if (state.mode === 'search') {
    if (key === 'Escape') {
      state.mode = 'normal'
      state.searchInput = ''
      return { state, sound: 'key' }
    }
    if (key === 'Backspace') {
      state.searchInput = state.searchInput.slice(0, -1)
      return { state, sound: 'key' }
    }
    if (key === 'Enter') {
      doSearch(state, state.lastSearchBackward)
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    }
    if (key.length === 1 && key.charCodeAt(0) >= 32) {
      state.searchInput += key
      return { state, sound: 'key' }
    }
    return { state, sound: 'error' }
  }

  /* normal mode */

  if (state.awaitRegister) {
    state.awaitRegister = false
    if (key === '"') {
      state.register = null
      return { state, sound: 'key' }
    }
    if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
      state.register = key
      return { state, sound: 'key' }
    }
    state.register = null
    return { state, sound: 'key' }
  }

  if (state.awaitG) {
    state.awaitG = false
    if (key === 'g') {
      return { state: handleMotionKey(state, 'gg'), sound: 'key' }
    }
    return { state, sound: 'key' }
  }

  if (state.replaceChar !== null) {
    const ch = key
    state.replaceChar = null
    if (ch.length === 1 && ch.charCodeAt(0) >= 32 && state.col < state.lines[state.row].length) {
      pushUndo(state)
      const line = state.lines[state.row]
      state.lines[state.row] = line.slice(0, state.col) + ch + line.slice(state.col + 1)
      state.redoStack.length = 0
      state.pendingDigits = ''
      state.count = 0
    }
    return { state, sound: 'key' }
  }

  if (state.textObjectPrefix !== null) {
    const prefix = state.textObjectPrefix
    state.textObjectPrefix = null
    if (TEXT_OBJECT_TARGETS.has(key)) {
      const obj = (prefix + key) as TextObjectKey
      if (state.op) {
        applyOp(state, state.op, obj, state.count)
        state.op = null
        state.pendingDigits = ''
        state.count = 0
        return { state, sound: state.statusIsError ? 'error' : 'key' }
      }
      beep(state, 'E30: No operator')
      return { state, sound: 'error' }
    }
    beep(state, 'E474: Invalid text object')
    return { state, sound: 'error' }
  }

  if (key >= '1' && key <= '9') {
    if (state.op !== null && state.pendingDigits.length > 0) {
      state.pendingDigits = key
    } else {
      state.pendingDigits += key
    }
    state.count = parseInt(state.pendingDigits, 10)
    return { state, sound: 'key' }
  }

  if (key === '0' && state.pendingDigits.length > 0) {
    state.pendingDigits = state.op !== null ? '0' : state.pendingDigits + '0'
    state.count = parseInt(state.pendingDigits, 10)
    return { state, sound: 'key' }
  }

  if (state.op !== null) {
    if (key === 'd' || key === 'c' || key === 'y') {
      if (key === state.op) {
        applyLineOp(state, state.op, Math.max(state.count, 1))
        state.op = null
        state.pendingDigits = ''
        state.count = 0
        return { state, sound: state.statusIsError ? 'error' : 'key' }
      }
      beep(state, 'E474: Invalid operand')
      state.op = null
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: 'error' }
    }
    if (key === '.') {
      const rep: Repeat | null = state.lastRepeat
      state.op = null
      state.pendingDigits = ''
      state.count = 0
      if (rep) {
        applyRepeat(state, rep)
        return { state, sound: state.statusIsError ? 'error' : 'key' }
      }
      beep(state, 'E29: No previous command')
      return { state, sound: 'error' }
    }
    if (key === 'i' || key === 'a') {
      state.textObjectPrefix = key
      return { state, sound: 'key' }
    }
    if (isMotionKey(key)) {
      applyOp(state, state.op, key, state.count)
      state.op = null
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    }
    beep(state, 'E474: Invalid operand')
    state.op = null
    state.pendingDigits = ''
    state.count = 0
    return { state, sound: 'error' }
  }

  switch (key) {
    case 'h':
    case 'l':
    case 'j':
    case 'k':
    case 'w':
    case 'b':
    case 'e':
    case 'ge':
    case '$':
    case '^':
    case 'G':
      return { state: handleMotionKey(state, key), sound: state.statusIsError ? 'error' : 'key' }
    case '0':
      return { state: handleMotionKey(state, '0'), sound: 'key' }
    case 'g':
      state.awaitG = true
      return { state, sound: 'key' }
    case 'd':
    case 'c':
    case 'y':
      state.op = key
      return { state, sound: 'key' }
    case 'i':
      enterInsert(state, 'before')
      return { state, sound: 'key' }
    case 'a':
      enterInsert(state, 'after')
      return { state, sound: 'key' }
    case 'I':
      enterInsert(state, 'start')
      return { state, sound: 'key' }
    case 'A':
      enterInsert(state, 'end')
      return { state, sound: 'key' }
    case 'o':
      enterInsert(state, 'below')
      return { state, sound: 'key' }
    case 'O':
      enterInsert(state, 'above')
      return { state, sound: 'key' }
    case 'x': {
      const n = Math.max(state.count, 1)
      const line = state.lines[state.row]
      if (state.col >= line.length) {
        beep(state, 'E550: Character not found')
        state.pendingDigits = ''
        state.count = 0
        return { state, sound: 'error' }
      }
      pushUndo(state)
      const to = Math.min(line.length, state.col + n)
      const text = line.slice(state.col, to)
      storeToRegister(state, text, false)
      state.lines[state.row] = line.slice(0, state.col) + line.slice(to)
      state.redoStack.length = 0
      state.lastRepeat = { kind: 'x', count: n, text }
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: 'key' }
    }
    case 'X': {
      const n = Math.max(state.count, 1)
      if (state.col <= 0) {
        beep(state, 'E550: Character not found')
        state.pendingDigits = ''
        state.count = 0
        return { state, sound: 'error' }
      }
      pushUndo(state)
      const from = Math.max(0, state.col - n)
      const text = state.lines[state.row].slice(from, state.col)
      storeToRegister(state, text, false)
      state.lines[state.row] = state.lines[state.row].slice(0, from) + state.lines[state.row].slice(state.col)
      state.col = from
      state.redoStack.length = 0
      state.lastRepeat = { kind: 'X', count: n, text }
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: 'key' }
    }
    case 's': {
      const line = state.lines[state.row]
      if (state.col >= line.length) {
        beep(state, 'E550: Character not found')
        state.pendingDigits = ''
        state.count = 0
        return { state, sound: 'error' }
      }
      pushUndo(state)
      const to = Math.min(line.length, state.col + Math.max(state.count, 1))
      state.lines[state.row] = line.slice(0, state.col) + line.slice(to)
      state.redoStack.length = 0
      state.mode = 'insert'
      state.insertAccum = ''
      state.insertUndoDone = true
      state.lastRepeat = { kind: 'change', count: Math.max(state.count, 1), motion: 'l', text: '' }
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: 'key' }
    }
    case 'S':
      state.op = null
      applyLineOp(state, 'c', Math.max(state.count, 1))
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    case 'r':
      if (state.col >= state.lines[state.row].length) {
        beep(state, 'E550: Character not found')
        state.pendingDigits = ''
        state.count = 0
        return { state, sound: 'error' }
      }
      state.replaceChar = ''
      return { state, sound: 'key' }
    case '~': {
      const line = state.lines[state.row]
      const ch = line[state.col]
      if (ch === undefined) {
        beep(state, 'E550: Character not found')
        state.pendingDigits = ''
        state.count = 0
        return { state, sound: 'error' }
      }
      pushUndo(state)
      const upper = ch.toUpperCase()
      const toggled = ch === upper ? ch.toLowerCase() : upper
      state.lines[state.row] = line.slice(0, state.col) + toggled + line.slice(state.col + 1)
      if (state.col < state.lines[state.row].length) state.col++
      state.redoStack.length = 0
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: 'key' }
    }
    case 'J': {
      if (state.row >= state.lines.length - 1) {
        beep(state, 'E55: Unmatched bracket')
        state.pendingDigits = ''
        state.count = 0
        return { state, sound: 'error' }
      }
      pushUndo(state)
      const cur = state.lines[state.row]
      const next = state.lines[state.row + 1]
      state.lines[state.row] = cur.trimEnd() + (next.length > 0 && cur.trimEnd().length > 0 ? ' ' : '') + next.trimStart()
      state.lines.splice(state.row + 1, 1)
      state.col = cur.trimEnd().length
      state.redoStack.length = 0
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: 'key' }
    }
    case 'u':
      doUndo(state)
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    case 'U':
      doRedo(state)
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    case '.': {
      const rep = state.lastRepeat
      state.pendingDigits = ''
      state.count = 0
      if (rep) {
        applyRepeat(state, rep)
        return { state, sound: state.statusIsError ? 'error' : 'key' }
      }
      beep(state, 'E29: No previous command')
      return { state, sound: 'error' }
    }
    case 'p':
      paste(state, true)
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    case 'P':
      paste(state, false)
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    case 'v':
      startVisual(state, false)
      return { state, sound: 'key' }
    case 'V':
      startVisual(state, true)
      return { state, sound: 'key' }
    case ':':
      state.mode = 'command'
      state.cmdInput = ''
      return { state, sound: 'key' }
    case '/':
      state.mode = 'search'
      state.searchInput = ''
      state.lastSearchBackward = false
      return { state, sound: 'key' }
    case '?':
      state.mode = 'search'
      state.searchInput = ''
      state.lastSearchBackward = true
      return { state, sound: 'key' }
    case 'n':
      repeatSearch(state, true)
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    case 'N':
      repeatSearch(state, false)
      state.pendingDigits = ''
      state.count = 0
      return { state, sound: state.statusIsError ? 'error' : 'key' }
    case '"':
      state.awaitRegister = true
      return { state, sound: 'key' }
    default:
      return { state, sound: 'error' }
  }
}

export function modeLabel(mode: VimMode): string {
  switch (mode) {
    case 'normal':
      return '-- NORMAL --'
    case 'insert':
      return '-- INSERT --'
    case 'visual':
      return '-- VISUAL --'
    case 'command':
      return '-- : --'
    case 'search':
      return '-- / --'
  }
}