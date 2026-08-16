import { useMemo } from 'react'
import type { CharState } from './useTypingEngine'
import { cn } from '../../lib/cn'

interface Token {
  kind: 'word' | 'space'
  chars: string[]
  start: number
}

function splitTokens(text: string): Token[] {
  const tokens: Token[] = []
  let start = 0
  let i = 0
  while (i < text.length) {
    const isSpace = text[i] === ' '
    let j = i
    while (j < text.length && (text[j] === ' ') === isSpace) j++
    tokens.push({ kind: isSpace ? 'space' : 'word', chars: text.slice(i, j).split(''), start })
    start += j - i
    i = j
  }
  return tokens
}

export interface TypeAreaProps {
  text: string
  states: CharState[]
  index: number
}

export function TypeArea({ text, states, index }: TypeAreaProps) {
  const tokens = useMemo(() => splitTokens(text), [text])

  return (
    <div className="type-area">
      {tokens.map((tok, ti) => (
        <span key={ti} className={tok.kind === 'word' ? 'tok-word' : 'tok-space'}>
          {tok.chars.map((ch, ci) => {
            const pos = tok.start + ci
            const st = states[pos]
            return (
              <span
                key={ci}
                className={cn(
                  'char',
                  st === 'correct' && 'correct',
                  st === 'wrong' && 'wrong',
                  pos === index && 'current',
                )}
              >
                {ch}
              </span>
            )
          })}
        </span>
      ))}
    </div>
  )
}