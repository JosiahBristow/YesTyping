import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useTypingEngine } from './useTypingEngine'
import { fingerForChar, keyForChar, needsShift, shiftSideForKey } from './layouts'
import type { EngineResult } from './metrics'
import { evaluatePass, formatClock, type PassVerdict } from './metrics'
import { Keyboard } from '../../components/Keyboard'
import { Numpad } from '../../components/Numpad'
import { KeyboardToggle } from '../../components/KeyboardToggle'
import { PassBanner } from '../../components/PassBanner'
import { ResultSummary } from '../../components/ResultSummary'
import { FingerGuide } from '../../components/FingerGuide'
import { LayoutPicker } from '../../components/LayoutPicker'
import { TypeArea } from './TypeArea'
import { cn } from '../../lib/cn'
import { useLayout } from '../../lib/layout'
import { useSettings } from '../../lib/settings'
import { useLang, type Bi } from '../../lib/lang'

export interface TypingSessionProps {
  text: string
  numpad?: boolean
  hints?: Bi[]
  graded?: boolean
  onFinish?: (result: EngineResult) => void
  onNext?: () => void
  onPrev?: () => void
}

interface EngineProps extends TypingSessionProps {
  onRestart: () => void
}

function Engine({ text, numpad = false, hints, graded = false, onFinish, onNext, onPrev, onRestart }: EngineProps) {
  const { t } = useTranslation()
  const layout = useLayout((s) => s.layout)
  const lang = useLang((s) => s.lang)
  const showKeyboard = useSettings((s) => s.showKeyboard)
  const [result, setResult] = useState<EngineResult | null>(null)
  const hintTexts = hints?.map((hint) => (lang === 'zh' ? hint.zh : hint.en))
  const engine = useTypingEngine({
    text,
    requireNumpad: numpad,
    layout,
    onFinish: (r) => {
      setResult(r)
      onFinish?.(r)
    },
  })

  const verdict: PassVerdict | null = result && graded ? evaluatePass(result, text.length) : null

  const currentChar = engine.finished ? null : text[engine.index]
  const activeKey = numpad ? currentChar : currentChar ? keyForChar(currentChar, layout) : null
  const finger = numpad ? null : currentChar ? fingerForChar(currentChar, layout) : null
  const lastWasWrong = engine.index > 0 && engine.states[engine.index - 1] === 'wrong'
  const nextKeyLabel = currentChar === ' ' ? 'Space' : currentChar
  const shiftNeeded = currentChar !== null && needsShift(currentChar)
  const shiftSide = shiftNeeded && activeKey ? shiftSideForKey(activeKey) : null

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

      <TypeArea text={text} states={engine.states} index={engine.index} hints={hintTexts} />

      {!numpad && finger && currentChar && (
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
        <KeyboardToggle />
      </div>
      {showKeyboard &&
        (numpad ? (
          <Numpad activeKey={activeKey} pressedKey={engine.lastKey} pressCount={engine.pressCount} />
        ) : (
          <Keyboard
            activeKey={activeKey}
            pressedKey={engine.lastKey}
            pressCount={engine.pressCount}
            layout={layout}
            lastWasWrong={lastWasWrong}
            shiftSide={shiftSide}
          />
        ))}
      </div>

      {!numpad && <FingerGuide finger={finger} />}

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

export function TypingSession({ text, numpad, hints, graded, onFinish, onNext, onPrev }: TypingSessionProps) {
  const [seed, setSeed] = useState(0)
  const restart = () => setSeed((s) => s + 1)
  return (
    <Engine
      key={seed}
      text={text}
      numpad={numpad}
      hints={hints}
      graded={graded}
      onFinish={onFinish}
      onNext={onNext}
      onPrev={onPrev}
      onRestart={restart}
    />
  )
}