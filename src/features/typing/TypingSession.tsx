import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTypingEngine } from './useTypingEngine'
import { fingerForChar, keyForChar } from './layouts'
import type { EngineResult } from './metrics'
import { formatClock } from './metrics'
import { Keyboard } from '../../components/Keyboard'
import { ResultSummary } from '../../components/ResultSummary'
import { FingerGuide } from '../../components/FingerGuide'
import { LayoutPicker } from '../../components/LayoutPicker'
import { TypeArea } from './TypeArea'
import { cn } from '../../lib/cn'
import { useLayout } from '../../lib/layout'

export interface TypingSessionProps {
  text: string
  onFinish?: (result: EngineResult) => void
  onNext?: () => void
  onPrev?: () => void
}

interface EngineProps extends TypingSessionProps {
  onRestart: () => void
}

function Engine({ text, onFinish, onNext, onPrev, onRestart }: EngineProps) {
  const { t } = useTranslation()
  const layout = useLayout((s) => s.layout)
  const [result, setResult] = useState<EngineResult | null>(null)
  const engine = useTypingEngine({
    text,
    onFinish: (r) => {
      setResult(r)
      onFinish?.(r)
    },
  })

  const currentChar = engine.finished ? null : text[engine.index]
  const activeKey = currentChar ? keyForChar(currentChar, layout) : null
  const finger = currentChar ? fingerForChar(currentChar, layout) : null

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
        <div className="spacer" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRestart}>
          ↺ {t('practice.restart')}
        </button>
      </div>

      <TypeArea text={text} states={engine.states} index={engine.index} />

      {finger && (
        <div className="type-hint">
          {t('practice.fingerHint')}
          <span className="finger-chip">
            <i className={cn('finger-dot', `finger-${finger}`)} />
            {t(`finger.${finger}`)}
          </span>
        </div>
      )}

      <div className="kb-toolbar">
        <LayoutPicker />
      </div>
      <Keyboard activeKey={activeKey} pressedKey={engine.lastKey} pressCount={engine.pressCount} layout={layout} />
      </div>

      <FingerGuide finger={finger} />

      {result && (
        <div className="result-overlay">
          <ResultSummary
            result={result}
            title={t('practice.done')}
            footer={
              <>
                <button type="button" className="btn btn-ghost" onClick={onRestart}>
                  ↺ {t('practice.again')}
                </button>
                {onPrev && (
                  <button type="button" className="btn btn-ghost" onClick={onPrev}>
                    ← {t('practice.prev')}
                  </button>
                )}
                {onNext && (
                  <button type="button" className="btn btn-primary" onClick={onNext}>
                    {t('practice.next')} →
                  </button>
                )}
              </>
            }
          />
        </div>
      )}
    </div>
  )
}

export function TypingSession({ text, onFinish, onNext, onPrev }: TypingSessionProps) {
  const [seed, setSeed] = useState(0)
  const restart = () => setSeed((s) => s + 1)
  return (
    <Engine
      key={seed}
      text={text}
      onFinish={onFinish}
      onNext={onNext}
      onPrev={onPrev}
      onRestart={restart}
    />
  )
}