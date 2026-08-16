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

function playNoiseClick(
  ac: AudioContext,
  start: number,
  dur: number,
  freq: number,
  q: number,
  vol: number,
): void {
  const len = Math.max(1, Math.floor(ac.sampleRate * dur))
  const buffer = ac.createBuffer(1, len, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = q
  const gain = ac.createGain()
  gain.gain.setValueAtTime(vol, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
  src.connect(bp)
  bp.connect(gain)
  gain.connect(ac.destination)
  src.start(start)
  src.stop(start + dur + 0.01)
}

function playThock(ac: AudioContext, start: number, freq: number, dur: number, vol: number): void {
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = freq
  const gain = ac.createGain()
  gain.gain.setValueAtTime(vol, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(start)
  osc.stop(start + dur + 0.01)
}

export function playKey(): void {
  if (!useSound.getState().enabled) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  playNoiseClick(ac, now, 0.012, 3800, 2.2, 0.45)
  playNoiseClick(ac, now, 0.02, 1700, 1.4, 0.3)
  playThock(ac, now, 210, 0.03, 0.25)
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