import { create } from 'zustand'

export interface LessonProgress {
  wpm: number
  accuracy: number
  at: number
}

const STORAGE_KEY = 'yestyping.progress.v1'

export function loadProgress(): Record<string, LessonProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Record<string, LessonProgress>
    return {}
  } catch {
    return {}
  }
}

function saveProgress(done: Record<string, LessonProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done))
  } catch {
    // storage unavailable — ignore
  }
}

export function progressKey(courseId: string, lessonId: string): string {
  return `${courseId}:${lessonId}`
}

interface ProgressState {
  done: Record<string, LessonProgress>
  markDone: (courseId: string, lessonId: string, wpm: number, accuracy: number) => void
}

export const useProgress = create<ProgressState>((set) => ({
  done: loadProgress(),
  markDone: (courseId, lessonId, wpm, accuracy) =>
    set((s) => {
      const key = progressKey(courseId, lessonId)
      if (s.done[key]) return s
      const done = { ...s.done, [key]: { wpm, accuracy, at: Date.now() } }
      saveProgress(done)
      return { done }
    }),
}))