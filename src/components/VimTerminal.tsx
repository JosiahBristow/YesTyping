import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createVimState,
  handleKey,
  modeLabel,
  visualRange,
  type VimState,
} from '../features/vim/miniVim'
import { playError, playKey } from '../lib/sound'

function normalizeKey(e: KeyboardEvent): string | null {
  if (e.metaKey || e.ctrlKey || e.altKey) return null
  if (e.key === 'Enter') return 'Enter'
  if (e.key === 'Backspace') return 'Backspace'
  if (e.key === 'Escape') return 'Escape'
  if (e.key === 'Tab') return 'Tab'
  if (e.key.length === 1) return e.key
  return null
}

interface CharSeg {
  ch: string
  cls: string
}

function rowChars(line: string, row: number, state: VimState): CharSeg[] {
  const sel = visualRange(state)
  const segs: CharSeg[] = []
  let selFrom: number | null = null
  let selTo: number | null = null
  if (sel) {
    if (sel.kind === 'lines') {
      if (row >= sel.fromRow && row <= sel.toRow) {
        selFrom = 0
        selTo = line.length
      }
    } else if (row >= sel.from.row && row <= sel.to.row) {
      selFrom = row === sel.from.row ? sel.from.col : 0
      selTo = row === sel.to.row ? sel.to.col : line.length
    }
  }
  for (let c = 0; c < line.length; c++) {
    let cls = ''
    if (selFrom !== null && selTo !== null && c >= selFrom && c < selTo) cls = 'sel'
    if (row === state.row && c === state.col) cls += cls ? ' cur' : 'cur'
    segs.push({ ch: line[c], cls })
  }
  if (row === state.row && state.col >= line.length) {
    segs.push({ ch: ' ', cls: 'cur' })
  }
  return segs
}

export function VimTerminal() {
  const { t } = useTranslation()
  const [state, setState] = useState<VimState>(() => createVimState())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = normalizeKey(e)
      if (key === null) return
      const handled = /^[\x20-\x7e]$/.test(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape' || key === 'Tab'
      if (handled) e.preventDefault()
      const res = handleKey(state, key)
      setState(res.state)
      if (res.sound === 'error') playError()
      else playKey()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state])

  const pending = []
  if (state.register) pending.push(`"${state.register}`)
  if (state.pendingDigits) pending.push(state.pendingDigits)
  if (state.op) pending.push(state.op)
  if (state.textObjectPrefix) pending.push(state.textObjectPrefix)
  const pendingStr = pending.join(' ')

  const input = state.mode === 'command' ? ':' + state.cmdInput : state.mode === 'search' ? (state.lastSearchBackward ? '?' : '/') + state.searchInput : ''

  return (
    <div className="vim-term">
      <div className="vt-titlebar">
        <span className="vt-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="vt-title">vim — yestyping</span>
        <button
          type="button"
          className="vt-reset"
          onClick={() => setState(createVimState())}
        >
          ↺ {t('vimTerminal.reset')}
        </button>
      </div>

      <div className="vt-body">
        {state.lines.map((line, i) => (
          <div className="vt-row" key={i}>
            <span className="vt-gutter">{String(i + 1).padStart(2, '0')}</span>
            <span className="vt-line">
              {rowChars(line, i, state).map((s, c) =>
                s.cls ? (
                  <span key={c} className={`vt-ch ${s.cls}`}>
                    {s.ch}
                  </span>
                ) : (
                  s.ch
                ),
              )}
            </span>
          </div>
        ))}
        {input !== '' && <div className="vt-input">{input}<span className="vt-caret" /></div>}
      </div>

      <div className="vt-status">
        <span className="vt-mode">
          {modeLabel(state.mode)}
          {pendingStr && <span className="vt-pending"> {pendingStr}</span>}
        </span>
        <span className={`vt-msg${state.statusIsError ? ' err' : ''}`}>{state.status || '\u00a0'}</span>
      </div>

      <div className="vt-help">
        <span>hjkl {t('vimTerminal.move')} · w/b/e {t('vimTerminal.words')} · dd {t('vimTerminal.delete')} · yy {t('vimTerminal.yank')} · p {t('vimTerminal.paste')} · u {t('vimTerminal.undo')} · . {t('vimTerminal.repeat')} · ciw {t('vimTerminal.change')} · v {t('vimTerminal.visual')} · / {t('vimTerminal.search')} · : {t('vimTerminal.commands')}</span>
      </div>
    </div>
  )
}