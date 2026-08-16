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
const KB_H = ROW_TOP[4] + CAP_H + 44 // extra room below the space bar for the palms
const HOMEROW_Y = ROW_TOP[2] + CAP_H / 2
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

const SKIN = '#ebd6c2'
const SKIN_EDGE = '#d2b294'
const CREASE = 'rgba(158, 113, 74, 0.5)'

interface FingerSpec {
  id: Finger
  tip: [number, number]
  base: [number, number]
  baseW: number
  tipW: number
  bow: number
}

/* Fingertips land on the home-row key centers; bases meet the palms below. */
const LEFT_FINGERS: FingerSpec[] = [
  { id: 'lp', tip: [68.5 - 7, HOMEROW_Y], base: [61, 250], baseW: 15, tipW: 10, bow: 9 },
  { id: 'lr', tip: [126.5 - 2, HOMEROW_Y], base: [124, 252], baseW: 16, tipW: 11, bow: 5 },
  { id: 'lm', tip: [184.5 + 3, HOMEROW_Y], base: [187, 254], baseW: 17, tipW: 11, bow: 2 },
  { id: 'li', tip: [242.5 + 9, HOMEROW_Y], base: [251, 252], baseW: 16, tipW: 11, bow: 7 },
]
const RIGHT_FINGERS: FingerSpec[] = [
  { id: 'ri', tip: [416.5 - 9, HOMEROW_Y], base: [407, 252], baseW: 16, tipW: 11, bow: -7 },
  { id: 'rm', tip: [474.5 - 3, HOMEROW_Y], base: [472, 254], baseW: 17, tipW: 11, bow: -2 },
  { id: 'rr', tip: [532.5 + 2, HOMEROW_Y], base: [534, 252], baseW: 16, tipW: 11, bow: -5 },
  { id: 'rp', tip: [590.5 + 7, HOMEROW_Y], base: [598, 250], baseW: 15, tipW: 10, bow: -9 },
]
const LEFT_THUMB: FingerSpec = { id: 'th', tip: [322, 236], base: [215, 256], baseW: 21, tipW: 13, bow: -18 }
const RIGHT_THUMB: FingerSpec = { id: 'th', tip: [453, 236], base: [560, 256], baseW: 21, tipW: 13, bow: 18 }

function fingerShape(
  tip: [number, number],
  base: [number, number],
  baseW: number,
  tipW: number,
  bow: number,
): { d: string; creases: Array<[[number, number], [number, number]]> } {
  const [bx, by] = base
  const [tx, ty] = tip
  const dx = tx - bx
  const dy = ty - by
  const len = Math.hypot(dx, dy) || 1
  const px = -dy / len
  const py = dx / len
  const mx = (bx + tx) / 2
  const my = (by + ty) / 2
  const lB = `${bx + px * (baseW / 2)},${by + py * (baseW / 2)}`
  const rB = `${bx - px * (baseW / 2)},${by - py * (baseW / 2)}`
  const lT = `${tx + px * (tipW / 2)},${ty + py * (tipW / 2)}`
  const rT = `${tx - px * (tipW / 2)},${ty - py * (tipW / 2)}`
  const lC = `${mx + px * bow},${my + py * bow}`
  const rC = `${mx - px * bow},${my - py * bow}`
  const d = `M ${lB} Q ${lC} ${lT} A ${tipW / 2} ${tipW / 2} 0 0 0 ${rT} Q ${rC} ${rB} A ${baseW / 2} ${baseW / 2} 0 0 0 ${lB} Z`
  const creases: Array<[[number, number], [number, number]]> = []
  for (const f of [0.6, 0.28]) {
    const fx = bx + dx * f
    const fy = by + dy * f
    const wf = baseW + (tipW - baseW) * f
    creases.push([
      [fx + px * (wf / 2), fy + py * (wf / 2)],
      [fx - px * (wf / 2), fy - py * (wf / 2)],
    ])
  }
  return { d, creases }
}

function HandFinger({ spec, active }: { spec: FingerSpec; active: boolean }) {
  const { d, creases } = fingerShape(spec.tip, spec.base, spec.baseW, spec.tipW, spec.bow)
  return (
    <g className={cn('hand-finger', active && 'active')}>
      <path
        d={d}
        fill={active ? COLORS[spec.id] : SKIN}
        stroke={SKIN_EDGE}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {creases.map(([a, b], i) => (
        <line
          key={i}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          stroke={CREASE}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      ))}
    </g>
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
      <ellipse cx={150} cy={278} rx={108} ry={30} fill={SKIN} stroke={SKIN_EDGE} strokeWidth={1} />
      <ellipse cx={505} cy={278} rx={108} ry={30} fill={SKIN} stroke={SKIN_EDGE} strokeWidth={1} />
      {LEFT_FINGERS.map((f) => (
        <HandFinger key={f.id} spec={f} active={finger === f.id} />
      ))}
      {RIGHT_FINGERS.map((f) => (
        <HandFinger key={f.id} spec={f} active={finger === f.id} />
      ))}
      <HandFinger spec={LEFT_THUMB} active={finger === 'th'} />
      <HandFinger spec={RIGHT_THUMB} active={finger === 'th'} />
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