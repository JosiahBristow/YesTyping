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

interface PinyinWord {
  chars: string[]
  start: number
}

interface HanziBlock {
  hanzi: string
  chars: string[]
  words: PinyinWord[]
}

function buildHanziBlocks(text: string, hanzi: string[]): HanziBlock[] {
  const words: PinyinWord[] = []
  let start = 0
  for (const word of text.split(' ')) {
    words.push({ chars: Array.from(word), start })
    start += word.length + 1
  }
  const blocks: HanziBlock[] = []
  let wi = 0
  for (const hz of hanzi) {
    const chars = Array.from(hz)
    if (wi + chars.length > words.length) break
    blocks.push({ hanzi: hz, chars, words: words.slice(wi, wi + chars.length) })
    wi += chars.length
  }
  for (; wi < words.length; wi++) {
    blocks.push({ hanzi: '', chars: [], words: [words[wi]] })
  }
  return blocks
}

export interface TypeAreaProps {
  text: string
  states: CharState[]
  index: number
  hints?: string[]
  /** Hanzi grouped by word (each entry one word, e.g. "你好"), aligned in order with the syllables of `text`. */
  hanzi?: string[]
}

export function TypeArea({ text, states, index, hints, hanzi }: TypeAreaProps) {
  const tokens = useMemo(() => splitTokens(text), [text])
  const hanziBlocks = useMemo(() => (hanzi ? buildHanziBlocks(text, hanzi) : null), [text, hanzi])

  if (hanziBlocks) {
    return (
      <div className="type-area with-hanzi">
        {hanziBlocks.map((block, bi) => (
          <span key={bi} className="hanzi-block">
            {block.words.map((w, wi) => (
              <span key={wi} className="hanzi-cell">
                <span className="syllable-card">
                  {w.chars.map((ch, ci) => {
                    const pos = w.start + ci
                    const st = states[pos]
                    return (
                      <span
                        key={ci}
                        data-index={pos}
                        className={cn(
                          'char',
                          st === 'correct' && 'correct',
                          st === 'corrected' && 'corrected',
                          st === 'wrong' && 'wrong',
                          pos === index && 'current',
                        )}
                      >
                        {ch}
                      </span>
                    )
                  })}
                </span>
                {block.chars[wi] && <span className="block-hanzi">{block.chars[wi]}</span>}
              </span>
            ))}
          </span>
        ))}
      </div>
    )
  }

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
                  data-index={pos}
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
          const st = states[tok.start]
          return hints ? (
            <span key={ti} className="word-gap" />
          ) : (
            <span
              key={ti}
              className={cn(
                'tok-space',
                st === 'correct' && 'correct',
                st === 'corrected' && 'corrected',
                st === 'wrong' && 'wrong',
                tok.start === index && 'current',
              )}
              data-index={tok.start}
            >
              {' '}
            </span>
          )
        }

        const hint = hints?.[tok.wordIndex]
        return (
          <span key={ti} className="word-cell">
            {hint && <span className="word-hint">{hint}</span>}
            {word}
          </span>
        )
      })}
    </div>
  )
}