import { useEffect, useRef, useState } from 'react'
import { playError, playKey } from '../../lib/sound'
import { keyForChar, type LayoutId } from './layouts'
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
  requireNumpad?: boolean
  layout?: LayoutId
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
  combo: number
  maxCombo: number
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
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)

  const textRef = useRef(text)
  const statesRef = useRef(states)
  const indexRef = useRef(index)
  const startRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const lastSampleRef = useRef(0)
  const samplesRef = useRef<number[]>([])
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const keyErrorsRef = useRef<Record<string, number>>({})
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
      maxCombo: maxComboRef.current,
      keyErrors: keyErrorsRef.current,
    }
    setFinished(true)
    optsRef.current.onFinish?.(result)
  }

  const commitText = (str: string) => {
    if (finishedRef.current) return
    if (!startRef.current) {
      startRef.current = performance.now()
      setStarted(true)
    }

    const chars = Array.from(str)
    let i = indexRef.current
    for (const ch of chars) {
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
      const ok = ch === expected
      statesRef.current[i] = ok ? 'correct' : 'wrong'
      if (ok) {
        comboRef.current += 1
        if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
      } else {
        comboRef.current = 0
        const key = keyForChar(ch, optsRef.current.layout ?? 'qwerty')
        keyErrorsRef.current[key] = (keyErrorsRef.current[key] ?? 0) + 1
      }
      if (ok) playKey()
      else playError()
      i++
    }
    indexRef.current = i
    setStates([...statesRef.current])
    setIndex(i)
    setLastKey(str)
    setPressCount((c) => c + 1)
    setCombo(comboRef.current)
    setMaxCombo(maxComboRef.current)

    if (indexRef.current >= textRef.current.length && mode === 'lesson') {
      finish()
    }
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
    if (optsRef.current.requireNumpad && /[0-9.+\-*/]/.test(e.key) && !e.code.startsWith('Numpad')) {
      return
    }
    commitText(e.key)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = document.createElement('input')
    el.type = 'text'
    el.setAttribute('autocomplete', 'off')
    el.setAttribute('autocorrect', 'off')
    el.setAttribute('autocapitalize', 'off')
    el.setAttribute('spellcheck', 'false')
    el.style.cssText =
      'position:fixed;top:0;left:0;width:1px;height:1px;border:0;padding:0;background:transparent;opacity:0'

    const onInput = (e: Event) => {
      const ie = e as InputEvent
      if (ie.isComposing) return
      if (ie.inputType !== 'insertCompositionText') return
      const data = ie.data
      el.value = ''
      if (data && data.length > 0) commitText(data)
    }
    const onFocus = () => el.focus()
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest('button, a, input, textarea, select')) return
      el.focus()
    }

    document.body.appendChild(el)
    el.focus()
    el.addEventListener('input', onInput)
    window.addEventListener('focus', onFocus)
    window.addEventListener('mousedown', onMouseDown)

    return () => {
      el.removeEventListener('input', onInput)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('mousedown', onMouseDown)
      el.remove()
    }
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
    combo,
    maxCombo,
    wpm: wpm(correctChars, elapsed),
    cpm: cpm(correctChars, elapsed),
    accuracy: accuracy(correctChars, wrongChars),
  }
}