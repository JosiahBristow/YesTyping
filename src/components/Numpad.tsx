import { cn } from '../lib/cn'
import { NUMPAD_FINGER } from '../features/typing/fingerMap'
import { useSettings } from '../lib/settings'

export interface NumpadProps {
  activeKey?: string | null
  pressedKey?: string | null
  pressCount?: number
}

const NUMPAD_KEYS: string[][] = [
  ['7', '8', '9', '+'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '*'],
  ['0', '.', 'Enter', '/'],
]

export function Numpad({ activeKey, pressedKey, pressCount = 0 }: NumpadProps) {
  const keyboardStyle = useSettings((s) => s.keyboardStyle)
  return (
    <div className={cn('numpad', `kb-style-${keyboardStyle}`)} aria-hidden>
      {NUMPAD_KEYS.map((row, r) => (
        <div className="numpad-row" key={r}>
          {row.map((key) => {
            const isActive = activeKey === key
            const isPressed = pressedKey === key
            const finger = NUMPAD_FINGER[key]
            const classes = cn(
              'numpad-key',
              finger && `finger-${finger}`,
              isActive && 'is-active',
              isPressed && 'is-pressed',
              key === 'Enter' && 'numpad-enter',
            )
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
          })}
        </div>
      ))}
    </div>
  )
}