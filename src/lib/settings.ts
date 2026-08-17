import { create } from 'zustand'
import { useTheme, type Theme } from './theme'

const STORAGE_KEY = 'yestyping.settings'

export type KeyboardStyle = 'rainbow' | 'mono' | 'vintage' | 'neon' | 'pastel'

export const KEYBOARD_STYLES: KeyboardStyle[] = ['rainbow', 'mono', 'vintage', 'neon', 'pastel']

export function styleTheme(style: KeyboardStyle): Theme {
  if (style === 'rainbow') return 'light'
  if (style === 'neon') return 'dark'
  if (style === 'vintage' || style === 'pastel') return 'light'
  return 'system'
}

interface SettingsState {
  showKeyboard: boolean
  keyboardStyle: KeyboardStyle
  onboarded: boolean
  setShowKeyboard: (v: boolean) => void
  setKeyboardStyle: (s: KeyboardStyle) => void
  setOnboarded: (v: boolean) => void
}

function detect(): SettingsState['showKeyboard'] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return true
    const parsed = JSON.parse(raw) as { showKeyboard?: unknown }
    return parsed.showKeyboard !== false
  } catch {
    return true
  }
}

function detectStyle(): SettingsState['keyboardStyle'] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 'rainbow'
    const parsed = JSON.parse(raw) as { keyboardStyle?: unknown }
    return (KEYBOARD_STYLES as unknown[]).includes(parsed.keyboardStyle)
      ? (parsed.keyboardStyle as KeyboardStyle)
      : 'rainbow'
  } catch {
    return 'rainbow'
  }
}

function detectOnboarded(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { onboarded?: unknown }
    return parsed.onboarded === true
  } catch {
    return false
  }
}

function persist(patch: Partial<SettingsState>): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const prev = raw ? JSON.parse(raw) : {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...patch }))
  } catch {
    // storage unavailable — ignore
  }
}

export const useSettings = create<SettingsState>((set) => ({
  showKeyboard: detect(),
  keyboardStyle: detectStyle(),
  onboarded: detectOnboarded(),
  setShowKeyboard: (showKeyboard) => {
    persist({ showKeyboard })
    set({ showKeyboard })
  },
  setKeyboardStyle: (keyboardStyle) => {
    persist({ keyboardStyle })
    set({ keyboardStyle })
    useTheme.getState().setTheme(styleTheme(keyboardStyle))
  },
  setOnboarded: (onboarded) => {
    persist({ onboarded })
    set({ onboarded })
  },
}))

document.documentElement.dataset.kbStyle = useSettings.getState().keyboardStyle
useSettings.subscribe((s) => {
  document.documentElement.dataset.kbStyle = s.keyboardStyle
})