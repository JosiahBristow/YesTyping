import { useTranslation } from 'react-i18next'
import { useWordRain, loadGameBest } from '../features/game/useWordRain'
import { cn } from '../lib/cn'

export function GamePage() {
  const { t } = useTranslation()
  const game = useWordRain()
  const best = loadGameBest()

  return (
    <div className="page container" style={{ maxWidth: '820px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.game')}</div>
        <h1>{t('game.title')}</h1>
        <p>{t('game.subtitle')}</p>
      </div>

      <div className="card game-panel">
        <div className="game-hud">
          <div className="game-stat">
            <b>{game.score}</b>
            <span>{t('game.score')}</span>
          </div>
          <div className="game-stat">
            <b>{game.level}</b>
            <span>{t('game.level')}</span>
          </div>
          <div className="game-stat">
            <b>{'❤️'.repeat(Math.max(0, game.lives))}</b>
            <span>{t('game.lives')}</span>
          </div>
          <div className="game-stat">
            <b>{best}</b>
            <span>{t('game.best')}</span>
          </div>
        </div>

        <div className="game-field" aria-live="polite">
          {game.started &&
            !game.over &&
            game.words.map((w) => (
              <span
                key={w.id}
                className={cn('game-word', game.targetId === w.id && 'target')}
                style={{ left: `${w.x}%`, top: `${w.y}%` }}
              >
                {w.word.split('').map((ch, i) => (
                  <span key={i} className={cn(i < game.buffer.length && game.targetId === w.id && 'typed')}>
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          {!game.started && (
            <div className="game-idle">
              <div className="big">🎮</div>
              <p>{t('game.howto')}</p>
              <button type="button" className="btn btn-primary" onClick={game.start}>
                {t('game.start')}
              </button>
            </div>
          )}
          {game.over && (
            <div className="game-over">
              <div className="big">💥</div>
              <h2>{t('game.done')}</h2>
              <p>
                {t('game.finalScore')} <b>{game.score}</b>
              </p>
              {game.score >= best && game.score > 0 && <p className="game-new-best">🏆 {t('game.newBest')}</p>}
              <button type="button" className="btn btn-primary" onClick={game.start}>
                ↺ {t('game.again')}
              </button>
            </div>
          )}
          {game.started && !game.over && game.buffer && (
            <div className="game-buffer" key={game.combo}>
              {game.buffer}
            </div>
          )}
        </div>

        {game.combo >= 3 && game.started && !game.over && (
          <div className="game-combo" key={game.combo}>
            🔥 {game.combo}×
          </div>
        )}
      </div>
    </div>
  )
}