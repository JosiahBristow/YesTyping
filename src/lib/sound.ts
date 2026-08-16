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
let unlocked = false

/**
 * Browsers block audio playback until a user gesture. Run this once on the
 * first real interaction (pointer/key) so later key sounds are allowed —
 * especially important on freshly-deployed sites with a low media-engagement
 * index, where an untrusted `audio.play()` is rejected.
 */
function unlockAudio(): void {
  if (unlocked) return
  unlocked = true
  try {
    if (!keyAudio) {
      keyAudio = new Audio(keySoundUrl)
      keyAudio.volume = 0.9
    }
    keyAudio.volume = 0
    keyAudio.currentTime = 0
    void keyAudio.play().then(() => {
      keyAudio?.pause()
      if (keyAudio) keyAudio.volume = 0.9
    }).catch(() => {
      if (keyAudio) keyAudio.volume = 0.9
    })
  } catch {
    /* ignore */
  }
  const ac = getCtx()
  if (ac && ac.state === 'suspended') void ac.resume()
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockAudio, { once: true })
  window.addEventListener('keydown', unlockAudio, { once: true })
  window.addEventListener('touchstart', unlockAudio, { once: true })
}

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

export function playAchievement(): void {
  if (!useSound.getState().enabled) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5]

  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + i * 0.09)
    const gain = ac.createGain()
    gain.gain.setValueAtTime(0.0001, now + i * 0.09)
    gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.09 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.28)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(now + i * 0.09)
    osc.stop(now + i * 0.09 + 0.3)
  })
}