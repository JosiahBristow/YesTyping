import { useEffect, useRef, useState } from 'react'
import { playError, playKey } from '../../lib/sound'
import { WORD_POOL } from '../typing/words'

export interface FallingWord {
  id: number
  word: string
  x: number
  y: number
}

const STORAGE_KEY = 'yestyping.gameBest'

const POOL = WORD_POOL.filter((w) => w.length >= 3 && w.length <= 7 && /^[a-z]+$/.test(w))

const TICK_MS = 33
const START_LIVES = 3
const LEVEL_SCORE = 150

export function loadGameBest(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0
  } catch {
    return 0
  }
}

export function useWordRain() {
  const [words, setWords] = useState<FallingWord[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(START_LIVES)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [buffer, setBuffer] = useState('')
  const [targetId, setTargetId] = useState<number | null>(null)
  const [over, setOver] = useState(false)
  const [started, setStarted] = useState(false)

  const wordsRef = useRef<FallingWord[]>([])
  const livesRef = useRef(START_LIVES)
  const overRef = useRef(false)
  const startedRef = useRef(false)
  const scoreRef = useRef(0)
  const levelRef = useRef(1)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const bufferRef = useRef('')
  const targetRef = useRef<FallingWord | null>(null)
  const nextIdRef = useRef(1)

  const syncWords = () => setWords([...wordsRef.current])

  const spawn = () => {
    if (wordsRef.current.length >= 4 + Math.floor(levelRef.current / 2)) return
    const word = POOL[Math.floor(Math.random() * POOL.length)]
    wordsRef.current.push({ id: nextIdRef.current++, word, x: 6 + Math.random() * 74, y: -5 })
  }

  const clearTarget = () => {
    bufferRef.current = ''
    targetRef.current = null
    setBuffer('')
    setTargetId(null)
  }

  const destroy = (id: number) => {
    wordsRef.current = wordsRef.current.filter((w) => w.id !== id)
    syncWords()
  }

  useEffect(() => {
    if (!started || over) return
    const id = window.setInterval(() => {
      const drop = 0.22 + levelRef.current * 0.1
      for (const w of wordsRef.current) {
        w.y += drop
      }
      const remaining = wordsRef.current.filter((w) => w.y <= 100)
      if (remaining.length !== wordsRef.current.length) {
        wordsRef.current = remaining
        if (targetRef.current && remaining.every((w) => w.id !== targetRef.current!.id)) clearTarget()
        livesRef.current -= 1
        setLives(livesRef.current)
        if (livesRef.current <= 0) {
          overRef.current = true
          setOver(true)
          setStarted(false)
          return
        }
      }
      spawn()
      syncWords()
    }, TICK_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, over])

  const onKey = (e: KeyboardEvent) => {
    if (overRef.current || !startedRef.current) return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length !== 1) return
    const ch = e.key.toLowerCase()
    if (!/^[a-z]$/.test(ch)) return

    const target = targetRef.current
    if (target) {
      const next = bufferRef.current + ch
      if (target.word.startsWith(next)) {
        bufferRef.current = next
        setBuffer(next)
        playKey()
        if (next === target.word) {
          comboRef.current += 1
          if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
          scoreRef.current += target.word.length * 10
          setScore(scoreRef.current)
          setCombo(comboRef.current)
          setMaxCombo(maxComboRef.current)
          const newLevel = Math.floor(scoreRef.current / LEVEL_SCORE) + 1
          if (newLevel > levelRef.current) {
            levelRef.current = newLevel
            setLevel(newLevel)
            spawn()
          }
          destroy(target.id)
          clearTarget()
        }
      } else {
        playError()
        clearTarget()
        comboRef.current = 0
        setCombo(0)
      }
      return
    }

    const hit = wordsRef.current.find((w) => w.word.startsWith(ch))
    if (hit) {
      targetRef.current = hit
      bufferRef.current = ch
      setBuffer(ch)
      setTargetId(hit.id)
      playKey()
    } else {
      playError()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const start = () => {
    wordsRef.current = []
    bufferRef.current = ''
    targetRef.current = null
    scoreRef.current = 0
    livesRef.current = START_LIVES
    levelRef.current = 1
    comboRef.current = 0
    maxComboRef.current = 0
    overRef.current = false
    startedRef.current = true
    setWords([])
    setScore(0)
    setLives(START_LIVES)
    setLevel(1)
    setCombo(0)
    setMaxCombo(0)
    setBuffer('')
    setTargetId(null)
    setOver(false)
    setStarted(true)
    for (let i = 0; i < 2; i++) spawn()
    syncWords()
  }

  useEffect(() => {
    if (!over) return
    const best = loadGameBest()
    if (scoreRef.current > best) {
      try {
        localStorage.setItem(STORAGE_KEY, String(scoreRef.current))
      } catch {
        // storage unavailable — ignore
      }
    }
  }, [over])

  return {
    words,
    score,
    lives,
    level,
    combo,
    maxCombo,
    buffer,
    targetId,
    over,
    started,
    start,
  }
}