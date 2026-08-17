import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useTypingEngine } from './useTypingEngine'
import { fingerForChar, keyForChar, needsShift, shiftSideForKey } from './layouts'
import { NUMPAD_FINGER } from './fingerMap'
import type { EngineResult } from './metrics'
import { evaluatePass, formatClock, type PassVerdict } from './metrics'
import { Keyboard } from '../../components/Keyboard'
import { Numpad } from '../../components/Numpad'
import { KeyboardToggle } from '../../components/KeyboardToggle'
import { PassBanner } from '../../components/PassBanner'
import { ResultSummary } from '../../components/ResultSummary'
import { HandOverlay } from '../../components/HandOverlay'
import { LayoutPicker } from '../../components/LayoutPicker'
import { TypeArea } from './TypeArea'
import { cn } from '../../lib/cn'
import { useLayout } from '../../lib/layout'
import { useSettings } from '../../lib/settings'
import { useLang, type Bi } from '../../lib/lang'

export interface TypingSessionProps {
  text: string
  numpad?: boolean
  autoSpace?: boolean
  hints?: Bi[]
  hanzi?: string[]
  graded?: boolean
  onFinish?: (result: EngineResult) => void
  onNext?: () => void
  onPrev?: () => void
}

interface EngineProps extends TypingSessionProps {
  onRestart: () => void
}

function Engine({ text, numpad = false, autoSpace = false, hints, hanzi, graded = false, onFinish, onNext, onPrev, onRestart }: EngineProps) {
  const { t } = useTranslation()
  const layout = useLayout((s) => s.layout)
  const lang = useLang((s) => s.lang)
  const showKeyboard = useSettings((s) => s.showKeyboard)
  const [result, setResult] = useState<EngineResult | null>(null)
  const hintTexts = hints?.map((hint) => (lang === 'zh' ? hint.zh : hint.en))
  const engine = useTypingEngine({
    text,
    requireNumpad: numpad,
    autoSpace,
    layout,
    onFinish: (r) => {
      setResult(r)
      onFinish?.(r)
    },
  })

  const typeViewportRef = useRef<HTMLDivElement>(null)
  const typeScrollRef = useRef<HTMLDivElement>(null)

  // Keep one row visible and snap the current line to the top.
  const measureViewport = useCallback(() => {
    const vp = typeViewportRef.current
    const scroll = typeScrollRef.current
    if (!vp || !scroll) return
    const area = scroll.querySelector('.type-area')
    if (!area) return

    // The caret can sit on a space, which has no char element — fall back to
    // the nearest typed character (a space always shares its word's line).
    let el = scroll.querySelector<HTMLElement>(`[data-index="${engine.index}"]`)
    if (!el) {
      for (let d = 1; d <= 64 && !el; d++) {
        el =
          scroll.querySelector<HTMLElement>(`[data-index="${engine.index - d}"]`) ??
          scroll.querySelector<HTMLElement>(`[data-index="${engine.index + d}"]`)
      }
    }
    if (!el) return

    const cell = el.closest<HTMLElement>('.word-cell, .hanzi-cell')
    const stacked = area.classList.contains('with-hints') || area.classList.contains('with-hanzi')
    let rowHeight: number
    let rowTop: number
    if (cell && stacked) {
      // Hints/hanzi rows: the cell is a flex column that spans the full row.
      rowHeight = cell.offsetHeight
      rowTop = cell.offsetTop
    } else {
      // Plain text: an inline char's offsetHeight is its font box, not the
      // line box, so recover the line top via the half-leading gap.
      const lineHeight = parseFloat(getComputedStyle(area).lineHeight) || el.offsetHeight
      const halfLeading = (lineHeight - el.offsetHeight) / 2
      rowHeight = lineHeight
      rowTop = el.offsetTop - halfLeading
    }
    vp.style.height = `${rowHeight}px`
    vp.scrollTop = Math.max(0, rowTop)
  }, [engine.index])

  useLayoutEffect(() => {
    measureViewport()
  })

  useEffect(() => {
    const onResize = () => measureViewport()
    window.addEventListener('resize', onResize)
    // The webfont loads after mount and re-wraps the lines — re-measure once
    // it's ready and whenever the content reflows.
    void document.fonts?.ready.then(onResize).catch(() => {})
    const ro = new ResizeObserver(onResize)
    const scrollEl = typeScrollRef.current
    if (scrollEl) ro.observe(scrollEl)
    return () => {
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [measureViewport])

  const verdict: PassVerdict | null = result && graded ? evaluatePass(result, text.length) : null

  const currentChar = engine.finished ? null : text[engine.index]
  const activeKey = numpad ? currentChar : currentChar ? keyForChar(currentChar, layout) : null
  const finger = numpad
    ? currentChar
      ? (NUMPAD_FINGER[currentChar] ?? (currentChar === ' ' ? 'th' : null))
      : null
    : currentChar
      ? fingerForChar(currentChar, layout)
      : null
  const lastWasWrong = engine.index > 0 && engine.states[engine.index - 1] === 'wrong'
  const nextKeyLabel = currentChar === ' ' ? 'Space' : currentChar
  const shiftNeeded = currentChar !== null && needsShift(currentChar)
  const shiftSide = shiftNeeded && activeKey ? shiftSideForKey(activeKey) : null
  const progressPct = engine.text.length
    ? Math.min(100, Math.round((engine.correctChars / engine.text.length) * 100))
    : 0

  useEffect(() => {
    if (!result) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      const el = document.activeElement
      if (el instanceof HTMLElement && el.closest('button')) return
      onNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, onNext])

  return (
    <div className="session-grid">
      <div className="session-main">
      <div className="stats-bar">
        <div className="stat">
          <b>{engine.wpm}</b>
          <span>{t('practice.wpm')}</span>
        </div>
        <div className="stat">
          <b>{engine.accuracy}%</b>
          <span>{t('practice.accuracy')}</span>
        </div>
        <div className="stat">
          <b>{formatClock(engine.elapsed)}</b>
          <span>{t('practice.time')}</span>
        </div>
        {engine.combo >= 10 && (
          <span className="combo-badge" key={engine.combo} aria-label={`${t('practice.combo')} ${engine.combo}`}>
            🔥 {engine.combo}
          </span>
        )}
        <div className="spacer" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRestart}>
          ↺ {t('practice.restart')}
        </button>
      </div>

      <div className="type-viewport" ref={typeViewportRef}>
          <div className="type-scroll" ref={typeScrollRef}>
            <TypeArea text={text} states={engine.states} index={engine.index} hints={hintTexts} hanzi={hanzi} />
          </div>
        </div>

        <div
          className="session-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-label={t('practice.progress')}
        >
          <div className="session-progress-track">
            <div className="session-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="session-progress-label">{progressPct}%</span>
        </div>

      {finger && currentChar && (
        <div className="type-hint">
          <span className="next-key" title={t('practice.nextKey')}>
            {nextKeyLabel}
          </span>
          {shiftNeeded && (
            <span className="shift-badge">
              ⇧ {shiftSide === 'left' ? t('practice.shiftLeft') : shiftSide === 'right' ? t('practice.shiftRight') : t('practice.shift')}
            </span>
          )}
          <span className="type-hint-text">{t('practice.fingerHint')}</span>
          <span className="finger-chip">
            <i className={cn('finger-dot', `finger-${finger}`)} />
            {t(`finger.${finger}`)}
          </span>
        </div>
      )}

      <div className="kb-toolbar">
        {numpad ? <span className="kb-toolbar-note">{t('practice.numpadHint')}</span> : <LayoutPicker />}
        {autoSpace && <span className="kb-toolbar-note">{t('practice.spaceAutoHint')}</span>}
        <KeyboardToggle />
      </div>
      {showKeyboard &&
        (numpad ? (
          <Numpad activeKey={activeKey} pressedKey={engine.lastKey} pressCount={engine.pressCount} />
        ) : (
          <div className="kb-wrap">
            <HandOverlay finger={finger} keyName={activeKey} shiftSide={shiftSide} />
            <Keyboard
              activeKey={activeKey}
              pressedKey={engine.lastKey}
              pressCount={engine.pressCount}
              layout={layout}
              lastWasWrong={lastWasWrong}
              shiftSide={shiftSide}
            />
          </div>
        ))}
      </div>

      {result && (
        <div className="result-overlay">
          <ResultSummary
            result={result}
            title={t('practice.done')}
            footer={
              <>
                {verdict && <PassBanner verdict={verdict} />}
                <button type="button" className="btn btn-ghost" onClick={onRestart}>
                  ↺ {t('practice.again')}
                </button>
                {onPrev && (
                  <button type="button" className="btn btn-ghost" onClick={onPrev}>
                    ← {t('practice.prev')}
                  </button>
                )}
                {onNext && (!verdict || verdict.passed) && (
                  <button type="button" className="btn btn-primary" onClick={onNext}>
                    {t('practice.next')} →
                  </button>
                )}
                {onNext && (!verdict || verdict.passed) && (
                  <p className="kbd-hint">
                    <Trans i18nKey="practice.enterNext" components={{ kbd: <kbd>Enter</kbd> }} />
                  </p>
                )}
              </>
            }
          />
        </div>
      )}
    </div>
  )
}

export function TypingSession({ text, numpad, autoSpace, hints, hanzi, graded, onFinish, onNext, onPrev }: TypingSessionProps) {
  const [seed, setSeed] = useState(0)
  const restart = () => setSeed((s) => s + 1)
  return (
    <Engine
      key={seed}
      text={text}
      numpad={numpad}
      autoSpace={autoSpace}
      hints={hints}
      hanzi={hanzi}
      graded={graded}
      onFinish={onFinish}
      onNext={onNext}
      onPrev={onPrev}
      onRestart={restart}
    />
  )
}