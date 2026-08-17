import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRace } from '../features/race/useRace'
import { fetchRooms, type RoomInfo } from '../features/race/rooms'
import { fetchLeaderboard, saveRaceResult, type RaceRecord } from '../features/race/leaderboard'
import { generateSeededWords } from '../features/typing/words'
import { useTypingEngine } from '../features/typing/useTypingEngine'
import type { EngineResult } from '../features/typing/metrics'
import { formatClock } from '../features/typing/metrics'
import { displayName, useAuth } from '../lib/auth'
import { supabaseConfigured } from '../lib/supabase'
import { Keyboard } from '../components/Keyboard'
import { LayoutPicker } from '../components/LayoutPicker'
import { HandOverlay } from '../components/HandOverlay'
import { TypeArea } from '../features/typing/TypeArea'
import { fingerForChar, keyForChar, needsShift, shiftSideForKey } from '../features/typing/layouts'
import { KeyboardToggle } from '../components/KeyboardToggle'
import { useLayout } from '../lib/layout'
import { useSettings } from '../lib/settings'
import { cn } from '../lib/cn'

interface ProgressPayload {
  progress: number
  wpm: number
  accuracy: number
  finished: boolean
}

function RaceEngine({
  text,
  onProgress,
  onFinish,
}: {
  text: string
  onProgress: (p: ProgressPayload) => void
  onFinish: (r: EngineResult) => void
}) {
  const { t } = useTranslation()
  const layout = useLayout((s) => s.layout)
  const showKeyboard = useSettings((s) => s.showKeyboard)
  const engine = useTypingEngine({ text, mode: 'timed', durationSec: 60, onFinish, layout })

  const engineRef = useRef(engine)
  engineRef.current = engine
  const propsRef = useRef({ onProgress, text })
  propsRef.current = { onProgress, text }

  useEffect(() => {
    const id = window.setInterval(() => {
      const e = engineRef.current
      const { onProgress, text } = propsRef.current
      if (!e.started && !e.finished) return
      onProgress({
        progress: e.finished ? 1 : Math.min(1, e.correctChars / Math.max(1, text.length)),
        wpm: e.wpm,
        accuracy: e.accuracy,
        finished: e.finished,
      })
    }, 500)
    return () => window.clearInterval(id)
  }, [])

  const currentChar = engine.finished ? null : text[engine.index]
  const activeKey = currentChar ? keyForChar(currentChar, layout) : null
  const finger = currentChar ? fingerForChar(currentChar, layout) : null
  const lastWasWrong = engine.index > 0 && engine.states[engine.index - 1] === 'wrong'
  const nextKeyLabel = currentChar === ' ' ? 'Space' : currentChar
  const shiftNeeded = currentChar !== null && needsShift(currentChar)
  const shiftSide = shiftNeeded && activeKey ? shiftSideForKey(activeKey) : null

  return (
    <div className="session-grid">
      <div className="session-main">
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
        </div>

        <TypeArea text={text} states={engine.states} index={engine.index} />

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
          <LayoutPicker />
          <KeyboardToggle />
        </div>
        {showKeyboard && (
          <div className="kb-wrap">
            <HandOverlay finger={finger} keyName={activeKey} />
            <Keyboard
              activeKey={activeKey}
              pressedKey={engine.lastKey}
              pressCount={engine.pressCount}
              layout={layout}
              lastWasWrong={lastWasWrong}
              shiftSide={shiftSide}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function RacePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const defaultName = user ? displayName(user) : `Player${Math.floor(1000 + Math.random() * 9000)}`
  const [name, setName] = useState(defaultName)
  const [roomId, setRoomId] = useState('')
  const [joined, setJoined] = useState(false)
  const [myResult, setMyResult] = useState<{ wpm: number; accuracy: number; won: boolean } | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [rooms, setRooms] = useState<RoomInfo[] | null>(null)

  const refreshRooms = () => {
    void fetchRooms().then(setRooms)
  }

  useEffect(() => {
    if (!supabaseConfigured || joined) return
    refreshRooms()
    const id = window.setInterval(refreshRooms, 8000)
    return () => window.clearInterval(id)
  }, [joined])

  const race = useRace(joined ? roomId : '', name)
  const text = useMemo(() => (race.seed !== null ? generateSeededWords(220, race.seed) : ''), [race.seed])

  const playerList = Object.values(race.players).sort((a, b) => a.name.localeCompare(b.name))
  const readyCount = playerList.filter((p) => p.ready).length

  const join = () => {
    if (!roomId.trim() || !name.trim()) return
    setJoined(true)
  }

  const quickMatch = () => {
    if (!name.trim()) return
    setRoomId(`room${Math.floor(1000 + Math.random() * 9000)}`)
    setJoined(true)
  }

  const leave = () => {
    setJoined(false)
    setMyResult(null)
  }

  const handleFinish = (r: EngineResult) => {
    const othersHigher = Object.values(race.players).some((p) => p.key !== race.myKey && p.wpm > r.wpm)
    const won = !othersHigher
    setMyResult({ wpm: r.wpm, accuracy: r.accuracy, won })
    race.finishRace({ progress: 1, wpm: r.wpm, accuracy: r.accuracy, finished: true })
    void saveRaceResult({ userId: user?.id ?? null, name, room: roomId, wpm: r.wpm, accuracy: r.accuracy, won })
  }

  return (
    <div className="page container" style={{ maxWidth: '920px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.race')}</div>
        <h1>{t('race.title')}</h1>
        <p>{t('race.subtitle')}</p>
      </div>

      {!supabaseConfigured ? (
        <div className="card auth-card">
          <div className="big">🏎️</div>
          <h2 className="auth-title">{t('auth.title')}</h2>
          <p className="section-sub">{t('auth.notConfigured')}</p>
          <p className="auth-code">
            <code>.env</code> → <code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_ANON_KEY</code>
          </p>
        </div>
      ) : !joined ? (
        <div className="card auth-card">
          <div className="race-join">
            <label className="auth-field">
              <span>{t('race.name')}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
            </label>
            <label className="auth-field">
              <span>{t('race.roomCode')}</span>
              <input value={roomId} onChange={(e) => setRoomId(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())} placeholder={t('race.roomPlaceholder')} maxLength={16} />
            </label>
            <div className="auth-actions">
              <button type="button" className="btn btn-primary" onClick={join} disabled={!roomId.trim() || !name.trim()}>
                {t('race.join')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={quickMatch} disabled={!name.trim()}>
                {t('race.quickMatch')}
              </button>
            </div>
            {!user && <p className="section-sub" style={{ fontSize: '0.82rem' }}>{t('race.guestNote')}</p>}
          </div>

          <div className="race-rooms">
            <div className="race-rooms-head">
              <h3>{t('race.roomsTitle')}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={refreshRooms}>
                ↺ {t('race.refresh')}
              </button>
            </div>
            {rooms === null ? (
              <p className="race-rooms-warn">{t('race.roomsMissing')}</p>
            ) : rooms.length === 0 ? (
              <p className="section-sub" style={{ fontSize: '0.88rem' }}>{t('race.roomsEmpty')}</p>
            ) : (
              <ul className="race-rooms-list">
                {rooms.map((r) => (
                  <li key={r.code}>
                    <span className="race-rooms-code">{r.code}</span>
                    <span className="race-rooms-players">
                      👤 {r.players}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setRoomId(r.code)
                        setJoined(true)
                      }}
                    >
                      {t('race.join')} →
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="race-room">
          <div className="race-top">
            <span className="race-code">
              {t('race.room')} <b>{roomId}</b>
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={leave}>
              {t('race.leave')}
            </button>
          </div>

          <div className="race-players">
            {playerList.map((p) => (
              <div key={p.key} className={cn('race-player', p.key === race.myKey && 'me')}>
                <span className="race-player-name">
                  {p.name}
                  {p.key === race.myKey && <i className="race-me">{t('race.you')}</i>}
                </span>
                <div className="timer-track race-track">
                  <div className="race-fill you" style={{ width: `${Math.round(p.progress * 100)}%` }} />
                </div>
                <span className={cn('race-player-meta', p.ready && 'ready')}>
                  {race.phase === 'waiting'
                    ? p.ready
                      ? `✓ ${t('race.ready')}`
                      : '⏳'
                    : p.finished
                      ? `✓ ${p.wpm}`
                      : `${Math.round(p.progress * 100)}%`}
                </span>
              </div>
            ))}
          </div>

          {race.phase === 'waiting' && (
            <>
              <div className="card race-waiting">
                <p>{t('race.waiting', { count: playerList.length })}</p>
                <button
                  type="button"
                  className={cn('btn', race.ready ? 'btn-ghost' : 'btn-primary')}
                  onClick={race.toggleReady}
                  disabled={playerList.length < 2}
                >
                  {race.ready ? `✓ ${t('race.ready')}` : t('race.getReady')}
                </button>
                {playerList.length < 2 ? (
                  <p className="section-sub" style={{ fontSize: '0.82rem' }}>{t('race.needTwo')}</p>
                ) : readyCount === playerList.length ? (
                  <p className="section-sub" style={{ fontSize: '0.82rem' }}>🏁 {t('race.autoStart')}</p>
                ) : (
                  <p className="section-sub" style={{ fontSize: '0.82rem' }}>
                    {t('race.readyCount', { ready: readyCount, total: playerList.length })}
                  </p>
                )}
              </div>

              <div className="card race-chat">
                <h4 className="race-chat-title">{t('race.chatTitle')}</h4>
                <div className="race-chat-list">
                  {race.messages.length === 0 && (
                    <p className="section-sub" style={{ fontSize: '0.85rem' }}>{t('race.chatEmpty')}</p>
                  )}
                  {race.messages.map((m, i) => (
                    <div key={i} className={cn('race-chat-msg', m.key === race.myKey && 'me')}>
                      <b>{m.name}</b>
                      <span>{m.text}</span>
                    </div>
                  ))}
                </div>
                <form
                  className="race-chat-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    race.sendChat(chatDraft)
                    setChatDraft('')
                  }}
                >
                  <input
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    placeholder={t('race.chatPlaceholder')}
                    maxLength={200}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    {t('race.send')}
                  </button>
                </form>
              </div>
            </>
          )}

          {race.phase === 'racing' && text && (
            <div className="card speed-panel">
              <RaceEngine key={race.seed} text={text} onProgress={race.updateProgress} onFinish={handleFinish} />
            </div>
          )}

          {race.phase === 'done' && (
            <ResultPanel roomId={roomId} myResult={myResult} onAgain={race.startRace} />
          )}
        </div>
      )}
    </div>
  )
}

function ResultPanel({
  roomId,
  myResult,
  onAgain,
}: {
  roomId: string
  myResult: { wpm: number; accuracy: number; won: boolean } | null
  onAgain: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="card speed-panel">
      <h2 className="section-title">{t('race.results')}</h2>
      {myResult && (
        <div className={cn('race-banner', myResult.won ? 'win' : 'lose')}>
          {myResult.won ? `🏆 ${t('speed.won')}` : `💔 ${t('speed.lost')}`}
        </div>
      )}
      {myResult && (
        <div className="result-stats" style={{ maxWidth: '360px', margin: '1rem auto' }}>
          <div className="result-stat">
            <b>{myResult.wpm}</b>
            <span>{t('speed.wpm')}</span>
          </div>
          <div className="result-stat">
            <b>{myResult.accuracy}%</b>
            <span>{t('speed.accuracy')}</span>
          </div>
        </div>
      )}
      <div className="result-actions">
        <button type="button" className="btn btn-primary" onClick={onAgain}>
          ↺ {t('race.again')}
        </button>
      </div>
      <Leaderboard roomId={roomId} />
    </div>
  )
}

function Leaderboard({ roomId }: { roomId: string }) {
  const { t } = useTranslation()
  const [rows, setRows] = useState<RaceRecord[]>([])

  useEffect(() => {
    void fetchLeaderboard(10).then(setRows)
  }, [roomId])

  if (rows.length === 0) return null
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 className="section-title" style={{ fontSize: '1rem' }}>
        {t('race.leaderboard')}
      </h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('race.name')}</th>
            <th>{t('speed.wpm')}</th>
            <th>{t('speed.accuracy')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td className="nolabel">{i + 1}</td>
              <td>{r.name}</td>
              <td>{r.wpm}</td>
              <td>{r.accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}