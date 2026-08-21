import { useTranslation } from 'react-i18next'
import { useZombies } from '../features/game/useZombies'
import { GameShell, type GameState } from '../components/GameShell'
import { cn } from '../lib/cn'

export function ZombiesPage() {
  const { t } = useTranslation()
  const game = useZombies()

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
        <h1>{t('games.zombies.title')}</h1>
        <p>{t('games.zombies.desc')}</p>
      </div>

      <GameShell
        game={api}
        stats={[
          { label: t('games.zombies.score'), value: game.score },
          { label: t('games.zombies.level'), value: game.level },
          { label: t('games.zombies.lives'), value: '❤️'.repeat(Math.max(0, game.lives)) },
        ]}
        howto={t('games.zombies.howto')}
      >
        <span className="zombie-wall">🧱</span>
        {game.kills.map((k) => (
          <span key={k.id} className="game-burst" style={{ left: `${k.x}%`, top: '34%' }}>
            💥
          </span>
        ))}
        {game.started &&
          !game.over &&
          game.zombies.map((z) => (
            <span
              key={z.id}
              className={cn('game-zombie', game.targetId === z.id && 'target')}
              style={{ left: `${z.x}%`, top: `${32 + (z.id % 3) * 8}%` }}
            >
              <span className="zombie-word">
                {z.word.split('').map((ch, i) => (
                  <span key={i} className={cn(i < game.buffer.length && game.targetId === z.id && 'typed')}>
                    {ch}
                  </span>
                ))}
              </span>
              <span className="zombie-emoji">🧟</span>
            </span>
          ))}
      </GameShell>
    </div>
  )
}