import { useTranslation } from 'react-i18next'
import type { Finger } from '../features/typing/fingerMap'
import { cn } from '../lib/cn'

const FINGER_COLOR: Record<Finger, string> = {
  lp: '#7aa2f7',
  lr: '#2dd4bf',
  lm: '#4ade80',
  li: '#fbbf24',
  ri: '#fbbf24',
  rm: '#4ade80',
  rr: '#2dd4bf',
  rp: '#7aa2f7',
  th: '#fb923c',
}

const FINGER_SLOT: Record<Finger, number> = {
  lp: 0,
  lr: 1,
  lm: 2,
  li: 3,
  rp: 0,
  rr: 1,
  rm: 2,
  ri: 3,
  th: -1,
}

const SLOTS = [
  { x: 6, y: 30, h: 44, color: FINGER_COLOR.lp }, // pinky
  { x: 26, y: 22, h: 52, color: FINGER_COLOR.lr }, // ring
  { x: 46, y: 16, h: 58, color: FINGER_COLOR.lm }, // middle
  { x: 66, y: 26, h: 46, color: FINGER_COLOR.li }, // index
]

const REST = '#d6dce8'

export function FingerGuide({ finger }: { finger: Finger | null }) {
  const { t } = useTranslation()
  const isRight = finger !== null && (finger === 'th' || finger.startsWith('r'))
  const activeSlot = finger !== null && finger !== 'th' ? FINGER_SLOT[finger] : -1
  const thumbActive = finger === 'th'

  return (
    <aside className="finger-panel" aria-label={finger ? t(`finger.${finger}`) : undefined}>
      <svg
        className="hand"
        viewBox="0 0 120 160"
        role="img"
        aria-label={finger ? t(`finger.${finger}`) : 'hand'}
      >
        <g transform={isRight ? 'scale(-1 1) translate(-120 0)' : undefined}>
          <rect x="4" y="72" width="86" height="72" rx="24" fill={REST} />
          {SLOTS.map((slot, i) => {
            const active = i === activeSlot
            return (
              <rect
                key={i}
                className={cn('hand-finger', active && 'active')}
                x={slot.x}
                y={slot.y}
                width="16"
                height={slot.h}
                rx="8"
                fill={active ? slot.color : REST}
              />
            )
          })}
          <g transform="rotate(-18 88 132)">
            <rect
              className={cn('hand-finger', thumbActive && 'active')}
              x="80"
              y="84"
              width="16"
              height="52"
              rx="8"
              fill={thumbActive ? FINGER_COLOR.th : REST}
            />
          </g>
        </g>
      </svg>
      {finger && (
        <div className="finger-panel-label">
          <i className={cn('finger-dot', `finger-${finger}`)} />
          {t(`finger.${finger}`)}
        </div>
      )}
    </aside>
  )
}