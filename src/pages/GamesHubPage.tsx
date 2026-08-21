import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GAMES, loadBest, type GameId } from '../features/game/gameCore'

export function GamesHubPage() {
  const { t } = useTranslation()

  return (
    <div className="page container" style={{ maxWidth: '900px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.game')}</div>
        <h1>{t('gameHub.title')}</h1>
        <p>{t('gameHub.subtitle')}</p>
      </div>
      <div className="games-grid">
        {GAMES.map((g) => (
          <Link key={g.id} to={`/game/${g.id}`} className="card game-card">
            <div className="game-card-top">
              <span className="course-ic">{g.icon}</span>
              <span className="go">{t('gameHub.play')} →</span>
            </div>
            <h3>{t(`games.${g.id}.title`)}</h3>
            <p>{t(`games.${g.id}.desc`)}</p>
            <div className="game-card-best">
              {t('gameCommon.best')}: <b>{loadBest(g.id as GameId)}</b>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}