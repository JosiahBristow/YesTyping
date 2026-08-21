import { useTranslation } from 'react-i18next'
import { useWordRain } from '../features/game/useWordRain'
import { GameShell, type GameState } from '../components/GameShell'
import { cn } from '../lib/cn'

export function WordRainPage() {
  const { t } = useTranslation()
  const game = useWordRain()

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
        <h1>{t('games.word-rain.title')}</h1>
        <p>{t('games.word-rain.desc')}</p>
      </div>

      <GameShell
        game={api}
        stats={[
          { label: t('games.word-rain.score'), value: game.score },
          { label: t('games.word-rain.level'), value: game.level },
          { label: t('games.word-rain.lives'), value: '❤️'.repeat(Math.max(0, game.lives)) },
        ]}
        howto={t('games.word-rain.howto')}
      >
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
      </GameShell>
    </div>
  )
}