import { useEffect, useRef, useState } from 'react'
import { playError, playKey } from '../../lib/sound'
import { recordGameScore } from '../achievements/achievements'
import { loadBest, saveBest, type GameId } from './gameCore'
import { WORD_POOL } from '../typing/words'

export interface Zombie {
  id: number
  word: string
  x: number
}

export interface KillFx {
  id: number
  x: number
}

const GAME_ID: GameId = 'zombies'

const POOL = WORD_POOL.filter((w) => w.length >= 3 && w.length <= 7 && /^[a-z]+$/.test(w))

const START_LIVES = 3
const MAX_ZOMBIES = 6
const KILL_POINTS = 10
const WALL_X = 96

function randWord(lastRef: { current: string }): string {
  let w = POOL[Math.floor(Math.random() * POOL.length)]
  for (let i = 0; i < 6 && w === lastRef.current; i++) {
    w = POOL[Math.floor(Math.random() * POOL.length)]
  }
  lastRef.current = w
  return w
}

export function useZombies() {
  const [zombies, setZombies] = useState<Zombie[]>([])
  const [kills, setKills] = useState<KillFx[]>([])
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

  const zombiesRef = useRef<Zombie[]>([])
  const killsRef = useRef<KillFx[]>([])
  const livesRef = useRef(START_LIVES)
  const overRef = useRef(false)
  const startedRef = useRef(false)
  const pausedRef = useRef(false)
  const scoreRef = useRef(0)
  const levelRef = useRef(1)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const bufferRef = useRef('')
  const targetRef = useRef<Zombie | null>(null)
  const nextIdRef = useRef(1)
  const lastWordRef = useRef('')
  const lastSpawnRef = useRef(0)

  const syncZombies = () => setZombies([...zombiesRef.current])
  const syncKills = () => setKills([...killsRef.current])

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
    if (overRef.current || zombiesRef.current.length >= MAX_ZOMBIES) return
    zombiesRef.current.push({ id: nextIdRef.current++, word: randWord(lastWordRef), x: -6 - Math.random() * 22 })
    syncZombies()
  }

  useEffect(() => {
    if (!started || over) return
    let raf: number
    let last = performance.now()
    const loop = (now: number) => {
      if (overRef.current) return
      raf = requestAnimationFrame(loop)
      if (pausedRef.current) { last = now; return }
      const dt = (now - last) / 1000
      last = now
      const speed = 1.6 + levelRef.current * 0.75
      for (const z of zombiesRef.current) z.x += speed * dt
      const breached = zombiesRef.current.filter((z) => z.x >= WALL_X)
      if (breached.length > 0) {
        for (const z of breached) {
          if (targetRef.current?.id === z.id) clearTarget()
          comboRef.current = 0
          setCombo(0)
        }
        zombiesRef.current = zombiesRef.current.filter((z) => z.x < WALL_X)
        syncZombies()
        if (loseLife()) return
      }
      if (now - lastSpawnRef.current > Math.max(400, 1400 - levelRef.current * 140)) {
        lastSpawnRef.current = now
        spawn()
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, over])

  const kill = (id: number, x: number) => {
    killsRef.current = [...killsRef.current, { id, x }]
    syncKills()
    window.setTimeout(() => {
      killsRef.current = killsRef.current.filter((k) => k.id !== id)
      syncKills()
    }, 500)
  }

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
          comboRef.current += 1
          if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
          scoreRef.current += target.word.length * KILL_POINTS
          setScore(scoreRef.current)
          setCombo(comboRef.current)
          setMaxCombo(maxComboRef.current)
          kill(target.id, target.x)
          zombiesRef.current = zombiesRef.current.filter((z) => z.id !== target.id)
          syncZombies()
          const newLevel = Math.floor(scoreRef.current / 250) + 1
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

    const hit = zombiesRef.current.find((z) => z.word.startsWith(ch))
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
    zombiesRef.current = []
    killsRef.current = []
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
    setZombies([])
    setKills([])
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
    for (let i = 0; i < 3; i++) spawn()
  }

  useEffect(() => {
    if (!over) return
    const b = saveBest(GAME_ID, scoreRef.current)
    setBest(b)
    setNewBest(scoreRef.current >= b && scoreRef.current > 0)
    recordGameScore(GAME_ID, scoreRef.current, maxComboRef.current)
  }, [over])

  return {
    zombies,
    kills,
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