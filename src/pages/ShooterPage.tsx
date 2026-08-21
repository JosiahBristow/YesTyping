import { useTranslation } from 'react-i18next'
import { useShooter } from '../features/game/useShooter'
import { GameShell, type GameState } from '../components/GameShell'
import { cn } from '../lib/cn'

export function ShooterPage() {
  const { t } = useTranslation()
  const game = useShooter()

  const api: GameState = {
    started: game.started,
    paused: game.paused,
    over: game.over,
    score: game.score,
    best: game.best,
    combo: game.combo,
    buffer: game.buffer,
    newBest: game.newBest,
    start: game.start,
    togglePause: game.togglePause,
  }

  return (
    <div className="page container" style={{ maxWidth: '820px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.game')}</div>
        <h1>{t('games.shooter.title')}</h1>
        <p>{t('games.shooter.desc')}</p>
      </div>

      <GameShell
        game={api}
        stats={[
          { label: t('games.shooter.score'), value: game.score },
          { label: t('games.shooter.level'), value: game.level },
          { label: t('games.shooter.lives'), value: '❤️'.repeat(Math.max(0, game.lives)) },
        ]}
        howto={t('games.shooter.howto')}
      >
        {game.hits.map((h) => (
          <span key={`hit-${h.id}`} className="game-burst" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
            💥
          </span>
        ))}
        {game.started &&
          !game.over &&
          game.targets.map((tg) => (
            <span
              key={tg.id}
              className={cn('game-target', game.targetId === tg.id && 'target')}
              style={{ left: `${tg.x}%`, top: `${tg.y}%` }}
            >
              <span
                className="game-target-fuse"
                style={{ animationDuration: `${tg.expireMs}ms` }}
              />
              {tg.word.split('').map((ch, i) => (
                <span key={i} className={cn(i < game.buffer.length && game.targetId === tg.id && 'typed')}>
                  {ch}
                </span>
              ))}
            </span>
          ))}
      </GameShell>
    </div>
  )
}