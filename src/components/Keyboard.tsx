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
  showLegend?: boolean
}

function capClass(finger: Finger | undefined): string {
  return finger ? `finger-${finger}` : ''
}

export function Keyboard({ activeKey, pressedKey, pressCount = 0, showLegend = true }: KeyboardProps) {
  const { t } = useTranslation()
  const pressed = pressedKey ? keyForChar(pressedKey) : null

  const renderCap = (key: string, extraClass = '') => {
    const finger = FINGER_BY_KEY[key]
    const isActive = activeKey === key
    const isPressed = pressed === key
    const classes = cn('keycap', capClass(finger), isActive && 'is-active', isPressed && 'is-pressed', extraClass)
    return (
      <div
        key={isPressed ? `p-${pressCount}-${key}` : key}
        className={classes}
        data-finger={finger ?? undefined}
        aria-hidden
      >
        {key}
      </div>
    )
  }

  return (
    <div className="kb" aria-hidden>
      {KEYBOARD_ROWS.map((row, r) => (
        <div className="kb-row" key={r}>
          {row.map((k) => renderCap(k))}
        </div>
      ))}
      <div className="kb-row space-row">{renderCap('space', 'kb-space-label')}</div>
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