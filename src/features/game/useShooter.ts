import { useEffect, useRef, useState } from 'react'
import { playError, playKey } from '../../lib/sound'
import { recordGameScore } from '../achievements/achievements'
import { loadBest, saveBest, type GameId } from './gameCore'
import { WORD_POOL } from '../typing/words'

export interface Target {
  id: number
  word: string
  x: number
  y: number
  born: number
  expireMs: number
}

export interface Explosion {
  id: number
  x: number
  y: number
  born: number
}

const GAME_ID: GameId = 'shooter'

const POOL = WORD_POOL.filter((w) => w.length >= 3 && w.length <= 8 && /^[a-z]+$/.test(w))

const TICK_MS = 50
const START_LIVES = 3
const MAX_TARGETS = 5
const HIT_POINTS = 10

function randWord(lastRef: { current: string }): string {
  let w = POOL[Math.floor(Math.random() * POOL.length)]
  for (let i = 0; i < 6 && w === lastRef.current; i++) {
    w = POOL[Math.floor(Math.random() * POOL.length)]
  }
  lastRef.current = w
  return w
}

function pickPos(existing: Target[]): { x: number; y: number } {
  for (let i = 0; i < 60; i++) {
    const x = 8 + Math.random() * 84
    const y = 12 + Math.random() * 62
    const w = 6
    if (!existing.some((o) => Math.abs(o.x - x) < w && Math.abs(o.y - y) < 12)) return { x, y }
  }
  return { x: 20 + Math.random() * 60, y: 12 + Math.random() * 62 }
}

export function useShooter() {
  const [targets, setTargets] = useState<Target[]>([])
  const [hits, setHits] = useState<Explosion[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(START_LIVES)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [buffer, setBuffer] = useState('')
  const [targetId, setTargetId] = useState<number | null>(null)
  const [over, setOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [best, setBest] = useState(loadBest(GAME_ID))
  const [newBest, setNewBest] = useState(false)

  const targetsRef = useRef<Target[]>([])
  const hitsRef = useRef<Explosion[]>([])
  const livesRef = useRef(START_LIVES)
  const overRef = useRef(false)
  const startedRef = useRef(false)
  const pausedRef = useRef(false)
  const scoreRef = useRef(0)
  const levelRef = useRef(1)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const bufferRef = useRef('')
  const targetRef = useRef<Target | null>(null)
  const nextIdRef = useRef(1)
  const lastWordRef = useRef('')
  const lastSpawnRef = useRef(0)

  const syncTargets = () => setTargets([...targetsRef.current])
  const syncHits = () => setHits([...hitsRef.current])

  const clearTarget = () => {
    bufferRef.current = ''
    targetRef.current = null
    setBuffer('')
    setTargetId(null)
  }

  const loseLife = (): boolean => {
    livesRef.current -= 1
    setLives(livesRef.current)
    if (livesRef.current <= 0) {
      overRef.current = true
      startedRef.current = false
      setOver(true)
      setStarted(false)
      return true
    }
    return false
  }

  const spawn = () => {
    if (overRef.current || targetsRef.current.length >= MAX_TARGETS) return
    const word = randWord(lastWordRef)
    const { x, y } = pickPos(targetsRef.current)
    targetsRef.current.push({
      id: nextIdRef.current++,
      word,
      x,
      y,
      born: performance.now(),
      expireMs: Math.max(4200, 9000 - levelRef.current * 700),
    })
    syncTargets()
  }

  useEffect(() => {
    if (!started || over) return
    const id = window.setInterval(() => {
      if (pausedRef.current) return
      const now = performance.now()
      const expired = targetsRef.current.filter((w) => now - w.born >= w.expireMs)
      if (expired.length > 0) {
        for (const w of expired) {
          if (targetRef.current?.id === w.id) clearTarget()
          comboRef.current = 0
          setCombo(0)
        }
        targetsRef.current = targetsRef.current.filter((w) => now - w.born < w.expireMs)
        syncTargets()
        if (loseLife()) return
      }
      hitsRef.current = hitsRef.current.filter((h) => now - h.born < 500)
      syncHits()
      if (now - lastSpawnRef.current > Math.max(600, 1700 - levelRef.current * 180)) {
        lastSpawnRef.current = now
        spawn()
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, over])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (startedRef.current && !overRef.current) {
        pausedRef.current = !pausedRef.current
        setPaused(pausedRef.current)
      }
      return
    }
    if (overRef.current || !startedRef.current || pausedRef.current) return
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
          const now = performance.now()
          comboRef.current += 1
          if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
          scoreRef.current += target.word.length * HIT_POINTS
          setScore(scoreRef.current)
          setCombo(comboRef.current)
          setMaxCombo(maxComboRef.current)
          hitsRef.current.push({ id: target.id, x: target.x, y: target.y, born: now })
          syncHits()
          targetsRef.current = targetsRef.current.filter((t) => t.id !== target.id)
          syncTargets()
          const newLevel = Math.floor(scoreRef.current / 200) + 1
          if (newLevel > levelRef.current) {
            levelRef.current = newLevel
            setLevel(newLevel)
          }
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

    const hit = targetsRef.current.find((t) => t.word.startsWith(ch))
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

  const togglePause = () => {
    if (!startedRef.current || overRef.current) return
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  const start = () => {
    targetsRef.current = []
    hitsRef.current = []
    bufferRef.current = ''
    targetRef.current = null
    scoreRef.current = 0
    livesRef.current = START_LIVES
    levelRef.current = 1
    comboRef.current = 0
    maxComboRef.current = 0
    lastSpawnRef.current = performance.now()
    overRef.current = false
    startedRef.current = true
    pausedRef.current = false
    setTargets([])
    setHits([])
    setScore(0)
    setLives(START_LIVES)
    setLevel(1)
    setCombo(0)
    setMaxCombo(0)
    setBuffer('')
    setTargetId(null)
    setOver(false)
    setStarted(true)
    setPaused(false)
    setNewBest(false)
    for (let i = 0; i < 2; i++) spawn()
  }

  useEffect(() => {
    if (!over) return
    const b = saveBest(GAME_ID, scoreRef.current)
    setBest(b)
    setNewBest(scoreRef.current >= b && scoreRef.current > 0)
    recordGameScore(GAME_ID, scoreRef.current, maxComboRef.current)
  }, [over])

  return {
    targets,
    hits,
    score,
    lives,
    level,
    combo,
    maxCombo,
    buffer,
    targetId,
    over,
    started,
    paused,
    best,
    newBest,
    start,
    togglePause,
  }
}