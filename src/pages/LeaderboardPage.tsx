import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchLeaderboard, type LeaderboardMetric, type LeaderboardRow } from '../features/stats/remoteStats'
import { displayName, useAuth } from '../lib/auth'
import { supabaseConfigured } from '../lib/supabase'
import { formatDuration } from '../features/typing/metrics'
import { cn } from '../lib/cn'

const METRICS: { id: LeaderboardMetric; icon: string }[] = [
  { id: 'max_wpm', icon: '🚀' },
  { id: 'avg_wpm', icon: '⏱️' },
  { id: 'total_seconds', icon: '🕐' },
  { id: 'sessions', icon: '🎯' },
]

function metricValue(row: LeaderboardRow, metric: LeaderboardMetric): string {
  switch (metric) {
    case 'max_wpm':
      return String(row.max_wpm)
    case 'avg_wpm':
      return String(row.avg_wpm)
    case 'total_seconds':
      return formatDuration(row.total_seconds)
    case 'sessions':
      return String(row.sessions)
  }
}

export function LeaderboardPage() {
  const { t } = useTranslation()
  const user = useAuth((s) => s.user)
  const [metric, setMetric] = useState<LeaderboardMetric>('max_wpm')
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabaseConfigured) return
    let cancelled = false
    setLoading(true)
    void fetchLeaderboard(metric).then((data) => {
      if (cancelled) return
      setRows(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [metric])

  return (
    <div className="page container" style={{ maxWidth: '760px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.leaderboard')}</div>
        <h1>{t('leaderboard.title')}</h1>
        <p>{t('leaderboard.subtitle')}</p>
      </div>

      {!supabaseConfigured ? (
        <div className="card auth-card">
          <div className="big">🏆</div>
          <h2 className="auth-title">{t('nav.leaderboard')}</h2>
          <p className="section-sub">{t('auth.notConfigured')}</p>
        </div>
      ) : (
        <>
          <div className="leaderboard-tabs">
            {METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={cn(metric === m.id && 'active')}
                onClick={() => setMetric(m.id)}
              >
                {m.icon} {t(`leaderboard.metric.${m.id}`)}
              </button>
            ))}
          </div>

          {!user && (
            <div className="leaderboard-guest">
              {t('leaderboard.guest')}{' '}
              <Link to="/login" className="leaderboard-link">
                {t('nav.login')}
              </Link>
            </div>
          )}

          <div className="card speed-panel">
            {loading ? (
              <p className="section-sub">{t('leaderboard.loading')}</p>
            ) : rows.length === 0 ? (
              <div className="empty-state">
                <div className="big">🏆</div>
                <p>{t('leaderboard.empty')}</p>
                {!user && (
                  <Link to="/login" className="btn btn-primary">
                    {t('leaderboard.join')}
                  </Link>
                )}
              </div>
            ) : (
              <table className="history-table leaderboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('leaderboard.name')}</th>
                    <th>{t(`leaderboard.metric.${metric}`)}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const mine = user ? row.user_id === user.id : false
                    return (
                      <tr key={row.user_id} className={cn(mine && 'mine')}>
                        <td className="nolabel">
                          <span className={cn('rank', i < 3 && `rank-${i + 1}`)}>
                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                          </span>
                        </td>
                        <td>
                          {row.username}
                          {mine && <span className="leaderboard-me">{t('race.you')}</span>}
                        </td>
                        <td className="nolabel">
                          <b className="leaderboard-value">{metricValue(row, metric)}</b>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {user && (
            <p className="section-sub" style={{ textAlign: 'center', fontSize: '0.82rem' }}>
              {t('leaderboard.synced', { name: displayName(user) })}
            </p>
          )}
        </>
      )}
    </div>
  )
}