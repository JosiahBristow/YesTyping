import { useTranslation } from 'react-i18next'
import { cn } from '../lib/cn'
import {
  FINGER_BY_KEY,
  FINGERS,
  KEYBOARD_ROWS,
  keyForChar,
  type Finger,
} from '../features/typing/fingerMap'

export interface KeyboardProps {
  activeKey?: string | null
  pressedKey?: string | null
  pressCount?: number
  finger?: Finger | null
  showLegend?: boolean
}

/* Fixed geometry shared by the keycaps and the hands overlay */
const CAP_W = 50
const CAP_H = 46
const GAP = 8
const P = CAP_W + GAP
const ROW_BASE = [0, 0.5, 0.75, 1.25]
const ROW_W = 13 * P - GAP // 746 — widest row (numbers / qwerty)
const KB_W = ROW_BASE[1] * P + ROW_W // 775 — qwerty row sticks out 0.5 key
const ROW_TOP = [0, CAP_H + GAP, 2 * (CAP_H + GAP), 3 * (CAP_H + GAP), 4 * (CAP_H + GAP)]
const KB_H = ROW_TOP[4] + CAP_H
const HOMEROW_Y = ROW_TOP[2] + CAP_H / 2
const SPACE_Y = ROW_TOP[4] + CAP_H / 2
const SPACE_W = 6 * P

const COLORS: Record<Finger, string> = {
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
const REST_COLOR = '#c7d0e1'

interface HandFinger {
  id: Finger
  x: number
}

const LEFT_FINGERS: HandFinger[] = [
  { id: 'lp', x: 68.5 - 7 },
  { id: 'lr', x: 126.5 - 2 },
  { id: 'lm', x: 184.5 + 3 },
  { id: 'li', x: 242.5 + 9 },
]
const RIGHT_FINGERS: HandFinger[] = [
  { id: 'ri', x: 416.5 - 9 },
  { id: 'rm', x: 474.5 - 3 },
  { id: 'rr', x: 532.5 + 2 },
  { id: 'rp', x: 590.5 + 7 },
]

function HandFingerCap({
  id,
  x,
  active,
}: {
  id: Finger
  x: number
  active: boolean
}) {
  const color = active ? COLORS[id] : REST_COLOR
  return (
    <line
      className={cn('hand-finger', active && 'active')}
      x1={x}
      y1={HOMEROW_Y + 48}
      x2={x}
      y2={HOMEROW_Y}
      stroke={color}
      strokeWidth={15}
      strokeLinecap="round"
    />
  )
}

function HandsOverlay({ finger }: { finger: Finger | null }) {
  return (
    <svg
      className="kb-hands"
      viewBox={`0 0 ${KB_W} ${KB_H}`}
      width={KB_W}
      height={KB_H}
      aria-hidden
    >
      <ellipse cx={150} cy={212} rx={62} ry={50} fill={REST_COLOR} opacity="0.55" />
      <ellipse cx={510} cy={212} rx={62} ry={50} fill={REST_COLOR} opacity="0.55" />
      {LEFT_FINGERS.map((f) => (
        <HandFingerCap key={f.id} id={f.id} x={f.x} active={finger === f.id} />
      ))}
      {RIGHT_FINGERS.map((f) => (
        <HandFingerCap key={f.id} id={f.id} x={f.x} active={finger === f.id} />
      ))}
      <line
        className={cn('hand-finger', finger === 'th' && 'active')}
        x1={335}
        y1={SPACE_Y + 34}
        x2={335}
        y2={SPACE_Y}
        stroke={finger === 'th' ? COLORS.th : REST_COLOR}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <line
        className={cn('hand-finger', finger === 'th' && 'active')}
        x1={411}
        y1={SPACE_Y + 34}
        x2={411}
        y2={SPACE_Y}
        stroke={finger === 'th' ? COLORS.th : REST_COLOR}
        strokeWidth={16}
        strokeLinecap="round"
      />
    </svg>
  )
}

function capClass(finger: Finger | undefined): string {
  return finger ? `finger-${finger}` : ''
}

export function Keyboard({
  activeKey,
  pressedKey,
  pressCount = 0,
  finger = null,
  showLegend = true,
}: KeyboardProps) {
  const { t } = useTranslation()
  const pressed = pressedKey ? keyForChar(pressedKey) : null

  const renderCap = (key: string, extraClass = '', width = CAP_W) => {
    const f = FINGER_BY_KEY[key]
    const isActive = activeKey === key
    const isPressed = pressed === key
    const classes = cn('keycap', capClass(f), isActive && 'is-active', isPressed && 'is-pressed', extraClass)
    return (
      <div
        key={isPressed ? `p-${pressCount}-${key}` : key}
        className={classes}
        style={{ width, height: CAP_H }}
        data-finger={f ?? undefined}
        aria-hidden
      >
        {key}
      </div>
    )
  }

  return (
    <div className="kb" aria-hidden>
      <div className="kb-keys">
        {KEYBOARD_ROWS.map((row, r) => (
          <div className="kb-row" key={r} style={{ paddingLeft: ROW_BASE[r] * P }}>
            {row.map((k) => renderCap(k))}
          </div>
        ))}
        <div className="kb-row" style={{ paddingLeft: (KB_W - SPACE_W) / 2 }}>
          {renderCap('space', 'kb-space-label', SPACE_W)}
        </div>
        <HandsOverlay finger={finger} />
      </div>
      {showLegend && (
        <div className="kb-legend">
          {FINGERS.map((f) => (
            <span key={f}>
              <i className={cn('legend-dot', `finger-${f}`)} />
              {t(`finger.${f}`)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}