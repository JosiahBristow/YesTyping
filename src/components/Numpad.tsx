import { cn } from '../lib/cn'

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
  return (
    <div className="numpad" aria-hidden>
      {NUMPAD_KEYS.map((row, r) => (
        <div className="numpad-row" key={r}>
          {row.map((key) => {
            const isActive = activeKey === key
            const isPressed = pressedKey === key
            const classes = cn(
              'numpad-key',
              isActive && 'is-active',
              isPressed && 'is-pressed',
              key === 'Enter' && 'numpad-enter',
            )
            return (
              <div key={isPressed ? `p-${pressCount}-${key}` : key} className={classes}>
                {key}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}