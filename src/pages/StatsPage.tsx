import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useLocalStats } from '../features/stats/useLocalStats'
import { formatDuration } from '../features/typing/metrics'
import { TrendChart } from '../components/TrendChart'
import { cn } from '../lib/cn'

function dateLabel(at: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(at)
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
              {t('stats.trend')}
            </h2>
            <TrendChart data={trendData} height={140} />
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