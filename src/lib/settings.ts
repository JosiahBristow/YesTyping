import { create } from 'zustand'

const STORAGE_KEY = 'yestyping.settings'

interface SettingsState {
  showKeyboard: boolean
  setShowKeyboard: (v: boolean) => void
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
  setShowKeyboard: (showKeyboard) => {
    persist({ showKeyboard })
    set({ showKeyboard })
  },
}))