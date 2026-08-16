import { create } from 'zustand'

const STORAGE_KEY = 'yestyping.sound'

export function detectSound(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== 'off'
}

function persistSound(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
}

interface SoundState {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

export const useSound = create<SoundState>((set) => ({
  enabled: detectSound(),
  setEnabled: (enabled) => {
    persistSound(enabled)
    set({ enabled })
  },
}))

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function playKey(): void {
  if (!useSound.getState().enabled) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime

  const len = Math.max(1, Math.floor(ac.sampleRate * 0.045))
  const buffer = ac.createBuffer(1, len, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5)
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2200
  bp.Q.value = 0.9
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.4, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)
  src.connect(bp)
  bp.connect(gain)
  gain.connect(ac.destination)
  src.start(now)

  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.04)
  const og = ac.createGain()
  og.gain.setValueAtTime(0.22, now)
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  osc.connect(og)
  og.connect(ac.destination)
  osc.start(now)
}

export function playError(): void {
  if (!useSound.getState().enabled) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime

  const osc = ac.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, now)
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.14)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.16, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.18)
}