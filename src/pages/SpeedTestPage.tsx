import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { useTypingEngine } from '../features/typing/useTypingEngine'
import { fingerForChar, keyForChar } from '../features/typing/fingerMap'
import type { EngineResult } from '../features/typing/metrics'
import { formatClock } from '../features/typing/metrics'
import { generateWords } from '../features/typing/words'
import { useLocalStats } from '../features/stats/useLocalStats'
import { Keyboard } from '../components/Keyboard'
import { TrendChart } from '../components/TrendChart'
import { TypeArea } from '../features/typing/TypeArea'
import { cn } from '../lib/cn'

const DURATIONS = [15, 30, 60]

function SpeedEngine({
  duration,
  onPick,
  onRestart,
}: {
  duration: number
  onPick: (d: number) => void
  onRestart: () => void
}) {
  const { t } = useTranslation()
  const [result, setResult] = useState<EngineResult | null>(null)
  const { add } = useLocalStats()
  const initialText = useMemo(() => generateWords(80), [])

  const engine = useTypingEngine({
    text: initialText,
    mode: 'timed',
    durationSec: duration,
    extend: () => generateWords(40),
    onFinish: (r) => {
      setResult(r)
      add({
        label: `Speed test ${duration}s`,
        mode: r.mode,
        wpm: r.wpm,
        accuracy: r.accuracy,
        elapsedSec: r.elapsedSec,
        correctChars: r.correctChars,
      })
    },
  })

  const progress = Math.min(1, engine.elapsed / duration)
  const currentChar = engine.finished ? null : engine.text[engine.index]
  const activeKey = currentChar ? keyForChar(currentChar) : null
  const finger = currentChar ? fingerForChar(currentChar) : null

  return (
    <>
      <div className="session-grid">
        <div className="session-main">
      <div className="mode-tabs">
        {DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            className={d === duration ? 'active' : ''}
            onClick={() => onPick(d)}
          >
            {d}s
          </button>
        ))}
      </div>

      <div className="timer-track">
        <div className="timer-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="stats-bar">
        <div className="stat">
          <b>{engine.wpm}</b>
          <span>{t('speed.wpm')}</span>
        </div>
        <div className="stat">
          <b>{engine.accuracy}%</b>
          <span>{t('speed.accuracy')}</span>
        </div>
        <div className="stat">
          <b>{formatClock(engine.elapsed)}</b>
          <span>{t('speed.time')}</span>
        </div>
        <div className="spacer" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRestart}>
          ↺ {t('practice.restart')}
        </button>
      </div>

      <TypeArea text={engine.text} states={engine.states} index={engine.index} />

      {finger && !engine.finished && (
        <div className="type-hint">
          {t('practice.fingerHint')}
          <span className="finger-chip">
            <i className={cn('finger-dot', `finger-${finger}`)} />
            {t(`finger.${finger}`)}
          </span>
        </div>
      )}

      <Keyboard
          activeKey={activeKey}
          pressedKey={engine.lastKey}
          pressCount={engine.pressCount}
          finger={finger}
        />
        </div>
      </div>

      {result && (
        <div className="result-card" style={{ marginTop: '1.5rem' }}>
          <h2>{t('speed.done')}</h2>
          <p className="sub">{t('speed.summary')}</p>
          <div className="result-stats">
            <div className="result-stat">
              <b>{result.wpm}</b>
              <span>{t('speed.wpm')}</span>
            </div>
            <div className="result-stat">
              <b>{result.accuracy}%</b>
              <span>{t('speed.accuracy')}</span>
            </div>
            <div className="result-stat">
              <b>{result.consistency}%</b>
              <span>{t('speed.consistency')}</span>
            </div>
            <div className="result-stat">
              <b>{result.correctChars}</b>
              <span>{t('speed.chars')}</span>
            </div>
          </div>
          <p className="section-sub" style={{ textAlign: 'center' }}>
            {t('speed.trend')}
          </p>
          <TrendChart data={result.samples} />
          <div className="result-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn-primary" onClick={onRestart}>
              ↺ {t('speed.again')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export function SpeedTestPage() {
  const { t } = useTranslation()
  const [duration, setDuration] = useState(30)
  const [seed, setSeed] = useState(0)
  const restart = () => setSeed((s) => s + 1)
  const pick = (d: number) => {
    setDuration(d)
    setSeed((s) => s + 1)
  }

  return (
    <div className="page container" style={{ maxWidth: '900px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.speedTest')}</div>
        <h1>{t('speed.title')}</h1>
        <p>{t('speed.subtitle')}</p>
      </div>
      <div className="card speed-panel">
        <SpeedEngine key={seed} duration={duration} onPick={pick} onRestart={restart} />
      </div>
    </div>
  )
}