import { useMemo } from 'react'
import type { CharState } from './useTypingEngine'
import { cn } from '../../lib/cn'

interface Token {
  kind: 'word' | 'space'
  chars: string[]
  start: number
  wordIndex: number
}

function splitTokens(text: string): Token[] {
  const tokens: Token[] = []
  let start = 0
  let wordIndex = 0
  let i = 0
  while (i < text.length) {
    const isSpace = text[i] === ' '
    let j = i
    while (j < text.length && (text[j] === ' ') === isSpace) j++
    tokens.push({
      kind: isSpace ? 'space' : 'word',
      chars: text.slice(i, j).split(''),
      start,
      wordIndex: isSpace ? -1 : wordIndex++,
    })
    start += j - i
    i = j
  }
  return tokens
}

export interface TypeAreaProps {
  text: string
  states: CharState[]
  index: number
  hints?: string[]
}

export function TypeArea({ text, states, index, hints }: TypeAreaProps) {
  const tokens = useMemo(() => splitTokens(text), [text])

  return (
    <div className={cn('type-area', hints && 'with-hints')}>
      {tokens.map((tok, ti) => {
        const word = tok.kind === 'word' && (
          <span className="tok-word">
            {tok.chars.map((ch, ci) => {
              const pos = tok.start + ci
              const st = states[pos]
              const ghost = hints && st === 'pending'
              return (
                <span
                  key={ci}
                  className={cn(
                    'char',
                    st === 'correct' && 'correct',
                    st === 'corrected' && 'corrected',
                    st === 'wrong' && 'wrong',
                    ghost && 'ghost',
                    pos === index && 'current',
                  )}
                >
                  {ch}
                </span>
              )
            })}
          </span>
        )

        if (tok.kind === 'space') {
          return hints ? (
            <span key={ti} className="word-gap" />
          ) : (
            <span key={ti} className="tok-space">
              {' '}
            </span>
          )
        }

        const hint = hints?.[tok.wordIndex]
        return (
          <span key={ti} className="word-cell">
            <span className="word-hint">{hint}</span>
            {word}
          </span>
        )
      })}
    </div>
  )
}