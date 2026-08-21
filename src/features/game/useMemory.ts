import { useEffect, useRef, useState } from 'react'
import { playError, playKey } from '../../lib/sound'
import { recordGameScore } from '../achievements/achievements'
import { loadBest, saveBest, type GameId } from './gameCore'
import { WORD_POOL } from '../typing/words'

export type MemoryPhase = 'idle' | 'showing' | 'typing' | 'over'

const GAME_ID: GameId = 'memory'

const POOL = WORD_POOL.filter((w) => w.length >= 3 && w.length <= 6 && /^[a-z]+$/.test(w))

const START_LIVES = 3
const WORD_TIME_MS = 8000
const TICK_MS = 100
const HIT_POINTS = 10

function randWord(lastRef: { current: string }): string {
  let w = POOL[Math.floor(Math.random() * POOL.length)]
  for (let i = 0; i < 6 && w === lastRef.current; i++) {
    w = POOL[Math.floor(Math.random() * POOL.length)]
  }
  lastRef.current = w
  return w
}

function roundWords(round: number, lastRef: { current: string }): string[] {
  const count = 2 + round
  const out: string[] = []
  for (let i = 0; i < count; i++) out.push(randWord(lastRef))
  return out
}

export function useMemory() {
  const [phase, setPhase] = useState<MemoryPhase>('idle')
  const [round, setRound] = useState(1)
  const [words, setWords] = useState<string[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [buffer, setBuffer] = useState('')
  const [timeLeft, setTimeLeft] = useState(WORD_TIME_MS)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(START_LIVES)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [over, setOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [best, setBest] = useState(loadBest(GAME_ID))
  const [newBest, setNewBest] = useState(false)

  const phaseRef = useRef<MemoryPhase>('idle')
  const roundRef = useRef(1)
  const wordsRef = useRef<string[]>([])
  const wordIndexRef = useRef(0)
  const bufferRef = useRef('')
  const timeLeftRef = useRef(WORD_TIME_MS)
  const livesRef = useRef(START_LIVES)
  const overRef = useRef(false)
  const startedRef = useRef(false)
  const pausedRef = useRef(false)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const lastWordRef = useRef('')
  const showTimerRef = useRef<number | null>(null)
  const wrongRef = useRef(false)

  const loseLife = (): boolean => {
    if (wrongRef.current) return false
    wrongRef.current = true
    livesRef.current -= 1
    setLives(livesRef.current)
    comboRef.current = 0
    setCombo(0)
    if (livesRef.current <= 0) {
      overRef.current = true
      phaseRef.current = 'over'
      startedRef.current = false
      setPhase('over')
      setOver(true)
      setStarted(false)
      return true
    }
    return false
  }

  const nextWord = () => {
    if (overRef.current) return
    if (wordIndexRef.current >= wordsRef.current.length - 1) {
      // Round complete.
      const bonus = roundRef.current * 5
      scoreRef.current += bonus
      setScore(scoreRef.current)
      roundRef.current += 1
      setRound(roundRef.current)
      const next = roundWords(roundRef.current, lastWordRef)
      wordsRef.current = next
      wordIndexRef.current = 0
      bufferRef.current = ''
      wrongRef.current = false
      setWords(next)
      setWordIndex(0)
      setBuffer('')
      phaseRef.current = 'showing'
      setPhase('showing')
      const showMs = 1800 + next.length * 450
      showTimerRef.current = window.setTimeout(() => {
        showTimerRef.current = null
        if (overRef.current || pausedRef.current) return
        phaseRef.current = 'typing'
        setPhase('typing')
        timeLeftRef.current = WORD_TIME_MS
        setTimeLeft(WORD_TIME_MS)
      }, showMs)
      return
    }
    wordIndexRef.current += 1
    bufferRef.current = ''
    wrongRef.current = false
    setWordIndex(wordIndexRef.current)
    setBuffer('')
    timeLeftRef.current = WORD_TIME_MS
    setTimeLeft(WORD_TIME_MS)
  }

  useEffect(() => {
    if (phase !== 'showing' && phase !== 'typing') return
    if (phase === 'showing') return
    const id = window.setInterval(() => {
      if (pausedRef.current || overRef.current) return
      timeLeftRef.current -= TICK_MS
      setTimeLeft(timeLeftRef.current)
      if (timeLeftRef.current <= 0) {
        playError()
        nextWord()
        if (loseLife()) return
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (startedRef.current && !overRef.current) {
        pausedRef.current = !pausedRef.current
        setPaused(pausedRef.current)
      }
      return
    }
    if (overRef.current || !startedRef.current || pausedRef.current) return
    if (phaseRef.current !== 'typing') return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length !== 1) return
    const ch = e.key.toLowerCase()
    if (!/^[a-z]$/.test(ch)) return

    const word = wordsRef.current[wordIndexRef.current]
    if (!word) return
    const next = bufferRef.current + ch
    if (word.startsWith(next)) {
      bufferRef.current = next
      setBuffer(next)
      playKey()
      if (next === word) {
        comboRef.current += 1
        if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
        scoreRef.current += word.length * HIT_POINTS
        setScore(scoreRef.current)
        setCombo(comboRef.current)
        setMaxCombo(maxComboRef.current)
        nextWord()
      }
    } else {
      playError()
      nextWord()
      loseLife()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) window.clearTimeout(showTimerRef.current)
    }
  }, [])

  const togglePause = () => {
    if (!startedRef.current || overRef.current) return
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  const start = () => {
    if (showTimerRef.current !== null) window.clearTimeout(showTimerRef.current)
    roundRef.current = 1
    scoreRef.current = 0
    livesRef.current = START_LIVES
    comboRef.current = 0
    maxComboRef.current = 0
    overRef.current = false
    startedRef.current = true
    pausedRef.current = false
    wrongRef.current = false
    const first = roundWords(1, lastWordRef)
    wordsRef.current = first
    wordIndexRef.current = 0
    bufferRef.current = ''
    setRound(1)
    setWords(first)
    setWordIndex(0)
    setBuffer('')
    setScore(0)
    setLives(START_LIVES)
    setCombo(0)
    setMaxCombo(0)
    setOver(false)
    setStarted(true)
    setPaused(false)
    setNewBest(false)
    phaseRef.current = 'showing'
    setPhase('showing')
    const showMs = 1800 + first.length * 450
    showTimerRef.current = window.setTimeout(() => {
      showTimerRef.current = null
      if (overRef.current || pausedRef.current) return
      phaseRef.current = 'typing'
      setPhase('typing')
      timeLeftRef.current = WORD_TIME_MS
      setTimeLeft(WORD_TIME_MS)
    }, showMs)
  }

  useEffect(() => {
    if (!over) return
    const b = saveBest(GAME_ID, scoreRef.current)
    setBest(b)
    setNewBest(scoreRef.current >= b && scoreRef.current > 0)
    recordGameScore(GAME_ID, scoreRef.current, maxComboRef.current)
  }, [over])

  return {
    phase,
    round,
    words,
    wordIndex,
    buffer,
    timeLeft,
    score,
    lives,
    combo,
    maxCombo,
    over,
    started,
    paused,
    best,
    newBest,
    start,
    togglePause,
  }
}