import { useEffect, useRef, useState } from 'react'
import { playError, playKey } from '../../lib/sound'
import { recordGameScore } from '../achievements/achievements'
import { loadBest, saveBest, type GameId } from './gameCore'
import { WORD_POOL } from '../typing/words'

export interface Cell {
  x: number
  y: number
}

export interface Food {
  x: number
  y: number
  word: string
}

export type Dir = 'up' | 'down' | 'left' | 'right'

const GAME_ID: GameId = 'snake'

const COLS = 25
const ROWS = 18
const START_LENGTH = 3

const POOL = WORD_POOL.filter((w) => w.length >= 3 && w.length <= 5 && /^[a-z]+$/.test(w))

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const DIR_VEC: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function randWord(lastRef: { current: string }): string {
  let w = POOL[Math.floor(Math.random() * POOL.length)]
  for (let i = 0; i < 6 && w === lastRef.current; i++) {
    w = POOL[Math.floor(Math.random() * POOL.length)]
  }
  lastRef.current = w
  return w
}

function pickFood(snake: Cell[]): Food {
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(Math.random() * COLS)
    const y = Math.floor(Math.random() * ROWS)
    if (!snake.some((c) => c.x === x && c.y === y)) return { x, y, word: '' }
  }
  return { x: 0, y: 0, word: '' }
}

export function useSnake() {
  const [snake, setSnake] = useState<Cell[]>([])
  const [dir, setDir] = useState<Dir>('right')
  const [food, setFood] = useState<Food | null>(null)
  const [buffer, setBuffer] = useState('')
  const [score, setScore] = useState(START_LENGTH)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [over, setOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [best, setBest] = useState(loadBest(GAME_ID))
  const [newBest, setNewBest] = useState(false)

  const snakeRef = useRef<Cell[]>([])
  const dirRef = useRef<Dir>('right')
  const foodRef = useRef<Food | null>(null)
  const bufferRef = useRef('')
  const overRef = useRef(false)
  const startedRef = useRef(false)
  const pausedRef = useRef(false)
  const scoreRef = useRef(START_LENGTH)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const growRef = useRef(0)
  const lastWordRef = useRef('')
  const pendingDirRef = useRef<Dir | null>(null)

  const syncSnake = () => setSnake([...snakeRef.current])
  const syncFood = () => setFood(foodRef.current ? { ...foodRef.current } : null)

  const newFood = () => {
    const f = pickFood(snakeRef.current)
    f.word = randWord(lastWordRef)
    foodRef.current = f
    bufferRef.current = ''
    setBuffer('')
    syncFood()
  }

  useEffect(() => {
    if (!started || over) return
    const speed = Math.max(80, 220 - (scoreRef.current - START_LENGTH) * 8)
    const id = window.setInterval(() => {
      if (pausedRef.current || overRef.current) return
      if (pendingDirRef.current) {
        if (OPPOSITE[pendingDirRef.current] !== dirRef.current) {
          dirRef.current = pendingDirRef.current
          setDir(dirRef.current)
        }
        pendingDirRef.current = null
      }
      const vec = DIR_VEC[dirRef.current]
      const head = snakeRef.current[snakeRef.current.length - 1]
      const nh = { x: head.x + vec.x, y: head.y + vec.y }
      if (nh.x < 0 || nh.x >= COLS || nh.y < 0 || nh.y >= ROWS) {
        overRef.current = true
        startedRef.current = false
        setOver(true)
        setStarted(false)
        return
      }
      const body = snakeRef.current
      const grow = growRef.current > 0
      const willHit = body.some(
        (c, i) => c.x === nh.x && c.y === nh.y && (grow || i !== 0),
      )
      if (willHit) {
        overRef.current = true
        startedRef.current = false
        setOver(true)
        setStarted(false)
        return
      }
      snakeRef.current = [...body, nh]
      if (!grow) snakeRef.current.shift()
      else growRef.current -= 1
      syncSnake()
    }, speed)
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

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      pendingDirRef.current = e.key.slice(5).toLowerCase() as Dir
      return
    }
    if (e.key.length !== 1) return
    const ch = e.key.toLowerCase()
    if (!/^[a-z]$/.test(ch)) return

    const f = foodRef.current
    if (!f) return
    const next = bufferRef.current + ch
    if (f.word.startsWith(next)) {
      bufferRef.current = next
      setBuffer(next)
      playKey()
      if (next === f.word) {
        comboRef.current += 1
        if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
        scoreRef.current += 1
        growRef.current += 1
        setScore(scoreRef.current)
        setCombo(comboRef.current)
        setMaxCombo(maxComboRef.current)
        newFood()
      }
    } else {
      playError()
      bufferRef.current = ''
      setBuffer('')
      comboRef.current = 0
      setCombo(0)
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
    const midY = Math.floor(ROWS / 2)
    const body: Cell[] = []
    for (let i = 0; i < START_LENGTH; i++) body.push({ x: 6 + i, y: midY })
    snakeRef.current = body
    dirRef.current = 'right'
    pendingDirRef.current = null
    scoreRef.current = START_LENGTH
    growRef.current = 0
    comboRef.current = 0
    maxComboRef.current = 0
    overRef.current = false
    startedRef.current = true
    pausedRef.current = false
    setSnake(body)
    setDir('right')
    setScore(START_LENGTH)
    setCombo(0)
    setMaxCombo(0)
    setOver(false)
    setStarted(true)
    setPaused(false)
    setNewBest(false)
    newFood()
  }

  useEffect(() => {
    if (!over) return
    const b = saveBest(GAME_ID, scoreRef.current)
    setBest(b)
    setNewBest(scoreRef.current >= b && scoreRef.current > 0)
    recordGameScore(GAME_ID, scoreRef.current, maxComboRef.current)
  }, [over])

  return {
    snake,
    dir,
    food,
    buffer,
    score,
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