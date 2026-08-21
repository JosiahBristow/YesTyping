import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/cn'

export interface GameState {
  started: boolean
  paused: boolean
  over: boolean
  score: number
  best: number
  combo: number
  buffer: string
  newBest: boolean
  start: () => void
  togglePause: () => void
}

export interface GameStatItem {
  label: string
  value: ReactNode
}

export function GameShell({
  game,
  stats,
  howto,
  children,
  className,
}: {
  game: GameState
  stats: GameStatItem[]
  howto: string
  children: ReactNode
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div className={cn('card game-panel', className)}>
      <div className="game-hud">
        {stats.map((s) => (
          <div className="game-stat" key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
        <div className="game-stat">
          <b>{game.best}</b>
          <span>{t('gameCommon.best')}</span>
        </div>
        {game.started && !game.over && (
          <button
            type="button"
            className="game-pause"
            aria-label={game.paused ? t('gameCommon.resume') : t('gameCommon.pause')}
            title={game.paused ? t('gameCommon.resume') : t('gameCommon.pause')}
            onClick={game.togglePause}
          >
            {game.paused ? '▶' : '⏸'}
          </button>
        )}
      </div>

      <div className="game-field" aria-live="polite">
        {children}
        {!game.started && (
          <div className="game-idle">
            <div className="big">🎮</div>
            <p>{howto}</p>
            <button type="button" className="btn btn-primary" onClick={game.start}>
              {t('gameCommon.start')}
            </button>
          </div>
        )}
        {game.paused && !game.over && (
          <div className="game-paused">
            <div className="big">⏸️</div>
            <h2>{t('gameCommon.paused')}</h2>
            <button type="button" className="btn btn-primary" onClick={game.togglePause}>
              ▶ {t('gameCommon.resume')}
            </button>
            <p className="game-paused-hint">{t('gameCommon.pauseHint')}</p>
          </div>
        )}
        {game.over && (
          <div className="game-over">
            <div className="big">💥</div>
            <h2>{t('gameCommon.done')}</h2>
            <p>
              {t('gameCommon.finalScore')} <b>{game.score}</b>
            </p>
            {game.newBest && <p className="game-new-best">🏆 {t('gameCommon.newBest')}</p>}
            <button type="button" className="btn btn-primary" onClick={game.start}>
              ↺ {t('gameCommon.again')}
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
  )
}