import { useEffect, useRef, useState } from 'react'
import {
  accuracy,
  consistencyOf,
  cpm,
  wpm,
  type EngineMode,
  type EngineResult,
} from './metrics'

export type CharState = 'pending' | 'correct' | 'wrong'

export interface EngineOptions {
  text: string
  mode?: EngineMode
  durationSec?: number
  extend?: () => string
  onFinish?: (result: EngineResult) => void
}

export interface TypingEngine {
  text: string
  states: CharState[]
  index: number
  elapsed: number
  started: boolean
  finished: boolean
  samples: number[]
  lastKey: string | null
  pressCount: number
  correctChars: number
  wrongChars: number
  wpm: number
  cpm: number
  accuracy: number
}

const EXTEND_AHEAD = 10

export function useTypingEngine(options: EngineOptions): TypingEngine {
  const { mode = 'lesson', durationSec = 30 } = options

  const [text, setText] = useState(options.text)
  const [states, setStates] = useState<CharState[]>(() =>
    Array.from({ length: options.text.length }, () => 'pending'),
  )
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [samples, setSamples] = useState<number[]>([])
  const [lastKey, setLastKey] = useState<string | null>(null)
  const [pressCount, setPressCount] = useState(0)

  const textRef = useRef(text)
  const statesRef = useRef(states)
  const indexRef = useRef(index)
  const startRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const lastSampleRef = useRef(0)
  const samplesRef = useRef<number[]>([])
  const optsRef = useRef(options)
  optsRef.current = options

  useEffect(() => {
    textRef.current = text
  }, [text])

  useEffect(() => {
    statesRef.current = states
  }, [states])

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    const st = statesRef.current
    const correct = st.filter((s) => s === 'correct').length
    const wrong = st.filter((s) => s === 'wrong').length
    const secs = startRef.current ? (performance.now() - startRef.current) / 1000 : 0
    const result: EngineResult = {
      mode,
      wpm: wpm(correct, secs),
      cpm: cpm(correct, secs),
      accuracy: accuracy(correct, wrong),
      consistency: consistencyOf(samplesRef.current),
      correctChars: correct,
      wrongChars: wrong,
      elapsedSec: Math.round(secs),
      samples: samplesRef.current,
    }
    setFinished(true)
    optsRef.current.onFinish?.(result)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.isComposing || e.keyCode === 229) return
    if (finishedRef.current) return
    if (e.ctrlKey || e.altKey || e.metaKey) return

    if (e.key === 'Backspace') {
      const i = indexRef.current
      if (i > 0) {
        const ni = i - 1
        statesRef.current[ni] = 'pending'
        indexRef.current = ni
        setStates([...statesRef.current])
        setIndex(ni)
      }
      return
    }

    if (e.key.length !== 1) return

    if (!startRef.current) {
      startRef.current = performance.now()
      setStarted(true)
    }

    let i = indexRef.current
    if (i >= textRef.current.length - EXTEND_AHEAD && optsRef.current.extend) {
      const more = optsRef.current.extend()
      if (more && more.length > 0) {
        textRef.current = textRef.current + more
        statesRef.current = [
          ...statesRef.current,
          ...Array.from({ length: more.length }, () => 'pending' as CharState),
        ]
        setText(textRef.current)
      }
    }

    const expected = textRef.current[i]
    const ok = e.key === expected
    statesRef.current[i] = ok ? 'correct' : 'wrong'
    indexRef.current = i + 1
    setStates([...statesRef.current])
    setIndex(indexRef.current)
    setLastKey(e.key)
    setPressCount((c) => c + 1)

    if (indexRef.current >= textRef.current.length && mode === 'lesson') {
      finish()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!startRef.current || finishedRef.current) return
      const secs = (performance.now() - startRef.current) / 1000
      setElapsed(secs)
      const whole = Math.floor(secs)
      if (whole > lastSampleRef.current) {
        lastSampleRef.current = whole
        const correct = statesRef.current.filter((s) => s === 'correct').length
        samplesRef.current = [...samplesRef.current, wpm(correct, secs)]
        setSamples(samplesRef.current)
      }
      if (mode === 'timed' && secs >= durationSec) finish()
    }, 200)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const correctChars = states.filter((s) => s === 'correct').length
  const wrongChars = states.filter((s) => s === 'wrong').length

  return {
    text,
    states,
    index,
    elapsed,
    started,
    finished,
    samples,
    lastKey,
    pressCount,
    correctChars,
    wrongChars,
    wpm: wpm(correctChars, elapsed),
    cpm: cpm(correctChars, elapsed),
    accuracy: accuracy(correctChars, wrongChars),
  }
}