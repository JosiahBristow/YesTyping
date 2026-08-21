import { useTranslation } from 'react-i18next'
import { useRhythm } from '../features/game/useRhythm'
import { GameShell, type GameState } from '../components/GameShell'
import { cn } from '../lib/cn'

const LANES = 4
const HIT_MIN = 78
const HIT_MAX = 94

export function RhythmPage() {
  const { t } = useTranslation()
  const game = useRhythm()

  const api: GameState = {
    started: game.started,
    paused: game.paused,
    over: game.over,
    score: game.score,
    best: game.best,
    combo: game.combo,
    buffer: '',
    newBest: game.newBest,
    start: game.start,
    togglePause: game.togglePause,
  }

  return (
    <div className="page container" style={{ maxWidth: '820px' }}>
      <div className="page-head">
        <div className="eyebrow">{t('nav.game')}</div>
        <h1>{t('games.rhythm.title')}</h1>
        <p>{t('games.rhythm.desc')}</p>
      </div>

      <GameShell
        game={api}
        stats={[
          { label: t('games.rhythm.score'), value: game.score },
          { label: t('games.rhythm.level'), value: game.level },
          { label: t('games.rhythm.lives'), value: '❤️'.repeat(Math.max(0, game.lives)) },
        ]}
        howto={t('games.rhythm.howto')}
      >
        <div className="rhythm-field">
          <div className="rhythm-judge" />
          {Array.from({ length: LANES }, (_, lane) => (
            <div key={lane} className="rhythm-lane" style={{ left: `${(lane / LANES) * 100}%` }} />
          ))}
          {game.sparks.map((s, i) => (
            <span
              key={i}
              className="rhythm-spark"
              style={{ left: `${((s.lane + 0.5) / LANES) * 100}%` }}
            >
              ✨
            </span>
          ))}
          {game.tiles.map((tl) => (
            <span
              key={tl.id}
              className={cn('rhythm-tile', tl.y >= HIT_MIN && tl.y <= HIT_MAX && 'in-zone')}
              style={{ left: `${((tl.lane + 0.5) / LANES) * 100}%`, top: `${tl.y}%` }}
            >
              {tl.letter}
            </span>
          ))}
        </div>
      </GameShell>
    </div>
  )
}