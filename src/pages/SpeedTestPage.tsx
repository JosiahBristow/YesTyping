import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useTypingEngine } from '../features/typing/useTypingEngine'
import { fingerForChar, keyForChar, needsShift, shiftSideForKey } from '../features/typing/layouts'
import type { EngineResult } from '../features/typing/metrics'
import { formatClock } from '../features/typing/metrics'
import { generateWords } from '../features/typing/words'
import { useLocalStats } from '../features/stats/useLocalStats'
import { maybeUnlock, winRace } from '../features/achievements/achievements'
import { getCourse } from '../features/courses'
import { useProgress } from '../features/progress/useProgress'
import { Keyboard } from '../components/Keyboard'
import { KeyboardToggle } from '../components/KeyboardToggle'
import { TrendChart } from '../components/TrendChart'
import { FingerGuide } from '../components/FingerGuide'
import { LayoutPicker } from '../components/LayoutPicker'
import { TypeArea } from '../features/typing/TypeArea'
import { cn } from '../lib/cn'
import { useLayout } from '../lib/layout'
import { useSettings } from '../lib/settings'
import { syncStats } from '../features/stats/remoteStats'

const DURATIONS = [15, 30, 60]
const OPPONENTS = [20, 40, 60, 80]
const CUSTOM_KEY = 'yestyping.customText'
// Skip-challenge thresholds: >100 English WPM or >60 Chinese chars/min.
const UNLOCK_WPM = 100
const UNLOCK_CPM = 60

function loadCustomText(): string {
  try {
    return localStorage.getItem(CUSTOM_KEY) ?? ''
  } catch {
    return ''
  }
}

function saveCustomText(value: string): void {
  try {
    localStorage.setItem(CUSTOM_KEY, value)
  } catch {
    // storage unavailable — ignore
  }
}

function SpeedEngine({
  duration,
  race,
  opponent,
  customText,
  unlockTarget,
  onPick,
  onRestart,
}: {
  duration: number
  race: boolean
  opponent: number
  customText: string
  unlockTarget?: string
  onPick: (d: number) => void
  onRestart: () => void
}) {
  const { t } = useTranslation()
  const layout = useLayout((s) => s.layout)
  const showKeyboard = useSettings((s) => s.showKeyboard)
  const [result, setResult] = useState<EngineResult | null>(null)
  const [raceResult, setRaceResult] = useState<'win' | 'lose' | null>(null)
  const [unlockResult, setUnlockResult] = useState<'passed' | 'failed' | null>(null)
  const { add } = useLocalStats()
  const hasCustom = Boolean(customText.trim())
  const initialText = useMemo(() => (hasCustom ? customText : generateWords(80)), [hasCustom, customText])

  const goalChars = race ? Math.round((opponent * 5) / 60) * duration : 0
  const unlockParts = unlockTarget?.split(':') ?? []
  const unlockCourseId = unlockParts[0]
  const unlockLessonId = unlockParts[1]
  const unlockCourse = unlockCourseId ? getCourse(unlockCourseId) : undefined
  const unlockLessonName = unlockLessonId
    ? unlockCourse?.lessons.find((l) => l.id === unlockLessonId)?.title.en ?? ''
    : ''

  const engine = useTypingEngine({
    text: initialText,
    mode: 'timed',
    durationSec: duration,
    extend: hasCustom ? undefined : () => generateWords(40),
    layout,
    onFinish: (r) => {
      setResult(r)
      const won = race ? r.correctChars >= goalChars : false
      if (race) setRaceResult(won ? 'win' : 'lose')
      add({
        label: `${hasCustom ? 'Custom' : 'Speed test'} ${duration}s`,
        mode: r.mode,
        wpm: r.wpm,
        accuracy: r.accuracy,
        elapsedSec: r.elapsedSec,
        correctChars: r.correctChars,
        durationSec: duration,
        keyErrors: r.keyErrors,
        maxCombo: r.maxCombo,
      })
      maybeUnlock()
      winRace(won)
      void syncStats()

      // Skip challenge: meeting the speed bar unlocks every lesson up to
      // and including the target one.
      if (unlockCourseId && unlockLessonId && unlockCourse) {
        const fastEnough = r.wpm > UNLOCK_WPM || r.cpm > UNLOCK_CPM
        setUnlockResult(fastEnough ? 'passed' : 'failed')
        if (fastEnough) {
          const idx = unlockCourse.lessons.findIndex((l) => l.id === unlockLessonId)
          const end = idx === -1 ? unlockCourse.lessons.length - 1 : idx
          for (let i = 0; i <= end; i++) {
            useProgress.getState().markDone(unlockCourseId, unlockCourse.lessons[i].id, r.wpm, r.accuracy)
          }
          maybeUnlock()
          void syncStats()
        }
      }
    },
  })

  const progress = Math.min(1, engine.elapsed / duration)
  const playerFill = race ? Math.min(1, engine.correctChars / goalChars) : 0
  const currentChar = engine.finished ? null : engine.text[engine.index]
  const activeKey = currentChar ? keyForChar(currentChar, layout) : null
  const finger = currentChar ? fingerForChar(currentChar, layout) : null
  const lastWasWrong = engine.index > 0 && engine.states[engine.index - 1] === 'wrong'
  const nextKeyLabel = currentChar === ' ' ? 'Space' : currentChar
  const shiftNeeded = currentChar !== null && needsShift(currentChar)
  const shiftSide = shiftNeeded && activeKey ? shiftSideForKey(activeKey) : null

  return (
    <>
      {unlockTarget && !result && (
        <div className="unlock-banner pending">
          <b>⏭ {t('speed.unlockHint', { wpm: UNLOCK_WPM, cpm: UNLOCK_CPM, lesson: unlockLessonName })}</b>
        </div>
      )}
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

      {finger && !engine.finished && currentChar && (
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
        <LayoutPicker />
        <KeyboardToggle />
      </div>
      {showKeyboard && (
        <Keyboard
          activeKey={activeKey}
          pressedKey={engine.lastKey}
          pressCount={engine.pressCount}
          layout={layout}
          lastWasWrong={lastWasWrong}
          shiftSide={shiftSide}
        />
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
          {unlockTarget && unlockResult && (
            <div className={cn('unlock-banner', unlockResult)}>
              {unlockResult === 'passed' ? (
                <>
                  <b>🎉 {t('speed.unlockPassed', { lesson: unlockLessonName })}</b>
                  {unlockCourseId && (
                    <Link to={`/courses/${unlockCourseId}`} className="btn btn-primary btn-sm" style={{ marginTop: '0.6rem' }}>
                      {t('speed.backToCourse')} →
                    </Link>
                  )}
                </>
              ) : (
                <b>💪 {t('speed.unlockFailed', { wpm: UNLOCK_WPM, cpm: UNLOCK_CPM })}</b>
              )}
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
  const [searchParams] = useSearchParams()
  const unlockTarget = searchParams.get('unlock') ?? undefined
  const [duration, setDuration] = useState(30)
  const [race, setRace] = useState(false)
  const [opponent, setOpponent] = useState(40)
  const [customText, setCustomText] = useState(loadCustomText)
  const [customOpen, setCustomOpen] = useState(false)
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

        {!race && (
          <button
            type="button"
            className={cn('speed-custom-toggle', customText.trim() && 'active')}
            onClick={() => setCustomOpen((o) => !o)}
          >
            ✏️ {t('speed.customTitle')}
            {customText.trim() && <span className="speed-custom-on">✓</span>}
          </button>
        )}

        {!race && customOpen ? (
          <div className="speed-custom-body">
            <textarea
              className="custom-textarea"
              rows={5}
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value)
                saveCustomText(e.target.value)
              }}
              placeholder={t('speed.customPlaceholder')}
            />
            <div className="speed-custom-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!customText.trim()}
                onClick={() => {
                  setCustomOpen(false)
                  restart()
                }}
              >
                {t('speed.customStart')} →
              </button>
              {customText.trim() && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setCustomText('')
                    saveCustomText('')
                    setCustomOpen(false)
                    restart()
                  }}
                >
                  {t('speed.customClear')}
                </button>
              )}
            </div>
          </div>
        ) : (
        <SpeedEngine
          key={seed}
          duration={duration}
          race={race}
          opponent={opponent}
          customText={customText}
          unlockTarget={unlockTarget}
          onPick={pick}
          onRestart={restart}
        />
        )}
      </div>
    </div>
  )
}