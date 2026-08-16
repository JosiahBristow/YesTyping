import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useLocalStats, type SessionRecord } from '../features/stats/useLocalStats'
import { formatDuration } from '../features/typing/metrics'
import { TrendChart } from '../components/TrendChart'
import { Keyboard } from '../components/Keyboard'
import { cn } from '../lib/cn'

const DURATIONS = [15, 30, 60]

function dateLabel(at: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(at)
}

function aggregateErrors(sessions: SessionRecord[]): Record<string, number> {
  const agg: Record<string, number> = {}
  for (const s of sessions) {
    if (!s.keyErrors) continue
    for (const [k, n] of Object.entries(s.keyErrors)) {
      agg[k] = (agg[k] ?? 0) + n
    }
  }
  return agg
}

export function StatsPage() {
  const { t } = useTranslation()
  const { sessions } = useLocalStats()

  const stats = useMemo(() => {
    if (sessions.length === 0) return null
    const bestWpm = Math.max(...sessions.map((s) => s.wpm))
    const bestAcc = Math.max(...sessions.map((s) => s.accuracy))
    const totalSec = sessions.reduce((a, s) => a + s.elapsedSec, 0)
    const avgWpm = Math.round(sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length)
    return { bestWpm, bestAcc, totalSec, avgWpm }
  }, [sessions])

  const durationBests = useMemo(() => {
    return DURATIONS.map((d) => {
      const best = Math.max(0, ...sessions.filter((s) => s.mode === 'timed' && s.durationSec === d).map((s) => s.wpm))
      return { d, best }
    })
  }, [sessions])

  const errorKeys = useMemo(() => aggregateErrors(sessions), [sessions])
  const topErrors = useMemo(() => {
    return Object.entries(errorKeys)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [errorKeys])
  const hasErrors = topErrors.length > 0

  const recent = sessions.slice(0, 10)
  const trendData = sessions.slice(0, 30).map((s) => s.wpm).reverse()

  return (
    <div className="page container" style={{ maxWidth: '900px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.stats')}</div>
        <h1>{t('stats.title')}</h1>
        <p>{t('stats.subtitle')}</p>
      </div>

      {!stats ? (
        <div className="card empty-state">
          <div className="big">⌨️</div>
          <p>{t('stats.empty')}</p>
          <Link to="/courses" className="btn btn-primary">
            {t('stats.startPracticing')} →
          </Link>
        </div>
      ) : (
        <>
          <div className="stat-cards">
            <div className="card big-stat">
              <b>{stats.bestWpm}</b>
              <span>{t('stats.bestWpm')}</span>
            </div>
            <div className="card big-stat">
              <b>{stats.bestAcc}%</b>
              <span>{t('stats.bestAccuracy')}</span>
            </div>
            <div className="card big-stat">
              <b>{formatDuration(stats.totalSec)}</b>
              <span>{t('stats.totalTime')}</span>
            </div>
            <div className="card big-stat">
              <b>{sessions.length}</b>
              <span>{t('stats.sessions')}</span>
            </div>
            <div className="card big-stat">
              <b>{stats.avgWpm}</b>
              <span>{t('stats.avgWpm')}</span>
            </div>
          </div>

          <div className="card speed-panel" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.15rem' }}>
              {t('stats.durationBests')}
            </h2>
            <div className="duration-bests">
              {durationBests.map(({ d, best }) => (
                <div className="card big-stat duration-best" key={d}>
                  <b>{best > 0 ? best : '—'}</b>
                  <span>{d}s {t('speed.wpm')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card speed-panel" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.15rem' }}>
              {t('stats.trend')}
            </h2>
            <TrendChart data={trendData} height={140} />
          </div>

          <div className="card speed-panel" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.15rem' }}>
              {t('stats.weakKeys')}
            </h2>
            {hasErrors ? (
              <>
                <Keyboard errorKeys={errorKeys} showLegend={false} />
                <div className="top-errors">
                  {topErrors.map(([k, n]) => (
                    <span className="error-chip" key={k}>
                      <b>{k}</b> ×{n}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="section-sub">{t('stats.weakKeysEmpty')}</p>
            )}
          </div>

          <div className="card speed-panel">
            <h2 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
              {t('stats.recent')}
            </h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>{t('stats.date')}</th>
                  <th>{t('stats.type')}</th>
                  <th>{t('stats.speed')}</th>
                  <th>{t('stats.acc')}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id}>
                    <td className="nolabel" style={{ fontSize: '0.82rem' }}>
                      {dateLabel(s.at)}
                    </td>
                    <td>
                      <span className={cn('badge', s.mode === 'lesson' ? 'lesson' : 'timed')}>
                        {t(`stats.mode${s.mode === 'lesson' ? 'Lesson' : 'Timed'}`)}
                      </span>
                    </td>
                    <td>{s.wpm}</td>
                    <td>{s.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}