import { useTranslation } from 'react-i18next'
import { cn } from '../lib/cn'
import { FINGERS, KEYBOARD_ROWS, type Finger } from '../features/typing/fingerMap'

export interface KeyboardProps {
  activeKey?: string | null
  finger?: Finger | null
  showLegend?: boolean
}

/* ── geometry ─────────────────────────────────────────────── */
const K = 50   // keycap unit
const G = 8    // gap between keys
const P = K + G // 58 px column pitch
const S = 0.5  // row stagger in column units (qwerty / home)

/* Row top-left offsets (in px) */
const ROW0_X = 0
const ROW1_X = S * P          // 29
const ROW2_X = (S + 0.25) * P // 43.5
const ROW3_X = (S + 1) * P    // 87

const ROW_Y = [0, P, 2 * P, 3 * P]       // [0,58,116,174]
const KB_W  = ROW3_X + 13 * P - G         // 848
const KB_H  = ROW_Y[3] + K + 48           // 270

/* Home-row fingertip y */
const HR_Y = ROW_Y[2] + K / 2             // 139

/* ── colors ───────────────────────────────────────────────── */
const FILL_INACT  = '#dce0e8'
const STROKE_INACT = '#9aa3b2'
const FILL_ACT    = '#4078f0'
const STROKE_ACT  = '#2558c6'
const CREASE_CLR  = 'rgba(120,132,148,0.35)'
const LINE_CLR    = '#4078f0'

/* ── keyboard layout ──────────────────────────────────────── */

interface KeyDef { w: number; l: string }

function row0(): KeyDef[] {
  const keys: KeyDef[] = [
    { w: 1, l: '`' },
    ...Array.from({ length: 10 }, (_, i) => ({ w: 1, l: String(i + 1) })),
    { w: 1, l: '-' }, { w: 1, l: '=' }, { w: 1.75, l: '⌫' },
  ]
  return keys
}

function row1(): KeyDef[] {
  return [
    { w: 1.5, l: '⇥' },
    ...KEYBOARD_ROWS[1].map((k) => ({ w: 1, l: k })),
  ]
}

function row2(): KeyDef[] {
  return [
    { w: 1.75, l: '⇪' },
    ...KEYBOARD_ROWS[2].map((k) => ({ w: 1, l: k })),
    { w: 2.25, l: '↵' },
  ]
}

function row3(): KeyDef[] {
  return [
    { w: 2.25, l: '⇧' },
    ...KEYBOARD_ROWS[3].map((k) => ({ w: 1, l: k })),
    { w: 2.75, l: '⇧' },
  ]
}

const ROWS: Array<{ keys: KeyDef[]; x0: number; y: number }> = [
  { keys: row0(), x0: ROW0_X, y: ROW_Y[0] },
  { keys: row1(), x0: ROW1_X, y: ROW_Y[1] },
  { keys: row2(), x0: ROW2_X, y: ROW_Y[2] },
  { keys: row3(), x0: ROW3_X, y: ROW_Y[3] },
]

const SPACE_X = ROW3_X + 6 * P + G / 2
const SPACE_W = 5 * P - G

/* ── finger positions (fingertips on home-row key centres) ── */

interface FS { id: Finger; tx: number; ty: number; bx: number; by: number; bw: number; tw: number; bow: number }

const LF: FS[] = [
  { id: 'lp', tx: 68.5,  ty: HR_Y, bx: 62,  by: 260, bw: 17, tw: 11, bow: 8 },
  { id: 'lr', tx: 126.5, ty: HR_Y, bx: 124, by: 262, bw: 18, tw: 12, bow: 4 },
  { id: 'lm', tx: 184.5, ty: HR_Y, bx: 187, by: 264, bw: 19, tw: 12, bow: 1 },
  { id: 'li', tx: 242.5, ty: HR_Y, bx: 250, by: 262, bw: 18, tw: 12, bow: 6 },
]

const RF: FS[] = [
  { id: 'ri', tx: 416.5, ty: HR_Y, bx: 407, by: 262, bw: 18, tw: 12, bow: -6 },
  { id: 'rm', tx: 474.5, ty: HR_Y, bx: 472, by: 264, bw: 19, tw: 12, bow: -1 },
  { id: 'rr', tx: 532.5, ty: HR_Y, bx: 534, by: 262, bw: 18, tw: 12, bow: -4 },
  { id: 'rp', tx: 590.5, ty: HR_Y, bx: 598, by: 260, bw: 17, tw: 11, bow: -8 },
]

const LT: FS = { id: 'th', tx: 365, ty: 236, bx: 216, by: 264, bw: 24, tw: 14, bow: -20 }
const RT: FS = { id: 'th', tx: 483, ty: 236, bx: 560, by: 264, bw: 24, tw: 14, bow: 20 }

/* ── finger outline shape (two quadratic arcs + two semicircles) ── */

function fShape(tx: number, ty: number, bx: number, by: number, bw: number, tw: number, bow: number) {
  const dx = tx - bx, dy = ty - by
  const len = Math.hypot(dx, dy) || 1
  const px = -dy / len, py = dx / len
  const mx = (bx + tx) / 2, my = (by + ty) / 2

  const arc = (r: number, ex: number, ey: number, sweep: number) =>
    `A${r} ${r} 0 0 ${sweep} ${ex} ${ey}`

  const lB = [bx + px * bw / 2, by + py * bw / 2]
  const rB = [bx - px * bw / 2, by - py * bw / 2]
  const lT = [tx + px * tw / 2, ty + py * tw / 2]
  const rT = [tx - px * tw / 2, ty - py * tw / 2]
  const lC = [mx + px * bow,    my + py * bow]
  const rC = [mx - px * bow,    my - py * bow]

  const d = [
    `M${lB[0]},${lB[1]}`,
    `Q${lC[0]},${lC[1]} ${lT[0]},${lT[1]}`,
    arc(tw / 2, rT[0], rT[1], 0),
    `Q${rC[0]},${rC[1]} ${rB[0]},${rB[1]}`,
    arc(bw / 2, lB[0], lB[1], 0),
    'Z',
  ].join(' ')

  /* two joint creases at 0.3 and 0.6 of the finger length */
  const joints: Array<[[number, number], [number, number]]> = []
  for (const t of [0.3, 0.6]) {
    const fx = bx + dx * t, fy = by + dy * t
    const wf = bw + (tw - bw) * t
    joints.push([
      [fx + px * wf / 2, fy + py * wf / 2],
      [fx - px * wf / 2, fy - py * wf / 2],
    ])
  }
  return { d, joints }
}

/* ── SVG subcomponents ────────────────────────────────────── */

function Finger({ f, active }: { f: FS; active: boolean }) {
  const { d, joints } = fShape(f.tx, f.ty, f.bx, f.by, f.bw, f.tw, f.bow)
  return (
    <g className={cn('hand-finger', active && 'active')}>
      <path
        d={d}
        fill={active ? FILL_ACT : FILL_INACT}
        stroke={active ? STROKE_ACT : STROKE_INACT}
        strokeWidth={active ? 2 : 1.5}
        strokeLinejoin="round"
      />
      {joints.map(([a, b], i) => (
        <line
          key={i}
          x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
          stroke={active ? 'rgba(255,255,255,0.4)' : CREASE_CLR}
          strokeWidth={1.3}
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

function HandsSvg({ finger }: { finger: Finger | null }) {
  return (
    <svg
      className="kb-hands"
      viewBox={`0 0 ${KB_W} ${KB_H}`}
      width={KB_W}
      height={KB_H}
      aria-hidden
    >
      {/* palms */}
      <ellipse cx={152} cy={280} rx={118} ry={32} fill={FILL_INACT} stroke={STROKE_INACT} strokeWidth={1.5} />
      <ellipse cx={524} cy={280} rx={118} ry={32} fill={FILL_INACT} stroke={STROKE_INACT} strokeWidth={1.5} />
      {/* fingers */}
      {LF.map((f) => <Finger key={f.id + f.tx} f={f} active={finger === f.id} />)}
      {RF.map((f) => <Finger key={f.id + f.tx} f={f} active={finger === f.id} />)}
      <Finger f={LT} active={finger === 'th'} />
      <Finger f={RT} active={finger === 'th'} />
    </svg>
  )
}

/* ── main component ───────────────────────────────────────── */

export function Keyboard({
  activeKey,
  finger = null,
  showLegend = true,
}: KeyboardProps) {
  const { t } = useTranslation()

  return (
    <div className="kb" aria-hidden>
      {/* ── full keyboard drawn as SVG ── */}
      <svg className="kb-svg" viewBox={`0 0 ${KB_W} ${KB_H}`} width={KB_W} height={KB_H}>
        <defs>
          <filter id="ks" x="-2%" y="-2%" width="104%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.2" floodOpacity="0.09" />
          </filter>
        </defs>
        <g filter="url(#ks)">
          {ROWS.map((row, ri) => {
            let cx = row.x0
            return row.keys.map((k) => {
              const kw = k.w * K - G
              const el = (
                <g key={`${ri}-${k.l}-${cx}`}>
                  <rect x={cx} y={row.y} width={kw} height={K} rx={8} fill="#fff" stroke="#e0e5f0" strokeWidth={1} />
                  <text x={cx + kw / 2} y={row.y + K / 2} textAnchor="middle" dominantBaseline="central"
                    fontSize={k.l.length > 1 ? 12 : 16} fontWeight="600" fill="#5b6472"
                    fontFamily="var(--font-mono, monospace)">
                    {k.l}
                  </text>
                </g>
              )
              cx += k.w * P
              return el
            })
          })}
          {/* spacebar */}
          <rect x={SPACE_X} y={ROW_Y[3]} width={SPACE_W} height={K} rx={8} fill="#fff" stroke="#e0e5f0" strokeWidth={1} />
          <text x={SPACE_X + SPACE_W / 2} y={ROW_Y[3] + K / 2} textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight="500" fill="#9aa3b2"
            fontFamily="var(--font-body, sans-serif)" letterSpacing="0.08em">
            SPACE
          </text>
          {/* active key highlight */}
          {activeKey && (() => {
            const h = setH(activeKey)
            return h ? <rect x={h.x} y={h.y} width={h.w} height={K} rx={8} fill={FILL_ACT} opacity={0.14} /> : null
          })()}
        </g>
      </svg>
      {/* ── hands overlay ── */}
      <HandsSvg finger={finger} />
      {/* ── connecting line (active fingertip → key) ── */}
      {finger && activeKey && (() => {
        const tip = fingerTip(finger)
        const h = setH(activeKey)
        if (!tip || !h) return null
        const kx = h.x + h.w / 2
        const ky = h.y
        const mx = (tip.x + kx) / 2
        return (
          <svg className="kb-line" viewBox={`0 0 ${KB_W} ${KB_H}`} width={KB_W} height={KB_H}>
            <path
              d={`M${tip.x},${tip.y} Q${mx},${tip.y + 8} ${kx},${ky}`}
              fill="none" stroke={LINE_CLR} strokeWidth={2} strokeLinecap="round" opacity={0.55}
            />
          </svg>
        )
      })()}
      {/* ── legend ── */}
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

/* ── helpers used inside Keyboard ─────────────────────────── */

function setH(key: string): { x: number; y: number; w: number } | undefined {
  if (key === 'space') return { x: SPACE_X, y: ROW_Y[3], w: SPACE_W }
  for (let ri = 0; ri < ROWS.length; ri++) {
    const row = ROWS[ri]
    let cx = row.x0
    for (const k of row.keys) {
      const kw = k.w * K - G
      if (k.l === key) return { x: cx, y: row.y, w: kw }
      cx += k.w * P
    }
  }
  return undefined
}

function fingerTip(f: Finger): { x: number; y: number } | undefined {
  for (const s of [...LF, ...RF]) if (s.id === f) return { x: s.tx, y: s.ty }
  if (f === 'th') return { x: (LT.tx + RT.tx) / 2, y: LT.ty }
  return undefined
}
