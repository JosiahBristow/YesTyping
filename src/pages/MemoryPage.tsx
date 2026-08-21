import { useTranslation } from 'react-i18next'
import { useMemory } from '../features/game/useMemory'
import { GameShell, type GameState } from '../components/GameShell'
import { cn } from '../lib/cn'

export function MemoryPage() {
  const { t } = useTranslation()
  const game = useMemory()

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

  const current = game.words[game.wordIndex]

  return (
    <div className="page container" style={{ maxWidth: '820px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.game')}</div>
        <h1>{t('games.memory.title')}</h1>
        <p>{t('games.memory.desc')}</p>
      </div>

      <GameShell
        game={api}
        stats={[
          { label: t('games.memory.round'), value: game.round },
          { label: t('games.memory.time'), value: `${Math.max(0, Math.ceil(game.timeLeft / 1000))}s` },
          { label: t('games.memory.lives'), value: '❤️'.repeat(Math.max(0, game.lives)) },
        ]}
        howto={t('games.memory.howto')}
      >
        {game.started && !game.over && game.phase === 'showing' && (
          <div className="memory-show">
            <div className="memory-show-label">{t('games.memory.memorize')}</div>
            <div className="memory-show-words">
              {game.words.map((w, i) => (
                <span key={i} className="memory-show-word">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
        {game.started && !game.over && game.phase === 'typing' && current && (
          <div className="memory-type">
            <div className="memory-type-label">
              {t('games.memory.wordOf', { n: game.wordIndex + 1, total: game.words.length })}
            </div>
            <div className="memory-slots">
              {current.split('').map((ch, i) => (
                <span
                  key={i}
                  className={cn('memory-slot', i < game.buffer.length && 'typed', i < game.buffer.length && game.buffer[i] !== ch && 'wrong')}
                >
                  {i < game.buffer.length ? ch : '·'}
                </span>
              ))}
            </div>
          </div>
        )}
      </GameShell>
    </div>
  )
}