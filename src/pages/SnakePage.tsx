import { useTranslation } from 'react-i18next'
import { useSnake } from '../features/game/useSnake'
import { GameShell, type GameState } from '../components/GameShell'
import { cn } from '../lib/cn'

const COLS = 25
const ROWS = 18

export function SnakePage() {
  const { t } = useTranslation()
  const game = useSnake()

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

  const pct = (x: number, y: number) => ({
    left: `${(x / COLS) * 100}%`,
    top: `${(y / ROWS) * 100}%`,
  })

  return (
    <div className="page container" style={{ maxWidth: '820px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.game')}</div>
        <h1>{t('games.snake.title')}</h1>
        <p>{t('games.snake.desc')}</p>
      </div>

      <GameShell
        game={api}
        stats={[
          { label: t('games.snake.length'), value: game.score },
          { label: t('games.snake.speed'), value: `${Math.max(80, 220 - (game.score - 3) * 8)}ms` },
        ]}
        howto={t('games.snake.howto')}
      >
        <div className="snake-grid">
          {game.food && (
            <span className="snake-food" style={pct(game.food.x, game.food.y)}>
              <span className="snake-food-emoji">🍎</span>
              <span className="snake-food-word">
                {game.food.word.split('').map((ch, i) => (
                  <span key={i} className={cn(i < game.buffer.length && 'typed')}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          )}
          {game.snake.map((c, i) => (
            <span
              key={`${c.x}-${c.y}-${i}`}
              className={cn('snake-seg', i === game.snake.length - 1 && 'head')}
              style={pct(c.x, c.y)}
            />
          ))}
        </div>
      </GameShell>
    </div>
  )
}