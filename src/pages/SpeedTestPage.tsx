import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { useTypingEngine } from '../features/typing/useTypingEngine'
import { fingerForChar, keyForChar } from '../features/typing/layouts'
import type { EngineResult } from '../features/typing/metrics'
import { formatClock } from '../features/typing/metrics'
import { generateWords } from '../features/typing/words'
import { useLocalStats } from '../features/stats/useLocalStats'
import { maybeUnlock } from '../features/achievements/achievements'
import { Keyboard } from '../components/Keyboard'
import { TrendChart } from '../components/TrendChart'
import { FingerGuide } from '../components/FingerGuide'
import { LayoutPicker } from '../components/LayoutPicker'
import { TypeArea } from '../features/typing/TypeArea'
import { cn } from '../lib/cn'
import { useLayout } from '../lib/layout'
import { useSettings } from '../lib/settings'

const DURATIONS = [15, 30, 60]
const OPPONENTS = [20, 40, 60, 80]

function SpeedEngine({
  duration,
  race,
  opponent,
  onPick,
  onRestart,
}: {
  duration: number
  race: boolean
  opponent: number
  onPick: (d: number) => void
  onRestart: () => void
}) {
  const { t } = useTranslation()
  const layout = useLayout((s) => s.layout)
  const showKeyboard = useSettings((s) => s.showKeyboard)
  const [result, setResult] = useState<EngineResult | null>(null)
  const [raceResult, setRaceResult] = useState<'win' | 'lose' | null>(null)
  const { add } = useLocalStats()
  const initialText = useMemo(() => generateWords(80), [])

  const goalChars = race ? Math.round((opponent * 5) / 60) * duration : 0

  const engine = useTypingEngine({
    text: initialText,
    mode: 'timed',
    durationSec: duration,
    extend: () => generateWords(40),
    onFinish: (r) => {
      setResult(r)
      if (race) setRaceResult(r.correctChars >= goalChars ? 'win' : 'lose')
      add({
        label: `Speed test ${duration}s`,
        mode: r.mode,
        wpm: r.wpm,
        accuracy: r.accuracy,
        elapsedSec: r.elapsedSec,
        correctChars: r.correctChars,
      })
      maybeUnlock(r)
    },
  })

  const progress = Math.min(1, engine.elapsed / duration)
  const playerFill = race ? Math.min(1, engine.correctChars / goalChars) : 0
  const currentChar = engine.finished ? null : engine.text[engine.index]
  const activeKey = currentChar ? keyForChar(currentChar, layout) : null
  const finger = currentChar ? fingerForChar(currentChar, layout) : null

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

      {race ? (
        <div className="race-bars">
          <div className="race-row">
            <span className="race-label">{t('speed.you')}</span>
            <div className="timer-track race-track">
              <div className="race-fill you" style={{ width: `${playerFill * 100}%` }} />
            </div>
          </div>
          <div className="race-row">
            <span className="race-label">{t('speed.bot', { wpm: opponent })}</span>
            <div className="timer-track race-track">
              <div className="race-fill bot" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="timer-track">
          <div className="timer-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

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

      <div className="kb-toolbar">
        <LayoutPicker />
      </div>
      {showKeyboard && (
        <Keyboard activeKey={activeKey} pressedKey={engine.lastKey} pressCount={engine.pressCount} layout={layout} />
      )}
        </div>

        <FingerGuide finger={engine.finished ? null : finger} />

      </div>

      {result && (
        <div className="result-card" style={{ marginTop: '1.5rem' }}>
          {race && raceResult && (
            <div className={cn('race-banner', raceResult)}>
              {raceResult === 'win' ? `🏆 ${t('speed.won')}` : `💔 ${t('speed.lost')}`}
            </div>
          )}
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
  const [race, setRace] = useState(false)
  const [opponent, setOpponent] = useState(40)
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
        <div className="race-toggle">
          <div className="seg-group">
            <button type="button" className={cn(!race && 'active')} onClick={() => { setRace(false); restart() }}>
              🏁 {t('speed.solo')}
            </button>
            <button type="button" className={cn(race && 'active')} onClick={() => { setRace(true); restart() }}>
              🏎️ {t('speed.race')}
            </button>
          </div>
          {race && (
            <div className="opponent-pick">
              <span>{t('speed.vs')}</span>
              <div className="seg-group">
                {OPPONENTS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={cn(o === opponent && 'active')}
                    onClick={() => {
                      setOpponent(o)
                      restart()
                    }}
                  >
                    {o} WPM
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <SpeedEngine
          key={seed}
          duration={duration}
          race={race}
          opponent={opponent}
          onPick={pick}
          onRestart={restart}
        />
      </div>
    </div>
  )
}