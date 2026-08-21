import { useEffect, useRef, useState } from 'react'
import { playError, playKey } from '../../lib/sound'
import { recordGameScore } from '../achievements/achievements'
import { loadBest, saveBest, type GameId } from './gameCore'

export interface Tile {
  id: number
  lane: number
  y: number
  letter: string
}

export interface Spark {
  lane: number
  t: number
}

const GAME_ID: GameId = 'rhythm'

const TICK_MS = 33
const START_LIVES = 3
const HIT_MIN = 78
const HIT_MAX = 94
const ESCAPE_Y = 100
const MAX_TILES = 14
const HIT_POINTS = 10
const LANES = 4
const LETTERS = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']

export function useRhythm() {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [sparks, setSparks] = useState<Spark[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(START_LIVES)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [over, setOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [best, setBest] = useState(loadBest(GAME_ID))
  const [newBest, setNewBest] = useState(false)

  const tilesRef = useRef<Tile[]>([])
  const sparksRef = useRef<Spark[]>([])
  const livesRef = useRef(START_LIVES)
  const overRef = useRef(false)
  const startedRef = useRef(false)
  const pausedRef = useRef(false)
  const scoreRef = useRef(0)
  const levelRef = useRef(1)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const nextIdRef = useRef(1)
  const lastSpawnRef = useRef(0)

  const syncTiles = () => setTiles([...tilesRef.current])
  const syncSparks = () => setSparks([...sparksRef.current])

  const loseLife = (): boolean => {
    livesRef.current -= 1
    setLives(livesRef.current)
    comboRef.current = 0
    setCombo(0)
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
    if (overRef.current || tilesRef.current.length >= MAX_TILES) return
    const lanes: number[] = []
    for (let i = 0; i < LANES; i++) {
      if (!tilesRef.current.some((tl) => tl.lane === i && tl.y < 45)) lanes.push(i)
    }
    if (lanes.length === 0) return
    const lane = lanes[Math.floor(Math.random() * lanes.length)]
    tilesRef.current.push({ id: nextIdRef.current++, lane, y: -12, letter: LETTERS[Math.floor(Math.random() * LETTERS.length)] })
    syncTiles()
  }

  useEffect(() => {
    if (!started || over) return
    const id = window.setInterval(() => {
      if (pausedRef.current) return
      const speed = 11 + levelRef.current * 2.6
      for (const tl of tilesRef.current) tl.y += speed * (TICK_MS / 1000)
      const escaped = tilesRef.current.filter((tl) => tl.y >= ESCAPE_Y)
      if (escaped.length > 0) {
        tilesRef.current = tilesRef.current.filter((tl) => tl.y < ESCAPE_Y)
        syncTiles()
        for (let i = 0; i < escaped.length; i++) {
          if (loseLife()) return
        }
      }
      sparksRef.current = sparksRef.current.filter((s) => performance.now() - s.t < 400)
      syncSparks()
      if (performance.now() - lastSpawnRef.current > Math.max(380, 900 - levelRef.current * 55)) {
        lastSpawnRef.current = performance.now()
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

    const hittable = tilesRef.current.filter((tl) => tl.y >= HIT_MIN && tl.y <= HIT_MAX)
    const match = hittable.find((tl) => tl.letter === ch)
    if (match) {
      comboRef.current += 1
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
      scoreRef.current += match.letter === ';' ? 15 : HIT_POINTS
      setScore(scoreRef.current)
      setCombo(comboRef.current)
      setMaxCombo(maxComboRef.current)
      sparksRef.current = [...sparksRef.current, { lane: match.lane, t: performance.now() }]
      syncSparks()
      tilesRef.current = tilesRef.current.filter((tl) => tl.id !== match.id)
      syncTiles()
      playKey()
      const newLevel = Math.floor(scoreRef.current / 150) + 1
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel
        setLevel(newLevel)
      }
    } else {
      playError()
      if (tilesRef.current.some((tl) => tl.y >= HIT_MIN && tl.y <= HIT_MAX)) {
        comboRef.current = 0
        setCombo(0)
      }
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
    tilesRef.current = []
    sparksRef.current = []
    scoreRef.current = 0
    livesRef.current = START_LIVES
    levelRef.current = 1
    comboRef.current = 0
    maxComboRef.current = 0
    lastSpawnRef.current = performance.now()
    overRef.current = false
    startedRef.current = true
    pausedRef.current = false
    setTiles([])
    setSparks([])
    setScore(0)
    setLives(START_LIVES)
    setLevel(1)
    setCombo(0)
    setMaxCombo(0)
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
    tiles,
    sparks,
    score,
    lives,
    level,
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