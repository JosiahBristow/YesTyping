import { create } from 'zustand'
import type { LayoutId } from '../features/typing/layouts'

const STORAGE_KEY = 'yestyping.layout'

export function detectLayout(): LayoutId {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dvorak' || stored === 'colemak' ? stored : 'qwerty'
}

function persistLayout(layout: LayoutId): void {
  localStorage.setItem(STORAGE_KEY, layout)
}

interface LayoutState {
  layout: LayoutId
  setLayout: (layout: LayoutId) => void
}

export const useLayout = create<LayoutState>((set) => ({
  layout: detectLayout(),
  setLayout: (layout) => {
    persistLayout(layout)
    set({ layout })
  },
}))