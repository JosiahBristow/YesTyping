import { useTranslation } from 'react-i18next'
import { cn } from '../lib/cn'
import { FINGER_BY_KEY, FINGERS, KEYBOARD_ROWS, type Finger } from '../features/typing/fingerMap'
import { charAtKey, keyForChar, type LayoutId } from '../features/typing/layouts'

export interface KeyboardProps {
  activeKey?: string | null
  pressedKey?: string | null
  pressCount?: number
  showLegend?: boolean
  layout?: LayoutId
  errorKeys?: Record<string, number>
  lastWasWrong?: boolean
  shiftSide?: 'left' | 'right' | null
}

function capClass(finger: Finger | undefined): string {
  return finger ? `finger-${finger}` : ''
}

export function Keyboard({
  activeKey,
  pressedKey,
  pressCount = 0,
  showLegend = true,
  layout = 'qwerty',
  errorKeys,
  lastWasWrong = false,
  shiftSide = null,
}: KeyboardProps) {
  const { t } = useTranslation()
  const pressed = pressedKey ? keyForChar(pressedKey, layout) : null
  const maxErr = errorKeys ? Math.max(1, ...Object.values(errorKeys)) : 0

  const renderCap = (key: string, isLeftShift = false, extraClass = '') => {
    const isShift = key === 'Shift'
    const isRightShift = isShift && !isLeftShift
    const shiftOn = isShift && ((isLeftShift && shiftSide === 'left') || (isRightShift && shiftSide === 'right'))
    const finger = FINGER_BY_KEY[key]
    const isActive = activeKey === key
    const isPressed = pressed === key
    const err = errorKeys?.[key] ?? 0
    const classes = cn(
      'keycap',
      capClass(finger),
      key === 'Tab' && 'tab',
      key === 'Caps' && 'caps',
      (key === 'Ctrl' || key === 'Win' || key === 'Alt') && 'mod',
      key === 'space' && 'space',
      isShift && 'shift',
      shiftOn && 'shift-on',
      isActive && 'is-active',
      isPressed && 'is-pressed',
      isPressed && lastWasWrong && 'is-wrong',
      key === 'space' && 'kb-space-label',
      extraClass,
    )
    const style =
      err > 0 && !isActive
        ? ({ background: `rgba(239, 68, 68, ${0.1 + 0.4 * (err / maxErr)})` } as const)
        : undefined
    return (
      <div
        key={isPressed ? `p-${pressCount}-${key}` : key}
        className={classes}
        data-finger={finger ?? undefined}
        style={style}
        aria-hidden
      >
        {isShift ? 'Shift' : charAtKey(key, layout)}
      </div>
    )
  }

  return (
    <div className="kb" aria-hidden>
      {KEYBOARD_ROWS.map((row, r) => (
        <div className={cn('kb-row', `kb-row-${r}`)} key={r}>
          {row.map((k, i) => renderCap(k, k === 'Shift' && i === 0))}
        </div>
      ))}
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