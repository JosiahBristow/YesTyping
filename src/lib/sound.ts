import { create } from 'zustand'
import keySoundUrl from '../assets/sounds/key.mp3'

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

let keyAudio: HTMLAudioElement | null = null

export function playKey(): void {
  if (!useSound.getState().enabled) return
  try {
    if (!keyAudio) {
      keyAudio = new Audio(keySoundUrl)
      keyAudio.volume = 0.9
    }
    keyAudio.currentTime = 0
    void keyAudio.play()
  } catch {
    /* ignore audio errors */
  }
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